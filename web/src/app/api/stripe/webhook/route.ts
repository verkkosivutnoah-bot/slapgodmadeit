/**
 * Stripe webhook. Verifies the signature, then records completed orders in Klaviyo as a
 * "Placed Order" event (drives the post-purchase flow). It does NOT subscribe buyers to the
 * newsletter — buying isn't marketing consent.
 *
 * Delivery itself doesn't depend on this: the success page reads the paid session directly,
 * so a delayed or failed webhook never blocks a download.
 */
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { track } from "@/lib/klaviyo";
import { loadPaidOrder, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Bad signature: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = await loadPaidOrder(session.id);
    if (order?.email) {
      const r = await track("Placed Order", order.email, {
        $value: order.total,
        currency: order.currency,
        order_id: order.sessionId,
        items: order.lines.map((l) => ({ title: l.title, kind: l.kind, tier: l.tier, amount: l.amount })),
        item_names: order.lines.map((l) => l.title),
      });
      if (r.status === "error") console.error(`[webhook] Klaviyo Placed Order failed: ${r.message}`);
    }
  }

  return NextResponse.json({ received: true });
}
