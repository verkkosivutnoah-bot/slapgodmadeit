"use client";
/**
 * SLAPGOD motion system — one small module. transform + opacity (and clip-path for image reveals) only.
 * ease [0.22, 1, 0.36, 1], 0.5–0.9s, stagger 0.06. Everything renders static under prefers-reduced-motion.
 */
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

type Tag = "div" | "section" | "li" | "article" | "header" | "ul" | "p" | "span";

/** Fade-up once when entering the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: Tag;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as React.ComponentType<HTMLMotionProps<"div">>;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

export function Stagger({ children, className, stagger = 0.06, as = "div" }: { children: ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as React.ComponentType<HTMLMotionProps<"div">>;
  return (
    <Comp
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = motion[as] as React.ComponentType<HTMLMotionProps<"div">>;
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </Comp>
  );
}

/** Image frame reveal: clip-path opens from the bottom while the image settles from 1.06 → 1. */
export function RevealImage({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(12% 0% 0% 0% round 24px)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)", opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Headline that reveals line-by-line (mask slide-up per line). Pass each line as an array item. */
export function LineReveal({
  lines,
  className,
  as = "h1",
  id,
  delay = 0,
  inView = false,
}: {
  lines: ReactNode[];
  className?: string;
  as?: "h1" | "h2";
  id?: string;
  delay?: number;
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = as;
  return (
    <Tag id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "105%" }}
            {...(inView ? { whileInView: { y: "0%" }, viewport: VIEWPORT } : { animate: { y: "0%" } })}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Rise-in on mount (not scroll-linked). */
export function Rise({ children, className, delay = 0, y = 16 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}
