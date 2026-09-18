import type { ReactNode } from "react";
import { LineReveal, Rise } from "@/components/ui/motion";

/** Inner-page header: centered serif title revealed by line, muted lead. */
export function PageHero({ eyebrow, title, lines, children }: { eyebrow?: string; title?: ReactNode; lines?: ReactNode[]; children?: ReactNode }) {
  return (
    <section className="relative pb-10 pt-36 text-center md:pb-16 md:pt-48">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(40%_60%_at_50%_0%,rgb(255_255_255/0.06),transparent_70%)]"
        aria-hidden
      />
      <div className="container-sg flex flex-col items-center">
        {eyebrow && (
          <Rise y={8}>
            <p className="eyebrow mb-5">{eyebrow}</p>
          </Rise>
        )}
        <LineReveal lines={lines ?? [title]} className="display max-w-4xl text-[clamp(40px,7.5vw,76px)] [text-wrap:balance]" delay={0.05} />
        {children && (
          <Rise delay={0.25} className="mt-5 max-w-xl text-[16px] leading-relaxed text-stone-400 [text-wrap:balance]">
            {children}
          </Rise>
        )}
      </div>
    </section>
  );
}

export function StubPage({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title}>
        Content coming soon.
      </PageHero>
      <div className="container-sg">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-line p-6 sm:p-10">
          {children}
          <div className="mt-8 space-y-3" aria-hidden>
            {[92, 78, 85, 60, 88, 70].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-white/[0.05]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
