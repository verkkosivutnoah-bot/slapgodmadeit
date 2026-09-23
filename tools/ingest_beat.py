#!/usr/bin/env python3
"""
Ingest a beat folder into the SLAPGOD site.

  python3 tools/ingest_beat.py "~/Desktop/Beats to upload/Midnight Ritual 140bpm"

Dry run by default: it analyses, prints what it found and what it WOULD write, and
touches nothing. Add --publish to actually write files and the catalog entry.

What it does
  1. BPM from the filename (140bpm / 140 bpm / _140_); falls back to detection.
  2. Key from the audio, via telegram-loop-bot/analyze.py (librosa).
  3. Tagged preview: your producer tag mixed in every ~20s, encoded to AAC (.m4a)
     with afconvert — the ONLY audio that lands in web/public.
  4. Master / untagged / stems copied to web/private/beats/<slug>/ (never public).
  5. Hashtags + a social caption.
  6. Appends the entry to web/src/data/beats.ts.

No ffmpeg needed: mixing is numpy + soundfile, encoding is macOS afconvert.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOT = ROOT / "telegram-loop-bot"
WEB = ROOT / "web"
PUBLIC_AUDIO = WEB / "public" / "audio" / "beats"
PRIVATE_BEATS = WEB / "private" / "beats"
BEATS_TS = WEB / "src" / "data" / "beats.ts"
TAG_FILE = WEB / "public" / "audio" / "tag" / "slapgod-tag.mp3"

AUDIO_EXT = {".wav", ".aif", ".aiff", ".flac", ".mp3", ".m4a"}
PREVIEW_SECONDS = 45          # length of the public preview
TAG_EVERY = 20.0              # seconds between producer-tag drops
TAG_GAIN = 0.85               # tag loudness relative to the beat
FADE = 0.8                    # fade-out at the end of the preview

GENRES = ["Trap", "Drill", "Dark Trap", "R&B", "Boom Bap", "Afrobeats"]
MOODS = ["Dark", "Aggressive", "Hypnotic", "Nostalgic", "Sensual", "Bouncy", "Moody", "Energetic"]

# Hashtags that always go out, then genre- and mood-specific ones.
BASE_TAGS = ["slapgod", "slapgodmadeit"]
GENRE_TAGS = {
    "Trap": ["trapbeats", "typebeat", "trapinstrumental"],
    "Drill": ["drillbeat", "ukdrill", "drilltypebeat"],
    "Dark Trap": ["darktrap", "darkbeat", "trapbeats"],
    "R&B": ["rnbbeats", "rnbtypebeat", "smoothbeats"],
    "Boom Bap": ["boombap", "lofibeats", "90shiphop"],
    "Afrobeats": ["afrobeats", "afrotypebeat", "amapiano"],
}
MOOD_TAGS = {
    "Dark": ["darkbeats"], "Aggressive": ["hardbeats"], "Hypnotic": ["hypnotic"],
    "Nostalgic": ["nostalgicbeats"], "Sensual": ["smooth"], "Bouncy": ["bouncybeat"],
    "Moody": ["moodybeats"], "Energetic": ["energy"],
}


# ----------------------------------------------------------------- helpers

def die(msg: str) -> None:
    print(f"\n✗ {msg}\n", file=sys.stderr)
    raise SystemExit(1)


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def title_from(name: str) -> str:
    """'Midnight Ritual 140bpm_Fmin' -> 'Midnight Ritual'"""
    s = re.sub(r"[_\-]+", " ", name)
    s = re.sub(r"\b\d{2,3}\s*bpm\b", " ", s, flags=re.I)
    s = re.sub(r"\b[A-G][#b]?\s*(min|maj|minor|major|m)\b", " ", s, flags=re.I)
    s = re.sub(r"\b(master|mix|final|v\d+|untagged|tagged|wav|mp3)\b", " ", s, flags=re.I)
    s = re.sub(r"@\S+", " ", s)
    return " ".join(w if w.isupper() else w.capitalize() for w in s.split()) or name


def bpm_from_filename(name: str) -> int | None:
    m = re.search(r"(\d{2,3})\s*bpm", name, flags=re.I) or re.search(r"[_\-\s](\d{2,3})[_\-\s]", name)
    if not m:
        return None
    bpm = int(m.group(1))
    return bpm if 40 <= bpm <= 300 else None


def fmt_duration(seconds: float) -> str:
    return f"{int(seconds) // 60}:{int(seconds) % 60:02d}"


def pick(prompt: str, options: list[str], default: str) -> str:
    print(f"\n{prompt}")
    for i, o in enumerate(options, 1):
        print(f"  {i}. {o}{'  (default)' if o == default else ''}")
    raw = input("> ").strip()
    if not raw:
        return default
    if raw.isdigit() and 1 <= int(raw) <= len(options):
        return options[int(raw) - 1]
    return raw if raw in options else default


def pick_many(prompt: str, options: list[str], default: list[str]) -> list[str]:
    print(f"\n{prompt} (comma-separated numbers, Enter for {', '.join(default)})")
    for i, o in enumerate(options, 1):
        print(f"  {i}. {o}")
    raw = input("> ").strip()
    if not raw:
        return default
    chosen = [options[int(n) - 1] for n in re.findall(r"\d+", raw) if 1 <= int(n) <= len(options)]
    return chosen or default


# ------------------------------------------------------------------ model

@dataclass
class Ingest:
    folder: Path
    master: Path
    slug: str
    title: str
    bpm: int
    bpm_source: str
    key: str
    key_confidence: float
    key_alternatives: list[str]
    duration: float
    genre: str = "Trap"
    moods: list[str] = field(default_factory=lambda: ["Dark"])
    tags: list[str] = field(default_factory=list)
    extras: dict[str, Path] = field(default_factory=dict)   # kind -> file
    cover: Path | None = None

    @property
    def hashtags(self) -> list[str]:
        out = list(BASE_TAGS)
        out += GENRE_TAGS.get(self.genre, [])[:2]
        for m in self.moods:
            out += MOOD_TAGS.get(m, [])
        out += [f"{self.bpm}bpm", self.key.replace(" ", "").replace("#", "sharp").lower()]
        seen, uniq = set(), []
        for t in out:
            if t not in seen:
                seen.add(t)
                uniq.append(t)
        return uniq[:10]

    @property
    def caption(self) -> str:
        return (
            f'"{self.title}" — {self.bpm} BPM · {self.key}\n'
            f"Prod. by SLAPGOD (@slapgodmadeit)\n"
            f"Lease it: slapgodmadeit.vercel.app/beats/{self.slug}\n\n"
            + " ".join(f"#{t}" for t in self.hashtags)
        )


# ---------------------------------------------------------------- scanning

def classify(files: list[Path]) -> tuple[Path | None, dict[str, Path], Path | None]:
    """Pick the master, the extra deliverables and the cover."""
    master: Path | None = None
    extras: dict[str, Path] = {}
    cover: Path | None = None

    for f in sorted(files):
        low = f.name.lower()
        if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            cover = f
        elif f.suffix.lower() == ".zip" or "stem" in low:
            extras["stems"] = f
        elif f.suffix.lower() in AUDIO_EXT:
            tagged = "tag" in low and "untag" not in low
            if tagged:
                extras["tagged"] = f
            elif f.suffix.lower() in {".wav", ".aif", ".aiff", ".flac"}:
                extras["wav"] = f
                master = master or f
            elif f.suffix.lower() in {".mp3", ".m4a"}:
                extras["mp3"] = f
                master = master or f
    # prefer a lossless master when both exist
    if "wav" in extras:
        master = extras["wav"]
    return master, extras, cover


# ---------------------------------------------------------------- analysis

def analyse(master: Path) -> tuple[str, float, list[str], int | None, float]:
    sys.path.insert(0, str(BOT))
    try:
        import analyze  # type: ignore
    except ModuleNotFoundError as e:
        die(f"Can't import the analyser ({e}). Run with the bot's Python:\n"
            f"  {BOT}/.venv/bin/python tools/ingest_beat.py ...")
    a = analyze.analyze(str(master))  # type: ignore
    key = f"{a.key} {'min' if a.mode == 'minor' else 'maj'}"
    return key, a.confidence, a.alternatives, a.bpm, a.duration


# ------------------------------------------------------------ audio output

def build_preview(master: Path, out_m4a: Path, tag: Path | None) -> None:
    """Preview with the producer tag mixed in every TAG_EVERY seconds → AAC .m4a."""
    import numpy as np
    import soundfile as sf

    data, sr = sf.read(str(master), always_2d=True, dtype="float32")
    data = data[: int(PREVIEW_SECONDS * sr)]

    if tag and tag.exists():
        t, tsr = sf.read(str(tag), always_2d=True, dtype="float32")
        if tsr != sr:                                  # cheap linear resample
            idx = np.linspace(0, len(t) - 1, int(len(t) * sr / tsr))
            t = np.stack([np.interp(idx, np.arange(len(t)), t[:, c]) for c in range(t.shape[1])], axis=1)
        if t.shape[1] != data.shape[1]:
            t = np.repeat(t[:, :1], data.shape[1], axis=1) if data.shape[1] > 1 else t[:, :1]
        t = t * TAG_GAIN
        pos = int(2.0 * sr)                            # first drop 2s in
        while pos + len(t) < len(data):
            data[pos:pos + len(t)] += t
            pos += int(TAG_EVERY * sr)

    peak = float(np.max(np.abs(data))) or 1.0
    data = data / peak * 0.95
    fade = int(FADE * sr)
    if len(data) > fade:
        data[-fade:] *= np.linspace(1.0, 0.0, fade)[:, None]

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, data, sr)
        out_m4a.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", tmp.name, str(out_m4a)],
            check=True, capture_output=True,
        )
    os.unlink(tmp.name)


# --------------------------------------------------------------- catalog

def ts_entry(i: Ingest) -> str:
    moods = ", ".join(f'"{m}"' for m in i.moods)
    tags = ", ".join(f'"{t}"' for t in i.tags[:3])
    return (f'  beat("{i.slug}", "{i.title}", "beats/{i.slug}", "{i.genre}", {i.bpm}, '
            f'"{i.key}", [{moods}], [{tags}], {{ isNew: true, duration: "{fmt_duration(min(i.duration, PREVIEW_SECONDS))}" }}),')


def append_to_catalog(entry: str) -> None:
    src = BEATS_TS.read_text()
    marker = "export const beats: Beat[] = ["
    at = src.index(marker) + len(marker)
    BEATS_TS.write_text(src[:at] + "\n" + entry + src[at:])


def write_all(i: Ingest, extras: dict[str, Path], cover: Path | None,
              conf: float, alts: list[str]) -> dict:
    """Encode the preview, copy the private files, write meta.json, append the catalog entry."""
    preview = PUBLIC_AUDIO / f"{i.slug}.m4a"
    build_preview(i.master, preview, TAG_FILE)

    priv = PRIVATE_BEATS / i.slug
    priv.mkdir(parents=True, exist_ok=True)
    for f in extras.values():
        shutil.copy2(f, priv / f.name)

    cover_out = None
    if cover:
        dest = WEB / "public" / "covers" / "beats" / f"{i.slug}{cover.suffix.lower()}"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(cover, dest)
        cover_out = str(dest.relative_to(WEB))

    meta = {
        "slug": i.slug, "title": i.title, "bpm": i.bpm, "bpmSource": i.bpm_source,
        "key": i.key, "keyConfidence": round(conf, 3), "keyAlternatives": alts,
        "genre": i.genre, "moods": i.moods, "tags": i.tags,
        "hashtags": i.hashtags, "caption": i.caption,
        "sourceFiles": {k: v.name for k, v in extras.items()},
    }
    (priv / "meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False))

    append_to_catalog(ts_entry(i))
    return {
        "published": True,
        "preview": str(preview.relative_to(WEB)),
        "private": str(priv.relative_to(WEB)),
        "coverWritten": cover_out,
    }


# ------------------------------------------------------------------- main

def main() -> None:
    ap = argparse.ArgumentParser(description="Ingest a beat folder into the SLAPGOD site.")
    ap.add_argument("folder", help="folder holding the files for ONE beat")
    ap.add_argument("--publish", action="store_true", help="actually write files and the catalog entry")
    ap.add_argument("--slug", help="override the URL slug")
    ap.add_argument("--title", help="override the title")
    ap.add_argument("--genre", help=f"one of: {', '.join(GENRES)}")
    ap.add_argument("--moods", help="comma-separated, e.g. Dark,Hypnotic")
    ap.add_argument("--tags", help="comma-separated descriptors, e.g. bells,808 glide")
    ap.add_argument("--yes", action="store_true", help="don't ask anything, take the defaults")
    ap.add_argument("--json", action="store_true", help="machine-readable output, never prompts (used by the admin dashboard)")
    ap.add_argument("--key", help="override the detected key, e.g. 'F min'")
    ap.add_argument("--bpm", type=int, help="override the BPM")
    ap.add_argument("--price", type=int, default=29, help="lease price floor shown on the card")
    args = ap.parse_args()

    folder = Path(os.path.expanduser(args.folder)).resolve()
    if not folder.is_dir():
        die(f"Not a folder: {folder}")

    files = [f for f in folder.iterdir() if f.is_file() and not f.name.startswith(".")]
    master, extras, cover = classify(files)
    if not master:
        die(f"No audio found in {folder}. Expected a .wav / .mp3 to work from.")

    print(f"\n▸ {folder.name}")
    print(f"  files: {', '.join(f'{k}={v.name}' for k, v in extras.items()) or '—'}")

    name_bpm = bpm_from_filename(master.name) or bpm_from_filename(folder.name)
    print("\n  analysing audio (key detection takes ~10-20s)…")
    key, conf, alts, det_bpm, duration = analyse(master)

    bpm = name_bpm or det_bpm
    if not bpm:
        die("No BPM in the filename and detection failed. Rename the file like 'Name 140bpm.wav'.")
    bpm_source = "filename" if name_bpm else "detected"

    title = args.title or title_from(master.stem)
    slug = args.slug or slugify(title)
    genre = args.genre or GENRES[0]
    moods = [m.strip() for m in args.moods.split(",")] if args.moods else ["Dark"]
    tags = [t.strip() for t in args.tags.split(",")] if args.tags else []

    if args.key:
        key = args.key
        conf = 1.0
    if args.bpm:
        bpm = args.bpm
        bpm_source = "override"

    # Only ask about what you didn't already pass on the command line.
    if not args.yes and not args.json and sys.stdin.isatty():
        if not args.genre:
            genre = pick("Genre?", GENRES, genre)
        if not args.moods:
            moods = pick_many("Moods?", MOODS, moods)
        if not args.tags:
            raw = input("\nDescriptors (comma-separated, e.g. bells, 808 glide)\n> ").strip()
            if raw:
                tags = [t.strip() for t in raw.split(",") if t.strip()]

    ing = Ingest(folder, master, slug, title, bpm, bpm_source, key, conf, alts, duration,
                 genre, moods, tags or ["beat"], extras, cover)

    if args.json:
        payload = {
            "slug": ing.slug, "title": ing.title, "bpm": ing.bpm, "bpmSource": ing.bpm_source,
            "key": ing.key, "keyConfidence": round(conf, 3), "keyAlternatives": alts,
            "duration": round(duration, 2), "durationLabel": fmt_duration(min(duration, PREVIEW_SECONDS)),
            "genre": ing.genre, "moods": ing.moods, "tags": ing.tags,
            "hashtags": ing.hashtags, "caption": ing.caption,
            "files": {k: v.name for k, v in extras.items()},
            "cover": cover.name if cover else None,
            "entry": ts_entry(ing),
        }
        if args.publish:
            payload.update(write_all(ing, extras, cover, conf, alts))
        print(json.dumps(payload, ensure_ascii=False))
        return

    conf_note = "" if conf >= 0.6 else "  ⚠ low confidence — check this one"
    print(f"""
  ── detected ────────────────────────────────
  title      {ing.title}
  slug       {ing.slug}
  bpm        {ing.bpm}  ({ing.bpm_source})
  key        {ing.key}  (confidence {conf:.2f}){conf_note}
  also maybe {', '.join(alts) or '—'}
  duration   {fmt_duration(duration)}
  genre      {ing.genre}   moods: {', '.join(ing.moods)}

  ── would write ─────────────────────────────
  preview    web/public/audio/beats/{ing.slug}.m4a   (tagged, {PREVIEW_SECONDS}s)""")
    for kind, f in extras.items():
        print(f"  {kind:<10} web/private/beats/{ing.slug}/{f.name}")
    if cover:
        print(f"  cover      web/public/covers/beats/{ing.slug}{cover.suffix}")
    print(f"\n  ── catalog entry ───────────────────────────\n{ts_entry(ing)}")
    print(f"\n  ── caption ─────────────────────────────────\n{ing.caption}\n")

    if not args.publish:
        print("Dry run. Nothing written. Re-run with --publish when it looks right.\n")
        return

    print("  encoding preview…")
    write_all(ing, extras, cover, conf, alts)

    print(f"""
✓ Published locally.

  Next:
    cd web && npm run build          # check it compiles
    open http://localhost:3000/beats/{ing.slug}
    git add -A && git commit -m "Add beat: {ing.title}" && git push

  Caption + hashtags are saved at web/private/beats/{ing.slug}/meta.json
""")


if __name__ == "__main__":
    main()
