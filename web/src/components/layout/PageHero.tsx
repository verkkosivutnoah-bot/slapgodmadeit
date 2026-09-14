"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Inner-page header with parallax title + ghost word. */
export function PageHero({ eyebrow, title, ghost, children }: { eyebrow: string; title: ReactNode; ghost?: string; children?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const gx = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-32 md:pb-16 md:pt-44">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_80%_0%,rgb(var(--gold-rgb)/0.14),transparent_60%),radial-gradient(50%_60%_at_0%_20%,rgb(var(--violet-rgb)/0.1),transparent_60%)]" />
      {ghost && (
        <motion.p
          aria-hidden
          className="display pointer-events-none absolute left-0 top-20 select-none whitespace-nowrap text-[30vw] leading-none text-bone/[0.03]"
          style={reduce ? undefined : { x: gx }}
        >
          {ghost}
        </motion.p>
      )}
      <motion.div className="container-sg relative" style={reduce ? undefined : { y, opacity }}>
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          <span className="text-ember">✦</span> {eyebrow}
        </motion.p>
        <motion.h1
          className="display mt-4 text-[17vw] sm:text-8xl md:text-[140px]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.05 }}
        >
          {title}
        </motion.h1>
        {children && (
          <motion.div
            className="mt-5 max-w-2xl text-lg text-mute"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export function StubPage({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} ghost={title.toUpperCase()}>
        Content coming soon.
      </PageHero>
      <div className="container-sg">
        <div className="panel max-w-3xl p-6 sm:p-10">
          {children}
          <div className="mt-8 space-y-3" aria-hidden>
            {[92, 78, 85, 60, 88, 70].map((w, i) => (
              <div key={i} className="h-3 rounded-full bg-bone/[0.06]" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
