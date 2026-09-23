"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { cartTotals } from "@/lib/pricing";
import { useCurrency } from "@/lib/currency";
import { licenseDeals } from "@/data/licenses";
import { ArrowIcon, CloseIcon } from "@/components/ui/Icons";
import { EASE, Reveal } from "@/components/ui/motion";

export function CartView() {
  const cart = useCart();
  const { format, vatNote, currency } = useCurrency();
  const [agree, setAgree] = useState(false);
  const [notice, setNotice] = useState("");

  // "Buy 2 leases get 1 free" — shared with the checkout route so both agree (lib/pricing).
  const { discount, total, freeKeys, leasesToNextFree } = cartTotals(cart.items);

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
        <Reveal className="mx-auto max-w-xl rounded-[24px] border border-line bg-[radial-gradient(70%_80%_at_50%_0%,rgb(var(--coral-rgb)/0.12),transparent_70%)] p-10 text-center sm:p-16">
          <p className="display text-[36px]">Your cart is empty</p>
          <p className="mt-3 text-stone-400">Grab a beat lease or a pack — or start with 10 free guitar loops.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/beats" className="btn btn-primary">
              Browse beats
            </Link>
            <Link href="/free" className="btn btn-ghost">
              Free loops
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="container-sg grid grid-cols-1 gap-10 pb-24 lg:grid-cols-[1.5fr_1fr] lg:gap-14 lg:pb-0">
      <section aria-label="Cart items">
        {leasesToNextFree > 0 && (
          <p className="mb-5 rounded-2xl border border-amber/30 bg-amber/[0.06] px-5 py-3 text-[14px] text-amber">
            Add {leasesToNextFree} more lease{leasesToNextFree === 1 ? "" : "s"} and the cheapest one is free.
          </p>
        )}
        <ul className="border-t border-line">
          <AnimatePresence initial={false}>
            {cart.items.map((i) => (
              <motion.li
                key={i.key}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.3 } }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex items-center gap-4 border-b border-line py-4"
              >
                <Link href={i.href} className="frame block h-16 w-16 shrink-0 !rounded-[12px] sm:h-20 sm:w-20" tabIndex={-1} aria-hidden>
                  <CoverArt src={i.cover} title={i.title} alt="" sizes="80px" className="absolute inset-0" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={i.href} className="link-u truncate text-[16px] font-medium">
                    {i.title}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-mute">{i.variant ?? (i.kind === "beat" ? "Beat lease" : "Pack")}</p>
                </div>
                {freeKeys.includes(i.key) ? (
                  <p className="text-right">
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-amber">Free</span>
                    <s className="text-[14px] tabular-nums text-mute">{format(i.priceEUR)}</s>
                  </p>
                ) : (
                  <p className="text-[17px] font-semibold tabular-nums text-coral">{format(i.priceEUR)}</p>
                )}
                <button
                  type="button"
                  onClick={() => cart.remove(i.key)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone-300/[0.1] text-nav transition-colors duration-300 hover:bg-coral hover:text-deep"
                  aria-label={`Remove ${i.title} from cart`}
                >
                  <CloseIcon size={14} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <p className="mt-5 text-[13px] text-mute">{licenseDeals.bundle}.</p>
      </section>

      <aside id="cart-summary" className="h-fit scroll-mt-24 rounded-[24px] border border-line bg-[radial-gradient(80%_60%_at_100%_0%,rgb(var(--lilac-rgb)/0.1),transparent_70%)] p-6 sm:p-8 lg:sticky lg:top-28" aria-labelledby="summary-title">
        <h2 id="summary-title" className="display text-[32px]">
          Summary
        </h2>
        <dl className="mt-6 space-y-3 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-mute">Subtotal</dt>
            <dd className="tabular-nums">{format(cart.subtotalEUR)}</dd>
          </div>
          <AnimatePresence initial={false}>
            {discount > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between overflow-hidden text-amber">
                <dt>Buy 2 get 1 free</dt>
                <dd className="tabular-nums">−{format(discount)}</dd>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <dt className="font-medium">Total</dt>
            <dd className="text-grad text-[30px] font-semibold tracking-tight tabular-nums">{format(total)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-right text-[12px] text-mute">{vatNote}</p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-mute">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--coral)]" />
          <span>
            I accept the{" "}
            <Link href="/terms" className="text-bone underline decoration-coral underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/licenses" className="text-bone underline decoration-coral underline-offset-2">
              License Agreements
            </Link>
            , and I understand digital downloads are delivered immediately (
            <Link href="/refunds" className="text-bone underline decoration-coral underline-offset-2">
              Refund Policy
            </Link>
            ).
          </span>
        </label>

        <button type="button" onClick={checkout} className="btn btn-primary mt-6 !h-12 w-full">
          Checkout <ArrowIcon size={16} />
        </button>
        {notice && (
          <p role="status" className="mt-4 rounded-2xl border border-line p-3 text-[13px] text-mute">
            {notice}
          </p>
        )}
        <button type="button" onClick={cart.clear} className="link-u mx-auto mt-5 block text-[13px] text-mute hover:text-bone">
          Clear cart
        </button>
      </aside>

      {/* mobile sticky checkout */}
      <div className="buybar fixed inset-x-3 z-40 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-full border border-coral/30 bg-deep py-2 pl-5 pr-2 shadow-[0_14px_36px_-16px_var(--coral)]">
          <span className="text-[15px] font-semibold tabular-nums">
            {format(total)} <span className="text-[12px] font-normal text-mute">· {cart.count} item{cart.count === 1 ? "" : "s"}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (!agree) document.getElementById("cart-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
              checkout();
            }}
            className="btn btn-primary btn-sm"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
