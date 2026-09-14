import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { BeatCatalog } from "@/components/beats/BeatCatalog";

export const metadata: Metadata = { title: "Beats" };

export default function BeatsPage() {
  return (
    <>
      <PageHero
        eyebrow="Beat catalog"
        ghost="BEATS"
        title={
          <>
            All <span className="text-gold">beats</span>
          </>
        }
      >
        Filter by genre, BPM, key and mood. Hit play to preview in the player below — license from €29.
      </PageHero>
      <BeatCatalog />
    </>
  );
}
