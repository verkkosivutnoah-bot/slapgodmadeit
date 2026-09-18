"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { PackCard } from "./PackCard";
import { EASE, Reveal, VIEWPORT, spotlightMove } from "@/components/ui/motion";
import { PillTabs } from "@/components/ui/PillTabs";
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
          className="group relative mb-20 grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,420px)_1fr] md:gap-14"
        >
          <div onPointerMove={spotlightMove} className="frame spotlight card-lift aspect-square !rounded-[24px] ring-1 ring-white/10">
            <CoverArt src={guitarVault.cover} title={guitarVault.title} alt="" priority sizes="(max-width: 768px) 92vw, 420px" className="absolute inset-0" />
          </div>
          <div className="flex flex-col gap-4">
            <p className="eyebrow">
              <span className="text-amber">Flagship</span> · {guitarVault.soundLabel}
            </p>
            <p className="display text-[clamp(36px,5vw,60px)]">
              Guitar Vault <span className="text-grad">Vol. 1</span>
            </p>
            <p className="max-w-md text-[17px] leading-relaxed text-stone-300">{guitarVault.tagline}</p>
            <p className="mt-2 flex flex-wrap items-center gap-4">
              <span className="text-[26px] font-semibold tabular-nums text-coral">{format(guitarVault.price)}</span>
              {guitarVault.compareAt && <s className="text-[15px] text-mute">{format(guitarVault.compareAt)}</s>}
              <span className="btn btn-primary">View pack</span>
            </p>
          </div>
        </Link>
      </Reveal>

      <div className="mb-10 flex justify-center">
        <PillTabs options={FILTERS} value={type} onChange={setType} label="Filter packs by type" />
      </div>

      <motion.div layout className="grid grid-cols-1 gap-x-5 gap-y-10 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: (i % 4) * 0.07 }}
            >
              <PackCard pack={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Loop Club */}
      <Reveal>
        <section
          id="loop-club"
          aria-labelledby="loop-club-title"
          onPointerMove={spotlightMove}
          className="spotlight relative mt-20 grid scroll-mt-28 [&>*]:relative [&>*]:z-[2] grid-cols-1 gap-8 overflow-hidden rounded-[24px] border border-line bg-[radial-gradient(60%_120%_at_100%_0%,rgb(var(--lilac-rgb)/0.14),transparent_70%),radial-gradient(50%_100%_at_0%_100%,rgb(var(--coral-rgb)/0.1),transparent_70%)] p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <p className="eyebrow">
              Subscription · <span className="text-lilac">coming soon</span>
            </p>
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
