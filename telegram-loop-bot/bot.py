"""SLAPGOD loop bot.

Send an mp3/wav to the bot in a private chat -> it asks which 2 hashtags to
use, adds the detected key to the file name and posts the loop to the channel.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import shutil
import tempfile
import uuid
from pathlib import Path

from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Message, Update
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from analyze import Analysis, analyze
from local_files import rename_originals

load_dotenv(Path(__file__).with_name(".env"))

BOT_TOKEN = os.environ["BOT_TOKEN"]
CHANNEL_ID = os.environ["CHANNEL_ID"]  # "@mychannel" or "-100123..."
OWNER_IDS = {int(x) for x in os.getenv("OWNER_IDS", "").replace(" ", "").split(",") if x}
# TEST_MODE: send the finished post back to your own chat instead of the channel.
TEST_MODE = os.getenv("TEST_MODE", "true").lower() in ("1", "true", "yes")
TAG_COUNT = 2
DEFAULT_TAGS = os.getenv("DEFAULT_TAGS", "#painmelody #guitarloop")
# Hashtag choices offered as buttons, separated by "|".
TAG_PRESETS = os.getenv("TAG_PRESETS", "#painmelody #guitarloop|#spanish #guitarloop|#rnb #guitarloop")
LAST_TAGS_FILE = Path(__file__).with_name("tags.json")  # remembers the last hashtags used

logging.basicConfig(format="%(asctime)s %(levelname)s %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)  # its URLs contain the bot token
log = logging.getLogger("loopbot")

# Loops waiting for their hashtags: job id -> job
PENDING: dict[str, dict] = {}

AUDIO_FILTER = (
    filters.AUDIO
    | filters.VOICE
    | filters.Document.MimeType("audio/mpeg")
    | filters.Document.MimeType("audio/wav")
    | filters.Document.MimeType("audio/x-wav")
    | filters.Document.FileExtension("mp3")
    | filters.Document.FileExtension("wav")
)


def parse_tags(text: str) -> list[str]:
    words = re.findall(r"#?([A-Za-z0-9_]+)", text)
    return ["#" + w.lower() for w in words][:TAG_COUNT]


def last_tags() -> list[str]:
    try:
        return json.loads(LAST_TAGS_FILE.read_text())["tags"]
    except (OSError, ValueError, KeyError):
        return parse_tags(DEFAULT_TAGS)


def tag_options() -> list[str]:
    """Button choices: last used first, then the presets."""
    options = [" ".join(last_tags())]
    for preset in TAG_PRESETS.split("|"):
        tags = " ".join(parse_tags(preset))
        if tags and tags not in options:
            options.append(tags)
    return options


def is_owner(update: Update) -> bool:
    user = update.effective_user
    return bool(user) and user.id in OWNER_IDS


def keyed_name(filename: str, a: Analysis) -> str:
    """Add the detected key to the end of the file name, nothing else.

    "Pain Loop-@slapgodmadeit-150bpm.mp3" -> "Pain Loop-@slapgodmadeit-150bpm-Cmin.mp3"
    A key already at the end (e.g. "-Gmin") is replaced, since it may be wrong.
    """
    name = Path(filename)
    stem = re.sub(r"(?i)-?[A-G](?:#|b)?(?:maj|min)$", "", name.stem).rstrip("-_ ")
    key = f"{a.key}{'min' if a.mode == 'minor' else 'maj'}"
    return f"{stem}-{key}{name.suffix.lower() or '.mp3'}"


def cleanup(job: dict) -> None:
    shutil.rmtree(Path(job["path"]).parent, ignore_errors=True)


async def post_to_channel(context: ContextTypes.DEFAULT_TYPE, job: dict, tags: list[str]) -> Message:
    with open(job["path"], "rb") as fh:
        return await context.bot.send_audio(
            chat_id=job["chat_id"] if TEST_MODE else CHANNEL_ID,
            audio=fh,
            filename=job["filename"],
            title=Path(job["filename"]).stem,  # else Telegram shows the file's old tags
            caption=" ".join(tags),
            write_timeout=120,
            read_timeout=60,
        )


async def publish(context: ContextTypes.DEFAULT_TYPE, job_id: str, tags: list[str]) -> str:
    """Post a pending loop with the chosen hashtags. Returns a status line."""
    job = PENDING.pop(job_id, None)
    if not job:
        return "This loop was already posted or cancelled."
    try:
        a = await job["analysis"]
        job["filename"] = keyed_name(job["original_name"], a)
        sent = await post_to_channel(context, job, tags)
    except Exception as exc:  # noqa: BLE001
        log.exception("post failed")
        return f"❌ Post failed: {exc}"
    finally:
        cleanup(job)
    LAST_TAGS_FILE.write_text(json.dumps({"tags": tags}))
    where = "here (test mode)" if TEST_MODE else (sent.link or "the channel")
    lines = [f"✅ Posted {job['filename']} {' '.join(tags)} → {where}"]
    try:
        lines += await asyncio.to_thread(rename_originals, job["original_name"], job["filename"], job["size"])
    except Exception as exc:  # noqa: BLE001
        log.exception("local rename failed")
        lines.append(f"📁 Couldn't rename the file on your Mac: {exc}")
    return "\n".join(lines)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Send me an mp3/wav loop. I'll ask which hashtags to use, add the key to the "
        "file name and post it to the channel.\n\n"
        f"Your user id: {update.effective_user.id}"
    )


async def whoami(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(f"Your user id: {update.effective_user.id}")


async def handle_audio(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = update.message
    if not is_owner(update):
        await msg.reply_text(f"Not authorized. Add {update.effective_user.id} to OWNER_IDS in .env.")
        return

    media = msg.audio or msg.document or msg.voice
    filename = getattr(media, "file_name", None) or "loop.mp3"
    if media.file_size and media.file_size > 20 * 1024 * 1024:
        await msg.reply_text("File over 20 MB — Telegram bots can't download that. Export a smaller mp3.")
        return

    tmpdir = Path(tempfile.mkdtemp(prefix="loopbot_"))
    path = tmpdir / re.sub(r"[^\w.\-]", "_", filename)
    try:
        tg_file = await media.get_file()
        await tg_file.download_to_drive(path)
    except Exception as exc:  # noqa: BLE001
        log.exception("download failed")
        shutil.rmtree(tmpdir, ignore_errors=True)
        await msg.reply_text(f"❌ Couldn't download that file: {exc}")
        return

    # Find the key in the background while you pick hashtags.
    job_id = uuid.uuid4().hex[:10]
    PENDING[job_id] = {
        "path": str(path),
        "original_name": filename,
        "size": media.file_size,
        "chat_id": msg.chat_id,
        "analysis": asyncio.ensure_future(asyncio.to_thread(analyze, str(path))),
    }
    options = tag_options()
    context.bot_data.setdefault("options", {})[job_id] = options
    buttons = [[InlineKeyboardButton(o, callback_data=f"tags:{job_id}:{i}")] for i, o in enumerate(options)]
    buttons.append([InlineKeyboardButton("✖️ Cancel", callback_data=f"cancel:{job_id}")])
    prompt = await msg.reply_text(
        "Which hashtags? Tap one, or reply to this message with your own (2 hashtags).",
        reply_markup=InlineKeyboardMarkup(buttons),
    )
    PENDING[job_id]["prompt_id"] = prompt.message_id


async def handle_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not is_owner(update):
        return
    action, job_id, *rest = query.data.split(":")
    if action == "cancel":
        job = PENDING.pop(job_id, None)
        if job:
            job["analysis"].cancel()
            cleanup(job)
        await query.edit_message_text("Cancelled.")
        return
    options = context.bot_data.get("options", {}).pop(job_id, [])
    tags = parse_tags(options[int(rest[0])]) if rest and int(rest[0]) < len(options) else last_tags()
    await query.edit_message_text(f"Posting with {' '.join(tags)}…")
    await query.edit_message_text(await publish(context, job_id, tags))


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Typed hashtags: apply to the loop whose question you replied to, else the latest one."""
    msg = update.message
    if not is_owner(update) or not PENDING:
        return
    tags = parse_tags(msg.text or "")
    if not tags:
        await msg.reply_text("Send hashtags like: #painmelody #guitarloop")
        return
    reply_to = msg.reply_to_message.message_id if msg.reply_to_message else None
    job_id = next((j for j, job in PENDING.items() if job.get("prompt_id") == reply_to), None)
    job_id = job_id or list(PENDING)[-1]
    prompt_id = PENDING[job_id].get("prompt_id")
    context.bot_data.get("options", {}).pop(job_id, None)
    result = await publish(context, job_id, tags)
    if prompt_id:
        await context.bot.edit_message_text(result, chat_id=msg.chat_id, message_id=prompt_id)
    else:
        await msg.reply_text(result)


def main() -> None:
    if not OWNER_IDS:
        log.warning("OWNER_IDS not set — nobody can post. Send /id to the bot, then add it to .env.")
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("id", whoami))
    app.add_handler(MessageHandler(filters.ChatType.PRIVATE & AUDIO_FILTER, handle_audio))
    app.add_handler(MessageHandler(filters.ChatType.PRIVATE & filters.TEXT & ~filters.COMMAND, handle_text))
    app.add_handler(CallbackQueryHandler(handle_button))
    log.info("Loop bot running. %s",
             "TEST MODE (replies in your chat, channel untouched)" if TEST_MODE else f"LIVE → channel {CHANNEL_ID}")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
