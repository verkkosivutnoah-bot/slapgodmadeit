"use client";
import Link from "next/link";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { Magnetic, Parallax, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ArrowIcon, CheckIcon, Waveform } from "@/components/ui/Icons";
import { guitarVault, GUITAR_SPECS } from "@/data/packs";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function FlagshipVault() {
  const { format, vatNote } = useCurrency();
  const cart = useCart();
  const p = guitarVault;
  const inCart = cart.has(`pack:${p.slug}`);

  return (
    <section className="relative overflow-hidden py-24 md:py-36" aria-labelledby="vault-title">
      <Parallax offset={120} className="pointer-events-none absolute -right-40 top-10 -z-10 h-[520px] w-[520px] rounded-full bg-gold/20 blur-[120px]">
        <span />
      </Parallax>
      <Parallax offset={-80} className="pointer-events-none absolute -left-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-violet/15 blur-[110px]">
        <span />
      </Parallax>

      <div className="container-sg grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20 grid-cols-1">
        <Reveal>
          <MusicPlayer id="vault-home" label="Guitar Vault Vol. 1 previews" tracks={p.demo} />
          <p className="mt-4 hidden text-center font-mono text-[11px] text-mute md:block lg:text-left [@media(hover:none)]:hidden">
            Tip: click the disc to zoom · <kbd className="rounded border border-line px-1">Space</kbd> play/pause ·{" "}
            <kbd className="rounded border border-line px-1">⇧</kbd>+<kbd className="rounded border border-line px-1">→</kbd> next
          </p>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">
              <span className="text-ember">✦</span> Flagship pack · out now
            </p>
            <h2 id="vault-title" className="display mt-4 text-[15vw] sm:text-8xl xl:text-[124px]">
              Guitar <span className="text-outline">Vault</span>
              <br />
              Vol. 1
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-bone/85">
              50 live guitar loops + ~40 one-shots. Chords, melodies, fingerstyle, strums, textures and body hits — every note played by SLAPGOD.
            </p>
          </Reveal>

          <Stagger className="mt-8 flex flex-wrap gap-2">
            {GUITAR_SPECS.map((s) => (
              <StaggerItem key={s}>
                <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-bone/[0.03] px-3 font-mono text-[11px] text-bone/85">
                  <CheckIcon size={12} className="text-ember" /> {s}
                </span>
              </StaggerItem>
            ))}
          </Stagger>

          <Stagger as="ul" className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 border-y border-line py-6 sm:grid-cols-3">
            {p.categories.map((c) => (
              <StaggerItem as="li" key={c.name}>
                <span className="display block text-3xl text-ember">{c.count}</span>
                <span className="text-[13px] leading-tight text-mute">{c.name}</span>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-8 flex flex-wrap items-center gap-5">
            <div>
              <p className="flex items-baseline gap-3">
                <span className="display text-6xl">{format(p.price)}</span>
                {p.compareAt && <s className="font-mono text-base text-mute">{format(p.compareAt)}</s>}
                <span className="rounded-full bg-gold px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">{p.deal}</span>
              </p>
              <p className="mt-1 font-mono text-[11px] text-mute">{vatNote} · royalty-free* with 25% placement split</p>
            </div>
            <div className="flex gap-3">
              <Magnetic>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    cart.add({
                      key: `pack:${p.slug}`,
                      kind: "pack",
                      productId: p.slug,
                      title: p.title,
                      priceEUR: p.price,
                      cover: p.cover,
                      href: `/packs/${p.slug}`,
                    })
                  }
                >
                  {inCart ? (
                    <>
                      <CheckIcon size={16} /> In cart
                    </>
                  ) : (
                    "Add to cart"
                  )}
                </button>
              </Magnetic>
              <Link href={`/packs/${p.slug}`} className="btn btn-ghost">
                Details <ArrowIcon size={16} />
              </Link>
            </div>
          </Reveal>
          <Waveform className="mt-10 h-8 w-full text-bone/15" bars={80} seed={7} />
        </div>
      </div>
    </section>
  );
}
