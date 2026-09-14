"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import { InstagramIcon } from "@/components/ui/Icons";
import { Marquee, Stagger, StaggerItem } from "@/components/ui/motion";
import { seller } from "@/data/seller";
import { coverFor } from "@/data/covers";

// Placeholder tiles (generated covers). TODO: replace with real posts (Instagram Basic Display / oEmbed or a static export).
const tiles = [
  { src: coverFor("packs", "guitar-vault-vol-1"), caption: "Guitar Vault Vol. 1 out now" },
  { src: coverFor("beats", "midnight-ritual"), caption: "Cooking up 'Midnight Ritual'" },
  { src: coverFor("beats", "glass-teeth"), caption: "Drill session" },
  { src: coverFor("packs", "neon-nights-premium"), caption: "Neon Nights teaser" },
  { src: coverFor("beats", "lagos-neon"), caption: "Afro bounce" },
  { src: coverFor("beats", "plum-smoke"), caption: "Late night loops" },
];

export function InstagramStrip() {
  return (
    <section className="py-20 md:py-24" aria-labelledby="ig-title">
      <Marquee
        className="display border-y border-line py-4 text-5xl text-bone md:text-7xl"
        duration={26}
        separator={<InstagramIcon size={36} className="text-gold" />}
        items={[
          <span key="a" id="ig-title">
            Follow {seller.instagram}
          </span>,
          <span key="b" className="text-outline">
            Studio sessions
          </span>,
          <span key="c">Free loop drops</span>,
          <span key="d" className="text-outline">
            Behind the beats
          </span>,
        ]}
      />
      <Stagger className="container-sg mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <StaggerItem key={t.src}>
            <a
              href={seller.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-2xl"
              aria-label={`Instagram post: ${t.caption} (opens Instagram)`}
            >
              <CoverArt src={t.src} title={t.caption} alt="" sizes="(max-width: 640px) 50vw, 16vw" className="absolute inset-0" imgClassName="transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/70 p-3 text-center opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <InstagramIcon size={22} className="text-ember" />
                <span className="text-xs">{t.caption}</span>
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
