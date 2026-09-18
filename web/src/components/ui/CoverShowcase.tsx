"use client";
import type { ReactNode } from "react";
import { CoverArt } from "./CoverArt";
import { RevealImage } from "./motion";

/** Very soft monochrome light behind detail-page heroes (gradient only, no filters). */
export function CoverBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-[radial-gradient(45%_50%_at_28%_38%,rgb(255_255_255/0.08),rgb(255_255_255/0.02)_50%,transparent_75%)]"
      aria-hidden
    />
  );
}

/** Big square cover with reveal + hover scale. */
export function CoverShowcase({ src, title, children }: { src: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <RevealImage className="group">
        <div className="frame aspect-square !rounded-[24px] ring-1 ring-white/10">
          <CoverArt src={src} title={title} priority sizes="(max-width: 640px) 92vw, 560px" className="absolute inset-0" />
        </div>
      </RevealImage>
      {children}
    </div>
  );
}
