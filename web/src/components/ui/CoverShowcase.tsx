"use client";
import type { ReactNode } from "react";
import { CoverArt } from "./CoverArt";
import { RevealImage, spotlightMove } from "./motion";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";

/** Colored light behind detail-page heroes, tinted with the cover's accent (gradient only, no filters). */
export function CoverBackdrop({ src }: { src?: string }) {
  const accent = useCoverAccent(src);
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]"
      style={{
        ...accentStyle(accent),
        background:
          "radial-gradient(45% 50% at 28% 38%, color-mix(in srgb, var(--track-accent, var(--coral)) 34%, transparent), color-mix(in srgb, var(--track-accent, var(--coral)) 9%, transparent) 50%, transparent 75%), radial-gradient(40% 45% at 82% 18%, rgb(var(--lilac-rgb) / 0.12), transparent 70%)",
      }}
      aria-hidden
    />
  );
}

/** Big square cover with reveal + hover scale + accent glow. */
export function CoverShowcase({ src, title, children }: { src: string; title: string; children?: ReactNode }) {
  const accent = useCoverAccent(src);
  return (
    <div className="relative mx-auto w-full max-w-[560px]" style={accentStyle(accent)}>
      <RevealImage className="group">
        <div onPointerMove={spotlightMove} className="frame spotlight card-lift aspect-square !rounded-[24px] ring-1 ring-white/10">
          <CoverArt src={src} title={title} priority sizes="(max-width: 640px) 92vw, 560px" className="absolute inset-0" />
        </div>
      </RevealImage>
      {children}
    </div>
  );
}
