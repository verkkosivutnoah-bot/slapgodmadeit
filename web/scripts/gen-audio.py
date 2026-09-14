#!/usr/bin/env python3
"""
Synthesize original, royalty-free placeholder beat loops for the SLAPGOD store.
Everything here is generated from sine waves + noise — no samples, no copyrighted audio.

Usage:  python3 scripts/gen-audio.py        (writes public/audio/*.wav, then *.m4a if afconvert exists)
Replace the files in public/audio/ with real tagged previews before launch.
"""
import os
import shutil
import subprocess
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(7)

NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
MINOR = [0, 2, 3, 5, 7, 8, 10]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lowpass(x, alpha):
    """one-pole lowpass (alpha 0..1, lower = darker)"""
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


def lp_fast(x, k):
    """cheap moving-average lowpass"""
    if k <= 1:
        return x
    c = np.cumsum(np.insert(x, 0, 0.0))
    y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.zeros(k - 1)])


def kick(dur=0.45, f0=150, f1=42):
    t = np.arange(int(SR * dur)) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9


def snare(dur=0.25, tone=190):
    t = np.arange(int(SR * dur)) / SR
    n = rng.standard_normal(len(t))
    n = n - lp_fast(n, 6)
    return (n * np.exp(-t * 18) * 0.55 + np.sin(2 * np.pi * tone * t) * np.exp(-t * 30) * 0.5) * 0.8


def clap(dur=0.3):
    t = np.arange(int(SR * dur)) / SR
    n = rng.standard_normal(len(t))
    n = n - lp_fast(n, 4)
    env = np.zeros(len(t))
    for off in (0, 0.011, 0.022):
        s = int(off * SR)
        env[s:] += np.exp(-(t[: len(t) - s]) * 40)
    env += np.exp(-t * 12) * 0.4
    return n * env * 0.35


def hat(dur=0.05, open_=False):
    d = 0.28 if open_ else dur
    t = np.arange(int(SR * d)) / SR
    n = rng.standard_normal(len(t))
    n = n - lp_fast(n, 2)
    return n * np.exp(-t * (12 if open_ else 90)) * 0.22


def rim(dur=0.08):
    t = np.arange(int(SR * dur)) / SR
    return (np.sin(2 * np.pi * 1700 * t) + 0.5 * np.sin(2 * np.pi * 820 * t)) * np.exp(-t * 60) * 0.25


def bass808(freq, dur, glide_to=None):
    t = np.arange(int(SR * dur)) / SR
    f = np.full(len(t), freq)
    if glide_to:
        g = np.clip((t - dur * 0.55) / 0.08, 0, 1)
        f = freq + (glide_to - freq) * g
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t * 200) * np.exp(-t * 1.4)
    return np.tanh(np.sin(ph) * 2.2) * env * 0.55


def bell(freq, dur):
    t = np.arange(int(SR * dur)) / SR
    s = (np.sin(2 * np.pi * freq * t) + 0.45 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 5)
         + 0.2 * np.sin(2 * np.pi * freq * 3.98 * t) * np.exp(-t * 9))
    return s * np.exp(-t * 3.2) * np.minimum(1, t * 300) * 0.16


def pad(freqs, dur):
    t = np.arange(int(SR * dur)) / SR
    s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.0, 0.13):
            ff = f * 2 ** (det / 12)
            s += np.sin(2 * np.pi * ff * t) + 0.3 * np.sin(2 * np.pi * ff * 2 * t)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4)
    return s / (len(freqs) * 3) * env * 0.22


def place(buf, sig, at, gain=1.0):
    s = int(at * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s] * gain


def echo(x, delay, fb=0.35, taps=4):
    y = x.copy()
    d = int(delay * SR)
    for i in range(1, taps + 1):
        if d * i >= len(x):
            break
        y[d * i:] += x[: len(x) - d * i] * (fb ** i)
    return y


def render(name, bpm, key, style, bars=8, seed=1):
    global rng
    rng = np.random.default_rng(seed)
    beat = 60 / bpm
    step = beat / 4
    total = bars * 4 * beat
    n = int(total * SR) + SR
    drums = np.zeros(n)
    bass = np.zeros(n)
    mel = np.zeros(n)
    root = 36 + NOTE[key]  # low octave
    prog = {
        "trap": [0, 5, 3, 4], "drill": [0, 3, 5, 4], "boombap": [0, 3, 2, 4],
        "rnb": [0, 5, 2, 4], "afro": [0, 4, 5, 3], "dark": [0, 1, 5, 4],
    }[style]
    swing = 0.12 if style == "boombap" else (0.05 if style == "rnb" else 0.0)

    for bar in range(bars):
        deg = prog[bar % 4]
        chord_root = root + MINOR[deg % 7]
        bt = bar * 4 * beat
        # pad / chords
        if style in ("rnb", "dark", "boombap"):
            freqs = [hz(chord_root + 24), hz(chord_root + 24 + (3 if deg in (0, 3, 4) else 4)), hz(chord_root + 31)]
            place(mel, pad(freqs, 4 * beat), bt, 1.0)
        # bell melody
        for s16 in range(16):
            tt = bt + s16 * step + (swing * step if s16 % 2 else 0)
            if style in ("trap", "drill", "dark", "afro") and rng.random() < (0.28 if s16 % 2 == 0 else 0.1):
                m = root + 36 + MINOR[int(rng.integers(0, 7))] + (12 if rng.random() < 0.2 else 0)
                place(mel, bell(hz(m), 1.2), tt, 1.0)
            if style in ("rnb", "boombap") and s16 in (0, 6, 10) and rng.random() < 0.7:
                m = chord_root + 36 + MINOR[int(rng.integers(0, 5))]
                place(mel, bell(hz(m), 1.0), tt, 0.8)

        # drums
        for s16 in range(16):
            tt = bt + s16 * step + (swing * step if s16 % 2 else 0)
            if style in ("trap", "dark"):
                if s16 in (0, 7, 10) or (bar % 2 and s16 == 13):
                    place(drums, kick(), tt)
                if s16 in (8,):
                    place(drums, clap(), tt, 1.0)
                    place(drums, snare(), tt, 0.5)
                place(drums, hat(), tt, 0.9 if s16 % 4 == 0 else 0.6)
                if s16 in (14,) and bar % 2:
                    for r in range(3):
                        place(drums, hat(), tt + r * step / 3, 0.5)
            elif style == "drill":
                if s16 in (0, 11) or (bar % 2 and s16 == 6):
                    place(drums, kick(0.35, 170, 50), tt)
                if s16 in (4, 12):
                    place(drums, snare(0.22, 220), tt + (step * 0.5 if s16 == 12 and bar % 2 else 0))
                # triplet hats
                for tr in range(3):
                    if (s16 % 4 == 0) and rng.random() < 0.9:
                        place(drums, hat(), tt + tr * beat / 3, 0.55)
                if s16 % 4 == 2:
                    place(drums, rim(), tt, 0.7)
            elif style == "boombap":
                if s16 in (0, 10) or (s16 == 7 and bar % 2):
                    place(drums, kick(0.35, 110, 48), tt)
                if s16 in (4, 12):
                    place(drums, snare(0.3, 180), tt, 1.1)
                if s16 % 2 == 0:
                    place(drums, hat(0.07), tt, 0.7 if s16 % 4 else 0.9)
                if s16 == 14:
                    place(drums, hat(open_=True), tt, 0.5)
            elif style == "rnb":
                if s16 in (0, 9):
                    place(drums, kick(0.4, 120, 45), tt)
                if s16 in (4, 12):
                    place(drums, clap(), tt, 0.9)
                    place(drums, rim(), tt, 0.4)
                if s16 % 2 == 0:
                    place(drums, hat(), tt, 0.5)
            elif style == "afro":
                if s16 in (0, 6, 8, 14):
                    place(drums, kick(0.3, 130, 55), tt, 0.9)
                if s16 in (3, 11):
                    place(drums, rim(), tt, 0.9)
                if s16 in (4, 12):
                    place(drums, clap(), tt, 0.6)
                place(drums, hat(0.03), tt, 0.35 + 0.3 * (s16 % 3 == 0))
                if s16 in (2, 7, 10, 15):
                    t2 = np.arange(int(SR * 0.12)) / SR
                    conga = np.sin(2 * np.pi * (260 - 60 * t2 * 8) * t2) * np.exp(-t2 * 30) * 0.3
                    place(drums, conga, tt)

        # 808 / bass
        if style in ("trap", "drill", "dark"):
            pattern = [(0, 6, None), (7, 3, None), (10, 6, 12)] if style != "drill" else [(0, 5, None), (6, 4, 3), (11, 5, -2)]
            for s16, length, glide in pattern:
                f = hz(chord_root)
                place(bass, bass808(f, length * step, hz(chord_root + glide) if glide is not None else None), bt + s16 * step)
        else:
            for s16, length in ((0, 5), (10, 5)):
                f = hz(chord_root + 12)
                t = np.arange(int(SR * length * step)) / SR
                b = np.sin(2 * np.pi * f * t) * np.minimum(1, t * 150) * np.exp(-t * 3) * 0.45
                place(bass, b, bt + s16 * step + (swing * step if s16 % 2 else 0))

    mel = echo(mel, beat * 0.75, 0.33, 4)
    mix = drums * 0.9 + bass * 0.95 + mel * 0.9
    # fade out tail + gentle master glue
    L = int(total * SR)
    mix = mix[:L]
    fade = int(0.02 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = np.tanh(mix * 1.15)
    mix /= max(1e-6, np.max(np.abs(mix))) / 0.89
    pcm = (mix * 32767).astype(np.int16)
    wav_path = os.path.join(OUT, f"{name}.wav")
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    if shutil.which("afconvert"):
        m4a = os.path.join(OUT, f"{name}.m4a")
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", wav_path, m4a], check=True)
        os.remove(wav_path)
    print("wrote", name, bpm, key, style)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    render("midnight-ritual", 142, "F", "trap", 8, 1)
    render("glass-teeth", 144, "C#", "drill", 8, 2)
    render("dusty-halo", 90, "A", "boombap", 6, 3)
    render("velvet-static", 96, "D#", "rnb", 6, 4)
    render("lagos-neon", 108, "G", "afro", 6, 5)
    render("plum-smoke", 130, "B", "dark", 8, 6)
