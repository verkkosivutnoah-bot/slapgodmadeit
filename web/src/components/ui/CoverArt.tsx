"use client";
import Image from "next/image";
import { useState } from "react";
import { coverBlur } from "@/data/covers";

/**
 * Product cover art (next/image). Square by default. Falls back to on-brand generated art
 * with the product title if the file is missing or fails to load.
 */
export function CoverArt({
  src,
  title,
  sizes = "(max-width: 640px) 90vw, 360px",
  priority = false,
  className = "",
  imgClassName = "",
  alt,
}: {
  src?: string | null;
  title: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  alt?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !src || failedSrc === src;

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      {failed ? (
        <FallbackCover title={title} />
      ) : (
        <Image
          src={src}
          alt={alt ?? `${title} cover art`}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          placeholder="blur"
          blurDataURL={coverBlur(src)}
          unoptimized={src.endsWith(".svg")}
          onError={() => setFailedSrc(src)}
          className={`object-cover ${imgClassName}`}
          draggable={false}
        />
      )}
    </div>
  );
}

function hash(str: string) {
  let h = 0;
  for (const c of str) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Generated fallback art in the brand palette. */
export function FallbackCover({ title }: { title: string }) {
  const h = hash(title);
  const cx = 30 + (h % 40);
  const cy = 25 + ((h >> 3) % 35);
  const rot = (h % 50) - 25;
  const id = `fb${h}`;
  return (
    <div className="absolute inset-0" role="img" aria-label={`${title} (artwork coming soon)`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={`${id}s`} cx={`${cx}%`} cy={`${cy}%`} r="60%">
            <stop offset="0" stopColor="#F2B544" />
            <stop offset=".35" stopColor="#FF4B2B" />
            <stop offset=".75" stopColor="#5C0F1C" />
            <stop offset="1" stopColor="#0B0708" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${id}s)`} />
        <g transform={`rotate(${rot} 50 50)`} stroke="#F3EBDD" strokeOpacity=".18" strokeWidth=".4">
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1="-20" x2="120" y1={i * 8} y2={i * 8} />
          ))}
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 p-[8%] [container-type:inline-size]">
        <p className="display line-clamp-3 text-[clamp(14px,11cqi,40px)] leading-[0.9] text-bone">{title}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/70">SLAPGOD</p>
      </div>
    </div>
  );
}
