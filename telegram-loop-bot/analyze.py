"""Audio analysis: musical key + BPM for loops and samples, from the audio only.

The filename is never used here (the bot may take the BPM from it).

Key detection combines two independent methods:

1. Pitch profile — how much each of the 12 notes sounds overall, correlated
   against 4 published key profiles (Krumhansl-Kessler, Temperley,
   Albrecht-Shanahan, Bellman-Budge).
2. Chord analysis — recognise the chord progression (with bass notes), then
   score each key by how well the chords fit it, how long the loop sits on
   the key's home chord, whether the loop starts on it, and whether the bass
   rests on the tonic. This is what separates close calls like C minor vs
   Eb major (same notes) or C minor vs G minor (Cm-Gm vamp).

Tempo: exact loop length (lossless files), the harmonic repeat length (a
whole number of bars), and the onset pulse — see _detect_bpm.
"""

from __future__ import annotations

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

# How well a chord (interval above the key's tonic, quality) fits a key.
# (0, ...) = home chord. Anything not listed counts as outside the key.
CHORD_FIT = {
    "major": {(0, "maj"): 1.0, (7, "maj"): 0.7, (5, "maj"): 0.6, (9, "min"): 0.5,
              (2, "min"): 0.5, (4, "min"): 0.4, (10, "maj"): 0.2},
    "minor": {(0, "min"): 1.0, (7, "min"): 0.6, (7, "maj"): 0.7, (5, "min"): 0.6,
              (8, "maj"): 0.5, (3, "maj"): 0.4, (10, "maj"): 0.5, (5, "maj"): 0.2},
}
OUTSIDE_KEY = -0.6

SR = 22050
HOP = 1024
PROFILE_WEIGHT = 0.7
CHORD_WEIGHT = 1.0
RELATIVE_MARGIN = 0.5


@dataclass
class Analysis:
    key: str  # e.g. "C"
    mode: str  # "major" / "minor"
    camelot: str
    confidence: float  # 0..1
    bpm: int | None
    duration: float
    bpm_confidence: float = 0.0
    alternatives: list[str] = field(default_factory=list)
    chords: list[str] = field(default_factory=list)  # e.g. ["Cm", "Gm"]
    tuning_cents: int = 0  # how far the audio sits from standard A=440 tuning
    bpm_from_filename: bool = False  # set by the bot when the filename states the BPM

    @property
    def key_name(self) -> str:
        return f"{self.key} {self.mode}"


def _key_label(idx: int) -> str:
    return f"{NOTES[idx % 12]} {'major' if idx < 12 else 'minor'}"


def _zscore(v: np.ndarray) -> np.ndarray:
    return (v - v.mean()) / (v.std() + 1e-9)


# ------------------------------------------------------------- pitch profile

def _profile_scores(chroma_vec: np.ndarray) -> np.ndarray:
    """24 Pearson correlations (0-11 major, 12-23 minor), averaged over profiles."""
    x = _zscore(chroma_vec)
    scores = np.zeros(24)
    for major, minor in PROFILES.values():
        for i, prof in enumerate((major, minor)):
            p = _zscore(np.asarray(prof, dtype=float))
            for tonic in range(12):
                scores[i * 12 + tonic] += float(np.dot(x, np.roll(p, tonic)) / 12.0)
    return scores / len(PROFILES)


# ----------------------------------------------------------- chord analysis

def _chord_templates() -> tuple[np.ndarray, list[tuple[int, str]]]:
    temps, labels = [], []
    for root in range(12):
        for quality, ivs in (("maj", (0, 4, 7)), ("min", (0, 3, 7))):
            t = np.zeros(12)
            t[[(root + i) % 12 for i in ivs]] = 1.0
            t[root] += 0.3
            temps.append(t / np.linalg.norm(t))
            labels.append((root, quality))
    return np.array(temps), labels


TEMPLATES, CHORD_LABELS = _chord_templates()


def _recognise_chords(chroma: np.ndarray, bass: np.ndarray, rms: np.ndarray, sr: int):
    """Return (segments, fit); segments = [(root, quality, start_s, dur_s, bass_pc)]."""
    n = chroma.shape[1]
    norm = chroma / (np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-9)
    sim = TEMPLATES @ norm  # (24, n)
    bass_norm = bass / (bass.max(axis=0, keepdims=True) + 1e-9)
    roots = np.array([r for r, _ in CHORD_LABELS])
    score = sim + 0.25 * bass_norm[roots, :]

    # Smooth with an HMM so chords don't flicker frame to frame.
    probs = np.exp(score * 12.0)
    probs /= probs.sum(axis=0, keepdims=True)
    frames_per_sec = sr / HOP
    stay = 1.0 - 1.0 / max(2.0, 0.8 * frames_per_sec)  # expected chord length ~0.8 s+
    path = librosa.sequence.viterbi_discriminative(probs, librosa.sequence.transition_loop(24, stay))

    loud = rms > 0.1 * rms.max()
    fit = float(np.mean(sim.max(axis=0)[loud])) if loud.any() else 0.0

    segments = []
    start = 0
    for i in range(1, n + 1):
        if i == n or path[i] != path[start]:
            if loud[start:i].any():
                root, quality = CHORD_LABELS[path[start]]
                bass_pc = int(np.argmax(bass[:, start:i] @ rms[start:i]))
                segments.append((root, quality, start / frames_per_sec,
                                 (i - start) / frames_per_sec, bass_pc))
            start = i
    segments = [s for s in segments if s[3] >= 0.25] or segments
    return segments, fit


def _chord_key_scores(segments) -> np.ndarray:
    scores = np.zeros(24)
    total = sum(s[3] for s in segments) or 1.0
    for k in range(24):
        tonic, mode = k % 12, ("major" if k < 12 else "minor")
        table = CHORD_FIT[mode]
        home = (0, "min" if mode == "minor" else "maj")
        fit = home_time = bass_home = 0.0
        for root, quality, _start, dur, bass_pc in segments:
            rel = ((root - tonic) % 12, quality)
            fit += dur * table.get(rel, OUTSIDE_KEY)
            if rel == home:
                home_time += dur
            if bass_pc == tonic:
                bass_home += dur
        s = fit / total + 0.6 * home_time / total + 0.25 * bass_home / total
        first = segments[0]
        if ((first[0] - tonic) % 12, first[1]) == home:
            s += 0.3
        scores[k] = s
    return scores


# --------------------------------------------------------------------- key

def _detect_key(y: np.ndarray, sr: int):
    tuning = librosa.estimate_tuning(y=y, sr=sr)
    y_harm = librosa.effects.harmonic(y, margin=3.0)
    if np.max(np.abs(y_harm)) < 1e-4:
        y_harm = y

    chroma = librosa.feature.chroma_cqt(y=y_harm, sr=sr, hop_length=HOP, tuning=tuning,
                                        n_octaves=7, bins_per_octave=36)
    bass = librosa.feature.chroma_cqt(y=y_harm, sr=sr, hop_length=HOP, tuning=tuning,
                                      fmin=librosa.note_to_hz("C1"), n_octaves=3,
                                      bins_per_octave=36)
    rms = librosa.feature.rms(y=y_harm, hop_length=HOP)[0]
    n = min(chroma.shape[1], bass.shape[1], rms.shape[0])
    chroma, bass, rms = chroma[:, :n], bass[:, :n], rms[:n]

    profile = _profile_scores(chroma @ (rms / (rms.sum() + 1e-9)))
    segments, chord_fit = _recognise_chords(chroma, bass, rms, sr)
    chords = _chord_key_scores(segments) if segments else np.zeros(24)

    # Chord analysis only counts when the audio actually contains chords
    # (a solo vocal or single-note melody fits triads poorly).
    chord_weight = CHORD_WEIGHT * float(np.clip((chord_fit - 0.55) / 0.25, 0.0, 1.0))
    combined = PROFILE_WEIGHT * _zscore(profile) + chord_weight * _zscore(chords)

    order = [int(i) for i in np.argsort(combined)[::-1]]
    best = order[0]

    # Relative major/minor (C minor vs Eb major) share every note. On a close
    # call, prefer the one whose tonic the loop opens on and the bass rests on.
    rel = (best % 12 + 9) % 12 + 12 if best < 12 else (best % 12 + 3) % 12
    if combined[best] - combined[rel] < RELATIVE_MARGIN:
        head = max(1, int(1.5 * sr / HOP))
        weights = rms / (rms.sum() + 1e-9)
        cue = chroma[:, :head].mean(axis=1) + bass[:, :head].mean(axis=1) + 0.5 * (bass @ weights)
        if cue[rel % 12] > cue[best % 12]:
            order.remove(rel)
            order.insert(0, rel)
            best = rel
    margin = float(combined[best] - max(combined[i] for i in order[1:]))
    agree = int(np.argmax(profile)) == best and (chord_weight == 0 or int(np.argmax(chords)) == best)

    confidence = 0.5 * float(np.clip(max(margin, 0.0) / 0.8, 0.0, 1.0)) + (0.5 if agree else 0.15)
    if chord_weight == 0:  # only one method available
        confidence *= 0.8

    names = []
    for root, quality, *_ in segments:
        name = NOTES[root] + ("m" if quality == "min" else "")
        if not names or names[-1] != name:
            names.append(name)
    return (best % 12, ("major" if best < 12 else "minor"), float(np.clip(confidence, 0, 1)),
            [_key_label(i) for i in order[1:3]], names[:12], chroma, rms, int(round(tuning * 100)))


# ------------------------------------------------------------------- tempo

def _repeat_period(chroma: np.ndarray, rms: np.ndarray, sr: int,
                   duration: float) -> tuple[float, float] | None:
    """Loop repeat length (seconds) from harmonic self-similarity, plus its strength."""
    fps = sr / HOP
    x = chroma / (np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-9)
    x = x * (rms > 0.05 * rms.max())
    n = x.shape[1]
    min_lag, max_lag = int(1.5 * fps), int(min(duration / 2, 24.0) * fps)
    if max_lag <= min_lag + 1:
        return None
    sims = np.zeros(max_lag + 1)
    for lag in range(min_lag, max_lag + 1):
        a, b = x[:, : n - lag], x[:, lag:]
        denom = np.count_nonzero(a.sum(axis=0) * b.sum(axis=0))
        sims[lag] = (a * b).sum() / denom if denom else 0.0
    peaks = [lag for lag in range(min_lag + 1, max_lag)
             if sims[lag] >= sims[lag - 1] and sims[lag] >= sims[lag + 1]]
    if not peaks:
        return None
    top = max(sims[p] for p in peaks)
    lag = min(p for p in peaks if sims[p] >= 0.9 * top)  # shortest strong repeat
    return lag / fps, float(sims[lag])


# Loops are almost always a power-of-two number of bars.
BAR_BONUS = {4: 1.0, 2: 0.9, 8: 0.9, 1: 0.5, 16: 0.5, 3: 0.3, 6: 0.3}


def _detect_bpm(y: np.ndarray, sr: int, duration: float, chroma: np.ndarray,
                rms: np.ndarray, exact_length: bool) -> tuple[int | None, float]:
    """Pick a tempo from three clues, strongest first:

    1. File length: loops exported to exact bars give an exact BPM (8 bars in
       21.8182 s = 88.000 BPM). Lossless files only — mp3 encoding pads length.
    2. Harmonic repeat length: the progression repeats every N bars.
    3. Onset pulse: weakest — strummed/triplet parts fool it (often 4/3 off).
    """
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, aggregate=np.median)
    if onset_env.max() <= 0:
        return None, 0.0
    tempogram = librosa.feature.tempogram(onset_envelope=onset_env, sr=sr, win_length=384)
    bpms = librosa.tempo_frequencies(tempogram.shape[0], sr=sr)
    valid = np.isfinite(bpms) & (bpms > 30) & (bpms < 600)
    vb, vs = bpms[valid][::-1], tempogram.mean(axis=1)[valid][::-1]  # ascending bpm
    vs = vs / (vs.max() + 1e-9)

    def at(b: float) -> float:
        return float(np.interp(b, vb, vs, left=0.0, right=0.0))

    def pulse(bpm: float) -> float:
        return at(bpm) + 0.5 * max(at(bpm / 2), at(bpm * 2)) + 0.25 * at(bpm * 1.5)

    bonus: dict[float, float] = {}

    def add(bpm: float, value: float) -> None:
        if 70 <= bpm <= 180:
            key = round(bpm, 1)
            bonus[key] = max(bonus.get(key, 0.0), value)

    for bars in (1, 2, 4, 8, 16, 32):
        bpm = 240.0 * bars / duration
        off = abs(bpm - round(bpm))
        if exact_length and off < 0.02:
            add(round(bpm), 1.2)
        elif exact_length and off < 0.3 and bars in (4, 8):  # trimmed a few ms off
            add(round(bpm), 0.35)
        elif pulse(bpm) >= 0.6:
            # Single-pass loop: length fits whole bars and the rhythm agrees.
            add(bpm, 0.5 if bars in (2, 4, 8) else 0.25)

    tempo = float(np.atleast_1d(librosa.feature.tempo(onset_envelope=onset_env, sr=sr))[0])
    add(tempo, 0.2)

    period = _repeat_period(chroma, rms, sr, duration)
    if period:
        seconds, strength = period
        weight = float(np.clip(strength / 0.6, 0.3, 1.0))
        for bars, value in BAR_BONUS.items():
            add(240.0 * bars / seconds, value * weight)

    for i in np.argsort(vs)[::-1][:6]:
        bpm = float(vb[i])
        while bpm < 70:
            bpm *= 2
        while bpm > 180:
            bpm /= 2
        add(bpm, 0.0)

    if not bonus:
        return None, 0.0
    scored = sorted(((0.35 * pulse(b) + v + (0.1 if 85 <= b <= 160 else 0.0), b)
                     for b, v in bonus.items()), reverse=True)
    best_score, best = scored[0]
    runner = next((sc for sc, b in scored[1:] if abs(b - best) / best > 0.03), 0.0)
    confidence = float(np.clip((best_score - runner) / 0.6 + 0.2, 0.0, 1.0))
    return int(round(best)), confidence


# --------------------------------------------------------------- public API

def analyze(path: str) -> Analysis:
    y, sr = librosa.load(path, sr=SR, mono=True)
    duration = float(len(y) / sr)
    if duration < 1.0:
        raise ValueError("Audio is too short to analyze (under 1 second).")
    y = y / (np.max(np.abs(y)) + 1e-9)

    pc, mode, confidence, alts, chords, chroma, rms, cents = _detect_key(y, sr)
    lossless = path.lower().endswith((".wav", ".aif", ".aiff", ".flac"))
    bpm, bpm_conf = _detect_bpm(y, sr, duration, chroma, rms, lossless)

    return Analysis(
        key=NOTES[pc],
        mode=mode,
        camelot=CAMELOT[(pc, mode)],
        confidence=confidence,
        bpm=bpm,
        bpm_confidence=bpm_conf,
        duration=duration,
        alternatives=alts,
        chords=chords,
        tuning_cents=cents,
    )


if __name__ == "__main__":
    import sys

    for p in sys.argv[1:]:
        a = analyze(p)
        print(f"{p.rsplit('/', 1)[-1]}: {a.key_name} ({a.camelot}) conf={a.confidence:.2f} "
              f"bpm={a.bpm} (conf={a.bpm_confidence:.2f}) alts={a.alternatives} chords={a.chords}")
