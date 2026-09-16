// Cover art resolution. Owner art in public/covers/<type>/<slug>.(webp|jpg|png) is picked up
// by scripts/sync-covers.mjs (runs before dev/build) → covers.manifest.json. Otherwise the
// generated placeholder SVG is used.
import manifest from "./covers.manifest.json";

export type CoverType = "beats" | "packs";
interface CoverEntry {
  src: string;
  blur?: string;
  width?: number;
  height?: number;
}
const entries = manifest as Record<string, CoverEntry>;
const bySrc = new Map(Object.values(entries).map((e) => [e.src, e]));

export function coverFor(type: CoverType, slug: string): string {
  return entries[`${type}/${slug}`]?.src ?? `/covers/placeholders/${type}/${slug}.svg`;
}

/** Tiny blur placeholder for a cover src (owner art only), otherwise a warm on-brand blur. */
export function coverBlur(src: string): string {
  return bySrc.get(src)?.blur ?? DEFAULT_BLUR;
}

// 8×8 neutral stone gradient — generic blur placeholder
export const DEFAULT_BLUR =
  "data:image/svg+xml;base64," +
  (typeof btoa === "function"
    ? btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><defs><radialGradient id="g" cx="35%" cy="30%" r="90%"><stop offset="0" stop-color="#44403C"/><stop offset=".5" stop-color="#292524"/><stop offset="1" stop-color="#1C1917"/></radialGradient></defs><rect width="8" height="8" fill="url(#g)"/></svg>`
      )
    : Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><defs><radialGradient id="g" cx="35%" cy="30%" r="90%"><stop offset="0" stop-color="#44403C"/><stop offset=".5" stop-color="#292524"/><stop offset="1" stop-color="#1C1917"/></radialGradient></defs><rect width="8" height="8" fill="url(#g)"/></svg>`
      ).toString("base64"));
