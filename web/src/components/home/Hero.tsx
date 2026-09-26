"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpIcon, SearchIcon } from "@/components/ui/Icons";
import { LineReveal, Magnetic, Rise, useOffscreenPause } from "@/components/ui/motion";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { guitarVault } from "@/data/packs";
import { LOOPS_LIVE } from "@/data/site";

// shader background: client-only, never blocks first paint (CSS gradient shows underneath until it fades in)
const HeroBackground = dynamic(() => import("@/components/hero/HeroBackground"), { ssr: false });

const TRUST = ["100% original", "Instant download", "Clear licenses"];

export function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLElement>(null);
  const player = usePlayer();
  useOffscreenPause(ref);

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
      className="relative isolate flex h-[100svh] min-h-[640px] flex-col overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* instant CSS-gradient placeholder — stays visible until the shader canvas fades in (and on fallback devices) */}
      <div className="hero-bg-fallback" aria-hidden />
      <HeroBackground />
      {/* readability: dark bottom-to-top scrim above the canvas, below the content */}
      <div className="hero-bg-scrim" aria-hidden />

      <div className="container-sg relative z-10 flex flex-col items-center pt-[max(112px,15svh)] text-center">
        <Rise delay={0.05} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
            <span className="text-coral">&#9834;</span> &ldquo;Slapgod bringin&apos; the hits on &apos;em&rdquo;
          </span>
        </Rise>
        <LineReveal
          id="hero-title"
          lines={[
            LOOPS_LIVE ? "Loops and beats" : "Beats",
            <>
              by <span className="text-grad-anim inline-block pr-[0.14em] italic">SLAPGOD</span>
            </>,
          ]}
          className="display text-[clamp(40px,6.6vw,80px)] leading-[1.02]"
          delay={0.1}
        />
        <Rise delay={0.35} className="mt-5 max-w-md text-[16px] leading-relaxed text-stone-400 [text-wrap:balance] sm:text-[17px]">
          {LOOPS_LIVE
            ? "SLAPGOD makes the beats slap — original loops, beats and sample packs, with licenses you can actually read."
            : "SLAPGOD makes the beats slap — original beats, made from scratch, with licenses you can actually read."}
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

        <Rise delay={0.5} className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Link href="/beats" className="btn btn-primary">
              Browse beats
            </Link>
          </Magnetic>
          {LOOPS_LIVE ? (
            <Link href="/packs" className="btn btn-ghost">
              Packs
            </Link>
          ) : (
            <Link href="/licenses" className="btn btn-ghost">
              Licenses
            </Link>
          )}
        </Rise>

        <Rise delay={0.55} className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] text-mute">
          {TRUST.map((t, i) => (
            <span key={t} className="flex items-center gap-5">
              {i > 0 && <span className={`h-1.5 w-1.5 rounded-full ${i === 1 ? "bg-amber" : "bg-lilac"}`} aria-hidden />}
              {t}
            </span>
          ))}
        </Rise>
      </div>

      {/* bottom corners */}
      <Rise delay={0.7} className="container-sg relative z-10 mt-auto flex items-end justify-between gap-3 pb-6">
{LOOPS_LIVE && (
        <Link href={`/packs/${guitarVault.slug}`} className="btn btn-ghost btn-sm hidden sm:inline-flex">
          <span className={`eq ${playing ? "" : "is-paused"}`} aria-hidden>
            <i />
            <i />
            <i />
          </span>
          Now spinning: <span className="text-grad font-semibold">Guitar Vault Vol. 1</span>
        </Link>
        )}
      </Rise>
    </section>
  );
}
