/**
 * Email-gated free tagged download.
 *
 * Subscribes the address (same consent record as every other form) and records a
 * "Downloaded Tagged Beat" event in Klaviyo carrying WHICH beat — that event is the per-beat
 * tag: build a flow on it and follow up about that exact beat ("how's the song going?").
 * Returns the public tagged MP3 url; the browser starts the download straight away.
 */
import { NextResponse } from "next/server";
import { beats } from "@/data/beats";
import { subscribe, track, upsertProfile } from "@/lib/klaviyo";
import { CONSENT_TEXT } from "../subscribe/route";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// 20 downloads per IP per 10 minutes — plenty for a person, annoying for a scraper.
const WINDOW_MS = 10 * 60_000;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 20;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { email, consent, slug, website, returning } = body;

  const beat = beats.find((b) => b.slug === slug);
  if (!beat) return NextResponse.json({ ok: false, error: "Unknown beat." }, { status: 404 });

  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true, url: beat.src }); // bot: hand over the public file, record nothing
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }
  if (consent !== true) {
    return NextResponse.json({ ok: false, error: "Please tick the consent box to continue." }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many downloads — try again in a few minutes." }, { status: 429 });
  }

  const address = email.trim().toLowerCase();
  const source = `free_tagged_${beat.slug}`;

  // First download: full consent record + list subscription. Returning visitors (email
  // remembered on their device from an earlier download) just get the event logged.
  const sub =
    returning === true
      ? await upsertProfile(address, { sg_last_tagged_beat: beat.slug })
      : await subscribe({
          email: address,
          source,
          consentText: CONSENT_TEXT,
          consentAt: new Date().toISOString(),
          consentIp: ip === "unknown" ? undefined : ip,
        });
  if (sub.status === "error") console.error(`[beat-download] Klaviyo profile failed: ${sub.message}`);

  const ev = await track("Downloaded Tagged Beat", address, {
    beat_slug: beat.slug,
    beat_title: beat.title,
    bpm: beat.bpm,
    key: beat.key,
    genre: beat.genre,
    beat_url: `https://slapgodmadeit.com/beats/${beat.slug}`,
    license_from_eur: beat.priceFrom,
  });
  if (ev.status === "error") console.error(`[beat-download] Klaviyo event failed: ${ev.message}`);

  if (returning !== true) await upsertProfile(address, { sg_last_tagged_beat: beat.slug });

  return NextResponse.json({ ok: true, url: beat.src });
}
