"use client";
import { Fragment, useRef } from "react";
import { useOffscreenPause } from "./motion";

const DEFAULT = ["100% original", "Played by hand", "Prod. by SLAPGOD", "Instant download", "Clear licenses"];

/** One-row serif ticker. Alternates outlined / gradient words; CSS transform loop, paused offscreen. */
export function Marquee({ items = DEFAULT, className = "", reverse = false }: { items?: string[]; className?: string; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useOffscreenPause(ref);
  const row = (hidden: boolean) => (
    <div className="flex items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <Fragment key={t}>
          <span className={`display whitespace-nowrap px-[0.35em] text-[clamp(34px,6vw,76px)] uppercase leading-none tracking-[-0.01em] ${i % 2 ? "text-grad" : "text-stroke"}`}>
            {t}
          </span>
          <span className="px-[0.35em] text-[clamp(18px,2.6vw,32px)] leading-none text-amber" aria-hidden>
            ✦
          </span>
        </Fragment>
      ))}
    </div>
  );
  return (
    <div ref={ref} className={`marquee ${className}`} role="marquee" aria-label={items.join(", ")}>
      <div className="marquee-track" style={reverse ? { animationDirection: "reverse" } : undefined}>
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}
