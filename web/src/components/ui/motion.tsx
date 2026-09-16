"use client";
// Calm motion primitives: only gentle fade/slide-up reveals.
// Magnetic / Tilt / Parallax are kept as plain wrappers so call sites stay simple (no hover physics).
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

export function Stagger({
  children,
  className,
  stagger = 0.05,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </Comp>
  );
}

export function Parallax({ children, className, style }: { children: ReactNode; offset?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function Magnetic({ children, className }: { children: ReactNode; strength?: number; className?: string }) {
  return <div className={`inline-block ${className ?? ""}`}>{children}</div>;
}

export function Tilt({ children, className }: { children: ReactNode; className?: string; max?: number }) {
  return <div className={`relative ${className ?? ""}`}>{children}</div>;
}
