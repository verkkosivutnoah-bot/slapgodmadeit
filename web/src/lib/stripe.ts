/**
 * Stripe (server-only). Stripe is the order database for now: a paid Checkout Session holds
 * the buyer, the line items (each tagged with our catalog key) and the payment status.
 *
 * Env: STRIPE_SECRET_KEY (sk_test_… while testing), STRIPE_WEBHOOK_SECRET (whsec_…),
 *      STRIPE_AUTOMATIC_TAX=true once Stripe Tax is set up in the dashboard.
 */
import Stripe from "stripe";
import type { FileKind } from "./catalog";

let client: Stripe | null = null;

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** What we stamp on every line item's product so an order can be read back from Stripe. */
export interface LineMeta {
  key: string;
  kind: "beat" | "pack";
  slug: string;
  title: string;
  tier: string;
  files: string; // comma-separated FileKind list
}

export interface PaidOrder {
  sessionId: string;
  createdAt: Date;
  email: string;
  name: string;
  currency: string;
  total: number;
  lines: (LineMeta & { index: number; fileKinds: FileKind[]; amount: number })[];
}

/**
 * Load a Checkout Session and return it only if it is PAID. Session ids are long unguessable
 * secrets, which is what makes the success page and its download links safe to share with the
 * buyer (and only the buyer).
 */
export async function loadPaidOrder(sessionId: string): Promise<PaidOrder | null> {
  if (!stripeConfigured() || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return null;
  const s = await stripe()
    .checkout.sessions.retrieve(sessionId, { expand: ["line_items.data.price.product"] })
    .catch(() => null);
  if (!s || s.payment_status !== "paid") return null;

  const lines = (s.line_items?.data ?? []).flatMap((li, index) => {
    const product = li.price?.product;
    const meta = (typeof product === "object" && product && "metadata" in product ? product.metadata : {}) as Partial<LineMeta>;
    if (!meta.key || !meta.kind || !meta.slug) return [];
    return [
      {
        index,
        key: meta.key,
        kind: meta.kind,
        slug: meta.slug,
        title: meta.title ?? li.description ?? meta.slug,
        tier: meta.tier ?? "",
        files: meta.files ?? "",
        fileKinds: (meta.files ?? "").split(",").filter(Boolean) as FileKind[],
        amount: (li.amount_total ?? 0) / 100,
      },
    ];
  });

  return {
    sessionId: s.id,
    createdAt: new Date(s.created * 1000),
    email: s.customer_details?.email ?? "",
    name: s.customer_details?.name ?? "",
    currency: (s.currency ?? "eur").toUpperCase(),
    total: (s.amount_total ?? 0) / 100,
    lines,
  };
}

/** Deterministic licence number per order line — the same PDF can be regenerated any time. */
export function orderLicenseNumber(order: Pick<PaidOrder, "sessionId" | "createdAt">, index: number) {
  const tail = order.sessionId.replace(/^cs_(test|live)_/, "").slice(-6).toUpperCase();
  return `SG-${order.createdAt.getFullYear()}-${tail}${index + 1}`;
}
