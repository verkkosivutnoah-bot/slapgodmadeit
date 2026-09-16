"use client";
// Native scrolling (Lenis removed for performance). Handles scroll-to-top on route change + a shared scroll lock.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const scrollLock = {
  count: 0,
  lock() {
    this.count++;
    document.body.dataset.dialogOpen = "true";
    document.documentElement.style.overflow = "hidden";
  },
  unlock() {
    this.count = Math.max(0, this.count - 1);
    if (this.count > 0) return;
    delete document.body.dataset.dialogOpen;
    document.documentElement.style.overflow = "";
  },
};
