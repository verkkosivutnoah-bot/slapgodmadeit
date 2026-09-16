"use client";
import Link from "next/link";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { useLicenseModal } from "./LicenseModal";
import { useCurrency } from "@/lib/currency";
import { PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { CoverArt } from "@/components/ui/CoverArt";
import { toPlayerTrack, type Beat } from "@/data/beats";

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

function PlayButton({ playing, onPlay, title, className = "" }: { playing: boolean; onPlay: () => void; title: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
        playing ? "bg-white text-deep" : "bg-stone-300/[0.12] text-nav hover:bg-stone-300/20"
      } ${className}`}
      aria-label={playing ? `Pause ${title}` : `Play ${title}`}
    >
      {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
    </button>
  );
}

/** Simple list row: cover · title · BPM/key · play · "License from" pill */
export function BeatRow({ beat, queue }: { beat: Beat; queue: Beat[]; index?: number }) {
  const { isCurrent, playing, onPlay } = usePlayBeat(beat, queue);
  const { openLicense } = useLicenseModal();
  const { format } = useCurrency();

  return (
    <li
      className={`flex items-center gap-3 rounded-[20px] px-2 py-2 transition-colors sm:gap-4 sm:px-3 ${
        isCurrent ? "bg-white/[0.06]" : "hover:bg-white/[0.035]"
      }`}
    >
      <Link href={`/beats/${beat.slug}`} className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-xl sm:h-14 sm:w-14" tabIndex={-1} aria-hidden>
        <CoverArt src={beat.cover} title={beat.title} alt="" sizes="56px" className="absolute inset-0" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-bone">
          <Link href={`/beats/${beat.slug}`} className="hover:underline hover:underline-offset-4">
            {beat.title}
          </Link>
          {beat.isNew && <span className="ml-2 align-middle text-xs font-normal text-mute">New</span>}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-mute">
          {beat.bpm} BPM · {beat.key}
          <span className="hidden sm:inline"> · {beat.genre}</span>
        </p>
      </div>
      <PlayButton playing={playing} onPlay={onPlay} title={beat.title} />
      <button
        type="button"
        onClick={() => openLicense(beat)}
        className="btn btn-sm btn-ghost shrink-0"
        aria-label={`License ${beat.title}, from ${format(beat.priceFrom)}`}
      >
        <span className="hidden sm:inline">License from</span>
        <span>{format(beat.priceFrom)}</span>
      </button>
    </li>
  );
}

export function BeatCard({ beat, queue }: { beat: Beat; queue: Beat[] }) {
  const { playing, onPlay } = usePlayBeat(beat, queue);
  const { openLicense } = useLicenseModal();
  const { format } = useCurrency();
  return (
    <article className="group rounded-[22px] border border-line bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
      <Link href={`/beats/${beat.slug}`} className="relative block aspect-square overflow-hidden rounded-2xl" tabIndex={-1} aria-hidden>
        <CoverArt src={beat.cover} title={beat.title} sizes="(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 300px" className="absolute inset-0" />
      </Link>
      <div className="flex items-center gap-3 px-1 pb-1 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            <Link href={`/beats/${beat.slug}`}>{beat.title}</Link>
          </p>
          <p className="text-[13px] text-mute">
            {beat.bpm} BPM · {beat.key}
          </p>
        </div>
        <PlayButton playing={playing} onPlay={onPlay} title={beat.title} />
      </div>
      <button type="button" onClick={() => openLicense(beat)} className="btn btn-sm btn-ghost mt-2 w-full">
        License from {format(beat.priceFrom)}
      </button>
    </article>
  );
}
