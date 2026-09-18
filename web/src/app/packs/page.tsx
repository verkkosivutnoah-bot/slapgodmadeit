import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { PacksGrid } from "@/components/packs/PacksGrid";

export const metadata: Metadata = { title: "Loops & Sample Packs" };

export default function PacksPage() {
  return (
    <>
      <PageHero eyebrow="Loops · Drum kits · Bundles" title={<>Sample <span className="text-grad pr-[0.06em] italic">packs</span></>}>
        Royalty-free loops and kits, every sound original. Use them in unlimited productions — 25% publishing split on released songs.
      </PageHero>
      <PacksGrid />
    </>
  );
}
