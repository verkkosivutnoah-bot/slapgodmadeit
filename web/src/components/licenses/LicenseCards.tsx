"use client";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckIcon } from "@/components/ui/Icons";
import { licenseDeals, leaseTerms, licenseTiers, TABLE_ROWS } from "@/data/licenses";
import { useCurrency } from "@/lib/currency";

export function LicenseCards({ ctaHref = "/beats" }: { ctaHref?: string }) {
  const { format, vatNote } = useCurrency();
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="chip">{licenseDeals.bundle}</span>
        <span className="chip">{licenseDeals.upgrade}</span>
        <Link href="/contact?topic=custom" className="chip">
          {licenseDeals.customBeat.label} from {format(licenseDeals.customBeat.from)} →
        </Link>
      </div>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 grid-cols-1">
        {licenseTiers.map((t) => (
          <StaggerItem key={t.id} className="h-full">
            <article
              className={`relative flex h-full flex-col rounded-[22px] border p-6 transition-colors ${
                t.popular ? "border-white/25 bg-white/[0.05]" : "border-line bg-white/[0.02]"
              }`}
            >
              {t.popular && (
                <span className="bg-silver absolute -top-3 left-6 rounded-full px-3 py-1 text-[12px] font-semibold">
                  Most popular
                </span>
              )}
              <h3 className="text-[16px] font-medium leading-tight">{t.name}</h3>
              <p className="mt-5 flex items-baseline gap-1.5">
                {t.fromPrice && <span className="text-xs text-mute">from</span>}
                <span className="text-[30px] font-semibold tracking-tight">{format(t.price, { usd: t.priceUSD })}</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-[13px]">
                {TABLE_ROWS.slice(0, 7).map((r) => (
                  <li key={r.key} className="flex gap-2">
                    <CheckIcon size={14} className="mt-0.5 shrink-0 text-stone-400" />
                    <span>
                      <span className="text-mute">{r.label}:</span> {String(t[r.key])}
                    </span>
                  </li>
                ))}
                {t.extra?.map((x) => (
                  <li key={x} className="flex gap-2 text-bone/90">
                    <CheckIcon size={14} className="mt-0.5 shrink-0 text-stone-400" /> {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
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
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-6 flex flex-col gap-4 rounded-[22px] border border-line p-6 md:flex-row md:items-center md:justify-between">
        <ul className="grid gap-x-8 gap-y-2 text-[13px] text-mute sm:grid-cols-2 lg:grid-cols-3 grid-cols-1">
          {leaseTerms.map((l) => (
            <li key={l} className="flex gap-2">
              <CheckIcon size={14} className="mt-0.5 shrink-0 text-stone-400" /> {l}
            </li>
          ))}
        </ul>
        <p className="shrink-0 text-[12px] text-mute">
          {vatNote} · SLAPGOD writer share 50% on all tiers
        </p>
      </div>
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
              <th key={t.id} scope="col" className={`p-4 align-bottom ${t.popular ? "bg-white/[0.07]" : ""}`}>
                {t.popular && <span className="text-silver mb-1 block text-[12px] font-semibold">Most popular</span>}
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
                  <td key={t.id} className={`p-4 ${t.popular ? "bg-white/[0.04]" : ""} ${v === "No" ? "text-mute" : ""}`}>
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
