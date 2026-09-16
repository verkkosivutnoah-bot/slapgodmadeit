"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { PackCard } from "./PackCard";
import { Reveal } from "@/components/ui/motion";
import { freePacks, guitarVault, loopClub, packs, type PackType } from "@/data/packs";
import { useCurrency } from "@/lib/currency";

const FILTERS: ("All" | PackType)[] = ["All", "Guitar Loops", "Loop Pack", "Premium Pack", "Mini Loop Kit", "Drum Kit", "Bundle", "Free Kit"];

export function PacksGrid() {
  const [type, setType] = useState<(typeof FILTERS)[number]>("All");
  const { format } = useCurrency();
  const all = useMemo(() => [...packs, ...freePacks], []);
  const list = type === "All" ? all : all.filter((p) => p.type === type);

  return (
    <div className="container-sg">
      {/* flagship spotlight */}
      <Reveal>
        <Link
          href={`/packs/${guitarVault.slug}`}
          className="group relative mb-14 grid grid-cols-1 items-center gap-6 rounded-[24px] border border-line bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04] md:grid-cols-[300px_1fr] md:gap-10"
        >
          <CoverArt src={guitarVault.cover} title={guitarVault.title} alt="" priority sizes="(max-width: 768px) 100vw, 320px" className="aspect-square w-full rounded-2xl" />
          <div className="flex flex-col justify-center gap-3 px-3 pb-4 md:px-0 md:pr-8">
            <p className="eyebrow">Flagship · {guitarVault.soundLabel}</p>
            <p className="display text-[clamp(30px,4.5vw,48px)]">{guitarVault.title}</p>
            <p className="max-w-xl text-stone-300">{guitarVault.tagline}</p>
            <p className="flex items-center gap-3">
              <span className="text-[22px] font-semibold">{format(guitarVault.price)}</span>
              {guitarVault.compareAt && <s className="text-sm text-mute">{format(guitarVault.compareAt)}</s>}
              <span className="btn btn-primary btn-sm ml-2">View pack</span>
            </p>
          </div>
        </Link>
      </Reveal>

      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Filter by type">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="chip shrink-0" aria-pressed={type === f} onClick={() => setType(f)}>
            {f}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <PackCard pack={p} className="h-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Loop Club */}
      <Reveal>
        <section
          id="loop-club"
          aria-labelledby="loop-club-title"
          className="relative mt-20 grid scroll-mt-28 grid-cols-1 gap-8 rounded-[24px] border border-line p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <p className="eyebrow">Subscription · coming soon</p>
            <h2 id="loop-club-title" className="display mt-3 text-[clamp(36px,6vw,56px)]">
              Loop Club
            </h2>
            <p className="mt-3 max-w-lg text-mute">{loopClub.description}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[28px] font-semibold">{format(loopClub.price, { interval: "month" })}</p>
            <button type="button" className="btn btn-ghost mt-4" disabled>
              Coming soon
            </button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
