/**
 * Email capture → Klaviyo.
 *
 * Validates, drops bots, rate-limits per IP, then upserts the profile (with the consent record and
 * a signed 30-day download link) and subscribes it to the list. The list uses single opt-in: the
 * profile is subscribed immediately and Klaviyo's welcome flow delivers the download link
 * ({{ person.sg_free_kit_url }}) straight away. The consent record on the profile
 * (wording + timestamp + IP) is the GDPR proof, since there is no confirmation click.
 */
import { NextResponse } from "next/server";
import { klaviyoConfigured, subscribe } from "@/lib/klaviyo";
import { signedDownloadUrl } from "@/lib/downloads";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Consent wording shown next to the checkbox — stored with the profile as proof (GDPR). */
export const CONSENT_TEXT =
  "I agree to receive emails from SLAPGOD about free sounds, new releases and offers. Unsubscribe anytime. See the Privacy Policy.";

// Simple per-instance rate limit: 5 signups per IP per 10 minutes.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // cheap bound
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { email, consent, source, website } = (body ?? {}) as {
    email?: unknown;
    consent?: unknown;
    source?: unknown;
    website?: unknown; // honeypot
  };

  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true }); // silently drop bots
  }
  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }
  if (consent !== true) {
    return NextResponse.json({ ok: false, error: "Please tick the consent box to continue." }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const address = email.trim().toLowerCase();
  const src = typeof source === "string" && source.length <= 64 ? source : "unknown";

  const result = await subscribe({
    email: address,
    source: src,
    consentText: CONSENT_TEXT,
    consentAt: new Date().toISOString(),
    consentIp: ip === "unknown" ? undefined : ip,
    downloadUrl: signedDownloadUrl("guitar-vault-lite"),
  });

  if (result.status === "error") {
    console.error(`[subscribe] Klaviyo failed for ${src}: ${result.message}`);
    return NextResponse.json({ ok: false, error: "We couldn't sign you up just now. Please try again." }, { status: 502 });
  }
  if (result.status === "skipped") {
    console.warn(`[subscribe] Klaviyo not configured — ${address} (${src}) was NOT stored.`);
  }

  return NextResponse.json({ ok: true, stored: klaviyoConfigured() });
}
