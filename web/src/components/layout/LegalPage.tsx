import Link from "next/link";
import type { ReactNode } from "react";
import { PageHero } from "./PageHero";
import { seller } from "@/data/seller";

/** Shared shell for Terms / Privacy / Refunds: hero, table of contents, readable prose. */
export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: ReactNode;
  updated: string;
  sections: { id: string; title: string; body: ReactNode }[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title}>
        {intro}
      </PageHero>
      <div className="container-sg pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-28 space-y-2 text-[13px]">
              <p className="eyebrow mb-3">On this page</p>
              {sections.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="block text-mute transition-colors hover:text-bone">
                  {i + 1}. {s.title}
                </a>
              ))}
            </div>
          </nav>

          <article className="legal max-w-3xl">
            <p className="text-[13px] text-mute">Last updated {updated}</p>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2>
                  {i + 1}. {s.title}
                </h2>
                {s.body}
              </section>
            ))}

            <section id="contact" className="scroll-mt-28">
              <h2>Contact</h2>
              <address className="not-italic">
                {seller.name} ({seller.legalForm})
                <br />
                Business ID {seller.businessId}
                <br />
                {seller.postalCode} {seller.city}, {seller.country}
                <br />
                {seller.email}
              </address>
              <p>
                Or use the <Link href="/contact">contact form</Link>.
              </p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
