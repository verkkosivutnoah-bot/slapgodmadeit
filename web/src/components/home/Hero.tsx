"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Magnetic } from "@/components/ui/motion";
import { ArrowIcon, Sticker } from "@/components/ui/Icons";
import { drawVaultScene } from "@/components/hero/vaultScene";

// Heavy canvas layer: client-only, loaded after first paint (the HTML wordmark is the LCP).
const AsciiStars = dynamic(() => import("@/components/hero/AsciiStars").then((m) => m.AsciiStars), { ssr: false });

const WORD = "SLAPGOD".split("");
const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // scroll parallax (transform/opacity only)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const subjectScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const subjectFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const contentFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex h-[100svh] min-h-[560px] flex-col overflow-hidden [overflow:clip]"
      aria-labelledby="hero-title"
    >
      {/* L0 — static sky glow */}
      <div className="absolute inset-0 -z-30" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_45%,rgb(var(--ember-rgb)/0.28),rgb(var(--oxblood-rgb)/0.35)_45%,transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(35%_40%_at_78%_22%,rgb(var(--violet-rgb)/0.14),transparent_70%)]" />
      </div>

      {/* L1 — stars-rendered sun + arch */}
      <motion.div
        className="absolute inset-0 -z-20 origin-[50%_45%]"
        style={reduce ? undefined : { scale: subjectScale, opacity: subjectFade }}
      >
        <AsciiStars scene={drawVaultScene} originX={0.5} originY={0.42} />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink via-ink/75 to-transparent" />

      {/* L4 — content */}
      <motion.div className="container-sg pointer-events-none relative mt-auto pb-8 md:pb-14" style={reduce ? undefined : { opacity: contentFade }}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <motion.p
            className="eyebrow max-w-xs"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
          >
            <span className="text-ember">●</span> Beats · Live guitar loops · Sample packs
          </motion.p>
        </div>

        <motion.h1
          id="hero-title"
          className="display relative -ml-[0.04em] flex select-none text-[clamp(64px,23vw,272px)] leading-[0.8] md:text-[clamp(120px,20.5vw,272px)]"
          style={reduce ? undefined : { y: wordY }}
          aria-label="SLAPGOD"
        >
          {WORD.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.04em]" aria-hidden>
              <motion.span
                className={`inline-block ${
                  i === 4
                    ? "bg-[linear-gradient(175deg,var(--color-gold)_10%,var(--color-ember)_75%)] bg-clip-text text-transparent"
                    : ""
                }`}
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.05 + i * 0.05, duration: 1, ease: EASE }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <div className="mt-5 grid items-end gap-6 md:mt-6 md:grid-cols-[1fr_auto] md:gap-8 grid-cols-1">
          <motion.p
            className="max-w-xl text-[clamp(16px,4.2vw,24px)] leading-snug text-bone/90"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9, ease: EASE }}
          >
            Sounds nobody else has. Every guitar played by hand, every beat cooked from scratch —{" "}
            <span className="text-mute">with licenses you can actually understand.</span>
          </motion.p>
          <motion.div
            className="pointer-events-auto flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
          >
            <Magnetic>
              <Link href="/beats" className="btn btn-primary h-14 px-8">
                Browse beats <ArrowIcon size={16} />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/free" className="btn btn-ghost h-14 px-7">
                10 free loops
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      <Sticker
        text="100% ORIGINAL • PLAYED BY HAND • PROD. BY SLAPGOD • "
        className="absolute right-[4vw] top-24 hidden h-32 w-32 text-gold md:grid lg:top-28 lg:h-36 lg:w-36"
      >
        <span className="display text-3xl">SG</span>
      </Sticker>
    </section>
  );
}
