import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { seller } from "@/data/seller";

export const metadata: Metadata = { title: "Refund Policy" };

const UPDATED = "23 September 2026";

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated={UPDATED}
      intro={<>Digital files can&apos;t be returned — but if something&apos;s wrong, it gets fixed.</>}
      sections={[
        {
          id: "why",
          title: "Why sales are final",
          body: (
            <p>
              Beats, loops and packs are delivered instantly as downloads, and a download can&apos;t be given back.
              That&apos;s why checkout asks you to agree to immediate delivery and to confirm you understand the 14-day
              right of withdrawal ends once the files are available (see the{" "}
              <Link href="/terms#withdrawal">Terms of Sale</Link>). After that, purchases aren&apos;t refundable just
              because you changed your mind.
            </p>
          ),
        },
        {
          id: "fixed",
          title: "When you'll get a fix or your money back",
          body: (
            <>
              <p>Your consumer rights still apply. Contact {seller.email} if:</p>
              <ul>
                <li>
                  <strong>A file is broken</strong> — won&apos;t download, won&apos;t open or is corrupted. You get a
                  working copy. If it can&apos;t be fixed, you get a full refund.
                </li>
                <li>
                  <strong>You got the wrong thing</strong> — a different beat, missing stems your license includes, the
                  wrong format. It gets corrected straight away.
                </li>
                <li>
                  <strong>You were charged twice</strong> for the same item — the duplicate is refunded.
                </li>
                <li>
                  <strong>It isn&apos;t as described</strong> — the files don&apos;t match what the product page
                  promised.
                </li>
              </ul>
              <p>Please get in touch within 14 days of buying, with the email you paid with and what went wrong.</p>
            </>
          ),
        },
        {
          id: "upgrades",
          title: "Upgrades instead of refunds",
          body: (
            <p>
              Bought a lease and need more? Don&apos;t buy twice — upgrade to a higher tier and pay only the difference.
              Ask through the <Link href="/contact?topic=licensing">contact form</Link> with your order details.
            </p>
          ),
        },
        {
          id: "exclusive",
          title: "Exclusive rights",
          body: (
            <p>
              Exclusive deals are agreed individually, and their refund terms are set in that written agreement.
            </p>
          ),
        },
        {
          id: "how",
          title: "How refunds are paid",
          body: (
            <p>
              Approved refunds go back to the original payment method through Stripe, usually within 5–10 business
              days depending on your bank. When a refund is issued, the license for that purchase ends and the files
              must be deleted and any release built on them taken down.
            </p>
          ),
        },
        {
          id: "chargebacks",
          title: "Please talk before disputing",
          body: (
            <p>
              If you have a problem, email first — it&apos;s faster than a bank dispute and it gets solved. Chargebacks
              on delivered downloads are contested with the order records.
            </p>
          ),
        },
      ]}
    />
  );
}
