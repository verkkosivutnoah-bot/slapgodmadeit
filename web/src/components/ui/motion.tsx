"use client";
/**
 * SLAPGOD motion system — one small module. transform + opacity (and clip-path for image reveals) only.
 * ease [0.22, 1, 0.36, 1], 0.5–0.9s, stagger 0.06. Everything renders static under prefers-reduced-motion.
 */
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";

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
      // sides/bottom stay negative so hover lift + glow shadows are never clipped
      initial={{ clipPath: "inset(12% -12% -12% -12% round 24px)", opacity: 0 }}
      whileInView={{ clipPath: "inset(-12% -12% -12% -12% round 24px)", opacity: 1 }}
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

/** Toggles `.is-offscreen` on the element so its (and its children's) CSS animations pause while not visible. */
export function useOffscreenPause<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-offscreen", !e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

const finePointer = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Cursor-follow spotlight: pair with the `.spotlight` class. Writes --mx/--my (desktop fine pointers only). */
export function spotlightMove(e: ReactPointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/** Magnetic pull toward the cursor (desktop fine pointer only, springs back on leave). */
export function Magnetic({ children, className, strength = 0.3 }: { children: ReactNode; className?: string; strength?: number }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      className={`inline-block ${className ?? ""}`}
      style={reduce ? undefined : { x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !finePointer()) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Number that counts up once when scrolled into view. */
export function CountUp({ value, duration = 1.4, className, suffix = "" }: { value: number; duration?: number; className?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  const started = useRef(false);
  useEffect(() => {
    if (reduce || started.current) return;
    if (!inView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setN(0);
      return;
    }
    started.current = true;
    const c = animate(0, value, { duration, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, value, duration]);
  return (
    <span ref={ref} className={className}>
      {n}
      {suffix}
    </span>
  );
}

/** Gradient underline that draws in (scaleX) once in view. */
export function GradUnderline({ className = "", delay = 0.2 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={`grad-underline ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1, ease: EASE, delay }}
    />
  );
}
