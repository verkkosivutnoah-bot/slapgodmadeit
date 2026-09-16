"use client";
// Extracts a vibrant, readable accent color from a cover image (client-side, cached per src).
// Result is an `hsl()` string with clamped saturation/lightness so it stays legible on the ink
// background (≥ ~4.5:1), or null when the cover has no usable color (callers fall back to off-white).
import { useEffect, useState } from "react";

const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

export function extractAccent(src: string): Promise<string | null> {
  if (cache.has(src)) return Promise.resolve(cache.get(src)!);
  if (pending.has(src)) return pending.get(src)!;
  const p = new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const bins = Array.from({ length: 24 }, () => ({ w: 0, h: 0, s: 0 }));
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          if (s < 0.25 || l < 0.12 || l > 0.92) continue;
          const w = s * (1 - Math.abs(l - 0.5) * 1.6);
          const bin = bins[Math.floor(h / 15) % 24];
          bin.w += w;
          bin.h += h * w;
          bin.s += s * w;
        }
        const best = bins.reduce((a, b) => (b.w > a.w ? b : a));
        if (best.w < 1.5) return resolve(null);
        const h = best.h / best.w;
        // monochrome site: keep only a whisper of the cover's hue (low saturation, high lightness)
        const s = Math.min(0.18, (best.s / best.w) * 0.25);
        const l = 0.8;
        resolve(`hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`);
      } catch {
        resolve(null); // tainted canvas / decode error
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  }).then((v) => {
    cache.set(src, v);
    pending.delete(src);
    return v;
  });
  pending.set(src, p);
  return p;
}

export function useCoverAccent(src?: string | null) {
  const [accent, setAccent] = useState<string | null>(() => (src && cache.has(src) ? cache.get(src)! : null));
  useEffect(() => {
    if (!src) return;
    let alive = true;
    extractAccent(src).then((v) => alive && setAccent(v));
    return () => {
      alive = false;
    };
  }, [src]);
  return accent;
}

/** Style object exposing the accent as --track-accent (omitted when unknown → CSS falls back to off-white). */
export function accentStyle(accent: string | null): React.CSSProperties | undefined {
  return accent ? ({ ["--track-accent" as string]: accent } as React.CSSProperties) : undefined;
}
