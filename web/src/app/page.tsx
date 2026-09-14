import { Hero } from "@/components/home/Hero";
import { FlagshipVault } from "@/components/home/FlagshipVault";
import { FeaturedPacks } from "@/components/home/FeaturedPacks";
import { BeatsPreview } from "@/components/home/BeatsPreview";
import { FreeTeaser } from "@/components/home/FreeTeaser";
import { LicensingPreview } from "@/components/home/LicensingPreview";
import { KnowYourRights } from "@/components/rights/KnowYourRights";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { Newsletter } from "@/components/home/Newsletter";
import { Marquee } from "@/components/ui/motion";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee
        className="display -rotate-1 border-y border-ember/30 bg-ember py-3 text-3xl text-ink md:text-4xl"
        separator={<span className="text-ink">✦</span>}
        duration={22}
        items={["Guitar Vault Vol. 1 out now", "Buy 2 leases get 1 free", "100% original sounds", "Free loops inside", "Prod. by SLAPGOD"]}
      />
      <FlagshipVault />
      <FeaturedPacks />
      <BeatsPreview />
      <FreeTeaser />
      <LicensingPreview />
      <KnowYourRights />
      <InstagramStrip />
      <Newsletter />
    </>
  );
}
