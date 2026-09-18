"use client";
import { PackCard } from "@/components/packs/PackCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DragScroll } from "@/components/ui/DragScroll";
import { Reveal } from "@/components/ui/motion";
import { freePacks, loopClub, packs } from "@/data/packs";

export function FeaturedPacks() {
  const items = [...packs.filter((p) => p.slug !== "guitar-vault-vol-1"), freePacks[0], loopClub];
  return (
    <section className="section overflow-hidden" aria-labelledby="packs-title">
      <div className="container-sg">
        <SectionHeader id="packs-title" eyebrow="Loops & sample packs" title="Packs" href="/packs" hrefLabel="All packs">
          Royalty-free loops, drum kits and bundles. Drag to browse.
        </SectionHeader>
      </div>
      <Reveal>
        <DragScroll
          label="Packs carousel"
          className="scroll-px-[max(16px,calc((100vw-1200px)/2))] px-[max(16px,calc((100vw-1200px)/2))] pb-2"
        >
          {items.map((p, i) => (
            <div key={p.slug} className="w-[72vw] shrink-0 sm:w-[300px] lg:w-[320px]">
              <PackCard pack={p} priority={i < 2} sizes="(max-width: 640px) 72vw, 320px" />
            </div>
          ))}
          <div className="w-px shrink-0" aria-hidden />
        </DragScroll>
      </Reveal>
    </section>
  );
}
