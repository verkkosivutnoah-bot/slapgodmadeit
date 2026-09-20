import type { Metadata } from "next";
import { StubPage } from "@/components/layout/PageHero";
import { seller } from "@/data/seller";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <StubPage eyebrow="Legal" title="Privacy">
      <h2 className="text-xl font-semibold">Privacy Policy</h2>
      <p className="mt-3 text-mute">
        Full privacy policy coming soon. It will cover email marketing consent (double opt-in, unsubscribe anytime), order data, payment processing and cookies.
      </p>
      <h3 className="mt-6 text-xs text-mute">Data controller</h3>
      <address className="mt-2 not-italic leading-relaxed text-bone/90">
        {seller.name} ({seller.legalForm}) · Business ID: {seller.businessId}
        <br />
        {seller.street}, {seller.postalCode} {seller.city}, {seller.country}
        <br />
        {seller.email}
      </address>
    </StubPage>
  );
}
