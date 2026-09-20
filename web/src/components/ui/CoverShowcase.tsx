"use client";
import type { ReactNode } from "react";
import { CoverArt } from "./CoverArt";
import { RevealImage, spotlightMove } from "./motion";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";

/**
 * Detail-page hero backdrop: the cover photo itself, faded out toward the copy, plus a colored
 * light tinted with the cover's accent. Gradients and masks only — no blur filters (perf rule).
 */
export function CoverBackdrop({ src, title }: { src?: string; title?: string }) {
  const accent = useCoverAccent(src);
  const isPhoto = !!src && !src.endsWith(".svg");
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden" style={accentStyle(accent)} aria-hidden>
      {isPhoto && (
        <div className="cover-bleed absolute inset-x-0 top-0 h-[620px]">
          <CoverArt src={src} title={title ?? ""} alt="" sizes="100vw" className="absolute inset-0 scale-[1.15]" imgClassName="object-cover object-center" />
          <div className="absolute inset-0 bg-ink/55" />
        </div>
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 50% at 28% 38%, color-mix(in srgb, var(--track-accent, var(--coral)) 34%, transparent), color-mix(in srgb, var(--track-accent, var(--coral)) 9%, transparent) 50%, transparent 75%), radial-gradient(40% 45% at 82% 18%, rgb(var(--lilac-rgb) / 0.12), transparent 70%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-ink via-ink/80 to-transparent" />
    </div>
  );
}

/** Big square cover with reveal + hover scale + accent glow, sitting on a soft colored pedestal. */
export function CoverShowcase({ src, title, badge, children }: { src: string; title: string; badge?: string; children?: ReactNode }) {
  const accent = useCoverAccent(src);
  return (
    <div className="relative mx-auto w-full max-w-[560px]" style={accentStyle(accent)}>
      <div className="cover-pedestal" aria-hidden />
      <RevealImage className="group">
        <div onPointerMove={spotlightMove} className="frame spotlight card-lift cover-frame aspect-square !rounded-[24px] ring-1 ring-white/10">
          <CoverArt src={src} title={title} priority sizes="(max-width: 640px) 92vw, 560px" className="absolute inset-0" imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
          <div className="cover-frame-sheen" />
          {badge && (
            <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-bone">
              {badge}
            </span>
          )}
        </div>
      </RevealImage>
      {children}
    </div>
  );
}
