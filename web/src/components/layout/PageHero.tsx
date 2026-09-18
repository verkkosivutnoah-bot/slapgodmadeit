import type { ReactNode } from "react";
import { GradUnderline, LineReveal, Rise } from "@/components/ui/motion";

/** Inner-page header: centered serif title revealed by line, muted lead. */
export function PageHero({ eyebrow, title, lines, children }: { eyebrow?: string; title?: ReactNode; lines?: ReactNode[]; children?: ReactNode }) {
  return (
    <section className="relative pb-10 pt-36 text-center md:pb-16 md:pt-48">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(34%_55%_at_36%_0%,rgb(var(--coral-rgb)/0.16),transparent_72%),radial-gradient(34%_55%_at_66%_8%,rgb(var(--lilac-rgb)/0.15),transparent_72%),radial-gradient(24%_35%_at_50%_30%,rgb(var(--amber-rgb)/0.07),transparent_70%)]"
        aria-hidden
      />
      <div className="container-sg flex flex-col items-center">
        {eyebrow && (
          <Rise y={8}>
            <p className="eyebrow mb-5 !text-amber">{eyebrow}</p>
          </Rise>
        )}
        <LineReveal lines={lines ?? [title]} className="display max-w-4xl text-[clamp(40px,7.5vw,76px)] [text-wrap:balance]" delay={0.05} />
        <GradUnderline className="mx-auto mt-6" delay={0.35} />
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
        <div className="mx-auto max-w-3xl rounded-[24px] border border-line bg-[radial-gradient(60%_80%_at_100%_0%,rgb(var(--lilac-rgb)/0.08),transparent_70%)] p-6 sm:p-10">
          {children}
          <div className="mt-8 space-y-3" aria-hidden>
            {[92, 78, 85, 60, 88, 70].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-[linear-gradient(90deg,rgb(var(--coral-rgb)/0.14),rgb(var(--lilac-rgb)/0.1))]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
