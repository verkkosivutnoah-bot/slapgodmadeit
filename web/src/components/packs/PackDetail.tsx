"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { CoverBackdrop, CoverShowcase } from "@/components/ui/CoverShowcase";
import { StickyBuyBar } from "@/components/ui/StickyBuyBar";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { PackCard } from "./PackCard";
import { EASE, LineReveal, Reveal, Rise, Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckIcon } from "@/components/ui/Icons";
import { getPack, packs } from "@/data/packs";
import { CREDIT_FORMAT, loopLicenseSummary } from "@/data/licenses";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function PackDetail({ slug }: { slug: string }) {
  const pack = getPack(slug)!;
  const cart = useCart();
  const { format, vatNote } = useCurrency();
  const [openCat, setOpenCat] = useState<number | null>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const cartKey = `pack:${pack.slug}`;
  const inCart = cart.has(cartKey);
  const isFree = pack.price === 0;
  const related = packs.filter((p) => p.slug !== pack.slug).slice(0, 4);
  const addToCart = () => cart.add({ key: cartKey, kind: "pack", productId: pack.slug, title: pack.title, priceEUR: pack.price, cover: pack.cover, href: `/packs/${pack.slug}` });

  const buyButton = (small = false) =>
    pack.comingSoon ? (
      <button type="button" className={`btn btn-ghost ${small ? "btn-sm" : ""}`} disabled>
        Coming soon
      </button>
    ) : inCart ? (
      <Link href="/cart" className={`btn btn-primary ${small ? "btn-sm" : ""}`}>
        <CheckIcon size={15} /> In cart · Checkout
      </Link>
    ) : (
      <button type="button" className={`btn btn-primary ${small ? "btn-sm" : ""}`} onClick={addToCart}>
        Buy · {format(pack.price, { usd: pack.priceUSD })}
      </button>
    );

  return (
    <div>
      <section className="relative isolate pb-20 pt-28 md:pb-28 md:pt-40">
        <CoverBackdrop />
        <div className="container-sg">
          <Rise y={6}>
            <nav aria-label="Breadcrumb" className="mb-10 text-[13px] text-mute">
              <Link href="/packs" className="link-u hover:text-bone">
                Packs
              </Link>{" "}
              <span className="mx-1.5">/</span> <span className="text-stone-300">{pack.title}</span>
            </nav>
          </Rise>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <CoverShowcase src={pack.cover} title={pack.title} />

            <div className="lg:pt-4">
              <Rise y={8}>
                <p className="eyebrow">
                  {pack.type}
                  {pack.soundLabel ? ` · ${pack.soundLabel}` : ""}
                  {pack.placeholder && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] normal-case tracking-normal">placeholder</span>}
                </p>
              </Rise>
              <LineReveal lines={[pack.title]} className="display mt-4 text-[clamp(40px,5.6vw,68px)] [text-wrap:balance]" delay={0.05} />
              <Rise delay={0.2}>
                <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-stone-300">{pack.tagline}</p>
              </Rise>

              <Rise delay={0.3}>
                <div ref={buyRef} className="mt-8">
                  {isFree ? (
                    <div className="max-w-[540px]">
                      <p className="mb-4 text-[14px] text-mute">Email required · confirm the double opt-in link in your inbox to get the download.</p>
                      <EmailCaptureForm source={`free_${pack.slug}`} cta="Get it free" />
                    </div>
                  ) : (
                    <>
                      <p className="flex items-baseline gap-3">
                        <span className="text-[40px] font-semibold tracking-tight tabular-nums">
                          {format(pack.price, { usd: pack.priceUSD, interval: pack.interval })}
                        </span>
                        {pack.compareAt && <s className="text-[17px] text-mute">{format(pack.compareAt)}</s>}
                        {pack.deal && <span className="tag">{pack.deal}</span>}
                      </p>
                      <p className="mt-1 text-[13px] text-mute">{vatNote} · instant download</p>
                      <div className="mt-6 flex flex-wrap gap-3">{buyButton()}</div>
                    </>
                  )}
                </div>
              </Rise>

              <Rise delay={0.4}>
                <p className="mt-8 text-[13px] leading-relaxed text-mute">{pack.specs.join(" · ")}</p>
              </Rise>

              {pack.demo.length > 0 && (
                <Reveal className="mt-10">
                  <p className="eyebrow mb-4">
                    Preview · {pack.demo.length} demo{pack.demo.length > 1 ? "s" : ""}
                  </p>
                  <MusicPlayer id={`pack-${pack.slug}`} label={`${pack.title} demo player`} tracks={pack.demo} />
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-sg grid grid-cols-1 gap-16 lg:grid-cols-[1.25fr_1fr] lg:gap-20" aria-labelledby="contents-title">
        <div>
          <Reveal>
            <p className="eyebrow">What&apos;s inside</p>
            <h2 id="contents-title" className="display mt-4 text-[clamp(32px,4.4vw,48px)]">
              {pack.soundLabel ?? "Contents"}
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-stone-400">{pack.description}</p>
          </Reveal>
          <Stagger as="ul" className="mt-10 border-t border-line">
            {pack.categories.map((c, i) => {
              const open = openCat === i;
              const expandable = !!c.examples?.length;
              return (
                <StaggerItem as="li" key={c.name} className="border-b border-line">
                  <button
                    type="button"
                    className="group flex w-full items-center gap-5 py-5 text-left disabled:cursor-default"
                    onClick={() => expandable && setOpenCat(open ? null : i)}
                    aria-expanded={expandable ? open : undefined}
                    disabled={!expandable}
                  >
                    <span className="w-10 text-[15px] tabular-nums text-mute">{String(c.count).padStart(2, "0")}</span>
                    <span className="flex-1">
                      <span className="block text-[17px] font-medium">{c.name}</span>
                      <span className="text-[13px] text-mute">{c.detail ?? c.unit}</span>
                    </span>
                    {expandable && (
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full transition-[transform,background-color,color] duration-500 ${open ? "rotate-45 bg-white text-deep" : "bg-stone-300/[0.12] text-nav"}`}
                        aria-hidden
                      >
                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && c.examples && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        {c.examples.map((e) => (
                          <li key={e} className="truncate pb-2 pl-[60px] text-[13px] tabular-nums text-stone-400">
                            {e}
                            {c.unit === "loops" && ".wav"}
                          </li>
                        ))}
                        {c.unit === "loops" && c.count > c.examples.length && (
                          <li className="pb-5 pl-[60px] text-[13px] text-mute">+ {c.count - c.examples.length} more</li>
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </StaggerItem>
              );
            })}
          </Stagger>
          <dl className="mt-8 grid grid-cols-2 gap-6 text-[15px] sm:grid-cols-3">
            {pack.bpmRange && (
              <div>
                <dt className="eyebrow">BPM</dt>
                <dd className="mt-2 tabular-nums text-stone-300">{pack.bpmRange}</dd>
              </div>
            )}
            {pack.genres.length > 0 && (
              <div>
                <dt className="eyebrow">Genres</dt>
                <dd className="mt-2 text-stone-300">{pack.genres.join(", ")}</dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">Delivery</dt>
              <dd className="mt-2 text-stone-300">Instant ZIP</dd>
            </div>
          </dl>
        </div>

        <Reveal as="div" className="h-fit lg:sticky lg:top-28">
          <aside aria-labelledby="license-title" className="rounded-[24px] border border-line p-7 sm:p-9">
            <p className="eyebrow">Royalty-free license</p>
            <div className="mt-5 flex items-end gap-4">
              <span className="display text-[64px] leading-none">25%</span>
              <span className="pb-1.5 text-[13px] leading-snug text-mute">publishing split on commercially released songs</span>
            </div>
            <ul className="mt-7 space-y-3 border-t border-line pt-7 text-[14px]">
              {loopLicenseSummary.points.map((p) => (
                <li key={p} className="flex gap-3 text-stone-300">
                  <CheckIcon size={14} className="mt-1 shrink-0 text-stone-500" /> {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[13px] text-stone-400">Credit: &ldquo;{CREDIT_FORMAT}&rdquo;</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/licenses" className="btn btn-ghost btn-sm">
                Full license
              </Link>
              <Link href="/#rights" className="btn btn-ghost btn-sm">
                Know your rights
              </Link>
            </div>
            <p className="mt-5 text-[12px] text-mute">Summary only — the license delivered with your purchase is the binding document.</p>
          </aside>
        </Reveal>
      </section>

      <section className="section container-sg" aria-labelledby="related-title">
        <Reveal>
          <h2 id="related-title" className="display mb-10 text-[clamp(32px,4.4vw,48px)]">
            More packs
          </h2>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-x-5 gap-y-10 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <StaggerItem key={p.slug}>
              <PackCard pack={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {!isFree && (
        <StickyBuyBar anchor={buyRef}>
          <span className="min-w-0 truncate text-[14px] font-medium">{pack.title}</span>
          {buyButton(true)}
        </StickyBuyBar>
      )}
    </div>
  );
}
