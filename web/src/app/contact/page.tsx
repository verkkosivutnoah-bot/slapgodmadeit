import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/layout/ContactForm";
import { seller } from "@/data/seller";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Contact" ghost="HOLLA">
        Custom beats, exclusive offers, Content ID whitelisting, split sheets or licensing questions — send a message.
      </PageHero>
      <div className="container-sg grid gap-8 lg:grid-cols-[1.4fr_1fr] grid-cols-1">
        <div className="panel p-6 sm:p-10">
          <Suspense fallback={<div className="h-96" />}>
            <ContactForm />
          </Suspense>
        </div>
        <aside className="panel h-fit p-6 sm:p-8">
          <h2 className="eyebrow">Seller information</h2>
          <address className="mt-4 not-italic leading-relaxed text-bone/90">
            <strong>
              {seller.name} ({seller.legalForm})
            </strong>
            <br />
            Y-tunnus: {seller.businessId}
            <br />
            {seller.street}
            <br />
            {seller.postalCode} {seller.city}, {seller.country}
            <br />
            Email: {seller.email}
            <br />
            Instagram:{" "}
            <a href={seller.instagramUrl} target="_blank" rel="noreferrer" className="text-ember underline-offset-2 hover:underline">
              {seller.instagram}
            </a>
          </address>
          <p className="mt-6 text-sm text-mute">Content ID claims are usually cleared within 48 hours. Custom beats start from €400.</p>
        </aside>
      </div>
    </>
  );
}
