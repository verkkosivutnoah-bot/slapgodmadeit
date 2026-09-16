"""SLAPGOD loop bot.

Send an mp3/wav to the bot in a private chat -> it detects key + BPM,
generates hashtags and posts the loop to your Telegram channel.
"""

from __future__ import annotations

import asyncio
import html
import logging
import os
import re
import tempfile
import uuid
from pathlib import Path

from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Message, Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from analyze import Analysis, analyze
from hashtags import make_hashtags

load_dotenv(Path(__file__).with_name(".env"))

BOT_TOKEN = os.environ["BOT_TOKEN"]
CHANNEL_ID = os.environ["CHANNEL_ID"]  # "@mychannel" or "-100123..."
OWNER_IDS = {int(x) for x in os.getenv("OWNER_IDS", "").replace(" ", "").split(",") if x}
AUTO_POST = os.getenv("AUTO_POST", "true").lower() in ("1", "true", "yes")
BASE_TAGS = [t for t in re.split(r"[,\s]+", os.getenv("BASE_TAGS", "")) if t]
ARTIST = os.getenv("ARTIST_NAME", "SLAPGOD")
TAG_LIMIT = int(os.getenv("TAG_LIMIT", "25"))

logging.basicConfig(format="%(asctime)s %(levelname)s %(message)s", level=logging.INFO)
log = logging.getLogger("loopbot")

# Pending posts awaiting approval when AUTO_POST=false: id -> dict
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


def is_owner(update: Update) -> bool:
    user = update.effective_user
    return bool(user) and (not OWNER_IDS or user.id in OWNER_IDS)


def loop_title(filename: str, caption: str) -> str:
    first_line = caption.strip().splitlines()[0] if caption.strip() else ""
    if first_line and not first_line.startswith("#"):
        return first_line
    stem = Path(filename).stem
    stem = re.sub(r"(?i)\d{2,3}\s*-?\s*bpm", "", stem)  # drop "140bpm"
    stem = re.sub(r"(?i)(?:^|[\s_\-\[\(])[A-G](?:#|b)?\s*-?(?:maj(?:or)?|min(?:or)?|m)(?=$|[\s_\-\]\)])", " ", stem)
    stem = re.sub(r"[_\-\[\]\(\)]+", " ", stem)
    return re.sub(r"\s+", " ", stem).strip().title() or "New Loop"


def build_caption(title: str, a: Analysis, tags: list[str]) -> str:
    bpm = f"{a.bpm} BPM" if a.bpm else "free tempo"
    return (
        f"🔥 <b>{html.escape(title)}</b>\n\n"
        f"🎹 Key: <b>{a.key_name}</b> ({a.camelot})\n"
        f"⏱ Tempo: <b>{bpm}</b>\n\n"
        f"{' '.join(tags)}"
    )[:1024]  # Telegram caption limit


def report(a: Analysis) -> str:
    conf = "from filename" if a.key_source == "filename" else f"confidence {a.confidence:.0%}"
    lines = [f"🎹 {a.key_name} ({a.camelot}) — {conf}",
             f"⏱ {a.bpm or '?'} BPM ({a.bpm_source})",
             f"⌛ {a.duration:.1f}s"]
    if a.key_source == "detected" and a.confidence < 0.35 and a.alternatives:
        lines.append("⚠️ Low confidence. Could also be: " + ", ".join(a.alternatives))
        lines.append("Tip: put the key in the filename (e.g. loop_140bpm_Cmin.mp3) to override.")
    return "\n".join(lines)


async def post_to_channel(context: ContextTypes.DEFAULT_TYPE, job: dict) -> Message:
    with open(job["path"], "rb") as fh:
        return await context.bot.send_audio(
            chat_id=CHANNEL_ID,
            audio=fh,
            filename=job["filename"],
            title=job["title"],
            performer=ARTIST,
            caption=job["caption"],
            parse_mode=ParseMode.HTML,
        )


def post_link(msg: Message) -> str:
    return msg.link or "channel"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Send me an mp3/wav loop. I'll find the key + BPM, add hashtags and post it "
        "to the channel.\n\nOptional: add a caption — first line = loop name, "
        "other words become hashtags (e.g. \"Midnight Keys\\ndark piano\").\n\n"
        f"Your user id: {update.effective_user.id}"
    )


async def whoami(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(f"Your user id: {update.effective_user.id}")


async def handle_audio(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = update.message
    if not is_owner(update):
        await msg.reply_text("Not authorized.")
        return

    media = msg.audio or msg.document or msg.voice
    filename = getattr(media, "file_name", None) or "loop.mp3"
    caption = msg.caption or ""
    if media.file_size and media.file_size > 20 * 1024 * 1024:
        await msg.reply_text("File over 20 MB — Telegram bots can't download that. Export a smaller mp3.")
        return

    status = await msg.reply_text("🎧 Analyzing…")
    tmpdir = Path(tempfile.mkdtemp(prefix="loopbot_"))
    path = tmpdir / re.sub(r"[^\w.\-]", "_", filename)
    try:
        tg_file = await media.get_file()
        await tg_file.download_to_drive(path)
        a = await asyncio.to_thread(analyze, str(path), filename)
    except Exception as exc:  # noqa: BLE001
        log.exception("analysis failed")
        await status.edit_text(f"❌ Couldn't analyze that file: {exc}")
        return

    title = loop_title(filename, caption)
    extra_words = "\n".join(caption.splitlines()[1:]) if caption and not caption.startswith("#") else caption
    tags = make_hashtags(a, extra_words, BASE_TAGS, TAG_LIMIT)
    job = {"path": str(path), "filename": filename, "title": title,
           "caption": build_caption(title, a, tags)}

    if AUTO_POST:
        try:
            sent = await post_to_channel(context, job)
        except Exception as exc:  # noqa: BLE001
            log.exception("post failed")
            await status.edit_text(f"{report(a)}\n\n❌ Post failed: {exc}\n"
                                   "Is the bot an admin of the channel?")
            return
        await status.edit_text(f"✅ Posted: {post_link(sent)}\n\n{report(a)}\n\n{' '.join(tags)}")
    else:
        job_id = uuid.uuid4().hex[:12]
        PENDING[job_id] = job
        buttons = InlineKeyboardMarkup([[
            InlineKeyboardButton("✅ Post", callback_data=f"post:{job_id}"),
            InlineKeyboardButton("✖️ Cancel", callback_data=f"cancel:{job_id}"),
        ]])
        await status.edit_text(
            f"{report(a)}\n\nPreview:\n\n{job['caption']}",
            parse_mode=ParseMode.HTML,
            reply_markup=buttons,
        )


async def handle_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not is_owner(update):
        return
    action, job_id = query.data.split(":", 1)
    job = PENDING.pop(job_id, None)
    if not job:
        await query.edit_message_reply_markup(None)
        return
    if action == "cancel":
        await query.edit_message_text("Cancelled.")
        return
    try:
        sent = await post_to_channel(context, job)
        await query.edit_message_text(f"✅ Posted: {post_link(sent)}")
    except Exception as exc:  # noqa: BLE001
        log.exception("post failed")
        await query.edit_message_text(f"❌ Post failed: {exc}")


def main() -> None:
    if not OWNER_IDS:
        log.warning("OWNER_IDS not set — ANYONE who finds the bot can post to your channel!")
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("id", whoami))
    app.add_handler(MessageHandler(filters.ChatType.PRIVATE & AUDIO_FILTER, handle_audio))
    app.add_handler(CallbackQueryHandler(handle_button))
    log.info("Loop bot running. Channel=%s auto_post=%s", CHANNEL_ID, AUTO_POST)
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
