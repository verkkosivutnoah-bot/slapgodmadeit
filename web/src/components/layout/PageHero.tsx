import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/motion";

/** Inner-page header: centered serif title, calm spacing. */
export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; ghost?: string; children?: ReactNode }) {
  return (
    <section className="pb-12 pt-36 text-center md:pb-16 md:pt-44">
      <Reveal className="container-sg flex flex-col items-center">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-[clamp(40px,8vw,66px)]">{title}</h1>
        {children && <div className="mt-5 max-w-xl text-[16px] leading-relaxed text-stone-300">{children}</div>}
      </Reveal>
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
        <div className="panel mx-auto max-w-3xl p-6 sm:p-10">
          {children}
          <div className="mt-8 space-y-3" aria-hidden>
            {[92, 78, 85, 60, 88, 70].map((w, i) => (
              <div key={i} className="h-2.5 rounded-full bg-white/[0.05]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
