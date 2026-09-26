"use client";
import Link from "next/link";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { useLicenseModal } from "./LicenseModal";
import { useCurrency } from "@/lib/currency";
import { DownloadIcon, PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { useTaggedDownload } from "./TaggedDownload";
import { CoverArt } from "@/components/ui/CoverArt";
import { toPlayerTrack, type Beat } from "@/data/beats";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";

export function usePlayBeat(beat: Beat, queue: Beat[]) {
  const player = usePlayer();
  const isCurrent = player.started && player.currentId === beat.id;
  const playing = isCurrent && player.isPlaying;
  const onPlay = () => {
    if (isCurrent) player.toggle();
    else player.playQueue(queue.map(toPlayerTrack), Math.max(0, queue.findIndex((b) => b.id === beat.id)));
  };
  return { isCurrent, playing, onPlay };
}

/** Tiny equalizer — animates only while playing (paused state = no animation frames). */
export function EQ({ playing }: { playing: boolean }) {
  return (
    <span className={`eq ${playing ? "" : "is-paused"}`} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

export function TrackListHeader() {
  return (
    <div className="hidden grid-cols-[40px_48px_minmax(0,1fr)_120px_56px_auto] items-center gap-4 border-b border-line px-3 pb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-mute md:grid">
      <span className="text-center">#</span>
      <span />
      <span>Title</span>
      <span>BPM · Key</span>
      <span className="text-right">Time</span>
      <span className="w-[150px]" />
    </div>
  );
}

/** Track-list row: number ↔ play toggle · 48px cover · title + tags · BPM/key · duration · license pill */
export function BeatRow({ beat, queue, index = 0, as: Tag = "li" }: { beat: Beat; queue: Beat[]; index?: number; as?: "li" | "div" }) {
  const { isCurrent, playing, onPlay } = usePlayBeat(beat, queue);
  const { openLicense } = useLicenseModal();
  const { format } = useCurrency();
  const download = useTaggedDownload();
  const accent = useCoverAccent(beat.cover);

  return (
    <Tag
      style={accentStyle(accent)}
      className={`group relative grid grid-cols-[40px_48px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-300 sm:gap-4 sm:px-3 md:grid-cols-[40px_48px_minmax(0,1fr)_120px_56px_auto] ${
        isCurrent
          ? "row-active bg-[color-mix(in_srgb,var(--track-accent,var(--coral))_11%,transparent)]"
          : "hover:bg-[color-mix(in_srgb,var(--track-accent,var(--coral))_7%,transparent)]"
      }`}
    >
      {/* number / play toggle */}
      <button
        type="button"
        onClick={onPlay}
        className={`relative grid h-10 w-10 place-items-center rounded-full text-[14px] tabular-nums transition-colors hover:bg-coral hover:text-deep ${isCurrent ? "text-coral" : "text-mute"}`}
        aria-label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
      >
        {isCurrent ? (
          <>
            <span className="group-hover:hidden">{playing ? <EQ playing /> : <PlayIcon size={14} />}</span>
            <span className="hidden group-hover:block">{playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}</span>
          </>
        ) : (
          <>
            <span className="transition-opacity group-hover:opacity-0 [@media(hover:none)]:opacity-0">{String(index + 1).padStart(2, "0")}</span>
            <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100">
              <PlayIcon size={14} />
            </span>
          </>
        )}
      </button>

      <Link href={`/beats/${beat.slug}`} className="frame block h-12 w-12 !rounded-[10px]" tabIndex={-1} aria-hidden>
        <CoverArt src={beat.cover} title={beat.title} alt="" sizes="48px" className="absolute inset-0" />
      </Link>

      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium text-bone">
          <Link href={`/beats/${beat.slug}`} className="link-u">
            {beat.title}
          </Link>
          {beat.isNew && <span className="badge-coral ml-2 rounded-full px-1.5 py-px align-middle text-[10px] font-bold">NEW</span>}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-mute">
          <span className="md:hidden">
            {beat.bpm} BPM · {beat.key} ·{" "}
          </span>
          <span className="text-[color-mix(in_srgb,var(--track-accent,var(--lilac))_85%,white)]">{beat.genre}</span> · {beat.moods.join(", ")}
        </p>
      </div>

      <p className="hidden items-center gap-2 text-[14px] tabular-nums text-stone-300 md:flex">
        <span className="tag tag-amber !h-[22px] !px-2">{beat.bpm}</span>
        {beat.key}
      </p>
      <p className="hidden text-right text-[14px] tabular-nums text-mute md:block">{beat.duration}</p>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            download(beat);
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-white/[0.06] hover:text-coral"
          aria-label={`Download ${beat.title} tagged MP3 (free)`}
          title="Free tagged download"
        >
          <DownloadIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => openLicense(beat)}
          className="btn btn-sm btn-ghost shrink-0 md:w-[150px]"
          aria-label={`License ${beat.title}, from ${format(beat.priceFrom)}`}
        >
          <span className="hidden sm:inline">License</span>
          <span>{format(beat.priceFrom)}</span>
        </button>
      </div>
    </Tag>
  );
}

export function BeatCard({ beat, queue }: { beat: Beat; queue: Beat[] }) {
  const { isCurrent, playing, onPlay } = usePlayBeat(beat, queue);
  const { openLicense } = useLicenseModal();
  const { format } = useCurrency();
  const accent = useCoverAccent(beat.cover);
  return (
    <article className="group" style={accentStyle(accent)}>
      <div className="frame card-lift aspect-square">
        <Link href={`/beats/${beat.slug}`} tabIndex={-1} aria-hidden>
          <CoverArt src={beat.cover} title={beat.title} sizes="(max-width: 480px) 90vw, (max-width: 1024px) 45vw, 300px" className="absolute inset-0" />
        </Link>
        <button
          type="button"
          onClick={onPlay}
          className={`play-btn absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full transition-[opacity,transform] duration-500 ${
            isCurrent ? "opacity-100" : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
          }`}
          aria-label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
        >
          {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        </button>
      </div>
      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            <Link href={`/beats/${beat.slug}`} className="link-u">
              {beat.title}
            </Link>
          </p>
          <p className="text-[13px] tabular-nums text-mute">
            <span className="text-amber">{beat.bpm} BPM</span> · {beat.key}
          </p>
        </div>
        <button type="button" onClick={() => openLicense(beat)} className="btn btn-sm btn-ghost shrink-0">
          {format(beat.priceFrom)}
        </button>
      </div>
    </article>
  );
}
