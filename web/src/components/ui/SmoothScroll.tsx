"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling (disabled for prefers-reduced-motion). Native scroll stays the source of truth,
 *  so motion's useScroll / IntersectionObserver keep working. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    // touch devices keep native momentum scrolling (no Lenis at all)
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // jump to top on route change (no smooth scroll across pages)
  useEffect(() => {
    if (window.location.hash) return;
    window.__lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}

export const scrollLock = {
  count: 0,
  lock() {
    this.count++;
    window.__lenis?.stop();
    document.body.dataset.dialogOpen = "true";
    document.documentElement.style.overflow = "hidden"; // native (touch) scroll lock
  },
  unlock() {
    this.count = Math.max(0, this.count - 1);
    if (this.count > 0) return;
    window.__lenis?.start();
    delete document.body.dataset.dialogOpen;
    document.documentElement.style.overflow = "";
  },
};
