import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { LicenseCards, LicenseTable } from "@/components/licenses/LicenseCards";
import { Reveal } from "@/components/ui/motion";
import { CheckIcon } from "@/components/ui/Icons";
import { CREDIT_FORMAT, loopLicenseSummary } from "@/data/licenses";
import { splits } from "@/data/rights";

export const metadata: Metadata = { title: "License Agreements" };

export default function LicensesPage() {
  return (
    <>
      <PageHero eyebrow="Legal · Licensing" title="Licenses">
        Beat lease tiers, exclusive rights and the loop license — summarized. The full agreement text is delivered with every purchase.
      </PageHero>

      <div className="container-sg space-y-20">
        <section aria-labelledby="tiers">
          <h2 id="tiers" className="display mb-8 text-[30px] sm:text-[40px]">
            Beat lease tiers
          </h2>
          <LicenseCards />
        </section>

        <section aria-labelledby="compare">
          <h2 id="compare" className="display mb-8 text-[30px] sm:text-[40px]">
            Full comparison
          </h2>
          <Reveal>
            <LicenseTable />
          </Reveal>
        </section>

        <section aria-labelledby="loops" className="grid gap-6 lg:grid-cols-2 grid-cols-1">
          <div className="panel p-6 sm:p-10">
            <h2 id="loops" className="display text-[32px]">
              {loopLicenseSummary.title}
            </h2>
            <ul className="mt-6 space-y-3 text-[15px]">
              {loopLicenseSummary.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <CheckIcon size={16} className="mt-1 shrink-0 text-white" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-6 sm:p-10">
            <h2 className="display text-[32px]">Splits &amp; credit</h2>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-line p-5">
                <dt className="eyebrow">Beats</dt>
                <dd className="display mt-2 text-[44px] text-white">{splits.beats.share}%</dd>
                <dd className="text-sm text-mute">writer share to SLAPGOD</dd>
              </div>
              <div className="rounded-2xl border border-line p-5">
                <dt className="eyebrow">Loops</dt>
                <dd className="display mt-2 text-[44px] text-stone-300">{splits.loops.share}%</dd>
                <dd className="text-sm text-mute">publishing on released songs</dd>
              </div>
            </dl>
            <p className="mt-6 text-lg">&ldquo;{CREDIT_FORMAT}&rdquo;</p>
            <Link href="/#rights" className="btn btn-ghost btn-sm mt-6">
              Know your rights guide
            </Link>
          </div>
        </section>

        <section aria-labelledby="agreements" className="panel p-6 sm:p-10">
          <h2 id="agreements" className="display text-[32px]">
            License agreement text
          </h2>
          <p className="mt-3 max-w-2xl text-mute">
            Content coming soon — full agreements for Basic MP3, Premium WAV, Trackout, Unlimited, Exclusive Rights and the Loop/Sample license.
          </p>
          <div className="mt-8 space-y-3" aria-hidden>
            {[94, 80, 88, 62, 90, 74, 84].map((w, i) => (
              <div key={i} className="h-3 rounded-full bg-bone/[0.06]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <p className="mt-8 text-xs text-mute">Summary only — the license agreement delivered with your purchase is the binding document.</p>
        </section>
      </div>
    </>
  );
}
