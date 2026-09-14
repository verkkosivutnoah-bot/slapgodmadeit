"use client";
import Link from "next/link";
import { Tilt } from "@/components/ui/motion";
import { PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { useCurrency } from "@/lib/currency";
import { CoverArt } from "@/components/ui/CoverArt";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";
import type { Pack } from "@/data/packs";

const badgeColor: Record<string, string> = {
  FLAGSHIP: "bg-ember text-ink",
  NEW: "bg-violet text-ink",
  BESTSELLER: "bg-gold text-ink",
  FREE: "bg-ember text-ink",
  "SAVE 30%": "bg-gold text-ink",
  "BEST VALUE": "bg-bone text-ink",
  SOON: "bg-bone/15 text-bone",
};

export function PackCard({ pack, priority = false, className = "" }: { pack: Pack; priority?: boolean; className?: string }) {
  const { format } = useCurrency();
  const player = usePlayer();
  const isCurrent = player.started && pack.demo.some((d) => d.id === player.currentId);
  const playing = isCurrent && player.isPlaying;
  const accent = useCoverAccent(pack.cover);
  const href = pack.comingSoon ? "/packs#loop-club" : `/packs/${pack.slug}`;

  return (
    <Tilt className={`group rounded-[26px] ${className}`} max={6}>
      <article
        style={accentStyle(accent)}
        className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-surface/60 transition-[border-color,box-shadow] duration-500 group-hover:border-[color-mix(in_srgb,var(--track-accent,var(--color-ember))_45%,transparent)] group-hover:shadow-[0_30px_80px_-40px_var(--track-accent,var(--color-ember))] active:border-bone/25"
      >
        <div className="relative aspect-square overflow-hidden">
          <CoverArt
            src={pack.cover}
            title={pack.title}
            priority={priority}
            sizes="(max-width: 520px) 80vw, (max-width: 1024px) 45vw, 340px"
            className="absolute inset-0"
            imgClassName="transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
          {pack.badge && (
            <span className={`absolute left-4 top-4 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest ${badgeColor[pack.badge] ?? "bg-bone text-ink"}`}>
              {pack.badge}
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
              className={`absolute bottom-4 right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-ember text-ink shadow-[0_8px_30px_-6px_rgb(var(--ember-rgb)/0.6)] transition duration-500 hover:scale-110 focus-visible:translate-y-0 focus-visible:opacity-100 ${
                playing ? "translate-y-0 opacity-100" : "translate-y-2 opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
              }`}
              aria-label={playing ? `Pause ${pack.title} demo` : `Play ${pack.title} demo`}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
            {pack.type}
            {pack.soundLabel ? ` · ${pack.soundLabel}` : ""}
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-tight">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {pack.title}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-mute">{pack.tagline}</p>
          <div className="mt-auto flex items-end justify-between pt-5">
            <p className="flex items-baseline gap-2">
              <span className="display text-3xl">{format(pack.price, { usd: pack.priceUSD, interval: pack.interval })}</span>
              {pack.compareAt && <s className="font-mono text-xs text-mute">{format(pack.compareAt)}</s>}
            </p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute transition group-hover:text-ember">
              {pack.comingSoon ? "Coming soon" : pack.price === 0 ? "Get free →" : "View →"}
            </span>
          </div>
        </div>
      </article>
    </Tilt>
  );
}
