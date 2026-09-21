import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { FreeDownloads } from "@/components/packs/FreeDownloads";

export const metadata: Metadata = { title: "Free Downloads" };

export default function FreePage() {
  return (
    <>
      <PageHero eyebrow="Free downloads" title={<>10 <span className="text-grad pr-[0.06em] italic">free</span> loops</>}>
        Email required. Tick the consent box and the download lands in your inbox.
      </PageHero>
      <FreeDownloads />
    </>
  );
}
