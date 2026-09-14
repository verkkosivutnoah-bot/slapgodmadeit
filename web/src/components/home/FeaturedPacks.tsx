"use client";
import Link from "next/link";
import { useRef } from "react";
import { PackCard } from "@/components/packs/PackCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowIcon } from "@/components/ui/Icons";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { loopClub, packs } from "@/data/packs";

export function FeaturedPacks() {
  const track = useRef<HTMLDivElement>(null);
  const items = [...packs, loopClub];
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 20), behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28" aria-labelledby="packs-title">
      <div className="container-sg">
        <SectionHeader
          id="packs-title"
          eyebrow="Loops & sample packs"
          ghost="PACKS"
          title={
            <>
              Featured <span className="text-ember">packs</span>
            </>
          }
          action={
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scroll(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-bone/40" aria-label="Previous packs">
                <ArrowIcon className="rotate-180" />
              </button>
              <button type="button" onClick={() => scroll(1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-bone/40" aria-label="Next packs">
                <ArrowIcon />
              </button>
              <Link href="/packs" className="btn btn-ghost btn-sm ml-2">
                All packs
              </Link>
            </div>
          }
        >
          Royalty-free loops, drum kits and bundles — every sound original, labeled and mix-ready.
        </SectionHeader>
      </div>

      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(16px,calc((100vw-1320px)/2+40px))] pb-6 [scrollbar-width:none]"
        role="region"
        aria-label="Featured packs carousel"
        tabIndex={0}
      >
        <Stagger className="flex gap-5">
          {items.map((p, i) => (
            <StaggerItem key={p.slug}>
              <div data-card className="w-[78vw] shrink-0 snap-start sm:w-[340px]">
                <PackCard pack={p} priority={i < 2} className="h-full" />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
