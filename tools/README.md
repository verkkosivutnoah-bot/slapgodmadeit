# Beat ingest CLI

Drop the files for one beat in a folder, run one command, and the beat is on the site.

```bash
cd "/Users/noahtuokkola/Desktop/Slapgod Website"

# 1. look first — analyses and prints, writes nothing
telegram-loop-bot/.venv/bin/python tools/ingest_beat.py "~/Desktop/Beats/Midnight Ritual 140bpm"

# 2. when it looks right
telegram-loop-bot/.venv/bin/python tools/ingest_beat.py "~/Desktop/Beats/Midnight Ritual 140bpm" --publish
```

Use the bot's Python (`telegram-loop-bot/.venv/bin/python`) — that's where librosa lives.

## The folder

One folder per beat. Name files however you like; the script sorts them out:

```
Midnight Ritual 140bpm/
  Midnight Ritual 140bpm.wav        → master (analysed, kept private)
  Midnight Ritual 140bpm.mp3        → kept private
  Midnight Ritual TAGGED.mp3        → recognised as the tagged version
  stems.zip                         → kept private
  cover.jpg                         → becomes the cover art
```

**Put the BPM in a filename** (`140bpm`, `140 bpm`, or `_140_`). The script trusts it.
Without it, it falls back to detecting the tempo, which is less reliable on short or
sparse material.

## What it does

| Step | Detail |
|---|---|
| BPM | From the filename; detection only as fallback |
| Key | `telegram-loop-bot/analyze.py` (librosa, chord-aware). Prints a confidence score and flags anything under 0.60 |
| Preview | First 45s, your producer tag mixed in every 20s, normalised, faded, encoded to AAC `.m4a` |
| Private files | wav / mp3 / tagged / stems → `web/private/beats/<slug>/` — never served publicly |
| Cover | Copied to `web/public/covers/beats/<slug>.jpg` if present |
| Catalog | Entry appended to `web/src/data/beats.ts` |
| Caption | Social caption + hashtags saved in `web/private/beats/<slug>/meta.json` |

Genre, moods and descriptors can't be detected — the script asks, or takes
`--genre`, `--moods`, `--tags`. Add `--yes` to skip the questions.

## After publishing

```bash
cd web && npm run build
git add -A && git commit -m "Add beat: <title>" && git push
```

Vercel deploys on push.

## Notes

- **No ffmpeg needed.** Mixing is numpy + soundfile; encoding is macOS `afconvert`.
- **Only the tagged preview is public.** The clean files sit in `web/private/` and are
  reachable only through signed links (same mechanism as the free kit).
- **Key detection is good, not perfect.** On sparse or atonal material confidence drops —
  that's what the warning is for. Override by editing the entry in `beats.ts`.
- **Re-running for the same slug** overwrites the preview and private files but appends a
  second catalog entry. Remove the old line from `beats.ts` first.

---

# Beat bot (Telegram)

Same idea, no terminal: send the beat to a bot, answer two taps, it's on the site.

```
you ──mp3──▶ bot ──▶ key detected ──▶ [genre?] ──▶ [moods?] ──▶ [Publish]
                                                                  │
                        preview + catalog entry + build + push ◀──┘
                                                                  │
                        live URL + caption to paste ◀─────────────┘
```

## Setup (once)

1. **@BotFather** → `/newbot` → make a *separate* bot from the loop bot, e.g. `@slapgod_beats_bot`.
   Copy the token.
2. `cp tools/.env.example tools/.env` and paste the token into `BEAT_BOT_TOKEN`.
3. Start the bot, send it `/id`, put the number in `OWNER_IDS`.
4. Leave `TEST_MODE=true` until you have published one beat happily — it builds but never pushes.

## Run

```bash
cd "/Users/noahtuokkola/Desktop/Slapgod Website"
telegram-loop-bot/.venv/bin/python tools/beat_bot.py
```

It runs on your Mac, because publishing needs the repo, `npm run build` and your git
credentials. Close the terminal and the bot stops.

## Using it

Send an mp3 **with the BPM in the filename** — `Midnight Ritual 140bpm.mp3`. Without it the
bot refuses rather than guessing. Then tap a genre, tap any moods, tap Publish.

## Limits worth knowing

- **20 MB.** Telegram won't hand a bot anything bigger, so send mp3s. The bot replies with the
  folder to drop the WAV and stems into (`web/private/beats/<slug>/`) — they never need to
  travel through Telegram.
- **Title comes from the filename.** Rename before sending if you want something else.
- **Descriptors default to "beat".** Edit the line in `beats.ts` if you want better ones.
- **Key detection is good, not perfect.** Under 0.60 confidence the bot shows a warning and its
  next guesses.
