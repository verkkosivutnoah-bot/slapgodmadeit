"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Page transition: re-mounts per route, so every navigation fades/lifts the new page in. */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
