/**
 * Trusted catalog lookups for checkout (server-side).
 *
 * The cart in the browser only sends item KEYS. Names, prices and what the buyer gets are
 * always looked up here, so nobody can edit a price in devtools and pay less.
 *
 * Keys:  beat → "<beat.id>:<tier>"   e.g. "beat_no-faces:premium"
 *        pack → "pack:<slug>"        e.g. "pack:guitar-vault-vol-1"
 */
import { beats } from "@/data/beats";
import { licenseTiers, type LicenseId } from "@/data/licenses";
import { allPacks } from "@/data/packs";
import { LOOPS_LIVE } from "@/data/site";

export type FileKind = "mp3" | "wav" | "stems" | "zip";

export interface CatalogLine {
  key: string;
  kind: "beat" | "pack";
  slug: string;
  title: string;
  tier?: LicenseId;
  tierName?: string;
  priceEUR: number;
  priceUSD: number;
  cover: string;
  files: FileKind[];
}

/** What each beat licence delivers. */
export const TIER_FILES: Record<LicenseId, FileKind[]> = {
  basic: ["mp3"],
  premium: ["mp3", "wav"],
  trackout: ["mp3", "wav", "stems"],
  unlimited: ["mp3", "wav", "stems"],
  exclusive: ["mp3", "wav", "stems"],
};

export const FILE_LABEL: Record<FileKind, string> = {
  mp3: "MP3 (untagged)",
  wav: "WAV",
  stems: "Stems / trackouts",
  zip: "Pack (zip)",
};

export function lookup(key: string): CatalogLine | null {
  if (key.startsWith("pack:")) {
    if (!LOOPS_LIVE) return null; // packs are off the site for now
    const slug = key.slice("pack:".length);
    const p = allPacks.find((x) => x.slug === slug);
    if (!p || p.price <= 0 || p.comingSoon) return null; // free or unreleased packs aren't sold
    return {
      key,
      kind: "pack",
      slug,
      title: p.title,
      priceEUR: p.price,
      priceUSD: p.priceUSD ?? p.price,
      cover: p.cover,
      files: ["zip"],
    };
  }

  const [beatId, tierId] = key.split(":");
  const b = beats.find((x) => x.id === beatId);
  const t = licenseTiers.find((x) => x.id === tierId);
  // Exclusives are negotiated through the offer form, never bought from the cart.
  if (!b || !t || t.id === "exclusive") return null;
  return {
    key,
    kind: "beat",
    slug: b.slug,
    title: b.title,
    tier: t.id,
    tierName: t.name,
    priceEUR: t.price,
    priceUSD: t.priceUSD ?? t.price,
    cover: b.cover,
    files: TIER_FILES[t.id],
  };
}
