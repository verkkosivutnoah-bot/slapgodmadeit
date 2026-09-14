"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { PackCard } from "./PackCard";
import { Reveal } from "@/components/ui/motion";
import { ArrowIcon, SparkIcon } from "@/components/ui/Icons";
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
          className="group relative mb-12 grid overflow-hidden rounded-[32px] border border-ember/30 bg-[linear-gradient(120deg,rgb(var(--ember-rgb)/0.1),rgb(var(--surface-rgb)/0.8)_50%)] md:grid-cols-[320px_1fr] grid-cols-1"
        >
          <CoverArt src={guitarVault.cover} title={guitarVault.title} alt="" priority sizes="(max-width: 768px) 100vw, 320px" className="aspect-square h-full w-full md:aspect-auto md:min-h-[320px]" imgClassName="transition duration-1000 group-hover:scale-105" />
          <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
            <p className="eyebrow text-ember">
              <SparkIcon size={10} className="mr-1 inline" /> Flagship · {guitarVault.soundLabel}
            </p>
            <p className="display text-5xl sm:text-7xl">{guitarVault.title}</p>
            <p className="max-w-xl text-mute">{guitarVault.tagline}</p>
            <p className="flex items-center gap-3">
              <span className="display text-4xl">{format(guitarVault.price)}</span>
              {guitarVault.compareAt && <s className="font-mono text-sm text-mute">{format(guitarVault.compareAt)}</s>}
              <span className="ml-auto inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ember">
                Explore <ArrowIcon size={14} className="transition group-hover:translate-x-1" />
              </span>
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
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
          className="relative mt-16 grid scroll-mt-28 gap-8 overflow-hidden rounded-[32px] border border-gold/30 bg-[radial-gradient(80%_120%_at_100%_0%,rgb(var(--gold-rgb)/0.2),transparent_60%),var(--color-surface)] p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center grid-cols-1"
        >
          <div>
            <p className="eyebrow text-gold">Subscription · coming soon</p>
            <h2 id="loop-club-title" className="display mt-3 text-6xl sm:text-8xl">
              Loop Club
            </h2>
            <p className="mt-3 max-w-lg text-mute">{loopClub.description}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="display text-6xl">{format(loopClub.price, { interval: "month" })}</p>
            <button type="button" className="btn btn-ghost mt-4" disabled>
              Coming soon
            </button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
