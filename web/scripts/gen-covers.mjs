// Generates original generative SVG cover art into public/covers/.
// Run: node scripts/gen-covers.mjs   — deterministic (seeded by slug).
// Output: public/covers/placeholders/{beats,packs}/<slug>.svg (used until the owner drops real art into
// public/covers/{beats,packs}/<slug>.(jpg|webp|png) — picked up by scripts/sync-covers.mjs).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "covers", "placeholders");
mkdirSync(join(OUT, "beats"), { recursive: true });
mkdirSync(join(OUT, "packs"), { recursive: true });

// Monochrome stone palette — keep in sync with src/app/globals.css tokens
const INK = "#0C0A09";
const PLUM = "#1C1917"; // page bg
const STONE_800 = "#292524";
const STONE_500 = "#78716C";
const STONE_400 = "#A8A29E";
const STONE_300 = "#D6D3D1";
const SILVER = "#E6E7E9";
const BONE = "#FAFAF9";
const PALETTES = [
  [STONE_300, STONE_500, BONE],
  [SILVER, STONE_800, STONE_400],
  [STONE_400, STONE_300, STONE_800],
  [BONE, STONE_500, STONE_300],
  [STONE_300, STONE_800, SILVER],
  [STONE_500, STONE_300, BONE],
];

function rngFrom(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}
const f = (n) => Math.round(n * 10) / 10;

function defs(id, [a, b, c]) {
  return `<defs>
  <radialGradient id="g1-${id}" cx="30%" cy="25%" r="85%"><stop offset="0" stop-color="${a}" stop-opacity=".95"/><stop offset=".45" stop-color="${b}" stop-opacity=".35"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></radialGradient>
  <linearGradient id="g2-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
  <filter id="grain-${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/></filter>
  <filter id="soft-${id}"><feGaussianBlur stdDeviation="18"/></filter>
</defs>`;
}

const styles = {
  orbit(r, id, p) {
    let s = `<circle cx="300" cy="300" r="300" fill="url(#g1-${id})"/>`;
    const cx = 220 + r() * 160, cy = 220 + r() * 160;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(90 + r() * 60)}" fill="url(#g2-${id})"/>`;
    for (let i = 0; i < 14; i++) {
      s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(120 + i * 22)}" fill="none" stroke="${i % 3 === 0 ? p[2] : BONE}" stroke-opacity="${f(0.5 - i * 0.03)}" stroke-width="${i % 4 === 0 ? 2 : 0.8}" stroke-dasharray="${i % 2 ? "2 6" : "none"}"/>`;
    }
    return s;
  },
  grid(r, id, p) {
    let s = `<rect width="600" height="600" fill="url(#g1-${id})"/>`;
    const freq = 0.01 + r() * 0.02, amp = 30 + r() * 40, ph = r() * 6;
    for (let y = 0; y < 22; y++) {
      for (let x = 0; x < 22; x++) {
        const px = 20 + x * 26.7;
        const wave = Math.sin(px * freq + ph + y * 0.35) * amp;
        const py = 20 + y * 26.7 + wave * (y / 22);
        const d = Math.hypot(x - 11, y - 11) / 15;
        const rad = Math.max(0.6, 7 * (1 - d) * (0.5 + 0.5 * Math.sin(x * 0.7 + y * 0.4 + ph)));
        s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(rad)}" fill="${(x + y) % 5 === 0 ? p[2] : p[0]}" fill-opacity="${f(0.35 + 0.6 * (1 - d))}"/>`;
      }
    }
    return s;
  },
  blob(r, id, p) {
    let s = `<rect width="600" height="600" fill="${PLUM}"/>`;
    for (let i = 0; i < 4; i++) {
      s += `<circle cx="${f(100 + r() * 400)}" cy="${f(100 + r() * 400)}" r="${f(110 + r() * 120)}" fill="${p[i % 3]}" fill-opacity=".85" filter="url(#soft-${id})"/>`;
    }
    const pts = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      const rad = 150 + r() * 70;
      return [300 + Math.cos(a) * rad, 300 + Math.sin(a) * rad];
    });
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      d += ` Q${f(a[0])},${f(a[1])} ${f((a[0] + b[0]) / 2)},${f((a[1] + b[1]) / 2)}`;
    }
    s += `<path d="${d}Z" fill="none" stroke="${BONE}" stroke-width="1.5" stroke-opacity=".7"/>`;
    s += `<path d="${d}Z" fill="${INK}" fill-opacity=".25" transform="translate(300 300) scale(.62) translate(-300 -300)"/>`;
    return s;
  },
  stripes(r, id, p) {
    let s = `<rect width="600" height="600" fill="${INK}"/>`;
    const tilt = -20 + r() * 40;
    s += `<g transform="rotate(${f(tilt)} 300 300)">`;
    for (let i = -6; i < 30; i++) {
      const y = i * 26;
      const amp = 10 + r() * 30;
      s += `<path d="M-200,${y} C 100,${f(y - amp)} 300,${f(y + amp * 2)} 800,${f(y - amp)}" fill="none" stroke="${i % 5 === 0 ? p[1] : p[0]}" stroke-width="${f(3 + (i % 3) * 3)}" stroke-opacity="${f(0.25 + ((i * 37) % 10) / 14)}"/>`;
    }
    s += `</g><circle cx="${f(180 + r() * 240)}" cy="${f(180 + r() * 240)}" r="${f(70 + r() * 40)}" fill="${p[2]}"/>`;
    return s;
  },
  burst(r, id, p) {
    let s = `<rect width="600" height="600" fill="${PLUM}"/><rect width="600" height="600" fill="url(#g1-${id})"/>`;
    const n = 36;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const len = 180 + r() * 220;
      s += `<line x1="300" y1="300" x2="${f(300 + Math.cos(a) * len)}" y2="${f(300 + Math.sin(a) * len)}" stroke="${i % 2 ? p[0] : p[1]}" stroke-width="${f(1 + r() * 5)}" stroke-linecap="round" stroke-opacity=".8"/>`;
    }
    // four-point star
    const R = 110 + r() * 40;
    s += `<path d="M300,${f(300 - R)} Q312,288 ${f(300 + R)},300 Q312,312 300,${f(300 + R)} Q288,312 ${f(300 - R)},300 Q288,288 300,${f(300 - R)}Z" fill="${p[2]}"/>`;
    return s;
  },
  rosette(r, id, p) {
    // guitar sound-hole rosette + strings
    let s = `<rect width="600" height="600" fill="${PLUM}"/><rect width="600" height="600" fill="url(#g1-${id})"/>`;
    const cx = 300, cy = 290;
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      for (let k = 0; k < 3; k++) {
        const rad = 150 + k * 16;
        s += `<circle cx="${f(cx + Math.cos(a + k * 0.05) * rad)}" cy="${f(cy + Math.sin(a + k * 0.05) * rad)}" r="${f(4 - k)}" fill="${[p[0], p[1], p[2]][(i + k) % 3]}"/>`;
      }
    }
    s += `<circle cx="${cx}" cy="${cy}" r="132" fill="none" stroke="${BONE}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="205" fill="none" stroke="${BONE}" stroke-opacity=".5" stroke-width="1.5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="120" fill="${INK}"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 240 + i * 24;
      s += `<line x1="${x}" y1="0" x2="${x}" y2="600" stroke="${i < 3 ? STONE_300 : BONE}" stroke-opacity=".85" stroke-width="${f(3.2 - i * 0.4)}"/>`;
    }
    return s;
  },
  halftone(r, id, p) {
    let s = `<rect width="600" height="600" fill="${INK}"/>`;
    const cx = 150 + r() * 300, cy = 150 + r() * 300;
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 30; x++) {
        const px = x * 20 + 10, py = y * 20 + 10;
        const d = Math.hypot(px - cx, py - cy);
        const rad = Math.max(0, 9.5 * (1 - d / 420));
        if (rad < 0.5) continue;
        s += `<circle cx="${px}" cy="${py}" r="${f(rad)}" fill="${d < 140 ? p[1] : p[0]}"/>`;
      }
    }
    s += `<rect x="40" y="${f(420 + r() * 80)}" width="520" height="6" fill="${p[2]}"/>`;
    return s;
  },
};

function cover(slug, style, paletteIdx, label) {
  const r = rngFrom(slug);
  const p = PALETTES[paletteIdx % PALETTES.length];
  const id = slug.replace(/[^a-z0-9]/gi, "");
  const body = styles[style](r, id, p);
  const mark = label
    ? `<g font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="${BONE}"><text x="34" y="560" font-size="44" letter-spacing="-1">${label}</text><text x="566" y="60" font-size="18" text-anchor="end" fill-opacity=".8" font-family="Menlo, monospace">SLAPGOD</text></g>`
    : `<text x="566" y="570" font-size="16" text-anchor="end" fill="${BONE}" fill-opacity=".75" font-family="Menlo, monospace">SG</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${defs(id, p)}<rect width="600" height="600" fill="${INK}"/>${body}<rect width="600" height="600" filter="url(#grain-${id})"/>${mark}</svg>`;
}

const STYLE_KEYS = Object.keys(styles).filter((k) => k !== "rosette");
const beats = [
  "midnight-ritual", "glass-teeth", "dusty-halo", "velvet-static", "lagos-neon", "plum-smoke",
  "chrome-halo", "no-signal", "cigarette-sunday", "silk-alarm", "heatwave-mirage", "ghost-parade",
];
const packs = [
  ["neon-nights-premium", "NEON NIGHTS"], ["velvet-keys", "VELVET KEYS"], ["slap-theory-drums", "SLAP THEORY"],
  ["plum-loops-mini", "PLUM MINI"], ["vault-bundle", "VAULT BUNDLE"], ["everything-bundle", "EVERYTHING"],
  ["loop-club", "LOOP CLUB"], ["free-808-pack", "FREE 808s"],
];

writeFileSync(join(OUT, "packs", "guitar-vault-vol-1.svg"), cover("guitar-vault-vol-1", "rosette", 5, "GUITAR VAULT 1"));
writeFileSync(join(OUT, "packs", "guitar-vault-lite.svg"), cover("guitar-vault-lite", "rosette", 3, "VAULT LITE"));
beats.forEach((slug, i) => {
  writeFileSync(join(OUT, "beats", `${slug}.svg`), cover(slug, STYLE_KEYS[i % STYLE_KEYS.length], i));
});
packs.forEach(([slug, label], i) => {
  writeFileSync(join(OUT, "packs", `${slug}.svg`), cover(slug, STYLE_KEYS[(i + 2) % STYLE_KEYS.length], i + 3, label));
});
console.log(`wrote ${beats.length + packs.length + 2} placeholder covers to ${OUT}`);
