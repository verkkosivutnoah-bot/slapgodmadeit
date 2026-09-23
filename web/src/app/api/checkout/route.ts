/**
 * Create a Stripe Checkout Session from cart KEYS.
 *
 * Prices, names and deliverables come from lib/catalog (trusted); the lease deal comes from
 * lib/pricing, the same function the cart shows. The browser never sets an amount.
 */
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { lookup, type CatalogLine } from "@/lib/catalog";
import { cartTotals } from "@/lib/pricing";
import { stripe, stripeConfigured, type LineMeta } from "@/lib/stripe";

export const runtime = "nodejs";

const WAIVER =
  "I agree to immediate delivery of the digital files and acknowledge that I lose my 14-day right of withdrawal once the download is available.";

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Checkout isn't set up yet (no Stripe key)." }, { status: 503 });
  }

  let body: { keys?: unknown; currency?: unknown; waiver?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.waiver !== true) {
    return NextResponse.json({ ok: false, error: "Please accept the terms to continue." }, { status: 422 });
  }
  const currency = body.currency === "USD" ? "usd" : "eur";
  const keys = Array.isArray(body.keys) ? [...new Set(body.keys.filter((k): k is string => typeof k === "string"))] : [];
  if (keys.length === 0 || keys.length > 30) {
    return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 422 });
  }

  const lines: CatalogLine[] = [];
  for (const key of keys) {
    const line = lookup(key);
    if (!line) {
      return NextResponse.json(
        { ok: false, error: "Something in your cart is no longer for sale. Remove it and try again.", key },
        { status: 409 }
      );
    }
    lines.push(line);
  }

  const price = (l: CatalogLine) => (currency === "usd" ? l.priceUSD : l.priceEUR);
  const { freeKeys } = cartTotals(lines.map((l) => ({ key: l.key, kind: l.kind, priceEUR: price(l) })));

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://slapgodmadeit.vercel.app";
  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX === "true";

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((l) => {
    const free = freeKeys.includes(l.key);
    const meta: LineMeta = {
      key: l.key,
      kind: l.kind,
      slug: l.slug,
      title: l.title,
      tier: l.tier ?? "",
      files: l.files.join(","),
    };
    const image = l.cover.startsWith("http") ? l.cover : `${origin}${l.cover}`;
    return {
      quantity: 1,
      price_data: {
        currency,
        unit_amount: free ? 0 : Math.round(price(l) * 100),
        ...(automaticTax ? { tax_behavior: "inclusive" as const } : {}),
        product_data: {
          name: l.kind === "beat" ? `${l.title} — ${l.tierName}` : l.title,
          description: free ? "Free with the buy 2, get 1 lease deal" : undefined,
          images: image.endsWith(".svg") ? undefined : [image],
          metadata: meta as unknown as Stripe.MetadataParam,
        },
      },
    };
  });

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    // Managed Payments makes Stripe the merchant of record (it files VAT for you) but forbids
    // custom checkout text — which is where the withdrawal waiver lives. You chose to file VAT
    // yourself, so it's off. Set STRIPE_MANAGED_PAYMENTS=true to hand VAT to Stripe instead.
    managed_payments: { enabled: process.env.STRIPE_MANAGED_PAYMENTS === "true" },
    line_items,
    customer_creation: "always",
    billing_address_collection: "auto",
    allow_promotion_codes: true,
    ...(automaticTax ? { automatic_tax: { enabled: true } } : {}),
    ...(process.env.STRIPE_MANAGED_PAYMENTS === "true" ? {} : { custom_text: { submit: { message: WAIVER } } }),
    metadata: {
      source: "slapgod-web",
      withdrawal_waiver: "accepted",
      withdrawal_waiver_at: new Date().toISOString(),
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
