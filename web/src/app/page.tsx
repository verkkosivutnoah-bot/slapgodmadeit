import { Hero } from "@/components/home/Hero";
import { FlagshipVault } from "@/components/home/FlagshipVault";
import { FeaturedPacks } from "@/components/home/FeaturedPacks";
import { BeatsPreview } from "@/components/home/BeatsPreview";
import { FreeTeaser } from "@/components/home/FreeTeaser";
import { LicensingPreview } from "@/components/home/LicensingPreview";
import { KnowYourRights } from "@/components/rights/KnowYourRights";

export default function Home() {
  return (
    <>
      <Hero />
      <FlagshipVault />
      <BeatsPreview />
      <FeaturedPacks />
      <FreeTeaser />
      <LicensingPreview />
      <KnowYourRights />
    </>
  );
}
