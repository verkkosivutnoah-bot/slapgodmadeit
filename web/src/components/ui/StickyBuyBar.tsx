"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { EASE } from "./motion";

/** Mobile-only bottom buy bar. mode "after": shows once `anchor` scrolled above the viewport; "outside": whenever it is off-screen. */
export function StickyBuyBar({ anchor, children, mode = "after" }: { anchor: RefObject<HTMLElement | null>; children: ReactNode; mode?: "after" | "outside" }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && (mode === "outside" || e.boundingClientRect.top < 0)));
    io.observe(el);
    return () => io.disconnect();
  }, [anchor, mode]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="buybar fixed inset-x-3 z-40 md:hidden"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="flex items-center justify-between gap-3 rounded-full border border-line bg-deep py-2 pl-5 pr-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
