#!/usr/bin/env python3
"""
YouTube uploads for SLAPGOD beats (YouTube Data API v3).

  # once: sign in with the Google account that owns the channel
  telegram-loop-bot/.venv/bin/python tools/youtube.py auth

  # upload (the dashboard calls this for you)
  telegram-loop-bot/.venv/bin/python tools/youtube.py upload \\
      --video no-faces.mp4 --thumbnail thumb.jpg --title "No Faces" --artist "EBK Young Joc" \\
      --bpm 100 --key "C# maj" --genre Drill --slug no-faces

Files (both gitignored, never commit them):
  tools/youtube-client.json  OAuth client from Google Cloud (Desktop app)
  tools/youtube-token.json   your saved sign-in, written by `auth`

Uploads default to PRIVATE. Google locks uploads from new, unaudited API projects to private
anyway until the project passes YouTube's compliance audit — see docs/YOUTUBE-SETUP.md.
"""
from __future__ import annotations

import argparse
import json
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")  # py3.9 / LibreSSL end-of-life notices from google-auth & urllib3

TOOLS = Path(__file__).resolve().parent
CLIENT = TOOLS / "youtube-client.json"
TOKEN = TOOLS / "youtube-token.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"]
SITE = "https://slapgodmadeit.com"


def die(msg: str, code: int = 1) -> None:
    print(json.dumps({"ok": False, "error": msg}))
    sys.exit(code)


# ------------------------------------------------------------------ auth

def credentials():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    if not TOKEN.exists():
        die("Not signed in to YouTube yet. Run: telegram-loop-bot/.venv/bin/python tools/youtube.py auth")
    creds = Credentials.from_authorized_user_file(str(TOKEN), SCOPES)
    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            TOKEN.write_text(creds.to_json())
        else:
            die("YouTube sign-in expired. Run: telegram-loop-bot/.venv/bin/python tools/youtube.py auth")
    return creds


def cmd_auth(_args) -> None:
    from google_auth_oauthlib.flow import InstalledAppFlow

    if not CLIENT.exists():
        print(f"✗ Missing {CLIENT.name}. Download the OAuth client (Desktop app) from Google Cloud and save it there.")
        sys.exit(1)
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT), SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent", open_browser=True)
    TOKEN.write_text(creds.to_json())
    TOKEN.chmod(0o600)

    from googleapiclient.discovery import build
    yt = build("youtube", "v3", credentials=creds, cache_discovery=False)
    me = yt.channels().list(part="snippet", mine=True).execute().get("items", [])
    name = me[0]["snippet"]["title"] if me else "(no channel found on this account)"
    print(f"✓ Signed in. Uploads will go to: {name}")


# ------------------------------------------------------------ metadata

def youtube_title(artist: str, title: str) -> str:
    """'EBK Young Joc Type Beat - "No Faces"' — YouTube caps titles at 100 characters."""
    artist = artist.strip()
    t = f'{artist} Type Beat - "{title}"' if artist else f'"{title}" Type Beat'
    return t[:100]


def youtube_description(a) -> str:
    beat_url = f"{SITE}/beats/{a.slug}"
    artist = a.artist.strip()
    lines = [
        f"🔑 Lease / buy \"{a.title}\": {beat_url}",
        "Free tagged download on the beat page.",
        "",
        f"{a.bpm} BPM · {a.key} · {a.genre}",
        "Prod. by SLAPGOD",
        "",
        "Leases from €29 · Exclusive rights available — make an offer on the site.",
        "Instagram / TikTok: @slapgodmadeit",
        "",
        "⚠️ This beat is not free for commercial use. Buy a license before releasing a song on it.",
        "Songs on a lease can't be registered in Content ID.",
    ]
    if artist:
        lines += ["", f"{artist} type beat · {artist} type beat {a.genre.lower()} · {a.genre.lower()} type beat"]
    return "\n".join(lines)[:4900]


def youtube_tags(a) -> list[str]:
    artist = a.artist.strip().lower()
    g = a.genre.lower()
    tags = [
        f"{artist} type beat" if artist else "",
        f"{artist} type beat {g}" if artist else "",
        f"{artist} instrumental" if artist else "",
        f"{g} type beat",
        f"{g} beat",
        f"{g} instrumental",
        f"{a.bpm} bpm",
        "type beat",
        "slapgod",
        "prod slapgod",
        a.title.lower(),
    ]
    out, total = [], 0
    for t in [t for t in tags if t]:
        if total + len(t) + 2 > 480:  # YouTube caps the combined tag length at 500 chars
            break
        out.append(t)
        total += len(t) + 2
    return out


# -------------------------------------------------------------- upload

def cmd_upload(a) -> None:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload

    video = Path(a.video)
    if not video.exists():
        die(f"video not found: {video}")

    yt = build("youtube", "v3", credentials=credentials(), cache_discovery=False)
    body = {
        "snippet": {
            "title": youtube_title(a.artist, a.title),
            "description": youtube_description(a),
            "tags": youtube_tags(a),
            "categoryId": "10",  # Music
            "defaultLanguage": "en",
        },
        "status": {
            "privacyStatus": a.privacy,
            "selfDeclaredMadeForKids": False,
            "embeddable": True,
        },
    }

    try:
        req = yt.videos().insert(
            part="snippet,status",
            body=body,
            media_body=MediaFileUpload(str(video), mimetype="video/mp4", chunksize=8 * 1024 * 1024, resumable=True),
        )
        resp = None
        while resp is None:
            _, resp = req.next_chunk()
    except HttpError as e:
        die(f"upload failed: {e.status_code} {e.reason}")

    vid = resp["id"]
    result = {
        "ok": True,
        "id": vid,
        "url": f"https://youtu.be/{vid}",
        "title": body["snippet"]["title"],
        "privacy": resp.get("status", {}).get("privacyStatus", a.privacy),
        "thumbnail": "skipped",
    }

    if a.thumbnail and Path(a.thumbnail).exists():
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(a.thumbnail)).execute()
            result["thumbnail"] = "set"
        except HttpError as e:
            # custom thumbnails need a phone-verified channel
            result["thumbnail"] = f"failed: {e.status_code} {e.reason}"

    print(json.dumps(result))


def main() -> None:
    ap = argparse.ArgumentParser(description="YouTube uploads for SLAPGOD beats")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("auth", help="sign in with the channel's Google account (once)")

    up = sub.add_parser("upload", help="upload one beat video")
    up.add_argument("--video", required=True)
    up.add_argument("--thumbnail")
    up.add_argument("--title", required=True, help="beat name, e.g. No Faces")
    up.add_argument("--artist", default="", help="type-beat artist, e.g. EBK Young Joc")
    up.add_argument("--slug", required=True)
    up.add_argument("--bpm", type=int, required=True)
    up.add_argument("--key", required=True)
    up.add_argument("--genre", required=True)
    up.add_argument("--privacy", choices=["private", "unlisted", "public"], default="private")
    up.add_argument("--dry-run", action="store_true", help="print the metadata, don't upload")

    a = ap.parse_args()
    if a.cmd == "auth":
        cmd_auth(a)
    elif a.dry_run:
        print(json.dumps({"ok": True, "title": youtube_title(a.artist, a.title),
                          "description": youtube_description(a), "tags": youtube_tags(a)}, ensure_ascii=False, indent=2))
    else:
        cmd_upload(a)


if __name__ == "__main__":
    main()
