"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CountUp, EASE, VIEWPORT, useOffscreenPause } from "@/components/ui/motion";
import { PillTabs } from "@/components/ui/PillTabs";
import { CheckIcon } from "@/components/ui/Icons";
import { licenseDeals, leaseTerms, licenseTiers, loopLicenseSummary, TABLE_ROWS } from "@/data/licenses";
import { useCurrency } from "@/lib/currency";

type Tab = "beats" | "loops";

export function LicenseCards({ ctaHref = "/beats", withTabs = true }: { ctaHref?: string; withTabs?: boolean }) {
  const { format, vatNote } = useCurrency();
  const [tab, setTab] = useState<Tab>("beats");
  const ref = useRef<HTMLDivElement>(null);
  useOffscreenPause(ref);

  return (
    <div ref={ref}>
      {withTabs && (
        <div className="mb-10 flex justify-center md:justify-start">
          <PillTabs<Tab> options={["beats", "loops"]} labels={{ beats: "Beat leases", loops: "Loops & packs" }} value={tab} onChange={setTab} label="License type" />
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {tab === "beats" ? (
          <motion.div key="beats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: EASE }}>
            {/* mobile: horizontal snap row · desktop: 5 columns */}
            <div className="snap-x-row -mx-4 scroll-px-4 px-4 pb-2 pt-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0">
              {licenseTiers.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
                  className="w-[78vw] max-w-[300px] shrink-0 sm:w-[280px] lg:w-auto lg:max-w-none"
                >
                <div className={`card-lift h-full rounded-[24px] ${t.popular ? "grad-ring" : ""}`}>
                  <article
                    className={`relative flex h-full flex-col rounded-[22.5px] p-6 ${
                      t.popular ? "bg-[#1f1a18] bg-[radial-gradient(90%_60%_at_50%_0%,rgb(var(--coral-rgb)/0.16),transparent_70%)]" : "border border-line bg-white/[0.015]"
                    }`}
                  >
                    {t.popular && (
                      <span className="badge-amber absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]">★ Most popular</span>
                    )}
                    <h3 className="text-[15px] font-medium text-stone-300">{t.name}</h3>
                    <p className="mt-4 flex items-baseline gap-1.5">
                      {t.fromPrice && <span className="text-[13px] text-mute">from</span>}
                      <span className={`text-[34px] font-semibold tracking-tight tabular-nums ${t.popular ? "text-coral" : ""}`}>{format(t.price, { usd: t.priceUSD })}</span>
                    </p>
                    <p className="mt-1 text-[13px] text-mute">{t.files}</p>
                    <div className={`my-5 h-px ${t.popular ? "hairline-grad" : "bg-line"}`} />
                    <ul className="space-y-2.5 text-[13.5px]">
                      {TABLE_ROWS.slice(1, 7).map((r) => (
                        <li key={r.key} className="flex items-baseline justify-between gap-3">
                          <span className="text-mute">{r.label.replace("Sales / downloads", "Sales")}</span>
                          <span className="text-right tabular-nums text-stone-200">{String(t[r.key])}</span>
                        </li>
                      ))}
                      {t.extra?.map((x) => (
                        <li key={x} className="flex gap-2.5 pt-1 text-stone-300">
                          <CheckIcon size={14} className="mt-0.5 shrink-0 text-coral" /> {x}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-7">
                      {t.id === "exclusive" ? (
                        <Link href="/contact?topic=exclusive" className="btn btn-ghost btn-sm w-full">
                          Make an offer
                        </Link>
                      ) : (
                        <Link href={ctaHref} className={`btn btn-sm w-full ${t.popular ? "btn-primary" : "btn-ghost"}`}>
                          Choose a beat
                        </Link>
                      )}
                    </div>
                  </article>
                </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-5 border-t border-line pt-8 md:flex-row md:items-start md:justify-between">
              <ul className="grid grid-cols-1 gap-x-10 gap-y-2 text-[14px] text-stone-400 sm:grid-cols-2">
                {leaseTerms.map((l) => (
                  <li key={l} className="flex gap-2.5">
                    <CheckIcon size={14} className="mt-1 shrink-0 text-lilac" /> {l}
                  </li>
                ))}
              </ul>
              <div className="shrink-0 space-y-1 text-[13px] text-mute md:text-right">
                <p>{licenseDeals.bundle} · {licenseDeals.upgrade}</p>
                <p>
                  <Link href="/contact?topic=custom" className="link-u text-stone-300">
                    {licenseDeals.customBeat.label} from {format(licenseDeals.customBeat.from)}
                  </Link>
                </p>
                <p>{vatNote} · SLAPGOD writer share 50%</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="loops" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: EASE }}>
            <div className="grid grid-cols-1 items-center gap-10 rounded-[24px] border border-line p-7 sm:p-10 md:grid-cols-[auto_1fr] md:gap-16">
              <div>
                <p className="display text-[clamp(64px,10vw,112px)] leading-none">
                  <CountUp value={25} suffix="%" className="text-grad pr-[0.05em]" />
                </p>
                <p className="mt-2 max-w-[220px] text-[14px] text-mute">publishing split on commercially released songs using the loops</p>
              </div>
              <ul className="space-y-3 text-[15px]">
                {loopLicenseSummary.points.map((pt) => (
                  <li key={pt} className="flex gap-3 text-stone-300">
                    <CheckIcon size={15} className="mt-1 shrink-0 text-coral" /> {pt}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LicenseTable() {
  const { format } = useCurrency();
  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-[22px] border border-line bg-ink" role="region" aria-label="License comparison table (scrolls horizontally)" tabIndex={0}>
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <caption className="sr-only">Beat license comparison</caption>
        <thead>
          <tr className="border-b border-line bg-bone/[0.03]">
            <th scope="col" className="sticky left-0 z-10 bg-ink p-4 text-[12px] font-normal text-mute">
              Tier
            </th>
            {licenseTiers.map((t) => (
              <th key={t.id} scope="col" className={`p-4 align-bottom ${t.popular ? "bg-coral/[0.1] shadow-[inset_0_2px_0_var(--coral)]" : ""}`}>
                {t.popular && <span className="mb-1 block text-[12px] font-semibold text-amber">★ Most popular</span>}
                <span className="block font-semibold">{t.name}</span>
                <span className="mt-1 block text-[20px] font-semibold">
                  {t.fromPrice ? "from " : ""}
                  {format(t.price, { usd: t.priceUSD })}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((r) => (
            <tr key={r.key} className="border-b border-line/60 last:border-0">
              <th scope="row" className="sticky left-0 z-10 w-32 min-w-32 bg-ink p-4 text-[12px] font-normal text-mute shadow-[1px_0_0_var(--color-line)]">
                {r.label}
              </th>
              {licenseTiers.map((t) => {
                const v = String(t[r.key]);
                return (
                  <td key={t.id} className={`p-4 ${t.popular ? "bg-coral/[0.05]" : ""} ${v === "No" ? "text-mute" : ""}`}>
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <th scope="row" className="sticky left-0 z-10 w-32 min-w-32 bg-ink p-4 text-[12px] font-normal text-mute shadow-[1px_0_0_var(--color-line)]">
              Extras
            </th>
            {licenseTiers.map((t) => (
              <td key={t.id} className="p-4 text-[13px] text-mute">
                {t.extra ? t.extra.join(". ") : "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
