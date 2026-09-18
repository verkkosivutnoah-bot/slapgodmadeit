"use client";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/ui/motion";

/** Giant faded wordmark that rises into view once. */
export function FooterWordmark() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="overflow-hidden">
      <motion.p
        className="display pointer-events-none -mb-[0.22em] select-none whitespace-nowrap text-center text-[18.5vw] leading-[0.9] text-[#292524]"
        initial={reduce ? false : { y: "35%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -5% 0px" }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        SLAPGOD
      </motion.p>
    </div>
  );
}
