import type { Metadata } from "next";
import { StubPage } from "@/components/layout/PageHero";
import { seller, sellerLine } from "@/data/seller";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <StubPage eyebrow="Legal" title="Terms">
      <h2 className="text-xl font-semibold">Terms of Service</h2>
      <p className="mt-3 text-mute">
        The full terms of sale for digital products (beats, loops and sample packs) are coming soon. Digital content is delivered instantly after purchase.
      </p>
      <h3 className="mt-6 text-xs text-mute">Seller</h3>
      <address className="mt-2 not-italic leading-relaxed text-bone/90">
        {seller.name} ({seller.legalForm})<br />
        Y-tunnus: {seller.businessId}
        <br />
        {seller.street}, {seller.postalCode} {seller.city}, {seller.country}
        <br />
        {seller.email}
      </address>
      <p className="sr-only">{sellerLine}</p>
    </StubPage>
  );
}
