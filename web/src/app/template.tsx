"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Page transition: quick cross-fade (opacity only, no layout shift). */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.24, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
