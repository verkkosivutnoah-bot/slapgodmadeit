"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLicenseModal } from "@/components/beats/LicenseModal";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ArrowIcon, CartIcon, PlayIcon } from "@/components/ui/Icons";
import { beats, toPlayerTrack } from "@/data/beats";
import { useCurrency } from "@/lib/currency";

/** Home catalog preview: a local MusicPlayer instance driven by the tracklist beside it. */
export function BeatsPreview() {
  const list = useMemo(() => beats.slice(0, 6), []);
  const tracks = useMemo(() => list.map(toPlayerTrack), [list]);
  const [index, setIndex] = useState(0);
  const [loadKey, setLoadKey] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { openLicense } = useLicenseModal();
  const { format } = useCurrency();

  return (
    <section className="relative py-20 md:py-28" aria-labelledby="beats-title">
      <div className="container-sg">
        <SectionHeader
          id="beats-title"
          eyebrow="Beat catalog"
          ghost="BEATS"
          title={
            <>
              Fresh <span className="text-gold">beats</span>
            </>
          }
          action={
            <Link href="/beats" className="btn btn-ghost">
              Full catalog <ArrowIcon size={16} />
            </Link>
          }
        >
          Leases from {format(29)}. Tagged previews, instant delivery, upgrade anytime.
        </SectionHeader>

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] grid-cols-1">
          <Reveal className="lg:sticky lg:top-28">
            <MusicPlayer
              id="beats-home"
              label="Beat previews"
              tracks={tracks}
              startIndex={index}
              loadKey={loadKey}
              autoPlay
              onTrackChange={(i) => setCurrent(i)}
              onPlayingChange={setPlaying}
            />
          </Reveal>

          <Stagger as="ul" className="space-y-2">
            {list.map((b, i) => {
              const active = i === current && (playing || loadKey > 0);
              return (
                <StaggerItem as="li" key={b.id}>
                  <div
                    className={`group flex items-center gap-4 rounded-2xl border p-3 transition-colors ${
                      active ? "border-ember/40 bg-ember/[0.04]" : "border-line/60 hover:border-line hover:bg-bone/[0.03]"
                    }`}
                  >
                    <button
                      type="button"
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
                      onClick={() => {
                        setIndex(i);
                        setLoadKey((k) => k + 1);
                      }}
                      aria-label={`Play ${b.title} in the preview player`}
                    >
                      <CoverArt src={b.cover} title={b.title} alt="" sizes="56px" className="absolute inset-0" />
                      <span className={`absolute inset-0 grid place-items-center bg-ink/50 transition ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        {active && playing ? (
                          <span className="eq">
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : (
                          <PlayIcon />
                        )}
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{b.title}</p>
                      <p className="font-mono text-[11px] text-mute">
                        {b.bpm} BPM · {b.key} · {b.genre}
                      </p>
                    </div>
                    <button type="button" className="btn btn-sm btn-ghost !h-10 gap-2 !px-4 hover:!border-ember hover:!text-ember" onClick={() => openLicense(b)}>
                      <CartIcon size={14} /> {format(b.priceFrom)}
                    </button>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
