# YouTube autoposting — setup

The dashboard can post every beat you publish to YouTube: it renders a 1080p video from your
**thumbnail** + the **tagged MP3**, uploads it with a type-beat title, description and tags, and
sets the same image as the video's thumbnail.

The code is done. The steps below connect it to your channel — they need your Google login, so
they're yours. About 10 minutes, once.

## 1. Google Cloud project

1. Go to https://console.cloud.google.com and sign in with the Google account that **owns the
   SLAPGOD YouTube channel**.
2. Top bar → project picker → **New project** → name it `slapgod-uploader` → Create.
3. **APIs & Services → Library** → search **YouTube Data API v3** → **Enable**.

## 2. OAuth consent screen

**APIs & Services → OAuth consent screen** (may be called "Google Auth Platform"):
- User type: **External**
- App name: `SLAPGOD uploader`, support email: yours
- Scopes: you can skip — the tool asks for them
- **Test users → Add users →** the Google account that owns the channel
- Leave it in **Testing** — fine for a single user

## 3. OAuth client

**APIs & Services → Credentials → Create credentials → OAuth client ID**
- Application type: **Desktop app**, name `SLAPGOD dashboard` → Create
- **Download JSON**, rename it to `youtube-client.json`, and move it to:

```
/Users/noahtuokkola/Desktop/Slapgod Website/tools/youtube-client.json
```

(It's gitignored — it never reaches GitHub.)

## 4. Sign in once

```bash
cd "/Users/noahtuokkola/Desktop/Slapgod Website" && telegram-loop-bot/.venv/bin/python tools/youtube.py auth
```

A browser opens: pick the channel's account, click **Continue** past "Google hasn't verified this
app" (it's your own app), allow. The terminal prints `✓ Signed in. Uploads will go to: <channel>`.
That writes `tools/youtube-token.json` (also gitignored). You won't need to do it again unless you
revoke access.

## 5. Custom thumbnails

YouTube only accepts custom thumbnails from **phone-verified** channels:
https://www.youtube.com/verify — without it, uploads work but the thumbnail step reports
`failed` and YouTube picks a frame (which is your thumbnail anyway, since the video is the
image).

## Using it

Dashboard → drop the beat + a **16:9 thumbnail** → fill **Type beat artist** → tick **Post to
YouTube** → choose visibility → Publish. The result panel links to the video.

Title format: `EBK Young Joc Type Beat - "No Faces"`. Description links the beat page, BPM, key,
genre, lease info and a "not free for commercial use" line. Tags cover the artist, genre and BPM.

## The catch: private until audited

Google restricts **new API projects**: videos uploaded through the API are **forced to private**
until the project passes YouTube's compliance audit. So at first:

- the upload works, the video is private → open YouTube Studio and switch it to Public (10 seconds), or
- apply for the audit: https://support.google.com/youtube/contact/yt_api_form — describe it as
  "uploading my own music to my own channel". Once approved, the dashboard's visibility setting
  is respected.

## Limits

- **Quota:** the API gives 10,000 units a day by default and an upload costs a large chunk of
  that — expect a handful of uploads per day, which is plenty. Quota resets at midnight Pacific.
- Rendering is ~5 seconds per beat; upload time depends on your connection (videos are ~8–10 MB).
