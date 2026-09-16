"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { licenseDeals } from "@/data/licenses";
import { ArrowIcon, CloseIcon } from "@/components/ui/Icons";

export function CartView() {
  const cart = useCart();
  const { format, vatNote, currency } = useCurrency();
  const [agree, setAgree] = useState(false);
  const [notice, setNotice] = useState("");

  // "Buy 2 leases get 1 free": cheapest lease free for every 3 leases (display only — enforce server-side).
  const leases = cart.items.filter((i) => i.kind === "beat").sort((a, b) => a.priceEUR - b.priceEUR);
  const freeCount = Math.floor(leases.length / 3);
  const discount = leases.slice(0, freeCount).reduce((s, i) => s + i.priceEUR, 0);
  const total = cart.subtotalEUR - discount;

  async function checkout() {
    if (!agree) {
      setNotice("Please accept the terms and license agreements to continue.");
      return;
    }
    // TODO: Stripe Checkout
    //   POST /api/checkout { items: cart.items.map(i => ({ key: i.key })), currency }
    //   → server builds line items from trusted prices, applies the lease deal, creates a Checkout Session,
    //     returns { url }, then: window.location.href = url
    setNotice(`Checkout isn't connected yet (${currency}). Stripe Checkout hook point: CartView.checkout().`);
  }

  if (cart.count === 0) {
    return (
      <div className="container-sg">
        <div className="panel mx-auto max-w-2xl p-10 text-center sm:p-16">
          <p className="display text-[32px]">Cart&apos;s empty</p>
          <p className="mt-3 text-mute">Grab a beat lease or a pack — or start with 10 free guitar loops.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/beats" className="btn btn-primary">
              Browse beats
            </Link>
            <Link href="/packs" className="btn btn-ghost">
              Packs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sg grid gap-8 lg:grid-cols-[1.5fr_1fr] grid-cols-1">
      <section aria-label="Cart items">
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {cart.items.map((i) => (
              <motion.li
                key={i.key}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="panel flex items-center gap-4 p-3 sm:p-4"
              >
                <CoverArt src={i.cover} title={i.title} alt="" sizes="80px" className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-mute">{i.kind === "beat" ? "Beat lease" : "Pack"}</p>
                  <Link href={i.href} className="block truncate font-semibold hover:text-white">
                    {i.title}
                  </Link>
                  {i.variant && <p className="text-sm text-mute">{i.variant}</p>}
                </div>
                <p className="text-[26px] font-semibold tracking-tight">{format(i.priceEUR)}</p>
                <button
                  type="button"
                  onClick={() => cart.remove(i.key)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-mute transition hover:border-stone-300 hover:text-stone-300"
                  aria-label={`Remove ${i.title} from cart`}
                >
                  <CloseIcon size={14} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <p className="mt-4 text-xs text-mute">
          Deal: {licenseDeals.bundle}.{" "}
          {leases.length > 0 && leases.length % 3 !== 0 && `Add ${3 - (leases.length % 3)} more lease${3 - (leases.length % 3) > 1 ? "s" : ""} to unlock a free one.`}
        </p>
      </section>

      <aside className="panel h-fit p-6 sm:p-8 lg:sticky lg:top-28" aria-labelledby="summary-title">
        <h2 id="summary-title" className="display text-[32px]">
          Summary
        </h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-mute">Subtotal</dt>
            <dd>{format(cart.subtotalEUR)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-white">
              <dt>Buy 2 get 1 free</dt>
              <dd>−{format(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="text-[26px] font-semibold tracking-tight">{format(total)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-right text-[12px] text-mute">{vatNote}</p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-[13px] text-mute">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] accent-[var(--fg)]" />
          <span>
            I accept the{" "}
            <Link href="/terms" className="text-bone underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/licenses" className="text-bone underline underline-offset-2">
              License Agreements
            </Link>
            , and I understand digital downloads are delivered immediately (
            <Link href="/refunds" className="text-bone underline underline-offset-2">
              Refund Policy
            </Link>
            ).
          </span>
        </label>

        <button type="button" onClick={checkout} className="btn btn-primary mt-6 !h-12 w-full">
          Checkout <ArrowIcon size={16} />
        </button>
        {notice && (
          <p role="status" className="mt-4 rounded-xl border border-line p-3 text-[13px] text-mute">
            {notice}
          </p>
        )}
        <button type="button" onClick={cart.clear} className="mt-4 w-full text-center text-[12px] text-mute hover:text-bone">
          Clear cart
        </button>
      </aside>
    </div>
  );
}
