"use client";
// Foreground dust motes drifting through the light. Small canvas, capped DPR, paused offscreen.
import { useEffect, useRef } from "react";

const COLORS = ["243,235,221", "242,181,68", "255,75,43"];

export function DustMotes({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px), (hover: none)").matches;
    const count = small ? 22 : 64;
    const dpr = Math.min(small ? 1 : 1.5, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();

    const parts = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.8,
      vy: 0.004 + Math.random() * 0.014,
      phase: Math.random() * Math.PI * 2,
      tw: 0.6 + Math.random() * 1.6,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      depth: 0.4 + Math.random() * 0.6,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw(0, performance.now());
    };

    function draw(dt: number, now: number) {
      ctx!.clearRect(0, 0, w, h);
      const t = now / 1000;
      for (const p of parts) {
        p.y -= p.vy * dt * p.depth;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        const x = (p.x + Math.sin(t * 0.3 + p.phase) * 0.012) * w;
        const y = p.y * h;
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * p.tw + p.phase));
        ctx!.beginPath();
        ctx!.arc(x, y, p.r * p.depth * 1.3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.c},${a})`;
        ctx!.fill();
      }
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt, now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
