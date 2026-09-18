"use client";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE, useOffscreenPause } from "@/components/ui/motion";

/** Giant gradient wordmark that rises into view once; its gradient drifts slowly (paused offscreen). */
export function FooterWordmark() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useOffscreenPause(ref);
  return (
    <div ref={ref} aria-hidden className="overflow-hidden">
      <motion.p
        className="display pointer-events-none -mb-[0.22em] select-none whitespace-nowrap text-center text-[18.5vw] leading-[0.9]"
        initial={reduce ? false : { y: "35%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -5% 0px" }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <span className="wordmark-grad">SLAPGOD</span>
      </motion.p>
    </div>
  );
}
