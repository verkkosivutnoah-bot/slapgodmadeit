import type { Metadata } from "next";
import { StubPage } from "@/components/layout/PageHero";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundsPage() {
  return (
    <StubPage eyebrow="Legal" title="Refunds">
      <h2 className="text-xl font-semibold">Refund Policy</h2>
      <p className="mt-3 text-mute">Content coming soon — including how the right of withdrawal applies to instantly delivered digital content.</p>
    </StubPage>
  );
}
