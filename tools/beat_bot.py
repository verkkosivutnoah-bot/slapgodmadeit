#!/usr/bin/env python3
"""
SLAPGOD beat bot — send a beat to Telegram, it lands on the site.

Flow: send an mp3 (BPM in the filename, e.g. "Midnight Ritual 140bpm.mp3")
  → the bot detects the key, asks for genre and mood with buttons
  → builds the tagged preview, writes the catalog entry
  → builds, commits and pushes; Vercel deploys
  → replies with the live URL and a caption to paste on socials.

Run:  telegram-loop-bot/.venv/bin/python tools/beat_bot.py
Env:  tools/.env  (see tools/.env.example) — BEAT_BOT_TOKEN, OWNER_IDS, TEST_MODE

TEST_MODE=true (default) does everything except commit and push.

Telegram caps bot downloads at 20 MB, so send the mp3. Keep WAV and stems local:
the bot tells you where to drop them (web/private/beats/<slug>/).
"""
from __future__ import annotations

import asyncio
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path

from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
sys.path.insert(0, str(TOOLS))

from ingest_beat import (  # noqa: E402
    GENRES,
    MOODS,
    PREVIEW_SECONDS,
    PRIVATE_BEATS,
    PUBLIC_AUDIO,
    TAG_FILE,
    Ingest,
    analyse,
    append_to_catalog,
    bpm_from_filename,
    build_preview,
    fmt_duration,
    slugify,
    title_from,
    ts_entry,
)

load_dotenv(TOOLS / ".env")
logging.basicConfig(format="%(asctime)s %(levelname)s %(message)s", level=logging.INFO)
log = logging.getLogger("beatbot")

TOKEN = os.environ["BEAT_BOT_TOKEN"]
OWNER_IDS = {int(x) for x in os.getenv("OWNER_IDS", "").replace(" ", "").split(",") if x}
TEST_MODE = os.getenv("TEST_MODE", "true").lower() in ("1", "true", "yes")
SITE = os.getenv("SITE_URL", "https://slapgodmadeit.vercel.app").rstrip("/")
MAX_MB = 20

JOBS: dict[str, dict] = {}


def is_owner(update: Update) -> bool:
    user = update.effective_user
    return bool(user) and user.id in OWNER_IDS


def rows(items: list[str], job_id: str, kind: str, per_row: int = 2, chosen: set[str] | None = None):
    chosen = chosen or set()
    out, row = [], []
    for i, item in enumerate(items):
        label = f"✅ {item}" if item in chosen else item
        row.append(InlineKeyboardButton(label, callback_data=f"{kind}:{job_id}:{i}"))
        if len(row) == per_row:
            out.append(row)
            row = []
    if row:
        out.append(row)
    if kind == "mood":
        out.append([InlineKeyboardButton("▶︎ Publish", callback_data=f"go:{job_id}:0")])
    out.append([InlineKeyboardButton("✖️ Cancel", callback_data=f"cancel:{job_id}:0")])
    return InlineKeyboardMarkup(out)


# ------------------------------------------------------------------ steps

async def on_audio(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = update.message
    if not is_owner(update):
        await msg.reply_text(f"Not authorized. Add {update.effective_user.id} to OWNER_IDS in tools/.env.")
        return

    media = msg.audio or msg.document
    filename = getattr(media, "file_name", None) or "beat.mp3"
    if media.file_size and media.file_size > MAX_MB * 1024 * 1024:
        await msg.reply_text(f"That's over {MAX_MB} MB — Telegram won't hand it to a bot. Send an mp3 export.")
        return
    if not bpm_from_filename(filename):
        await msg.reply_text(
            "No BPM in the filename. Rename it like “Midnight Ritual 140bpm.mp3” and send again —\n"
            "detection guesses wrong too often to trust it."
        )
        return

    tmp = Path(tempfile.mkdtemp(prefix="beatbot_"))
    path = tmp / re.sub(r"[^\w.\-]", "_", filename)
    await context.bot.send_chat_action(msg.chat_id, ChatAction.TYPING)
    try:
        await (await media.get_file()).download_to_drive(path)
    except Exception as exc:  # noqa: BLE001
        shutil.rmtree(tmp, ignore_errors=True)
        await msg.reply_text(f"❌ Download failed: {exc}")
        return

    note = await msg.reply_text("Listening for the key… (~15s)")
    try:
        key, conf, alts, _det_bpm, duration = await asyncio.to_thread(analyse, path)
    except Exception as exc:  # noqa: BLE001
        shutil.rmtree(tmp, ignore_errors=True)
        await note.edit_text(f"❌ Couldn't analyse that: {exc}")
        return

    title = title_from(path.stem)
    job_id = uuid.uuid4().hex[:8]
    JOBS[job_id] = {
        "tmp": tmp,
        "master": path,
        "title": title,
        "slug": slugify(title),
        "bpm": bpm_from_filename(filename),
        "key": key,
        "conf": conf,
        "alts": alts,
        "duration": duration,
        "genre": None,
        "moods": set(),
        "chat_id": msg.chat_id,
    }

    warn = "" if conf >= 0.6 else f"\n⚠️ low confidence — maybe {', '.join(alts[:2])}"
    await note.edit_text(
        f"*{title}*\n{JOBS[job_id]['bpm']} BPM · {key} · {fmt_duration(duration)}{warn}\n\nGenre?",
        parse_mode="Markdown",
        reply_markup=rows(GENRES, job_id, "genre"),
    )
    JOBS[job_id]["note_id"] = note.message_id


async def on_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not is_owner(update):
        return
    action, job_id, idx = query.data.split(":")
    job = JOBS.get(job_id)
    if not job:
        await query.edit_message_text("That one's gone — send the beat again.")
        return

    if action == "cancel":
        shutil.rmtree(job["tmp"], ignore_errors=True)
        JOBS.pop(job_id, None)
        await query.edit_message_text("Cancelled.")
        return

    if action == "genre":
        job["genre"] = GENRES[int(idx)]
        await query.edit_message_text(
            f"*{job['title']}*\n{job['bpm']} BPM · {job['key']} · {job['genre']}\n\nMood? (tap any, then Publish)",
            parse_mode="Markdown",
            reply_markup=rows(MOODS, job_id, "mood", chosen=job["moods"]),
        )
        return

    if action == "mood":
        mood = MOODS[int(idx)]
        job["moods"] ^= {mood}
        await query.edit_message_reply_markup(rows(MOODS, job_id, "mood", chosen=job["moods"]))
        return

    if action == "go":
        await query.edit_message_text(f"Publishing *{job['title']}*…", parse_mode="Markdown")
        try:
            result = await asyncio.to_thread(publish, job)
        except Exception as exc:  # noqa: BLE001
            log.exception("publish failed")
            await query.edit_message_text(f"❌ {exc}")
            return
        finally:
            shutil.rmtree(job["tmp"], ignore_errors=True)
            JOBS.pop(job_id, None)
        await query.edit_message_text(result, parse_mode="Markdown", disable_web_page_preview=True)


# --------------------------------------------------------------- publish

def run(cmd: list[str], cwd: Path) -> None:
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"`{' '.join(cmd[:2])}` failed:\n{(p.stderr or p.stdout)[-600:]}")


def publish(job: dict) -> str:
    ing = Ingest(
        folder=job["tmp"], master=job["master"], slug=job["slug"], title=job["title"],
        bpm=job["bpm"], bpm_source="filename", key=job["key"], key_confidence=job["conf"],
        key_alternatives=job["alts"], duration=job["duration"],
        genre=job["genre"] or GENRES[0], moods=sorted(job["moods"]) or ["Dark"], tags=["beat"],
    )

    build_preview(ing.master, PUBLIC_AUDIO / f"{ing.slug}.m4a", TAG_FILE)

    priv = PRIVATE_BEATS / ing.slug
    priv.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ing.master, priv / ing.master.name)

    append_to_catalog(ts_entry(ing))

    web = ROOT / "web"
    run(["npm", "run", "build"], web)

    if TEST_MODE:
        return (
            f"✅ *{ing.title}* built locally (TEST_MODE — nothing pushed)\n"
            f"{ing.bpm} BPM · {ing.key} · {ing.genre}\n\n"
            f"Set TEST_MODE=false in tools/.env to publish for real.\n\n{ing.caption}"
        )

    run(["git", "add", "-A"], ROOT)
    run(["git", "commit", "-m", f"Add beat: {ing.title}"], ROOT)
    run(["git", "push", "origin", "main"], ROOT)

    return (
        f"✅ *{ing.title}* is live\n{SITE}/beats/{ing.slug}\n"
        f"{ing.bpm} BPM · {ing.key} · {ing.genre} · preview {PREVIEW_SECONDS}s, tagged\n\n"
        f"Drop the WAV and stems in:\n`web/private/beats/{ing.slug}/`\n\n{ing.caption}"
    )


# ------------------------------------------------------------- commands

async def start(update: Update, _c: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Send me a beat as an mp3 with the BPM in the filename, e.g. “Midnight Ritual 140bpm.mp3”.\n\n"
        "I'll find the key, ask for genre and mood, build a tagged preview and put it on the site.\n"
        f"{'TEST MODE — I build but never push.' if TEST_MODE else 'LIVE — every publish deploys.'}"
    )


async def whoami(update: Update, _c: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(f"Your Telegram id: {update.effective_user.id}")


def main() -> None:
    if not OWNER_IDS:
        log.warning("OWNER_IDS empty — nobody can publish. Send /id to the bot and add it to tools/.env.")
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("id", whoami))
    app.add_handler(MessageHandler(filters.ChatType.PRIVATE & (filters.AUDIO | filters.Document.AUDIO), on_audio))
    app.add_handler(CallbackQueryHandler(on_button))
    log.info("beat bot up — %s", "TEST MODE (no push)" if TEST_MODE else "LIVE (pushes to main)")
    app.run_polling()


if __name__ == "__main__":
    main()
