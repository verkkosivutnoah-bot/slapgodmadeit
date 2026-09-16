import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LicenseCards } from "@/components/licenses/LicenseCards";

export function LicensingPreview() {
  return (
    <section className="py-20 md:py-28" aria-labelledby="licensing-title">
      <div className="container-sg">
        <SectionHeader
          id="licensing-title"
          eyebrow="Beat licenses"
          title="Simple licensing"
          action={
            <Link href="/licenses" className="btn btn-ghost">
              Compare all terms
            </Link>
          }
        >
          Clear caps, clear terms. Start small and upgrade when your song takes off — you only pay the difference.
        </SectionHeader>
        <LicenseCards />
      </div>
    </section>
  );
}
