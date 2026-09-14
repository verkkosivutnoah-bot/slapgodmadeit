"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowIcon, CheckIcon, SparkIcon } from "@/components/ui/Icons";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { licenseDeals, leaseTerms, licenseTiers, TABLE_ROWS, type LicenseId } from "@/data/licenses";
import type { Beat } from "@/data/beats";

interface Ctx {
  openLicense: (beat: Beat, tier?: LicenseId) => void;
}
const LicenseCtx = createContext<Ctx | null>(null);

export function useLicenseModal() {
  const ctx = useContext(LicenseCtx);
  if (!ctx) throw new Error("useLicenseModal must be inside LicenseModalProvider");
  return ctx;
}

export function LicenseModalProvider({ children }: { children: ReactNode }) {
  const [beat, setBeat] = useState<Beat | null>(null);
  const [tier, setTier] = useState<LicenseId>("premium");
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const cart = useCart();
  const { format, vatNote } = useCurrency();

  const openLicense = useCallback((b: Beat, t: LicenseId = "premium") => {
    setBeat(b);
    setTier(t);
    setAdded(false);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openLicense }), [openLicense]);
  const selected = licenseTiers.find((t) => t.id === tier)!;

  const addToCart = () => {
    if (!beat) return;
    cart.add({
      key: `${beat.id}:${selected.id}`,
      kind: "beat",
      productId: beat.id,
      title: beat.title,
      variant: selected.name,
      priceEUR: selected.price,
      cover: beat.cover,
      href: "/beats",
    });
    setAdded(true);
  };

  return (
    <LicenseCtx.Provider value={value}>
      {children}
      <Dialog open={open} onClose={() => setOpen(false)} title={beat ? `License ${beat.title}` : "License"} className="max-w-[980px]">
        {beat && (
          <div className="p-5 pt-16 sm:p-9">
            <div className="flex items-center gap-4 pr-10">
              <CoverArt src={beat.cover} title={beat.title} alt="" sizes="80px" className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
              <div className="min-w-0">
                <p className="eyebrow">Choose a license</p>
                <p className="display truncate text-4xl sm:text-5xl">{beat.title}</p>
                <p className="mt-1 font-mono text-xs text-mute">
                  {beat.bpm} BPM · {beat.key} · {beat.genre}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="tag !bg-gold/15 !text-gold">
                <SparkIcon size={10} className="mr-1" /> {licenseDeals.bundle}
              </span>
              <span className="tag">{licenseDeals.upgrade}</span>
            </div>

            <fieldset className="mt-6">
              <legend className="sr-only">License tier</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {licenseTiers.map((t) => {
                  const active = t.id === tier;
                  return (
                    <label
                      key={t.id}
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition ${
                        active ? "border-ember bg-ember/[0.07]" : "border-line hover:border-bone/30"
                      } ${t.id === "exclusive" ? "col-span-2 sm:col-span-1" : ""}`}
                    >
                      <input
                        type="radio"
                        name="license-tier"
                        value={t.id}
                        checked={active}
                        onChange={() => {
                          setTier(t.id);
                          setAdded(false);
                        }}
                        className="sr-only"
                      />
                      {t.popular && (
                        <span className="absolute -top-2.5 left-3 rounded-full bg-gold px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink">
                          Most popular
                        </span>
                      )}
                      <span className="font-mono text-[10px] uppercase tracking-widest text-mute">{t.short}</span>
                      <span className="mt-1 text-sm font-semibold leading-tight">{t.name}</span>
                      <span className={`display mt-3 text-3xl ${active ? "text-ember" : ""}`}>
                        {t.fromPrice && <span className="mr-1 font-mono text-[10px] text-mute">from</span>}
                        {format(t.price)}
                      </span>
                      {active && (
                        <motion.span layoutId="tier-check" className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-ember text-ink">
                          <CheckIcon size={12} />
                        </motion.span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr] grid-cols-1">
              <AnimatePresence mode="wait">
                <motion.dl
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-line p-5 text-sm"
                >
                  {TABLE_ROWS.map((r) => (
                    <div key={r.key} className="flex flex-col">
                      <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">{r.label}</dt>
                      <dd className="mt-0.5 text-bone">{String(selected[r.key])}</dd>
                    </div>
                  ))}
                  {selected.extra?.map((x) => (
                    <p key={x} className="col-span-2 flex gap-2 text-[13px] text-mute">
                      <SparkIcon size={12} className="mt-1 shrink-0 text-ember" /> {x}
                    </p>
                  ))}
                </motion.dl>
              </AnimatePresence>
              <ul className="space-y-2 text-[13px] text-mute">
                <li className="eyebrow mb-3">Every lease</li>
                {leaseTerms.map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckIcon size={14} className="mt-0.5 shrink-0 text-ember" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
              <p className="text-xs text-mute">
                {vatNote}. Summary only — full terms in the{" "}
                <Link href="/licenses" className="text-bone underline underline-offset-2" onClick={() => setOpen(false)}>
                  license agreement
                </Link>
                .
              </p>
              {selected.id === "exclusive" ? (
                <Link
                  href={`/contact?topic=exclusive&beat=${beat.slug}`}
                  className="btn btn-gold"
                  onClick={() => setOpen(false)}
                >
                  Make an offer <ArrowIcon size={16} />
                </Link>
              ) : added ? (
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                    Keep browsing
                  </button>
                  <Link href="/cart" className="btn btn-primary" onClick={() => setOpen(false)}>
                    <CheckIcon size={16} /> Go to cart
                  </Link>
                </div>
              ) : (
                <button type="button" className="btn btn-primary" onClick={addToCart}>
                  Add to cart · {format(selected.price)}
                </button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </LicenseCtx.Provider>
  );
}
