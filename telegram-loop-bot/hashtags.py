"""Hashtag generation for loop posts."""

from __future__ import annotations

import re

from analyze import FLAT_NAMES, Analysis

# (min bpm, max bpm, tags) — a loop can match several ranges.
GENRE_BY_BPM = [
    (60, 79, ["rnb", "soul", "lofi"]),
    (80, 99, ["boombap", "hiphop", "lofi"]),
    (100, 119, ["rnb", "afrobeats", "reggaeton"]),
    (120, 129, ["house", "afrohouse"]),
    (130, 170, ["trap", "trapbeats"]),
    (138, 146, ["drill", "ukdrill"]),
    (145, 165, ["pluggnb", "rage"]),
    (170, 180, ["dnb", "jersey club"]),
]

MOOD_BY_MODE = {
    "minor": ["dark", "emotional", "melodic"],
    "major": ["uplifting", "melodic", "bouncy"],
}

ALWAYS = ["loops", "samples", "producer", "flstudio", "beatmaker", "melodyloops", "samplepack"]


def _tag(word: str) -> str:
    return "#" + re.sub(r"[^a-z0-9]", "", word.lower())


def make_hashtags(a: Analysis, caption: str = "", base_tags: list[str] | None = None,
                  limit: int = 25) -> list[str]:
    tags: list[str] = []

    def add(*words: str) -> None:
        for w in words:
            t = _tag(w)
            if len(t) > 1 and t not in tags:
                tags.append(t)

    add(*(base_tags or []))

    # Words the user wrote in the caption, e.g. "dark guitar pluggnb"
    for word in re.findall(r"#?([A-Za-z0-9]{3,})", caption):
        add(word)

    # Key tags: #cminor #cmin #5a (+ flat spelling: #dbminor)
    key = a.key.replace("#", "sharp")
    add(f"{key}{a.mode}", f"{key}{a.mode[:3]}", a.camelot)
    if a.key in FLAT_NAMES:
        add(f"{FLAT_NAMES[a.key]}{a.mode}")

    if a.bpm:
        add(f"{a.bpm}bpm")
        for lo, hi, genres in GENRE_BY_BPM:
            if lo <= a.bpm <= hi:
                add(*genres)
                if "trap" in genres:
                    add("typebeat")

    add(*MOOD_BY_MODE[a.mode])
    add(*ALWAYS)
    return tags[:limit]
