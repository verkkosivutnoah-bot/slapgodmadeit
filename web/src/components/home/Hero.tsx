"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpIcon, PauseIcon, PlayIcon, SearchIcon } from "@/components/ui/Icons";
import { CoverArt } from "@/components/ui/CoverArt";
import { EASE, LineReveal, Magnetic, Rise, spotlightMove, useOffscreenPause } from "@/components/ui/motion";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { guitarVault } from "@/data/packs";

const TRUST = ["100% original", "Instant download", "Clear licenses"];

export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLElement>(null);
  const player = usePlayer();
  useOffscreenPause(ref);

  // the one "wow": vinyl drifts away (scale + fade) as you scroll — 2 motion values, no listeners
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const discScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const discOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const ids = guitarVault.demo.map((d) => d.id);
  const isCurrent = player.started && ids.includes(player.currentId ?? "");
  const playing = isCurrent && player.isPlaying;

  function submit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/beats?q=${encodeURIComponent(query)}` : "/beats");
  }

  return (
    <section
      ref={ref}
      onPointerMove={spotlightMove}
      className="spotlight relative isolate flex h-[100svh] min-h-[640px] flex-col overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* aurora: drifting radial-gradient blobs (transform only; 2 on mobile) */}
      <div className="aurora" aria-hidden>
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="aurora-blob b3" />
      </div>

      <div className="container-sg relative z-10 flex flex-col items-center pt-[max(112px,15svh)] text-center">
        <LineReveal
          id="hero-title"
          lines={[
            "Guitar loops and beats,",
            <>
              made <span className="text-grad-anim pr-[0.04em] italic">by hand</span>
            </>,
          ]}
          className="display text-[clamp(40px,6.6vw,80px)] leading-[1.02]"
          delay={0.1}
        />
        <Rise delay={0.35} className="mt-5 max-w-md text-[16px] leading-relaxed text-stone-400 [text-wrap:balance] sm:text-[17px]">
          Original beats, live guitar and sample packs by SLAPGOD — with licenses you can actually read.
        </Rise>

        <Rise delay={0.45} className="mt-8 w-full max-w-[480px]">
          <form role="search" onSubmit={submit} className="relative">
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
              className="play-btn absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full"
              aria-label="Search"
            >
              <ArrowUpIcon size={16} />
            </button>
          </form>
        </Rise>

        <Rise delay={0.55} className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] text-mute">
          {TRUST.map((t, i) => (
            <span key={t} className="flex items-center gap-5">
              {i > 0 && <span className={`h-1.5 w-1.5 rounded-full ${i === 1 ? "bg-amber" : "bg-lilac"}`} aria-hidden />}
              {t}
            </span>
          ))}
        </Rise>
      </div>

      {/* centerpiece: vinyl rising from the bottom edge */}
      <motion.div
        className="absolute left-1/2 top-full z-0 w-[min(620px,92vw)] -translate-x-1/2 -translate-y-[46%] sm:-translate-y-[52%]"
        style={reduce ? undefined : { scale: discScale, opacity: discOpacity }}
      >
        <motion.div
          initial={reduce ? false : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
          className={`vinyl-wrap relative aspect-square w-full ${playing ? "is-playing" : ""}`}
        >
          <div className="vinyl-glow" aria-hidden />
          <div className={`vinyl h-full w-full ${playing ? "is-playing" : ""}`}>
          <div className="vinyl-spin">
            <CoverArt src={guitarVault.cover} title={guitarVault.title} alt="" priority sizes="620px" className="absolute inset-0" />
            <div className="vinyl-grooves" />
            <div className="absolute left-1/2 top-[7%] -translate-x-1/2 text-[11px] font-medium uppercase tracking-[0.3em] text-bone/60">SLAPGOD</div>
          </div>
          <div className="vinyl-sheen" />
          {/* label */}
          <div className="absolute left-1/2 top-1/2 grid aspect-square w-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-deep ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => (isCurrent ? player.toggle() : player.playQueue(guitarVault.demo, 0))}
              className="play-btn grid h-14 w-14 place-items-center rounded-full hover:scale-105 sm:h-16 sm:w-16"
              aria-label={playing ? "Pause Guitar Vault preview" : "Play Guitar Vault preview"}
            >
              {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>
          </div>
          </div>
        </motion.div>
      </motion.div>

      {/* bottom corners */}
      <Rise delay={0.7} className="container-sg relative z-10 mt-auto flex items-end justify-between gap-3 pb-6">
        <Link href={`/packs/${guitarVault.slug}`} className="btn btn-ghost btn-sm hidden sm:inline-flex">
          <span className={`eq ${playing ? "" : "is-paused"}`} aria-hidden>
            <i />
            <i />
            <i />
          </span>
          Now spinning: <span className="text-grad font-semibold">Guitar Vault Vol. 1</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/packs" className="btn btn-ghost btn-sm">
            Packs
          </Link>
          <Magnetic>
            <Link href="/beats" className="btn btn-primary btn-sm">
              Browse beats
            </Link>
          </Magnetic>
        </div>
      </Rise>
    </section>
  );
}
