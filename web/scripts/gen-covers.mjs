// Generates original colorful placeholder cover art (accent-palette gradient meshes + bold shapes) as SVG.
// Run: npm run covers:placeholders   — deterministic (seeded by slug).
// Output: public/covers/placeholders/{beats,packs}/<slug>.svg (used until the owner drops real art into
// public/covers/{beats,packs}/<slug>.(jpg|webp|png) — picked up by scripts/sync-covers.mjs).
// No noise, no blur filters: gradients + geometry only, so they stay crisp and light.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "covers", "placeholders");
mkdirSync(join(OUT, "beats"), { recursive: true });
mkdirSync(join(OUT, "packs"), { recursive: true });

// Colorful palettes built from the site accents (keep in sync with src/app/globals.css tokens):
// coral #FF5A3C · orange #FF8A3D · amber #FFB547 · lilac #A98BFF — plus a few hue-shifted partners so every cover differs.
const INK = "#0C0A09";
const BONE = "#FAFAF9";
const PALETTES = [
  { name: "ember", bg: "#1A0906", a: "#FF5A3C", b: "#FFB547", c: "#A98BFF", d: "#FF8A3D" },
  { name: "ultraviolet", bg: "#0E0820", a: "#A98BFF", b: "#FF5A3C", c: "#5B8CFF", d: "#FF7AC6" },
  { name: "solar", bg: "#1C1204", a: "#FFB547", b: "#FF5A3C", c: "#FFE08A", d: "#FF8A3D" },
  { name: "lagoon", bg: "#04151A", a: "#2FD3C4", b: "#A98BFF", c: "#FFB547", d: "#3D8BFF" },
  { name: "plum", bg: "#170718", a: "#D05BFF", b: "#FF5A3C", c: "#FFB547", d: "#A98BFF" },
  { name: "neon", bg: "#07130B", a: "#B6FF5C", b: "#2FD3C4", c: "#A98BFF", d: "#FFB547" },
  { name: "rose", bg: "#1A0710", a: "#FF4F8B", b: "#FFB547", c: "#A98BFF", d: "#FF5A3C" },
  { name: "cobalt", bg: "#050B1E", a: "#3D6BFF", b: "#A98BFF", c: "#FF8A3D", d: "#2FD3C4" },
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

let P = PALETTES[0];
/** accent gradient (was "silver"): the cover palette's a → d → b → c */
const silver = (id) =>
  `<linearGradient id="sv-${id}" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="${P.a}"/><stop offset=".35" stop-color="${P.d}"/><stop offset=".6" stop-color="${P.b}"/><stop offset="1" stop-color="${P.c}"/></linearGradient>`;

const styles = {
  /** soft gradient mesh: overlapping radial light pools */
  mesh(r, id) {
    const pools = Array.from({ length: 4 }, (_, i) => {
      const cx = f(80 + r() * 440), cy = f(80 + r() * 440), rad = f(180 + r() * 220);
      const col = [P.a, P.b, P.c, P.d][i];
      const op = [0.95, 0.8, 0.75, 0.7][i];
      return { cx, cy, rad, col, op };
    });
    const defs = pools
      .map((p, i) => `<radialGradient id="m${i}-${id}" cx="${p.cx}" cy="${p.cy}" r="${p.rad}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${p.col}" stop-opacity="${p.op}"/><stop offset="1" stop-color="${p.col}" stop-opacity="0"/></radialGradient>`)
      .join("");
    return { defs, body: `<rect width="600" height="600" fill="${P.bg}"/>` + pools.map((_, i) => `<rect width="600" height="600" fill="url(#m${i}-${id})"/>`).join("") };
  },
  /** concentric rings around an off-centre point, silver core */
  rings(r, id) {
    const cx = f(200 + r() * 200), cy = f(200 + r() * 200);
    let body = `<rect width="600" height="600" fill="${P.bg}"/><rect width="600" height="600" fill="url(#rg-${id})"/>`;
    for (let i = 1; i < 26; i++) {
      body += `<circle cx="${cx}" cy="${cy}" r="${i * 17}" fill="none" stroke="${[P.a, P.b, P.c][i % 3]}" stroke-opacity="${f(0.75 - i * 0.022)}" stroke-width="${i % 5 === 0 ? 1.6 : 0.7}"/>`;
    }
    body += `<circle cx="${cx}" cy="${cy}" r="${f(40 + r() * 30)}" fill="url(#sv-${id})"/>`;
    const defs = `<radialGradient id="rg-${id}" cx="${cx}" cy="${cy}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${P.d}" stop-opacity=".55"/><stop offset="1" stop-color="${P.bg}"/></radialGradient>`;
    return { defs, body };
  },
  /** big serif letterform cropped off the edge */
  type(r, id, word) {
    const ch = (word || "S")[0];
    const x = f(-40 + r() * 120), y = f(560 + r() * 120);
    const defs = `<linearGradient id="tg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.c}"/><stop offset=".7" stop-color="${P.bg}"/></linearGradient>`;
    const body = `<rect width="600" height="600" fill="url(#tg-${id})"/><text x="${x}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${f(640 + r() * 160)}" fill="url(#sv-${id})" fill-opacity=".92">${ch}</text>`;
    return { defs, body };
  },
  /** stacked arcs — sunrise horizon */
  arcs(r, id) {
    const cy = f(420 + r() * 120);
    let body = `<rect width="600" height="600" fill="${P.bg}"/><rect width="600" height="600" fill="url(#ag-${id})"/>`;
    for (let i = 0; i < 9; i++) {
      const rad = 60 + i * 38;
      body += `<path d="M${300 - rad} ${cy} A${rad} ${rad} 0 0 1 ${300 + rad} ${cy}" fill="none" stroke="${i === 0 ? `url(#sv-${id})` : [P.a, P.d, P.b, P.c][i % 4]}" stroke-opacity="${i === 0 ? 1 : f(0.9 - i * 0.07)}" stroke-width="${i === 0 ? 14 : 1.2}"/>`;
    }
    body += `<rect y="${cy}" width="600" height="${600 - cy}" fill="${P.bg}"/>`;
    const defs = `<radialGradient id="ag-${id}" cx="300" cy="${cy}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${P.a}" stop-opacity=".75"/><stop offset=".5" stop-color="${P.c}" stop-opacity=".25"/><stop offset="1" stop-color="${P.bg}" stop-opacity="0"/></radialGradient>`;
    return { defs, body };
  },
  /** fine flowing lines */
  lines(r, id) {
    const amp = 40 + r() * 70, ph = r() * 6, tilt = f(-18 + r() * 36);
    let body = `<rect width="600" height="600" fill="${P.bg}"/><g transform="rotate(${tilt} 300 300)">`;
    for (let i = -8; i < 44; i++) {
      const y = i * 16;
      body += `<path d="M-120 ${y} C 120 ${f(y - amp * Math.sin(ph + i * 0.18))} 420 ${f(y + amp * Math.cos(ph + i * 0.14))} 720 ${y}" fill="none" stroke="${i % 3 === 0 ? P.a : i % 3 === 1 ? P.c : P.b}" stroke-opacity="${f(0.25 + 0.6 * Math.abs(Math.sin(i * 0.21 + ph)))}" stroke-width="1.3"/>`;
    }
    body += `</g><circle cx="${f(170 + r() * 260)}" cy="${f(170 + r() * 260)}" r="${f(46 + r() * 40)}" fill="url(#sv-${id})"/>`;
    return { defs: "", body };
  },
  /** dot matrix fading from a light source */
  dots(r, id) {
    const cx = 120 + r() * 360, cy = 120 + r() * 360;
    let body = `<rect width="600" height="600" fill="${P.bg}"/>`;
    for (let y = 0; y < 24; y++)
      for (let x = 0; x < 24; x++) {
        const px = 12.5 + x * 25, py = 12.5 + y * 25;
        const d = Math.hypot(px - cx, py - cy);
        const rad = Math.max(0, 8.5 * (1 - d / 460));
        if (rad < 0.6) continue;
        body += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(rad)}" fill="${d < 120 ? P.b : d < 260 ? P.a : P.c}" fill-opacity="${f(0.35 + 0.6 * (1 - d / 460))}"/>`;
      }
    return { defs: "", body };
  },
  /** guitar sound-hole rosette + strings (Guitar Vault) */
  rosette(r, id) {
    const cx = 300, cy = 285;
    const defs = `<radialGradient id="rw-${id}" cx="220" cy="160" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${P.a}"/><stop offset=".5" stop-color="${P.d}" stop-opacity=".55"/><stop offset="1" stop-color="${P.bg}"/></radialGradient>`;
    let body = `<rect width="600" height="600" fill="url(#rw-${id})"/>`;
    for (let k = 0; k < 3; k++) {
      const n = 60 + k * 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rad = 150 + k * 15;
        body += `<circle cx="${f(cx + Math.cos(a) * rad)}" cy="${f(cy + Math.sin(a) * rad)}" r="${f(3.4 - k * 0.8)}" fill="${[P.b, BONE, P.c][(i + k) % 3]}" fill-opacity="${f(0.55 + 0.4 * ((i + k) % 2))}"/>`;
      }
    }
    body += `<circle cx="${cx}" cy="${cy}" r="132" fill="none" stroke="url(#sv-${id})" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="212" fill="none" stroke="${BONE}" stroke-opacity=".25"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="121" fill="${P.bg}"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 240 + i * 24;
      body += `<line x1="${x}" y1="0" x2="${x}" y2="600" stroke="${BONE}" stroke-opacity="${f(0.9 - i * 0.07)}" stroke-width="${f(2.6 - i * 0.3)}"/>`;
    }
    return { defs, body };
  },
};

function cover(slug, style, label, pal) {
  const r = rngFrom(slug);
  P = pal ?? PALETTES[Math.floor(r() * PALETTES.length)];
  const id = slug.replace(/[^a-z0-9]/gi, "");
  const { defs, body } = styles[style](r, id, label || slug.toUpperCase());
  const mark = label
    ? `<g fill="${BONE}"><text x="36" y="556" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="40" letter-spacing="-1">${label}</text><text x="564" y="58" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="3" text-anchor="end" fill-opacity=".7">SLAPGOD</text></g>`
    : `<text x="564" y="566" font-family="Helvetica, Arial, sans-serif" font-size="12" letter-spacing="3" text-anchor="end" fill="${BONE}" fill-opacity=".6">SLAPGOD</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600"><defs>${silver(id)}${defs}</defs>${body}${mark}</svg>`;
}

const STYLE_KEYS = ["mesh", "rings", "type", "arcs", "lines", "dots"];
const beats = [
  ["midnight-ritual", "Midnight"], ["glass-teeth", "Glass"], ["dusty-halo", "Dusty"], ["velvet-static", "Velvet"], ["lagos-neon", "Lagos"], ["plum-smoke", "Plum"],
  ["chrome-halo", "Chrome"], ["no-signal", "No"], ["cigarette-sunday", "Cigarette"], ["silk-alarm", "Silk"], ["heatwave-mirage", "Heatwave"], ["ghost-parade", "Ghost"],
];
const packs = [
  ["neon-nights-premium", "Neon Nights"], ["velvet-keys", "Velvet Keys"], ["slap-theory-drums", "Slap Theory"],
  ["plum-loops-mini", "Plum Mini"], ["vault-bundle", "Vault Bundle"], ["everything-bundle", "Everything"],
  ["loop-club", "Loop Club"], ["free-808-pack", "Free 808s"],
];

const write = (type, slug, svg) => writeFileSync(join(OUT, type, `${slug}.svg`), svg);
write("packs", "guitar-vault-vol-1", cover("guitar-vault-vol-1", "rosette", "Guitar Vault 1", PALETTES[0]));
write("packs", "guitar-vault-lite", cover("guitar-vault-lite", "rosette", "Vault Lite", PALETTES[4]));
beats.forEach(([slug, word], i) => {
  const style = STYLE_KEYS[i % STYLE_KEYS.length];
  // "type" style uses the first letter of the title as the big glyph; beats get no label
  const pal = PALETTES[(i * 3) % PALETTES.length];
  write("beats", slug, style === "type" ? typeCover(slug, word, pal) : cover(slug, style, undefined, pal));
});
packs.forEach(([slug, label], i) => write("packs", slug, cover(slug, STYLE_KEYS[(i + 1) % STYLE_KEYS.length], label, PALETTES[(i * 5 + 1) % PALETTES.length])));

function typeCover(slug, word, pal) {
  const r = rngFrom(slug);
  P = pal;
  const id = slug.replace(/[^a-z0-9]/gi, "");
  const { defs, body } = styles.type(r, id, word);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600"><defs>${silver(id)}${defs}</defs>${body}<text x="564" y="566" font-family="Helvetica, Arial, sans-serif" font-size="12" letter-spacing="3" text-anchor="end" fill="${BONE}" fill-opacity=".6">SLAPGOD</text></svg>`;
}

console.log(`wrote ${beats.length + packs.length + 2} placeholder covers to ${OUT}`);
