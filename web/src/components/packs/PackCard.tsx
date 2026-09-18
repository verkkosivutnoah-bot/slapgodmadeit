"use client";
import Link from "next/link";
import { PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { useCurrency } from "@/lib/currency";
import { CoverArt } from "@/components/ui/CoverArt";
import type { Pack } from "@/data/packs";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";
import { spotlightMove } from "@/components/ui/motion";

/** Cover-first pack card: 1:1 art, title + price below. */
export function PackCard({ pack, priority = false, className = "", sizes }: { pack: Pack; priority?: boolean; className?: string; sizes?: string }) {
  const { format } = useCurrency();
  const player = usePlayer();
  const isCurrent = player.started && pack.demo.some((d) => d.id === player.currentId);
  const playing = isCurrent && player.isPlaying;
  const href = pack.comingSoon ? "/packs#loop-club" : `/packs/${pack.slug}`;
  const free = pack.price === 0;
  const accent = useCoverAccent(pack.cover);

  return (
    <article className={`group relative ${className}`} style={accentStyle(accent)}>
      <div onPointerMove={spotlightMove} className="frame spotlight card-lift aspect-square !rounded-[20px] ring-1 ring-white/[0.06]">
        <CoverArt src={pack.cover} title={pack.title} priority={priority} sizes={sizes ?? "(max-width: 520px) 90vw, (max-width: 1024px) 45vw, 400px"} className="absolute inset-0" />
        {(free || pack.badge) && (
          <span
            className={`absolute left-3 top-3 z-[1] rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
              free ? "badge-amber" : pack.badge === "FLAGSHIP" ? "bg-grad" : "bg-deep/85 text-lilac"
            }`}
          >
            {free ? "Free" : pack.badge}
          </span>
        )}
        {pack.demo.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (isCurrent) player.toggle();
              else player.playQueue(pack.demo, 0);
            }}
            className={`play-btn absolute bottom-3 right-3 z-[2] grid h-11 w-11 place-items-center rounded-full ${
              isCurrent ? "opacity-100" : "translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
            }`}
            aria-label={playing ? `Pause ${pack.title} demo` : `Play ${pack.title} demo`}
          >
            {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          </button>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 px-1 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-medium leading-snug">
            <Link href={href} className="link-u after:absolute after:inset-0 after:z-[1]">
              {pack.title}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-mute">
            {pack.type}
            {pack.soundLabel ? ` · ${pack.soundLabel}` : ""}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className={`block text-[16px] font-semibold tabular-nums ${free ? "text-amber" : "text-coral"}`}>
            {pack.comingSoon ? "Soon" : format(pack.price, { usd: pack.priceUSD, interval: pack.interval })}
          </span>
          {pack.compareAt && <s className="text-[12px] text-mute">{format(pack.compareAt)}</s>}
        </p>
      </div>
    </article>
  );
}
