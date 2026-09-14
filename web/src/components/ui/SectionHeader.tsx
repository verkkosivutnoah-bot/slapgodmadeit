"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

/** Section header with a parallax ghost word behind the title. */
export function SectionHeader({
  eyebrow,
  title,
  ghost,
  children,
  action,
  id,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  ghost?: string;
  children?: ReactNode;
  action?: ReactNode;
  id?: string;
  align?: "left" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div ref={ref} className={`relative mb-10 md:mb-14 ${align === "center" ? "text-center" : ""}`}>
      {ghost && (
        <motion.p
          aria-hidden
          className="display pointer-events-none absolute -top-8 left-0 select-none whitespace-nowrap text-[18vw] leading-none text-bone/[0.035] md:-top-14 md:text-[13vw]"
          style={reduce ? undefined : { x }}
        >
          {ghost}
        </motion.p>
      )}
      <motion.div
        className={`relative flex flex-col gap-6 ${align === "center" ? "items-center" : "md:flex-row md:items-end md:justify-between"}`}
        style={reduce ? undefined : { y }}
      >
        <div className={align === "center" ? "max-w-3xl" : "max-w-3xl"}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-ember">✦</span> {eyebrow}
          </motion.p>
          <motion.h2
            id={id}
            className="display mt-3 text-[13vw] sm:text-7xl md:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {title}
          </motion.h2>
          {children && (
            <motion.div
              className="mt-4 max-w-xl text-[15px] leading-relaxed text-mute md:text-base"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              {children}
            </motion.div>
          )}
        </div>
        {action}
      </motion.div>
    </div>
  );
}
