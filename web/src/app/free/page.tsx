import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { FreeDownloads } from "@/components/packs/FreeDownloads";

export const metadata: Metadata = { title: "Free Downloads" };

export default function FreePage() {
  return (
    <>
      <PageHero
        eyebrow="Free downloads"
        ghost="FREE"
        title={
          <>
            Free <span className="text-ember">sounds</span>
          </>
        }
      >
        Email required. Tick the consent box, confirm the double opt-in link in your inbox, and the download is yours.
      </PageHero>
      <FreeDownloads />
    </>
  );
}
