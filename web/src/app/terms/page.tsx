import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { seller } from "@/data/seller";

export const metadata: Metadata = { title: "Terms of Sale" };

const UPDATED = "23 September 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Sale"
      updated={UPDATED}
      intro={<>The rules for buying beats, loops and sample packs from {seller.name}, in plain language.</>}
      sections={[
        {
          id: "who",
          title: "Who you're buying from",
          body: (
            <>
              <p>
                The seller is <strong>{seller.name}</strong>, a {seller.legalForm} registered in {seller.country}{" "}
                (Business ID {seller.businessId}), {seller.street}, {seller.postalCode} {seller.city}. Contact:{" "}
                {seller.email}.
              </p>
              <p>
                These terms apply to every purchase made on slapgodmadeit.com. By completing a purchase you
                accept them, together with the <Link href="/licenses">license agreement</Link> for the product you
                buy.
              </p>
            </>
          ),
        },
        {
          id: "products",
          title: "What you're buying",
          body: (
            <>
              <p>
                Everything sold here is <strong>digital content</strong>: audio files delivered as downloads. You
                don&apos;t buy the music itself — you buy a <strong>license</strong> to use it on the terms of that
                license.
              </p>
              <ul>
                <li>
                  <strong>Beat leases</strong> (Basic, Premium, Trackout, Unlimited) are non-exclusive licenses to make
                  one new song. The beat stays available to other buyers. Each tier has its own file formats and
                  distribution limits, set out in the license agreement delivered with your order. {seller.name} owns
                  50% of the composition of every song made with a beat (writer and publisher share).
                </li>
                <li>
                  <strong>Exclusive rights</strong> are negotiated individually through the{" "}
                  <Link href="/contact?topic=exclusive">offer form</Link> and are covered by a separate written
                  agreement. They are an exclusive license, not a transfer of copyright, and include a 5% master
                  royalty to {seller.name}.
                </li>
                <li>
                  <strong>Loop and sample packs</strong> come with a royalty-free license to use the sounds in your
                  own productions. {seller.name} owns 25% of the composition of any commercially released song built
                  on them.
                </li>
              </ul>
              <p>
                Product pages, <Link href="/#rights">Know your rights</Link> and the{" "}
                <Link href="/licenses">licenses page</Link> are summaries. The license PDF you receive with your order
                is the binding agreement.
              </p>
            </>
          ),
        },
        {
          id: "prices",
          title: "Prices and payment",
          body: (
            <>
              <p>
                {seller.name} is not registered for value added tax (a small business under the Finnish VAT
                threshold), so <strong>no VAT is charged</strong> and prices are final. US dollar prices are shown
                for convenience; you are charged in the currency you check out in. The total is shown before you pay.
              </p>
              <p>
                Payments are processed by <strong>Stripe</strong>. Card details go directly to Stripe and are never
                seen or stored by {seller.name}. Your order is confirmed once the payment succeeds.
              </p>
              <p>
                Offers such as &ldquo;buy 2 leases, get 1 free&rdquo; and promotion codes are applied at checkout and
                can&apos;t be claimed after payment.
              </p>
            </>
          ),
        },
        {
          id: "delivery",
          title: "Delivery",
          body: (
            <>
              <p>
                Files are available <strong>immediately</strong> after payment on your downloads page, together with
                your license PDF. Stripe also emails you a receipt. Keep the downloads page link — it&apos;s your access
                to the files.
              </p>
              <p>
                If a file won&apos;t download or appears damaged, contact {seller.email} with your order details and
                you&apos;ll get a working copy.
              </p>
            </>
          ),
        },
        {
          id: "withdrawal",
          title: "Your right of withdrawal",
          body: (
            <>
              <p>
                Under EU consumer law you normally have 14 days to cancel an online purchase. For digital content,
                that right ends once delivery begins, <strong>if you agreed to immediate delivery and acknowledged
                losing the right</strong>.
              </p>
              <p>
                Checkout asks you to do exactly that: you tick a box confirming you want the files straight away and
                accept that the 14-day withdrawal right no longer applies once the download is available. Without that
                confirmation, you can&apos;t complete the purchase.
              </p>
              <p>
                This doesn&apos;t affect your rights if the files are faulty or not as described — see the{" "}
                <Link href="/refunds">refund policy</Link>.
              </p>
            </>
          ),
        },
        {
          id: "use",
          title: "Using what you bought",
          body: (
            <>
              <p>Your license, not these terms, sets what you may do with the music. In short, you may not:</p>
              <ul>
                <li>resell, share or redistribute the files, or include them in any sample pack or library;</li>
                <li>register the beat, loops or your song in YouTube Content ID or a similar system;</li>
                <li>use the music to train AI models or include it in any dataset;</li>
                <li>
                  place your song in film, TV, advertising or games (&ldquo;sync&rdquo;) without written permission;
                </li>
                <li>claim you wrote or produced the beat or sounds.</li>
              </ul>
              <p>
                Credit &ldquo;Prod. by SLAPGOD&rdquo; wherever you release, register {seller.name}&apos;s composition
                share with your PRO and distributor, and tell {seller.name} within 14 days of a commercial release
                (release date, ISRC and distributor).
              </p>
            </>
          ),
        },
        {
          id: "ip",
          title: "Ownership",
          body: (
            <p>
              {seller.name} keeps the copyright in every beat, loop and sample, and in the sound recordings. Buying a
              license doesn&apos;t transfer ownership. Every sound sold here is original, and {seller.name} guarantees
              that no uncleared third-party samples are used.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Liability",
          body: (
            <p>
              {seller.name}&apos;s liability for any purchase is limited to the amount you paid for it, except where
              the law doesn&apos;t allow liability to be limited. Nothing here limits your statutory rights as a
              consumer.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          body: (
            <p>
              These terms may be updated. The version that applies to your purchase is the one on this page when you
              paid. The date at the top shows the latest change.
            </p>
          ),
        },
        {
          id: "law",
          title: "Law and disputes",
          body: (
            <>
              <p>
                These terms are governed by the laws of {seller.country}. If you are a consumer living elsewhere in the
                EU, the mandatory consumer-protection rules of your own country still apply to you.
              </p>
              <p>
                If something goes wrong, contact {seller.email} first — most problems are solved in a reply. Consumers
                in Finland can also get free advice from the{" "}
                <a href="https://www.kkv.fi/en/consumer-affairs/consumer-advisory-services/" target="_blank" rel="noreferrer">
                  Consumer Advisory Services
                </a>{" "}
                and take a dispute to the{" "}
                <a href="https://www.kuluttajariita.fi/en/" target="_blank" rel="noreferrer">
                  Consumer Disputes Board
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
