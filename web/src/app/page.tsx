import { Hero } from "@/components/home/Hero";
import { FlagshipVault } from "@/components/home/FlagshipVault";
import { FeaturedPacks } from "@/components/home/FeaturedPacks";
import { BeatsPreview } from "@/components/home/BeatsPreview";
import { FreeTeaser } from "@/components/home/FreeTeaser";
import { LicensingPreview } from "@/components/home/LicensingPreview";
import { KnowYourRights } from "@/components/rights/KnowYourRights";
import { Marquee } from "@/components/ui/Marquee";
import { LOOPS_LIVE } from "@/data/site";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      {LOOPS_LIVE && <FlagshipVault />}
      <BeatsPreview />
      {LOOPS_LIVE && <FeaturedPacks />}
      {LOOPS_LIVE && <FreeTeaser />}
      <Marquee
        items={LOOPS_LIVE ? ["Beats", "Guitar loops", "Drum kits", "One-shots", "Custom beats"] : ["Beats", "Leases", "Exclusives", "Custom beats", "Free tagged downloads"]}
        reverse
      />
      <LicensingPreview />
      <KnowYourRights />
    </>
  );
}
