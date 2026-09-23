/**
 * Free tagged beat download, in exchange for an email.
 *
 * The producer-tagged, full-length file is how most leases actually start: people build the
 * song first, then buy the clean files. Subscribes the address (same consent record as the
 * popup) and hands back a signed link valid for 7 days.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { subscribe } from "@/lib/klaviyo";
import { TAGGED_TTL_DAYS, signedDownloadPath, taggedFileFor, taggedKitId } from "@/lib/downloads";
import { CONSENT_TEXT } from "../subscribe/route";
import { beats } from "@/data/beats";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { email, consent, slug, website } = (body ?? {}) as {
    email?: unknown;
    consent?: unknown;
    slug?: unknown;
    website?: unknown; // honeypot
  };

  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true });
  }
  if (typeof slug !== "string" || !beats.some((b) => b.slug === slug)) {
    return NextResponse.json({ ok: false, error: "Unknown beat." }, { status: 404 });
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }
  if (consent !== true) {
    return NextResponse.json({ ok: false, error: "Please tick the consent box to continue." }, { status: 422 });
  }

  const { file } = taggedFileFor(slug);
  if (!existsSync(join(process.cwd(), "private", file))) {
    return NextResponse.json(
      { ok: false, error: "That tagged file isn't ready yet — try another beat." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const result = await subscribe({
    email: email.trim().toLowerCase(),
    source: `free_tagged_${slug}`,
    consentText: CONSENT_TEXT,
    consentAt: new Date().toISOString(),
    consentIp: ip || undefined,
  });
  if (result.status === "error") {
    console.error(`[free-download] Klaviyo failed for ${slug}: ${result.message}`);
  }

  return NextResponse.json({
    ok: true,
    url: signedDownloadPath(taggedKitId(slug), TAGGED_TTL_DAYS),
    expiresInDays: TAGGED_TTL_DAYS,
  });
}
