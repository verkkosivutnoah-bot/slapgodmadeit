"use client";
import { useRef, type ReactNode } from "react";

/** Horizontal scroll-snap row. Touch = native swipe; mouse = click-drag (pointer events, no scroll listeners). */
export function DragScroll({ children, className = "", label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      className={`snap-x-row cursor-grab ${className}`}
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
        const el = ref.current;
        if (drag.current?.moved && el) {
          el.classList.remove("is-dragging");
          // let snap settle on the nearest card
          el.scrollBy({ left: 1, behavior: "smooth" });
        }
        drag.current = null;
      }}
      onPointerCancel={() => {
        ref.current?.classList.remove("is-dragging");
        drag.current = null;
      }}
    >
      {children}
    </div>
  );
}
