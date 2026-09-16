"use client";
import type { ReactNode } from "react";
import { CoverArt } from "./CoverArt";

/** Very soft monochrome light behind detail-page heroes (gradient only, no filters). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CoverBackdrop(_props: { src: string; title: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] bg-[radial-gradient(50%_60%_at_30%_35%,rgb(255_255_255/0.06),transparent_70%)]"
      aria-hidden
    />
  );
}

/** Big square cover. */
export function CoverShowcase({ src, title, children }: { src: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <CoverArt
        src={src}
        title={title}
        priority
        sizes="(max-width: 640px) 88vw, 480px"
        className="aspect-square w-full rounded-[24px] ring-1 ring-white/10"
      />
      {children}
    </div>
  );
}
