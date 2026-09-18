import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { LicenseCards, LicenseTable } from "@/components/licenses/LicenseCards";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/motion";
import { CREDIT_FORMAT } from "@/data/licenses";
import { splits } from "@/data/rights";

export const metadata: Metadata = { title: "License Agreements" };

export default function LicensesPage() {
  return (
    <>
      <PageHero eyebrow="Legal · Licensing" lines={["Licenses, in", "plain language"]}>
        Beat lease tiers, exclusive rights and the loop license — summarized. The full agreement text is delivered with every purchase.
      </PageHero>

      <section className="container-sg pb-24" aria-label="License tiers">
        <LicenseCards />
      </section>

      <section className="section container-sg" aria-labelledby="compare">
        <SectionHeader id="compare" eyebrow="Beat leases" title="Full comparison">
          Every cap, side by side. Scroll sideways on smaller screens.
        </SectionHeader>
        <Reveal>
          <LicenseTable />
        </Reveal>
      </section>

      <section className="container-sg" aria-labelledby="splits">
        <SectionHeader id="splits" eyebrow="Publishing" title="Splits & credit" href="/#rights" hrefLabel="Know your rights" />
        <Reveal className="grid grid-cols-1 border-y border-line sm:grid-cols-3">
          {[
            { k: `${splits.beats.share}%`, v: "Writer share to SLAPGOD on songs made with a beat" },
            { k: `${splits.loops.share}%`, v: "Publishing split on released songs that use the loops" },
            { k: "Credit", v: `“${CREDIT_FORMAT}”` },
          ].map((x, i) => (
            <div key={x.k} className={`py-10 sm:px-8 ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : "sm:pl-0"}`}>
              <p className="display text-[clamp(44px,6vw,72px)] leading-none">{x.k}</p>
              <p className="mt-4 max-w-[260px] text-[15px] leading-relaxed text-stone-400">{x.v}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="section container-sg" aria-labelledby="agreements">
        <Reveal className="mx-auto max-w-3xl rounded-[24px] border border-line p-7 sm:p-12">
          <p className="eyebrow">Agreements</p>
          <h2 id="agreements" className="display mt-4 text-[clamp(30px,4vw,44px)]">
            Full license text
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-stone-400">
            Coming soon — full agreements for Basic MP3, Premium WAV, Trackout, Unlimited, Exclusive Rights and the loop/sample license.
          </p>
          <div className="mt-8 space-y-3" aria-hidden>
            {[94, 80, 88, 62, 90, 74].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-white/[0.05]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <p className="mt-8 text-[13px] text-mute">
            Summary only — the license agreement delivered with your purchase is the binding document.{" "}
            <Link href="/contact?topic=licensing" className="link-u text-stone-300">
              Questions?
            </Link>
          </p>
        </Reveal>
      </section>
    </>
  );
}
