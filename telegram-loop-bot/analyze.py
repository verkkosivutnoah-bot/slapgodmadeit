"""Audio analysis: musical key + BPM for loops and samples.

Key detection
-------------
1. Load audio, estimate tuning offset (loops are often detuned / pitched).
2. Separate harmonic content (HPSS) so drums don't pollute the pitch profile.
3. Build energy-weighted CQT chroma.
4. Correlate against 4 published key profiles (Krumhansl-Kessler, Temperley,
   Albrecht-Shanahan, Bellman-Budge) for all 24 keys and average them.
5. Break relative major/minor near-ties using tonic cues (bass energy and the
   loop's opening), with a slight minor prior.
6. Full songs also get a small per-window vote.

A key/BPM written in the filename (e.g. "dark_140bpm_Cmin.mp3") always wins,
since the producer knows best.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

import librosa
import numpy as np

NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
FLAT_NAMES = {"C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb"}

# Camelot wheel: (pitch class, mode) -> code
CAMELOT = {
    (11, "major"): "1B", (6, "major"): "2B", (1, "major"): "3B", (8, "major"): "4B",
    (3, "major"): "5B", (10, "major"): "6B", (5, "major"): "7B", (0, "major"): "8B",
    (7, "major"): "9B", (2, "major"): "10B", (9, "major"): "11B", (4, "major"): "12B",
    (8, "minor"): "1A", (3, "minor"): "2A", (10, "minor"): "3A", (5, "minor"): "4A",
    (0, "minor"): "5A", (7, "minor"): "6A", (2, "minor"): "7A", (9, "minor"): "8A",
    (4, "minor"): "9A", (11, "minor"): "10A", (6, "minor"): "11A", (1, "minor"): "12A",
}

PROFILES = {
    "krumhansl": (
        [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
        [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
    ),
    "temperley": (
        [5.0, 2.0, 3.5, 2.0, 4.5, 4.0, 2.0, 4.5, 2.0, 3.5, 1.5, 4.0],
        [5.0, 2.0, 3.5, 4.5, 2.0, 4.0, 2.0, 4.5, 3.5, 2.0, 1.5, 4.0],
    ),
    "albrecht": (
        [0.238, 0.006, 0.111, 0.006, 0.137, 0.094, 0.016, 0.214, 0.009, 0.080, 0.008, 0.081],
        [0.220, 0.006, 0.104, 0.123, 0.019, 0.103, 0.012, 0.214, 0.062, 0.022, 0.061, 0.052],
    ),
    "bellman": (
        [16.80, 0.86, 12.95, 1.41, 13.49, 11.93, 1.25, 20.28, 1.80, 8.04, 0.62, 10.57],
        [18.16, 0.69, 12.99, 13.34, 1.07, 11.15, 1.38, 21.07, 7.49, 1.53, 0.92, 10.21],
    ),
}

SR = 22050
HOP = 2048
MINOR_PRIOR = 0.02  # beat/loop market is mostly minor
RELATIVE_MARGIN = 0.3


@dataclass
class Analysis:
    key: str  # e.g. "C"
    mode: str  # "major" / "minor"
    camelot: str
    confidence: float  # 0..1
    bpm: int | None
    duration: float
    key_source: str = "detected"  # or "filename"
    bpm_source: str = "detected"
    alternatives: list[str] = field(default_factory=list)

    @property
    def key_name(self) -> str:
        return f"{self.key} {self.mode}"

    @property
    def short_key(self) -> str:
        return f"{self.key}{'m' if self.mode == 'minor' else ''}"


# ---------------------------------------------------------------- key scoring

def _zscore(v: np.ndarray) -> np.ndarray:
    return (v - v.mean()) / (v.std() + 1e-9)


def _key_scores(chroma_vec: np.ndarray) -> np.ndarray:
    """Return 24 scores: index 0-11 major keys, 12-23 minor keys."""
    x = _zscore(chroma_vec)
    scores = np.zeros(24)
    for major, minor in PROFILES.values():
        for i, prof in enumerate((major, minor)):
            p = _zscore(np.asarray(prof, dtype=float))
            for tonic in range(12):
                r = float(np.dot(x, np.roll(p, tonic)) / 12.0)  # Pearson r
                scores[i * 12 + tonic] += r
    return scores / len(PROFILES)


def _detect_key(y: np.ndarray, sr: int) -> tuple[int, str, float, list[str]]:
    tuning = librosa.estimate_tuning(y=y, sr=sr)
    y_harm = librosa.effects.harmonic(y, margin=3.0)
    if np.max(np.abs(y_harm)) < 1e-4:  # nothing tonal survived; use raw audio
        y_harm = y

    chroma = librosa.feature.chroma_cqt(
        y=y_harm, sr=sr, hop_length=HOP, tuning=tuning, n_octaves=7, bins_per_octave=36
    )
    rms = librosa.feature.rms(y=y_harm, hop_length=HOP)[0]
    n = min(chroma.shape[1], rms.shape[0])
    chroma, rms = chroma[:, :n], rms[:n]
    weights = rms / (rms.sum() + 1e-9)

    # Bass-register chroma (C1..C4): hints at the tonic.
    bass = librosa.feature.chroma_cqt(
        y=y_harm, sr=sr, hop_length=HOP, tuning=tuning,
        fmin=librosa.note_to_hz("C1"), n_octaves=3, bins_per_octave=36,
    )[:, :n]

    scores = _key_scores(chroma @ weights)
    scores[12:] += MINOR_PRIOR

    # Long files (full songs): small vote from ~8 s windows so one section
    # can't dominate. Short loops are a single window, so this is skipped.
    win = max(1, int(8.0 * sr / HOP))
    if n >= 3 * win:
        votes = np.zeros(24)
        for start in range(0, n - win // 2, win):
            seg = slice(start, start + win)
            seg_vec = chroma[:, seg] @ rms[seg]
            if seg_vec.sum() > 0:
                votes[int(np.argmax(_key_scores(seg_vec)))] += rms[seg].sum()
        scores += 0.05 * votes / (votes.sum() + 1e-9)

    # The hardest confusion is relative keys (C minor vs Eb major share the
    # same notes). Break near-ties with tonic evidence: bass energy on the
    # tonic, and what's sounding in the first ~1.5 s (loops start on "home").
    best = int(np.argmax(scores))
    rel = (best % 12 + 9) % 12 + 12 if best < 12 else (best % 12 + 3) % 12
    rel_gap = float(scores[best] - scores[rel])
    if rel_gap < RELATIVE_MARGIN:
        head = max(1, int(1.5 * sr / HOP))
        tonic_cue = (chroma[:, :head].mean(axis=1) + bass[:, :head].mean(axis=1)
                     + 0.5 * (bass @ weights))
        if tonic_cue[rel % 12] > tonic_cue[best % 12]:
            best, rel = rel, best

    others = [int(i) for i in np.argsort(scores)[::-1] if i not in (best, rel)]
    fit = float(max(scores[best], scores[rel]))
    gap = fit - float(scores[others[0]])
    # Strong profile fit (r~0.8) with a clear gap to non-relative keys -> high.
    confidence = float(np.clip((fit - 0.4) / 0.4, 0, 1) * np.clip(0.5 + gap / 0.15, 0, 1))
    if abs(rel_gap) < 0.15:  # relative major/minor was a close call
        confidence = min(confidence, 0.6)
    order = [best, rel] + others

    def name(idx: int) -> str:
        return f"{NOTES[idx % 12]} {'major' if idx < 12 else 'minor'}"

    alternatives = [name(int(i)) for i in order[1:3]]
    return best % 12, ("major" if best < 12 else "minor"), confidence, alternatives


# ---------------------------------------------------------------------- tempo

def _detect_bpm(y: np.ndarray, sr: int, duration: float) -> int | None:
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    if onset_env.max() <= 0:
        return None
    tempo = float(np.atleast_1d(librosa.feature.tempo(onset_envelope=onset_env, sr=sr))[0])

    # Normalise to a producer-friendly range.
    while tempo < 70:
        tempo *= 2
    while tempo > 180:
        tempo /= 2

    # Loops are usually cut to a whole number of 4/4 bars. If the duration
    # implies a tempo close to the estimate, trust the (exact) bar math.
    # Also allow the classic 3:2 tracker error (e.g. 174 heard as 116),
    # with a penalty so a direct match always wins.
    best = None
    for bars in (1, 2, 3, 4, 6, 8, 12, 16, 32):
        cand = 240.0 * bars / duration
        if not 60 <= cand <= 200:
            continue
        for ratio, penalty in ((1.0, 0.0), (1.5, 0.02), (2 / 3, 0.02)):
            err = abs(cand - tempo * ratio) / (tempo * ratio)
            if err < 0.03 and (best is None or err + penalty < best[0]):
                best = (err + penalty, cand)
    if best:
        tempo = best[1]
    return int(round(tempo))


# ------------------------------------------------------------ filename hints

_BPM_RE = re.compile(r"(?<!\d)(\d{2,3})\s*-?\s*bpm", re.I)
_KEY_RE = re.compile(
    r"(?:^|[\s_\-\[\(])([A-G])([#b]|sharp|flat)?\s*-?\s*"
    r"(maj(?:or)?|min(?:or)?|m)?(?=$|[\s_\-\]\)\.])",
    re.I,
)


def hints_from_filename(filename: str) -> tuple[tuple[int, str] | None, int | None]:
    stem = re.sub(r"\.[a-z0-9]+$", "", filename, flags=re.I)
    bpm = None
    if m := _BPM_RE.search(stem):
        bpm = int(m.group(1))

    key = None
    for m in _KEY_RE.finditer(stem):
        letter, acc, qual = m.group(1), (m.group(2) or ""), (m.group(3) or "")
        # A bare single letter ("A", "B") is too ambiguous without a quality.
        if not qual and not acc:
            continue
        pc = NOTES.index(letter.upper())
        if acc.lower() in ("#", "sharp"):
            pc += 1
        elif acc.lower() in ("b", "flat"):
            pc -= 1
        mode = "minor" if qual.lower().startswith("m") and not qual.lower().startswith("maj") else "major"
        key = (pc % 12, mode)
    return key, bpm


# ----------------------------------------------------------------- public API

def analyze(path: str, filename: str | None = None) -> Analysis:
    y, sr = librosa.load(path, sr=SR, mono=True)
    duration = float(len(y) / sr)
    if duration < 0.5:
        raise ValueError("Audio is too short to analyze.")
    y = y / (np.max(np.abs(y)) + 1e-9)

    pc, mode, confidence, alts = _detect_key(y, sr)
    bpm = _detect_bpm(y, sr, duration)
    key_source = bpm_source = "detected"

    if filename:
        fkey, fbpm = hints_from_filename(filename)
        if fkey:
            if fkey != (pc, mode):
                alts = [f"{NOTES[pc]} {mode} (audio)"] + alts[:1]
            pc, mode, confidence, key_source = fkey[0], fkey[1], 1.0, "filename"
        if fbpm:
            bpm, bpm_source = fbpm, "filename"

    return Analysis(
        key=NOTES[pc],
        mode=mode,
        camelot=CAMELOT[(pc, mode)],
        confidence=confidence,
        bpm=bpm,
        duration=duration,
        key_source=key_source,
        bpm_source=bpm_source,
        alternatives=alts,
    )


if __name__ == "__main__":
    import sys

    for p in sys.argv[1:]:
        a = analyze(p, p.rsplit("/", 1)[-1])
        print(f"{p}: {a.key_name} ({a.camelot}) conf={a.confidence:.2f} "
              f"bpm={a.bpm} [{a.key_source}/{a.bpm_source}] alts={a.alternatives}")
