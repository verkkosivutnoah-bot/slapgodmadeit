"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { ArrowUpIcon, SearchIcon } from "@/components/ui/Icons";
import { guitarVault } from "@/data/packs";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/beats?q=${encodeURIComponent(query)}` : "/beats");
  }

  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease: EASE } };

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-x-clip pt-[76px]" aria-labelledby="hero-title">
      {/* soft monochrome light behind the player (gradient only) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-[radial-gradient(38%_55%_at_50%_78%,rgb(255_255_255/0.09),rgb(255_255_255/0.03)_45%,transparent_75%)]"
        aria-hidden
      />

      <div className="container-sg flex flex-1 flex-col items-center justify-center pb-10 pt-16 text-center md:pt-24">
        <motion.h1 id="hero-title" className="display max-w-[900px] text-[clamp(36px,6.2vw,72px)] leading-[1.02]" {...fade(0)}>
          Guitar loops and beats, <br className="hidden sm:block" />
          made by hand
        </motion.h1>

        <motion.form role="search" onSubmit={submit} className="relative mt-9 w-full max-w-[460px]" {...fade(0.1)}>
          <label htmlFor="hero-search" className="sr-only">
            Search beats
          </label>
          <SearchIcon size={17} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="hero-search"
            type="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by mood, BPM or key"
            className="input !h-[56px] !pl-12 !pr-16 text-[15px]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-nav transition-colors hover:bg-white hover:text-deep"
            aria-label="Search"
          >
            <ArrowUpIcon size={16} />
          </button>
        </motion.form>

        <motion.div className="mt-14 w-full max-w-[640px] md:mt-20" {...fade(0.2)}>
          <MusicPlayer id="vault-hero" label="Guitar Vault Vol. 1 previews" tracks={guitarVault.demo} />
          <p className="mt-4 text-[13px] text-mute">
            Now previewing: <Link href={`/packs/${guitarVault.slug}`} className="text-stone-300 underline-offset-4 hover:underline">{guitarVault.title}</Link>
          </p>
        </motion.div>
      </div>

      <div className="container-sg flex flex-wrap items-center justify-between gap-3 pb-8">
        <Link href="/#rights" className="btn btn-ghost">
          Know your rights
        </Link>
        <div className="flex gap-2">
          <Link href="/beats" className="btn btn-ghost">
            Beats
          </Link>
          <Link href="/packs" className="btn btn-ghost">
            Packs
          </Link>
        </div>
      </div>
    </section>
  );
}
