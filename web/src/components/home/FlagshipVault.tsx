"use client";
import Link from "next/link";
import { CoverArt } from "@/components/ui/CoverArt";
import { Reveal } from "@/components/ui/motion";
import { CheckIcon } from "@/components/ui/Icons";
import { guitarVault, GUITAR_SPECS } from "@/data/packs";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function FlagshipVault() {
  const { format, vatNote } = useCurrency();
  const cart = useCart();
  const p = guitarVault;
  const inCart = cart.has(`pack:${p.slug}`);

  return (
    <section className="py-24 md:py-36" aria-labelledby="vault-title">
      <div className="container-sg grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <Link href={`/packs/${p.slug}`} className="block">
            <CoverArt src={p.cover} title={p.title} sizes="(max-width: 768px) 90vw, 560px" className="aspect-square w-full rounded-[24px] ring-1 ring-white/10" />
          </Link>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="eyebrow">Flagship pack · out now</p>
          <h2 id="vault-title" className="display mt-3 text-[clamp(38px,5.5vw,60px)]">
            Guitar Vault <span className="text-silver">Vol. 1</span>
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-stone-300">
            50 live guitar loops and ~40 one-shots — chords, melodies, fingerstyle, strums and textures. Every note played by SLAPGOD.
          </p>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-mute">{GUITAR_SPECS.join(" · ")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <p className="flex items-baseline gap-2">
              <span className="text-[28px] font-semibold">{format(p.price)}</span>
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
            <Link href={`/packs/${p.slug}`} className="btn btn-ghost">
              Details
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-mute">{vatNote} · {p.deal}</p>
        </Reveal>
      </div>
    </section>
  );
}
