"use client";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { useLicenseModal } from "./LicenseModal";
import { useCurrency } from "@/lib/currency";
import { PauseIcon, PlayIcon, CartIcon } from "@/components/ui/Icons";
import { toPlayerTrack, type Beat } from "@/data/beats";
import Link from "next/link";
import { CoverArt } from "@/components/ui/CoverArt";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";

function usePlayBeat(beat: Beat, queue: Beat[]) {
  const player = usePlayer();
  const isCurrent = player.started && player.currentId === beat.id;
  const playing = isCurrent && player.isPlaying;
  const onPlay = () => {
    if (isCurrent) player.toggle();
    else player.playQueue(queue.map(toPlayerTrack), Math.max(0, queue.findIndex((b) => b.id === beat.id)));
  };
  return { isCurrent, playing, onPlay };
}

function EQ({ paused }: { paused: boolean }) {
  return (
    <span className={`eq ${paused ? "is-paused" : ""}`} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

export function BeatRow({ beat, queue, index }: { beat: Beat; queue: Beat[]; index: number }) {
  const { isCurrent, playing, onPlay } = usePlayBeat(beat, queue);
  const { openLicense } = useLicenseModal();
  const { format } = useCurrency();
  const accent = useCoverAccent(beat.cover);

  return (
    <li
      style={accentStyle(accent)}
      className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border px-3 py-3 transition-colors sm:grid-cols-[32px_auto_1.6fr_1fr_1fr_auto] sm:gap-5 sm:px-4 ${
        isCurrent
          ? "border-[color-mix(in_srgb,var(--track-accent,var(--color-ember))_45%,transparent)] bg-[color-mix(in_srgb,var(--track-accent,var(--color-ember))_6%,transparent)]"
          : "border-transparent hover:border-line hover:bg-bone/[0.03] hover:shadow-[0_0_48px_-18px_var(--track-accent,var(--color-ember))]"
      }`}
    >
      <span className="hidden font-mono text-xs text-mute sm:block">{isCurrent ? <EQ paused={!playing} /> : String(index + 1).padStart(2, "0")}</span>
      <button
        type="button"
        onClick={onPlay}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
        aria-label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
      >
        <CoverArt src={beat.cover} title={beat.title} alt="" sizes="56px" className="absolute inset-0" />
        <span
          className={`absolute inset-0 grid place-items-center bg-ink/50 text-bone transition-opacity ${
            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:bg-ink/30 [@media(hover:none)]:opacity-100"
          }`}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>
      <div className="min-w-0">
        <p className="truncate font-semibold">
          <Link href={`/beats/${beat.slug}`} className="hover:text-[var(--track-accent,var(--color-ember))]">
            {beat.title}
          </Link>
          {beat.isNew && <span className="ml-2 align-middle font-mono text-[9px] tracking-widest text-violet">NEW</span>}
        </p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-mute">
          {beat.bpm} BPM · {beat.key}
          <span className="sm:hidden"> · {beat.genre}</span>
        </p>
      </div>
      <p className="hidden truncate text-sm text-mute sm:block">{beat.genre}</p>
      <div className="hidden flex-wrap gap-1 sm:flex">
        {beat.moods.slice(0, 2).map((m) => (
          <span key={m} className="tag">
            {m}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => openLicense(beat)}
        className="btn btn-sm btn-ghost !h-10 gap-2 !px-3 sm:!px-4 group-hover:border-ember group-hover:text-ember"
        aria-label={`License ${beat.title}, from ${format(beat.priceFrom)}`}
      >
        <CartIcon size={14} />
        <span className="hidden sm:inline">{format(beat.priceFrom)}</span>
      </button>
    </li>
  );
}

export function BeatCard({ beat, queue }: { beat: Beat; queue: Beat[] }) {
  const { isCurrent, playing, onPlay } = usePlayBeat(beat, queue);
  const { openLicense } = useLicenseModal();
  const { format } = useCurrency();
  const accent = useCoverAccent(beat.cover);
  return (
    <article
      style={accentStyle(accent)}
      className={`group relative overflow-hidden rounded-3xl border bg-surface/50 p-3 transition-[border-color,box-shadow] ${
        isCurrent ? "border-[color-mix(in_srgb,var(--track-accent,var(--color-ember))_45%,transparent)]" : "border-line hover:border-bone/25 hover:shadow-[0_30px_70px_-40px_var(--track-accent,var(--color-ember))]"
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <CoverArt src={beat.cover} title={beat.title} sizes="(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 300px" className="absolute inset-0" imgClassName="transition-transform duration-1000 group-hover:scale-105" />
        <button
          type="button"
          onClick={onPlay}
          className="absolute inset-0 grid place-items-center bg-ink/0 transition hover:bg-ink/30"
          aria-label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
        >
          <span
            className={`grid h-14 w-14 place-items-center rounded-full bg-ember text-ink transition duration-500 ${
              isCurrent ? "scale-100 opacity-100" : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 [@media(hover:none)]:scale-90 [@media(hover:none)]:opacity-90"
            }`}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </span>
        </button>
        {isCurrent && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2 py-1 backdrop-blur">
            <EQ paused={!playing} />
          </span>
        )}
      </div>
      <div className="px-2 pb-2 pt-4">
        <p className="truncate text-lg font-semibold">
          <Link href={`/beats/${beat.slug}`} className="hover:text-[var(--track-accent,var(--color-ember))]">
            {beat.title}
          </Link>
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-mute">
          {beat.bpm} BPM · {beat.key} · {beat.genre}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs text-mute">from {format(beat.priceFrom)}</span>
          <button type="button" onClick={() => openLicense(beat)} className="btn btn-sm btn-primary !h-9">
            License
          </button>
        </div>
      </div>
    </article>
  );
}
