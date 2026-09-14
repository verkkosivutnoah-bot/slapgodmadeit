// Email capture stub. Validates input and returns ok.
// TODO: Klaviyo/ESP — create/update profile, subscribe to list with double opt-in,
//       store consent text + timestamp + source, and trigger the "Guitar Vault Lite" delivery flow
//       (deliver the download link only AFTER the opt-in is confirmed).
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  // TODO: Klaviyo/ESP — subscribe `email.trim().toLowerCase()` with source `${source}`
  void source;

  return NextResponse.json({ ok: true, doubleOptIn: true });
}
