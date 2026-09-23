/**
 * Contact + exclusive offers.
 *
 * Every enquiry becomes a Klaviyo profile plus a "Contact Request" event, so offers land
 * somewhere you'll see them and can be answered from the same place as the mailing list.
 * Set up a Klaviyo notification flow on that metric to get a push/email when one arrives.
 */
import { NextResponse } from "next/server";
import { klaviyoConfigured, track, upsertProfile } from "@/lib/klaviyo";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOPICS = ["general", "custom", "exclusive", "content-id", "split-sheet", "licensing"] as const;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { name, email, topic, beat, offer, message, website } = (body ?? {}) as Record<string, unknown>;

  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true }); // bot
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }
  if (typeof message !== "string" || message.trim().length < 5) {
    return NextResponse.json({ ok: false, error: "Tell me a bit more in the message." }, { status: 422 });
  }
  const chosen = TOPICS.includes(topic as (typeof TOPICS)[number]) ? (topic as string) : "general";
  const offerAmount = Number(offer);

  const address = email.trim().toLowerCase();
  const properties = {
    sg_last_contact_topic: chosen,
    ...(typeof name === "string" && name.trim() ? { sg_name: name.trim().slice(0, 120) } : {}),
  };

  const profile = await upsertProfile(address, properties);
  if (profile.status === "error") {
    console.error(`[contact] Klaviyo profile failed: ${profile.message}`);
    return NextResponse.json({ ok: false, error: "Couldn't send that just now. Please try again." }, { status: 502 });
  }

  const event = await track("Contact Request", address, {
    topic: chosen,
    beat: typeof beat === "string" ? beat.slice(0, 80) : null,
    offer: Number.isFinite(offerAmount) && offerAmount > 0 ? offerAmount : null,
    message: message.trim().slice(0, 4000),
    name: typeof name === "string" ? name.trim().slice(0, 120) : null,
  });
  if (event.status === "error") {
    console.error(`[contact] Klaviyo event failed: ${event.message}`);
  }

  // Nothing is stored anywhere else yet — say so honestly in the logs during dev.
  if (!klaviyoConfigured()) {
    console.warn(`[contact] Klaviyo not configured — enquiry from ${address} (${chosen}) was NOT stored.`);
  }

  return NextResponse.json({ ok: true, stored: klaviyoConfigured() });
}
