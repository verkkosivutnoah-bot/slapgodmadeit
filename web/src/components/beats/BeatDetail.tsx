"use client";
import Link from "next/link";
import { useMemo } from "react";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { CoverBackdrop, CoverShowcase } from "@/components/ui/CoverShowcase";
import { Reveal } from "@/components/ui/motion";
import { CheckIcon } from "@/components/ui/Icons";
import { useLicenseModal } from "./LicenseModal";
import { BeatRow } from "./BeatRow";
import { beats, toPlayerTrack } from "@/data/beats";
import { leaseTerms, licenseDeals, licenseTiers } from "@/data/licenses";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";
import { useCurrency } from "@/lib/currency";

export function BeatDetail({ slug }: { slug: string }) {
  const beat = beats.find((b) => b.slug === slug)!;
  const tracks = useMemo(() => [toPlayerTrack(beat)], [beat]);
  const more = useMemo(() => beats.filter((b) => b.id !== beat.id && (b.genre === beat.genre || b.moods.some((m) => beat.moods.includes(m)))).slice(0, 5), [beat]);
  const accent = useCoverAccent(beat.cover);
  const { openLicense } = useLicenseModal();
  const { format, vatNote } = useCurrency();

  return (
    <div style={accentStyle(accent)}>
      <section className="relative isolate overflow-hidden pb-16 pt-24 md:pt-36">
        <CoverBackdrop src={beat.cover} title={beat.title} />
        <div className="container-sg">
          <nav aria-label="Breadcrumb" className="mb-8 text-[12px] text-mute">
            <Link href="/beats" className="inline-flex min-h-11 items-center hover:text-bone">
              Beats
            </Link>{" "}
            / <span className="text-bone">{beat.title}</span>
          </nav>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 grid-cols-1">
            <CoverShowcase src={beat.cover} title={beat.title} />
            <div>
              <p className="eyebrow">
                {beat.genre} beat {beat.isNew && <span className="ml-2 text-stone-300">· New</span>}
              </p>
              <h1 className="display mt-3 text-[clamp(40px,10vw,72px)]">{beat.title}</h1>
              <ul className="mt-5 flex flex-wrap gap-2">
                {[`${beat.bpm} BPM`, beat.key, ...beat.moods, ...beat.tags].map((t) => (
                  <li key={t} className="tag !h-8 !px-3">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <p>
                  <span className="text-xs text-mute">Leases from </span>
                  <span className="text-[26px] font-semibold tracking-tight">{format(beat.priceFrom)}</span>
                  <span className="block text-[12px] text-mute">{vatNote}</span>
                </p>
                
                  <button type="button" className="btn btn-primary !h-12 !px-7" onClick={() => openLicense(beat)}>
                    License this beat
                  </button>
                
              </div>
              <p className="mt-3 text-[12px] text-stone-300">
                {licenseDeals.bundle} · {licenseDeals.upgrade}
              </p>
              <Reveal className="mt-8">
                <MusicPlayer id={`beat-${beat.slug}`} label={`${beat.title} preview`} tracks={tracks} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="container-sg grid gap-6 lg:grid-cols-[1.4fr_1fr] grid-cols-1" aria-labelledby="tiers-title">
        <div className="panel p-5 sm:p-8">
          <h2 id="tiers-title" className="display text-[30px] sm:text-[40px]">
            Pick a license
          </h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 grid-cols-1">
            {licenseTiers.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => openLicense(beat, t.id)}
                  className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-[var(--track-accent,var(--fg))] ${
                    t.popular ? "border-stone-300/50 bg-stone-300/[0.05]" : "border-line"
                  }`}
                >
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="text-[12px] text-mute">
                      {t.files} · {t.streams} streams
                    </span>
                  </span>
                  <span className="text-[26px] font-semibold tracking-tight">
                    {t.fromPrice && <span className="mr-1 text-[12px] text-mute">from</span>}
                    {format(t.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <aside className="panel h-fit p-5 sm:p-8">
          <p className="eyebrow">Every lease</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {leaseTerms.map((l) => (
              <li key={l} className="flex gap-2">
                <CheckIcon size={14} className="mt-0.5 shrink-0 text-white" /> {l}
              </li>
            ))}
          </ul>
          <Link href="/licenses" className="btn btn-ghost btn-sm mt-6">
            Full license terms
          </Link>
        </aside>
      </section>

      {more.length > 0 && (
        <section className="container-sg mt-20" aria-labelledby="more-title">
          <h2 id="more-title" className="display mb-6 text-[30px] sm:text-[40px]">
            More like this
          </h2>
          <ul className="space-y-1">
            {more.map((b, i) => (
              <BeatRow key={b.id} beat={b} queue={more} index={i} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
