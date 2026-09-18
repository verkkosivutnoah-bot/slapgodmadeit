"use client";
import Link from "next/link";
import { CoverArt } from "@/components/ui/CoverArt";
import { CountUp, Reveal, RevealImage, Stagger, StaggerItem, spotlightMove } from "@/components/ui/motion";
import { CheckIcon, PauseIcon, PlayIcon } from "@/components/ui/Icons";
import { usePlayer } from "@/components/player/GlobalPlayer";
import { guitarVault, GUITAR_SPECS } from "@/data/packs";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function FlagshipVault() {
  const { format, vatNote } = useCurrency();
  const cart = useCart();
  const player = usePlayer();
  const p = guitarVault;
  const inCart = cart.has(`pack:${p.slug}`);
  const isCurrent = player.started && p.demo.some((d) => d.id === player.currentId);
  const playing = isCurrent && player.isPlaying;

  return (
    <section className="section relative overflow-hidden" aria-labelledby="vault-title">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_22%_50%,rgb(var(--coral-rgb)/0.13),transparent_70%),radial-gradient(35%_45%_at_85%_30%,rgb(var(--lilac-rgb)/0.1),transparent_70%)]"
        aria-hidden
      />
      <div className="container-sg grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <RevealImage className="group">
          <Link href={`/packs/${p.slug}`} onPointerMove={spotlightMove} className="frame spotlight card-lift block aspect-square !rounded-[24px] ring-1 ring-white/10">
            <CoverArt src={p.cover} title={p.title} sizes="(max-width: 1024px) 92vw, 620px" className="absolute inset-0" />
          </Link>
        </RevealImage>

        <div>
          <Reveal y={8}>
            <p className="eyebrow">
              Flagship pack · <span className="text-amber">Out now</span>
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="vault-title" className="display mt-4 text-[clamp(40px,5.4vw,64px)]">
              Guitar Vault <span className="text-grad">Vol. 1</span>
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-stone-300">
              Fifty live guitar loops and ~40 one-shots, played and recorded by SLAPGOD. Warm, human, ready to flip.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-8 border-t border-line">
            {p.categories.map((c) => (
              <StaggerItem as="li" key={c.name}>
                <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[15px]">
                  <span className="text-stone-300">{c.name}</span>
                  <span className="tabular-nums text-mute">
                    <CountUp value={c.count} className="font-semibold text-amber" /> {c.unit}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="mt-8">
            <p className="text-[13px] leading-relaxed text-mute">{GUITAR_SPECS.join(" · ")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="mr-2 flex items-baseline gap-2">
                <span className="text-[32px] font-semibold tracking-tight text-coral">{format(p.price)}</span>
                {p.compareAt && <s className="text-[15px] text-mute">{format(p.compareAt)}</s>}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  cart.add({ key: `pack:${p.slug}`, kind: "pack", productId: p.slug, title: p.title, priceEUR: p.price, cover: p.cover, href: `/packs/${p.slug}` })
                }
              >
                {inCart ? (
                  <>
                    <CheckIcon size={16} /> In cart
                  </>
                ) : (
                  "Buy"
                )}
              </button>
              <button type="button" className="btn btn-light" onClick={() => (isCurrent ? player.toggle() : player.playQueue(p.demo, 0))}>
                {playing ? <PauseIcon size={13} /> : <PlayIcon size={13} />} {playing ? "Pause" : "Play preview"}
              </button>
            </div>
            <p className="mt-3 text-[13px] text-mute">
              {vatNote} · {p.deal} ·{" "}
              <Link href={`/packs/${p.slug}`} className="link-u text-stone-300">
                Full details
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
