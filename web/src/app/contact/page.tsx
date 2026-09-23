import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/layout/ContactForm";
import { seller } from "@/data/seller";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" lines={[<>Let’s <span className="text-grad pr-[0.06em] italic">talk</span></>]}>
        Custom beats, exclusive offers, Content ID whitelisting, split sheets or licensing questions — send a message.
      </PageHero>
      <div className="container-sg grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div className="rounded-[24px] border border-line p-6 sm:p-10">
          <Suspense fallback={<div className="h-96" />}>
            <ContactForm />
          </Suspense>
        </div>
        <aside className="h-fit border-t border-line pt-8 lg:border-t-0 lg:pt-4">
          <h2 className="eyebrow">Seller information</h2>
          <address className="mt-4 not-italic leading-relaxed text-stone-300">
            <strong>
              {seller.name} ({seller.legalForm})
            </strong>
            <br />
            Business ID: {seller.businessId}
            <br />
            {seller.postalCode} {seller.city}, {seller.country}
            <br />
            Email: {seller.email}
            <br />
            Instagram:{" "}
            <a href={seller.instagramUrl} target="_blank" rel="noreferrer" className="link-u text-bone">
              {seller.instagram}
            </a>
          </address>
          <p className="mt-6 text-sm text-mute">Content ID claims are usually cleared within 48 hours. Custom beats start from €400.</p>
        </aside>
      </div>
    </>
  );
}
