"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CoverBackdrop, CoverShowcase } from "@/components/ui/CoverShowcase";
import { accentStyle, useCoverAccent } from "@/lib/coverAccent";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { PackCard } from "./PackCard";
import { Magnetic, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ArrowIcon, CheckIcon, SparkIcon, Sticker } from "@/components/ui/Icons";
import { getPack, packs } from "@/data/packs";
import { CREDIT_FORMAT, loopLicenseSummary } from "@/data/licenses";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PackDetail({ slug }: { slug: string }) {
  const pack = getPack(slug)!;
  const cart = useCart();
  const { format, vatNote } = useCurrency();
  const [openCat, setOpenCat] = useState<number | null>(0);
  const accent = useCoverAccent(pack.cover);
  const cartKey = `pack:${pack.slug}`;
  const inCart = cart.has(cartKey);
  const isFree = pack.price === 0;
  const related = packs.filter((p) => p.slug !== pack.slug).slice(0, 4);

  return (
    <div style={accentStyle(accent)}>
      <div className="relative isolate overflow-hidden pb-16 pt-24 md:pt-36">
        <CoverBackdrop src={pack.cover} title={pack.title} />

        <div className="container-sg">
          <nav aria-label="Breadcrumb" className="mb-8 font-mono text-[11px] uppercase tracking-widest text-mute">
            <Link href="/packs" className="hover:text-bone">
              Packs
            </Link>{" "}
            / <span className="text-bone">{pack.title}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16 grid-cols-1">
            {/* left: cover + player */}
            <div className="space-y-8">
              <CoverShowcase src={pack.cover} title={pack.title}>
                {pack.badge && (
                  <Sticker text={`${pack.badge} • ${pack.badge} • ${pack.badge} • `} className="absolute -right-2 -top-4 h-24 w-24 text-gold sm:-right-8 sm:-top-8 sm:h-28 sm:w-28">
                    <SparkIcon size={22} />
                  </Sticker>
                )}
              </CoverShowcase>
            </div>

            {/* right: info */}
            <div>
              <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                {pack.type} {pack.soundLabel ? `· ${pack.soundLabel}` : ""}
                {pack.placeholder && <span className="ml-2 rounded bg-bone/10 px-1.5 py-0.5 text-[9px]">placeholder</span>}
              </motion.p>
              <motion.h1
                className="display mt-4 text-[14vw] sm:text-7xl xl:text-8xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                {pack.title}
              </motion.h1>
              <p className="mt-5 text-xl text-bone/85">{pack.tagline}</p>

              <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-2">
                <span className="display text-7xl">{format(pack.price, { usd: pack.priceUSD, interval: pack.interval })}</span>
                {pack.compareAt && <s className="mb-2 font-mono text-lg text-mute">{format(pack.compareAt)}</s>}
                {pack.deal && (
                  <span className="mb-3 rounded-full bg-gold px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">{pack.deal}</span>
                )}
              </div>
              {!isFree && <p className="mt-1 font-mono text-[11px] text-mute">{vatNote} · instant download</p>}

              <div className="mt-6">
                {isFree ? (
                  <div className="panel p-5">
                    <p className="mb-4 text-sm text-mute">Email required · confirm the double opt-in link in your inbox to get the download.</p>
                    <EmailCaptureForm source={`free_${pack.slug}`} cta="Get it free" />
                  </div>
                ) : pack.comingSoon ? (
                  <button type="button" className="btn btn-ghost" disabled>
                    Coming soon
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Magnetic>
                      <button
                        type="button"
                        className="btn btn-primary h-14 px-8"
                        onClick={() =>
                          cart.add({ key: cartKey, kind: "pack", productId: pack.slug, title: pack.title, priceEUR: pack.price, cover: pack.cover, href: `/packs/${pack.slug}` })
                        }
                      >
                        {inCart ? (
                          <>
                            <CheckIcon size={16} /> Added to cart
                          </>
                        ) : (
                          <>Add to cart · {format(pack.price, { usd: pack.priceUSD })}</>
                        )}
                      </button>
                    </Magnetic>
                    {inCart && (
                      <Link href="/cart" className="btn btn-ghost h-14">
                        Checkout <ArrowIcon size={16} />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <Stagger className="mt-8 flex flex-wrap gap-2">
                {pack.specs.map((s) => (
                  <StaggerItem key={s}>
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-ink/40 px-3 font-mono text-[11px]">
                      <CheckIcon size={12} className="text-ember" /> {s}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>

              {pack.demo.length > 0 && (
                <Reveal className="mt-10">
                  <p className="eyebrow mb-3">Demo · {pack.demo.length} preview{pack.demo.length > 1 ? "s" : ""}</p>
                  <MusicPlayer id={`pack-${pack.slug}`} label={`${pack.title} demo player`} tracks={pack.demo} />
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-sg grid gap-6 lg:grid-cols-[1.3fr_1fr] grid-cols-1">
        {/* contents */}
        <section aria-labelledby="contents-title" className="panel p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 id="contents-title" className="display text-4xl sm:text-5xl">
              What&apos;s inside
            </h2>
            <p className="font-mono text-xs text-mute">{pack.soundLabel}</p>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-mute">{pack.description}</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {pack.categories.map((c, i) => {
              const open = openCat === i;
              const expandable = !!c.examples?.length || !!c.detail;
              return (
                <li key={c.name}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 py-4 text-left disabled:cursor-default"
                    onClick={() => expandable && setOpenCat(open ? null : i)}
                    aria-expanded={expandable ? open : undefined}
                    disabled={!expandable}
                  >
                    <span className="display w-14 text-3xl text-ember">{c.count}</span>
                    <span className="flex-1">
                      <span className="block font-semibold">{c.name}</span>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-mute">{c.detail ?? c.unit}</span>
                    </span>
                    {expandable && (
                      <span className={`grid h-8 w-8 place-items-center rounded-full border border-line transition-transform duration-500 ${open ? "rotate-45 border-ember text-ember" : ""}`} aria-hidden>
                        +
                      </span>
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && c.examples && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        {c.examples.map((e) => (
                          <li key={e} className="truncate pb-2 pl-[72px] font-mono text-[12px] text-bone/75">
                            {e}
                            {c.unit === "loops" && ".wav"}
                          </li>
                        ))}
                        {c.unit === "loops" && c.count > c.examples.length && (
                          <li className="pb-4 pl-[72px] font-mono text-[11px] text-mute">+ {c.count - c.examples.length} more</li>
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            {pack.bpmRange && (
              <div>
                <dt className="eyebrow">BPM</dt>
                <dd className="mt-1">{pack.bpmRange}</dd>
              </div>
            )}
            {pack.genres.length > 0 && (
              <div>
                <dt className="eyebrow">Genres</dt>
                <dd className="mt-1">{pack.genres.join(", ")}</dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">Delivery</dt>
              <dd className="mt-1">Instant download (ZIP)</dd>
            </div>
          </dl>
        </section>

        {/* license */}
        <aside aria-labelledby="license-title" className="panel h-fit p-6 sm:p-8 lg:sticky lg:top-28">
          <p className="eyebrow text-ember">Royalty-free license</p>
          <h2 id="license-title" className="display mt-2 text-4xl">
            {loopLicenseSummary.title}
          </h2>
          <ul className="mt-5 space-y-3 text-[14px]">
            {loopLicenseSummary.points.map((p) => (
              <li key={p} className="flex gap-2.5">
                <CheckIcon size={15} className="mt-0.5 shrink-0 text-ember" /> {p}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
            <span className="display text-5xl text-gold">25%</span>
            <span className="text-[13px] text-mute">publishing split to SLAPGOD on commercially released songs using these loops</span>
          </div>
          <p className="mt-5 font-mono text-[12px]">Credit: &ldquo;{CREDIT_FORMAT}&rdquo;</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/licenses" className="btn btn-ghost btn-sm">
              Full license
            </Link>
            <Link href="/#rights" className="btn btn-ghost btn-sm">
              Know your rights
            </Link>
          </div>
          <p className="mt-5 text-[11px] text-mute">Summary only — the license delivered with your purchase is the binding document.</p>
        </aside>
      </div>

      <section className="container-sg mt-24" aria-labelledby="related-title">
        <h2 id="related-title" className="display mb-8 text-5xl">
          More packs
        </h2>
        <Stagger className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <StaggerItem key={p.slug}>
              <PackCard pack={p} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
