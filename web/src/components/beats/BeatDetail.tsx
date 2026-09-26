"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { CoverBackdrop, CoverShowcase } from "@/components/ui/CoverShowcase";
import { StickyBuyBar } from "@/components/ui/StickyBuyBar";
import { FreeTaggedDownload } from "./FreeTaggedDownload";
import { EASE, LineReveal, Reveal, Rise, Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckIcon } from "@/components/ui/Icons";
import { BeatRow, TrackListHeader } from "./BeatRow";
import { beats, toPlayerTrack } from "@/data/beats";
import { leaseTerms, licenseDeals, licenseTiers, TABLE_ROWS, type LicenseId } from "@/data/licenses";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function BeatDetail({ slug }: { slug: string }) {
  const beat = beats.find((b) => b.slug === slug)!;
  const tracks = useMemo(() => [toPlayerTrack(beat)], [beat]);
  const more = useMemo(() => beats.filter((b) => b.id !== beat.id && (b.genre === beat.genre || b.moods.some((m) => beat.moods.includes(m)))).slice(0, 5), [beat]);
  const [tierId, setTierId] = useState<LicenseId>("premium");
  const tier = licenseTiers.find((t) => t.id === tierId)!;
  const cart = useCart();
  const { format, vatNote } = useCurrency();
  const pickerRef = useRef<HTMLDivElement>(null);
  const cartKey = `${beat.id}:${tier.id}`;
  const inCart = cart.has(cartKey);

  const add = () =>
    cart.add({ key: cartKey, kind: "beat", productId: beat.id, title: beat.title, variant: tier.name, priceEUR: tier.price, cover: beat.cover, href: `/beats/${beat.slug}` });

  const cta = (small = false) =>
    tier.id === "exclusive" ? (
      <Link href={`/contact?topic=exclusive&beat=${beat.slug}`} className={`btn btn-primary ${small ? "btn-sm" : ""}`}>
        Make an offer
      </Link>
    ) : inCart ? (
      <Link href="/cart" className={`btn btn-primary ${small ? "btn-sm" : ""}`}>
        <CheckIcon size={15} /> In cart · Checkout
      </Link>
    ) : (
      <button type="button" onClick={add} className={`btn btn-primary ${small ? "btn-sm" : ""}`}>
        Add to cart · {format(tier.price)}
      </button>
    );

  return (
    <div>
      <section className="relative isolate pb-20 pt-28 md:pb-28 md:pt-40">
        <CoverBackdrop src={beat.cover} title={beat.title} />
        <div className="container-sg">
          <Rise y={6}>
            <nav aria-label="Breadcrumb" className="mb-10 text-[13px] text-mute">
              <Link href="/beats" className="link-u hover:text-bone">
                Beats
              </Link>
              <span className="mx-1.5">/</span> <span className="text-stone-300">{beat.title}</span>
            </nav>
          </Rise>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <CoverShowcase src={beat.cover} title={beat.title} />
            <div>
              <Rise y={8}>
                <p className="eyebrow">
                  <span className="text-lilac">{beat.genre}</span> beat{beat.isNew ? <span className="text-coral"> · New</span> : ""}
                </p>
              </Rise>
              <LineReveal lines={[beat.title]} className="display mt-4 text-[clamp(44px,7vw,88px)]" delay={0.05} />
              <Rise delay={0.2}>
                <p className="mt-5 flex flex-wrap items-center gap-2 text-[17px] tabular-nums text-stone-300">
                  <span className="tag tag-amber !h-8 !px-3.5 !text-[14px] font-semibold">{beat.bpm} BPM</span>
                  <span className="tag tag-coral !h-8 !px-3.5 !text-[14px] font-semibold">{beat.key}</span>
                  <span className="text-mute">{beat.duration}</span>
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {[...beat.moods, ...beat.tags].map((t) => (
                    <li key={t} className="tag !h-8 !px-3.5 !text-[13px]">
                      {t}
                    </li>
                  ))}
                </ul>
              </Rise>
              <Rise delay={0.3} className="mt-10">
                <MusicPlayer id={`beat-${beat.slug}`} label={`${beat.title} preview`} tracks={tracks} />
                <FreeTaggedDownload src={beat.src} title={beat.title} />
              </Rise>
            </div>
          </div>
        </div>
      </section>

      {/* license picker */}
      <section className="container-sg" aria-labelledby="tiers-title">
        <Reveal>
          <p className="eyebrow">Licensing</p>
          <h2 id="tiers-title" className="display mt-4 text-[clamp(32px,4.4vw,52px)]">
            Pick a license
          </h2>
          <p className="mt-3 text-[15px] text-mute">
            From {format(beat.priceFrom)} · {licenseDeals.bundle} · {licenseDeals.upgrade}
          </p>
        </Reveal>

        <div ref={pickerRef} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2" as="div">
            {licenseTiers.map((t) => {
              const active = t.id === tierId;
              return (
                <StaggerItem key={t.id} className={t.id === "exclusive" ? "sm:col-span-2" : ""}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTierId(t.id)}
                    className={`relative flex w-full items-center justify-between gap-4 rounded-[20px] border px-5 py-5 text-left transition-colors duration-300 ${
                      active ? "border-transparent" : "border-line hover:bg-white/[0.03]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="tier-selected"
                        className="absolute inset-0 rounded-[20px] bg-coral/[0.1] ring-1 ring-coral/70 shadow-[0_12px_36px_-18px_var(--coral)]"
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    )}
                    <span className="relative">
                      <span className="flex items-center gap-2 text-[15px] font-medium">
                        {t.name}
                        {t.popular && <span className="badge-amber rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]">★ Popular</span>}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-mute">
                        {t.files} · {t.streams} streams
                      </span>
                    </span>
                    <span className="relative shrink-0 text-right">
                      {t.fromPrice && <span className="block text-[11px] text-mute">from</span>}
                      <span className={`text-[22px] font-semibold tabular-nums ${active ? "text-coral" : ""}`}>{format(t.price)}</span>
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal delay={0.1}>
            <div className="rounded-[24px] border border-line p-7 sm:p-8 lg:sticky lg:top-28">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={tier.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
                  <p className="text-[15px] text-stone-300">{tier.name}</p>
                  <p className="mt-2 text-[40px] font-semibold tracking-tight tabular-nums">
                    {tier.fromPrice && <span className="mr-1.5 text-[14px] font-normal text-mute">from</span>}
                    {format(tier.price)}
                  </p>
                  <dl className="mt-6 space-y-2.5 border-t border-line pt-6 text-[14px]">
                    {TABLE_ROWS.map((r) => (
                      <div key={r.key} className="flex justify-between gap-4">
                        <dt className="text-mute">{r.label}</dt>
                        <dd className="text-right tabular-nums text-stone-200">{String(tier[r.key])}</dd>
                      </div>
                    ))}
                  </dl>
                  {tier.extra && <p className="mt-4 text-[13px] leading-relaxed text-mute">{tier.extra.join(". ")}.</p>}
                </motion.div>
              </AnimatePresence>
              <div className="mt-7 flex flex-wrap gap-3">{cta()}</div>
              <p className="mt-3 text-[12px] text-mute">{vatNote}</p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12">
          <ul className="grid grid-cols-1 gap-x-10 gap-y-2 border-t border-line pt-8 text-[14px] text-stone-400 sm:grid-cols-2 lg:grid-cols-3">
            {leaseTerms.map((l) => (
              <li key={l} className="flex gap-2.5">
                <CheckIcon size={14} className="mt-1 shrink-0 text-lilac" /> {l}
              </li>
            ))}
          </ul>
          <Link href="/licenses" className="link-u mt-6 inline-block text-[14px] text-stone-300">
            Full license terms →
          </Link>
        </Reveal>
      </section>

      {more.length > 0 && (
        <section className="section container-sg" aria-labelledby="more-title">
          <Reveal>
            <h2 id="more-title" className="display mb-10 text-[clamp(32px,4.4vw,48px)]">
              More like this
            </h2>
          </Reveal>
          <TrackListHeader />
          <ul className="mt-2 space-y-0.5">
            {more.map((b, i) => (
              <BeatRow key={b.id} beat={b} queue={more} index={i} />
            ))}
          </ul>
        </section>
      )}

      <StickyBuyBar anchor={pickerRef} mode="outside">
        <span className="min-w-0 truncate text-[14px] font-medium">
          {beat.title} <span className="text-mute">· {tier.short}</span>
        </span>
        {cta(true)}
      </StickyBuyBar>
    </div>
  );
}
