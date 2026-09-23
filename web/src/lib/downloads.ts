/**
 * Signed download links (server-only). Free kits live OUTSIDE /public — in `private/` — so the
 * only way to them is a link carrying an HMAC signature that expires.
 *
 * Link shape: /api/download?kit=<id>&exp=<unix seconds>&sig=<hex>
 * Env: DOWNLOAD_SECRET (any long random string), NEXT_PUBLIC_SITE_URL (for absolute links).
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** Free kits, by id. `file` is relative to the repo's `private/` folder. */
export const KITS: Record<string, { file: string; filename: string }> = {
  "guitar-vault-lite": { file: "guitar-vault-lite.zip", filename: "SLAPGOD_Guitar_Vault_Lite.zip" },
};

const DAY = 86_400;
export const LINK_TTL_DAYS = 30;

function secret() {
  return process.env.DOWNLOAD_SECRET || "dev-only-insecure-secret";
}

function sign(kit: string, exp: number) {
  return createHmac("sha256", secret()).update(`${kit}.${exp}`).digest("hex");
}

/**
 * Full-length tagged beat, free after an email. Lives in web/private/beats/<slug>/,
 * so it is only reachable through a signed link like the free kits.
 */
export const TAGGED_PREFIX = "beat:";
export const TAGGED_TTL_DAYS = 7;

export function taggedKitId(slug: string) {
  return `${TAGGED_PREFIX}${slug}`;
}

export function taggedFileFor(slug: string) {
  return { file: `beats/${slug}/${slug}-tagged.m4a`, filename: `${slug}-tagged-SLAPGOD.m4a` };
}

export function signedDownloadPath(kit: string, ttlDays = LINK_TTL_DAYS) {
  const exp = Math.floor(Date.now() / 1000) + ttlDays * DAY;
  return `/api/download?kit=${encodeURIComponent(kit)}&exp=${exp}&sig=${sign(kit, exp)}`;
}

export function signedDownloadUrl(kit: string, ttlDays = LINK_TTL_DAYS) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  return `${base}${signedDownloadPath(kit, ttlDays)}`;
}

/** Free kits by id, plus any beat's tagged file. */
export function resolveKit(kit: string) {
  if (kit.startsWith(TAGGED_PREFIX)) {
    const slug = kit.slice(TAGGED_PREFIX.length);
    return /^[a-z0-9-]+$/.test(slug) ? taggedFileFor(slug) : undefined;
  }
  return KITS[kit];
}

export function verify(kit: string, exp: string | null, sig: string | null): { ok: true } | { ok: false; reason: "bad" | "expired" } {
  if (!exp || !sig || !/^\d+$/.test(exp)) return { ok: false, reason: "bad" };
  const expected = sign(kit, Number(exp));
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(sig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad" };
  if (Number(exp) * 1000 < Date.now()) return { ok: false, reason: "expired" };
  return { ok: true };
}
