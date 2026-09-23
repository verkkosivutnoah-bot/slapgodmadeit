"use client";
/**
 * Horizontal card row that works with every input:
 *  - touch: native swipe with snap
 *  - mouse: prev/next arrow buttons, click-and-drag, and a visible thin scrollbar
 *  - keyboard: focusable region, arrow keys scroll
 * Arrows only appear when there's something to scroll to; edges fade to hint at more.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export function ScrollRow({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    el.addEventListener("scrollend", measure); // final position after smooth scroll / snap
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      el.removeEventListener("scrollend", measure);
      ro.disconnect();
    };
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className={`scroll-row-wrap relative ${className}`} data-start={edges.start} data-end={edges.end}>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="scroll-row"
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = ref.current;
          if (!d || !el) return;
          const dx = e.clientX - d.x;
          if (!d.moved && Math.abs(dx) > 6) {
            d.moved = true;
            el.classList.add("is-dragging");
            el.setPointerCapture(e.pointerId);
          }
          if (d.moved) el.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          if (drag.current?.moved) ref.current?.classList.remove("is-dragging");
          drag.current = null;
        }}
        onPointerCancel={() => {
          ref.current?.classList.remove("is-dragging");
          drag.current = null;
        }}
      >
        {children}
      </div>

      {!edges.start && (
        <button type="button" onClick={() => page(-1)} className="scroll-row-btn left-2" aria-label="Scroll left">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {!edges.end && (
        <button type="button" onClick={() => page(1)} className="scroll-row-btn right-2" aria-label="Scroll right">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
