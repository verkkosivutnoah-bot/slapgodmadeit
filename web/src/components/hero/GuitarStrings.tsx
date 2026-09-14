"use client";
// Six SVG strings laid exactly over the procedural guitar (same 1600×1000 cover-fit space as the
// AsciiStars canvas). Hover / touch plucks a string: damped sine vibration. Visual only — no sound.
import { useEffect, useRef } from "react";
import { useMemo } from "react";
import { SCENE_H, SCENE_W, stringLines, type SceneLayout } from "./vaultScene";

export function GuitarStrings({ className = "", layout = "wide" }: { className?: string; layout?: SceneLayout }) {
  const LINES = useMemo(() => stringLines(layout), [layout]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const state = useRef(Array.from({ length: 6 }, () => ({ amp: 0, t0: 0, lastPluck: 0 })));
  const raf = useRef(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const pathFor = (i: number, off: number) => {
    const [x1, y1, x2, y2] = LINES[i];
    const mx = x1 + (x2 - x1) * 0.42;
    const my = y1 + (y2 - y1) * 0.42;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + nx * off).toFixed(1)} ${(my + ny * off).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };

  const tick = (now: number) => {
    let active = false;
    state.current.forEach((s, i) => {
      if (s.amp <= 0) return;
      const t = (now - s.t0) / 1000;
      const env = Math.exp(-t * 3.2);
      const off = s.amp * env * Math.sin(t * (46 + i * 7));
      if (env < 0.02) {
        s.amp = 0;
        pathRefs.current[i]?.setAttribute("d", pathFor(i, 0));
        glowRefs.current[i]?.setAttribute("opacity", "0");
        return;
      }
      active = true;
      const d = pathFor(i, off);
      pathRefs.current[i]?.setAttribute("d", d);
      glowRefs.current[i]?.setAttribute("d", d);
      glowRefs.current[i]?.setAttribute("opacity", String(Math.min(0.9, env)));
    });
    raf.current = active ? requestAnimationFrame(tick) : 0;
  };

  const pluck = (i: number, strength = 1) => {
    if (reduce.current) return;
    const now = performance.now();
    const s = state.current[i];
    if (now - s.lastPluck < 120) return;
    s.lastPluck = now;
    s.amp = 9 * strength;
    s.t0 = now;
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <filter id="string-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {LINES.map((_, i) => (
        <g key={i}>
          <path
            ref={(el) => {
              glowRefs.current[i] = el;
            }}
            d={pathFor(i, 0)}
            fill="none"
            stroke="var(--color-ember)"
            strokeWidth={5}
            opacity={0}
            filter="url(#string-glow)"
            style={{ stroke: "var(--color-gold)" }}
          />
          <path
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={pathFor(i, 0)}
            fill="none"
            strokeWidth={1.6 + (5 - i) * 0.25}
            style={{ stroke: "rgb(var(--bone-rgb) / 0.7)" }}
          />
          {/* wide invisible hit area */}
          <path
            d={pathFor(i, 0)}
            fill="none"
            stroke="transparent"
            strokeWidth={16}
            style={{ pointerEvents: "stroke", cursor: "grab" }}
            onPointerEnter={() => pluck(i)}
            onPointerDown={() => pluck(i, 1.4)}
          />
        </g>
      ))}
    </svg>
  );
}
