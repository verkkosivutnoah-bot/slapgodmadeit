"use client";
import Link from "next/link";
import { PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { useCurrency } from "@/lib/currency";
import { CoverArt } from "@/components/ui/CoverArt";
import type { Pack } from "@/data/packs";

export function PackCard({ pack, priority = false, className = "" }: { pack: Pack; priority?: boolean; className?: string }) {
  const { format } = useCurrency();
  const player = usePlayer();
  const isCurrent = player.started && pack.demo.some((d) => d.id === player.currentId);
  const playing = isCurrent && player.isPlaying;
  const href = pack.comingSoon ? "/packs#loop-club" : `/packs/${pack.slug}`;

  return (
    <article className={`group relative flex h-full flex-col rounded-[22px] border border-line bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.045] ${className}`}>
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <CoverArt src={pack.cover} title={pack.title} priority={priority} sizes="(max-width: 520px) 90vw, (max-width: 1024px) 45vw, 400px" className="absolute inset-0" />
        {pack.badge && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-medium ${pack.badge === "FLAGSHIP" ? "bg-silver" : "bg-deep/80 text-nav"}`}>
            {pack.badge.charAt(0) + pack.badge.slice(1).toLowerCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <p className="text-[13px] text-mute">
          {pack.type}
          {pack.soundLabel ? ` · ${pack.soundLabel}` : ""}
        </p>
        <h3 className="mt-1 text-[17px] font-medium leading-snug">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[22px]">
            {pack.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="flex items-baseline gap-2">
            <span className="text-[17px] font-semibold">{format(pack.price, { usd: pack.priceUSD, interval: pack.interval })}</span>
            {pack.compareAt && <s className="text-[13px] text-mute">{format(pack.compareAt)}</s>}
          </p>
          {pack.demo.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (isCurrent) player.toggle();
                else player.playQueue(pack.demo, 0);
              }}
              className={`relative z-10 grid h-11 w-11 place-items-center rounded-full transition-colors ${
                playing ? "bg-white text-deep" : "bg-stone-300/[0.12] text-nav hover:bg-stone-300/20"
              }`}
              aria-label={playing ? `Pause ${pack.title} demo` : `Play ${pack.title} demo`}
            >
              {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </button>
          ) : (
            <span className="text-[13px] text-mute">{pack.comingSoon ? "Coming soon" : ""}</span>
          )}
        </div>
      </div>
    </article>
  );
}
