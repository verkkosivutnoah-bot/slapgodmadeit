"use client";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckIcon, SparkIcon } from "@/components/ui/Icons";
import { licenseDeals, leaseTerms, licenseTiers, TABLE_ROWS } from "@/data/licenses";
import { useCurrency } from "@/lib/currency";

export function LicenseCards({ ctaHref = "/beats" }: { ctaHref?: string }) {
  const { format, vatNote } = useCurrency();
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-gold px-4 font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
          <SparkIcon size={12} /> {licenseDeals.bundle}
        </span>
        <span className="chip">{licenseDeals.upgrade}</span>
        <Link href="/contact?topic=custom" className="chip">
          {licenseDeals.customBeat.label} from {format(licenseDeals.customBeat.from)} →
        </Link>
      </div>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 grid-cols-1">
        {licenseTiers.map((t) => (
          <StaggerItem key={t.id} className="h-full">
            <article
              className={`relative flex h-full flex-col rounded-3xl border p-6 transition duration-500 hover:-translate-y-1 ${
                t.popular
                  ? "border-ember bg-[linear-gradient(170deg,rgb(var(--ember-rgb)/0.12),rgb(var(--surface-rgb)/0.9)_55%)] shadow-[0_30px_80px_-40px_rgb(var(--ember-rgb)/0.5)]"
                  : t.id === "exclusive"
                    ? "border-gold/40 bg-[linear-gradient(170deg,rgb(var(--gold-rgb)/0.12),rgb(var(--surface-rgb)/0.9)_55%)]"
                    : "border-line bg-surface/40"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-ember px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                  Most popular
                </span>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{t.short}</p>
              <h3 className="mt-2 text-lg font-semibold leading-tight">{t.name}</h3>
              <p className="mt-5 flex items-baseline gap-1.5">
                {t.fromPrice && <span className="font-mono text-xs text-mute">from</span>}
                <span className={`display text-5xl ${t.popular ? "text-ember" : ""}`}>{format(t.price, { usd: t.priceUSD })}</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-[13px]">
                {TABLE_ROWS.slice(0, 7).map((r) => (
                  <li key={r.key} className="flex gap-2">
                    <CheckIcon size={14} className="mt-0.5 shrink-0 text-ember" />
                    <span>
                      <span className="text-mute">{r.label}:</span> {String(t[r.key])}
                    </span>
                  </li>
                ))}
                {t.extra?.map((x) => (
                  <li key={x} className="flex gap-2 text-bone/90">
                    <SparkIcon size={12} className="mt-1 shrink-0 text-gold" /> {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                {t.id === "exclusive" ? (
                  <Link href="/contact?topic=exclusive" className="btn btn-gold btn-sm w-full">
                    Make an offer
                  </Link>
                ) : (
                  <Link href={ctaHref} className={`btn btn-sm w-full ${t.popular ? "btn-primary" : "btn-ghost"}`}>
                    Choose a beat
                  </Link>
                )}
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-line p-6 md:flex-row md:items-center md:justify-between">
        <ul className="grid gap-x-8 gap-y-2 text-[13px] text-mute sm:grid-cols-2 lg:grid-cols-3 grid-cols-1">
          {leaseTerms.map((l) => (
            <li key={l} className="flex gap-2">
              <CheckIcon size={14} className="mt-0.5 shrink-0 text-ember" /> {l}
            </li>
          ))}
        </ul>
        <p className="shrink-0 font-mono text-[11px] text-mute">
          {vatNote} · SLAPGOD writer share 50% on all tiers
        </p>
      </div>
    </div>
  );
}

export function LicenseTable() {
  const { format } = useCurrency();
  return (
    <div className="overflow-x-auto overscroll-x-contain rounded-3xl border border-line bg-ink" data-lenis-prevent-horizontal role="region" aria-label="License comparison table (scrolls horizontally)" tabIndex={0}>
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <caption className="sr-only">Beat license comparison</caption>
        <thead>
          <tr className="border-b border-line bg-bone/[0.03]">
            <th scope="col" className="sticky left-0 z-10 bg-surface p-4 font-mono text-[10px] font-normal uppercase tracking-widest text-mute">
              Tier
            </th>
            {licenseTiers.map((t) => (
              <th key={t.id} scope="col" className={`p-4 align-bottom ${t.popular ? "bg-ember/[0.07]" : ""}`}>
                {t.popular && <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-ember">Most popular</span>}
                <span className="block font-semibold">{t.name}</span>
                <span className="display mt-1 block text-2xl">
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
              <th scope="row" className="sticky left-0 z-10 w-32 min-w-32 bg-surface p-4 font-mono text-[11px] font-normal uppercase tracking-wider text-mute shadow-[1px_0_0_var(--color-line)]">
                {r.label}
              </th>
              {licenseTiers.map((t) => {
                const v = String(t[r.key]);
                return (
                  <td key={t.id} className={`p-4 ${t.popular ? "bg-ember/[0.04]" : ""} ${v === "No" ? "text-mute" : ""}`}>
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <th scope="row" className="sticky left-0 z-10 w-32 min-w-32 bg-surface p-4 font-mono text-[11px] font-normal uppercase tracking-wider text-mute shadow-[1px_0_0_var(--color-line)]">
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
