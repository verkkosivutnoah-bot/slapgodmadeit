"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { CoverArt } from "./CoverArt";
import { Tilt } from "./motion";

/** Ambient blurred-cover backdrop for detail pages. Place as first child of a `relative` section. */
export function CoverBackdrop({ src, title }: { src: string; title: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <CoverArt src={src} title={title} alt="" sizes="200px" className="absolute inset-[-10%] scale-110 opacity-40 blur-[80px] saturate-150" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_30%,color-mix(in_srgb,var(--track-accent,var(--color-ember))_22%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/70 to-ink" />
    </div>
  );
}

/** Big cover with subtle 3D tilt, accent glow and scroll parallax. */
export function CoverShowcase({ src, title, children }: { src: string; title: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  return (
    <motion.div ref={ref} className="relative mx-auto w-full max-w-[520px]" style={reduce ? undefined : { y }}>
      <div
        className="absolute inset-[-12%] -z-10 opacity-70"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--track-accent, var(--color-ember)) 70%, transparent), transparent)" }}
        aria-hidden
      />
      <Tilt className="group rounded-[28px] sm:rounded-[32px]" max={7}>
        <CoverArt
          src={src}
          title={title}
          priority
          sizes="(max-width: 640px) 88vw, 520px"
          className="aspect-square w-full rounded-[28px] shadow-[0_50px_120px_-40px_rgb(0_0_0/0.9)] ring-1 ring-bone/10 sm:rounded-[32px]"
        />
      </Tilt>
      {children}
    </motion.div>
  );
}
