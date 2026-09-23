# SLAPGOD Loop Bot

Send an mp3/wav to the bot → it detects **key** (+ Camelot) and **BPM**, writes **hashtags**, and posts the loop to your Telegram channel.

## Setup (one time, ~5 min)

1. **Create the bot:** in Telegram, message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token.
2. **Add the bot to your loop channel as an admin** (needs "Post messages").
3. **Configure:**
   ```bash
   cp .env.example .env
   ```
   Fill `BOT_TOKEN` and `CHANNEL_ID` (`@yourchannel`, or `-100…` for a private channel).
4. **Install + run:**
   ```bash
   python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
   .venv/bin/python bot.py
   ```
5. DM your bot `/id`, put the number in `OWNER_IDS` in `.env`, restart. (Only owners can post.)

## Use

- Drop an mp3/wav in the chat with the bot. Done — it posts to the channel and replies with the link.
- **Caption (optional):** first line = loop name, next lines = extra hashtag words.
  ```
  Midnight Ride
  dark guitar pluggnb
  ```
- **Key** always comes from the audio (key labels in filenames are often wrong).
- **BPM** is read from the filename when it has one (e.g. `100bpm`), otherwise detected. The bot warns if the audio disagrees.
- The posted file is renamed so downloads carry everything: `Spanish Guitar-@slapgodmadeit-100bpm-Cmin.mp3`.
- `AUTO_POST=false` in `.env` → bot shows a preview with ✅ Post / ✖️ Cancel buttons first.

## Renaming the original file on your Mac

After posting, the bot finds the loop you sent on your Mac (same name and size, via Spotlight)
and renames it with the key. Copies inside the website project, FL Studio projects, the Music
library and Trash are left alone.

One-time setup: **System Settings → Privacy & Security → Full Disk Access → +**, press
Cmd+Shift+G, paste `/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/Resources/Python.app`,
add it, then re-run `./install_service.sh`. (The background service can't see Desktop/Documents otherwise.)

## How key + BPM detection works

**Key** — two independent methods vote:
1. *Pitch profile:* drums removed, tuning corrected, then the overall note balance is matched against 4 published key profiles.
2. *Chord analysis:* the chord progression and bass notes are recognised, then each key is scored by how well the chords fit, how long the loop sits on the home chord, and whether it starts there.

Close calls between relative keys (C minor / Eb major) are settled by the loop's opening and bass. When the result is uncertain, the bot says so and lists the alternatives, and it warns when audio is detuned between two keys.

**BPM** (when the filename has none) — exact loop length (wav/aiff/flac cut to whole bars), how long the progression takes to repeat, and the rhythmic pulse. Low confidence → the bot warns it may be half/double time.

Test locally on files: `.venv/bin/python analyze.py path/to/loop.mp3`

## Keep it running (without Claude or a terminal)

```bash
./install_service.sh
```
Installs the bot as a macOS background service: starts at login, restarts if it crashes.
It runs from a copy in `~/slapgod-loop-bot` (macOS blocks background services from the Desktop),
so **re-run the script after changing code or `.env`**. Log: `~/slapgod-loop-bot/bot.log`.
Remove it with `./install_service.sh uninstall`.

The Mac still has to be on and awake. For true 24/7, host it on a small VPS / Railway / Fly.io.
