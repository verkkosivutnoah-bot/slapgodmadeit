import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LicenseCards } from "@/components/licenses/LicenseCards";
import { ArrowIcon } from "@/components/ui/Icons";

export function LicensingPreview() {
  return (
    <section className="py-20 md:py-28" aria-labelledby="licensing-title">
      <div className="container-sg">
        <SectionHeader
          id="licensing-title"
          eyebrow="Beat licenses"
          ghost="LEASE"
          title={
            <>
              Pick your <span className="text-ember">lease</span>
            </>
          }
          action={
            <Link href="/licenses" className="btn btn-ghost">
              Compare all terms <ArrowIcon size={16} />
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
