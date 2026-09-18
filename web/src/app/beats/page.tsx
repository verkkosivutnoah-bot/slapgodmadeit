import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { BeatCatalog } from "@/components/beats/BeatCatalog";

export const metadata: Metadata = { title: "Beats" };

export default function BeatsPage() {
  return (
    <>
      <PageHero eyebrow="Beat catalog" title={<>Beats, cooked <span className="text-grad pr-[0.06em] italic">from scratch</span></>}>
        Filter by genre, BPM, key and mood. Press play to preview — leases from €29.
      </PageHero>
      <Suspense fallback={<div className="container-sg h-96" />}>
        <BeatCatalog />
      </Suspense>
    </>
  );
}
