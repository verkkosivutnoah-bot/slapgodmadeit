import type { Metadata } from "next";
import Link from "next/link";
import { FILE_LABEL } from "@/lib/catalog";
import { loadPaidOrder, orderLicenseNumber, stripeConfigured } from "@/lib/stripe";
import { ClearCart } from "@/components/packs/ClearCart";

export const metadata: Metadata = { title: "Your downloads", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Delivery page. Reads the paid Checkout Session straight from Stripe, so it works even if the
 * webhook is late. Bookmark-able: the session id in the URL is the buyer's key to their files.
 */
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const order = stripeConfigured() && session_id ? await loadPaidOrder(session_id) : null;

  if (!order) {
    return (
      <div className="container-sg pb-28 pt-40">
        <h1 className="display text-[clamp(36px,5vw,56px)]">We couldn&apos;t find that order</h1>
        <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-stone-400">
          If you just paid, give it a few seconds and refresh. Still nothing? Reply to your Stripe receipt or{" "}
          <Link href="/contact" className="link-u text-bone">
            get in touch
          </Link>{" "}
          — include the email you paid with.
        </p>
      </div>
    );
  }

  const q = (line: number) => `session=${encodeURIComponent(order.sessionId)}&line=${line}`;

  return (
    <div className="container-sg pb-28 pt-36">
      <ClearCart />
      <p className="eyebrow">
        <span className="text-amber">Paid</span> · {order.total.toFixed(2)} {order.currency}
      </p>
      <h1 className="display mt-4 text-[clamp(38px,5.4vw,64px)]">
        Your <span className="text-grad">downloads</span>
      </h1>
      <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-stone-400">
        Thanks{order.name ? `, ${order.name.split(" ")[0]}` : ""}. Everything you bought is below — bookmark this page, it
        stays yours. A receipt went to <span className="text-bone">{order.email}</span>.
      </p>

      <ul className="mt-12 max-w-3xl space-y-4">
        {order.lines.map((l) => (
          <li key={l.index} className="rounded-[22px] border border-line p-6 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[20px] font-semibold text-bone">{l.title}</h2>
              <span className="text-[14px] text-mute">
                {l.kind === "beat" ? l.tier.charAt(0).toUpperCase() + l.tier.slice(1) + " lease" : "Pack"}
                {l.amount === 0 ? " · free with the lease deal" : ""}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {l.fileKinds.map((f) => (
                <a key={f} href={`/api/order/download?${q(l.index)}&file=${f}`} className="btn btn-primary btn-sm">
                  {FILE_LABEL[f]}
                </a>
              ))}
              <a href={`/api/order/license?${q(l.index)}`} className="btn btn-ghost btn-sm">
                License PDF
              </a>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-mute">
              License {orderLicenseNumber(order, l.index)} · Credit &ldquo;Prod. by SLAPGOD&rdquo; ·{" "}
              {l.kind === "beat" ? "50%" : "25%"} of the composition to SLAPGOD on released songs · tell SLAPGOD
              within 14 days of release · no Content ID · keep the PDF with your release paperwork.
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-xl text-[14px] leading-relaxed text-mute">
        Releasing a song on one of these? Register SLAPGOD's composition share with your PRO and{" "}
        <Link href="/contact?topic=split-sheet" className="link-u text-bone">
          send the split sheet
        </Link>
        . Questions about your licence:{" "}
        <Link href="/#rights" className="link-u text-bone">
          know your rights
        </Link>
        .
      </p>
    </div>
  );
}
