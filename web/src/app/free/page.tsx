import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { FreeDownloads } from "@/components/packs/FreeDownloads";
import { redirect } from "next/navigation";
import { LOOPS_LIVE } from "@/data/site";

export const metadata: Metadata = { title: "Free Downloads" };

export default function FreePage() {
  if (!LOOPS_LIVE) redirect("/beats");
  return (
    <>
      <PageHero eyebrow="Free downloads" title={<>10 <span className="text-grad pr-[0.06em] italic">free</span> loops</>}>
        Email required. Tick the consent box and the download lands in your inbox.
      </PageHero>
      <FreeDownloads />
    </>
  );
}
