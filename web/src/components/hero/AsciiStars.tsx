"use client";
/**
 * "neon citi" ASCII-art effect — renderMode "stars" (see docs/specs/hero-ascii-spec.md).
 *
 * Pipeline
 *  1. On resize: draw source image (cover-fit) into a cols×rows offscreen canvas (2-step downscale ≈ cell average),
 *     getImageData ONCE, apply brightness/contrast, bucket cells by quantized color.
 *  2. Per frame: one Path2D per (color bucket × brightness tier); star size = luminance × pulse wave.
 *  3. Bloom: blit frame into a 1/4-res canvas (+ blur filter where supported) and add it back with 'lighter'.
 *  4. Vignette: cached radial gradient.
 * Perf: DPR 1, capped cell count, adaptive cell size if frames get slow, paused offscreen / hidden tab,
 * static single frame for prefers-reduced-motion.
 *
 * Source: either `scene` (a function returning a canvas — the procedural "Vault" artwork) or
 * `src` (same-origin image URL, e.g. the owner photo "/hero/source.jpg"). `scene` wins if both are set.
 */
import { useEffect, useRef } from "react";

export interface AsciiStarsProps {
  src?: string;
  /** procedural source (called once on mount) */
  scene?: () => HTMLCanvasElement;
  cellSize?: number;
  contrast?: number; // 100 = neutral
  brightness?: number; // -100..100
  vignette?: number; // 0..100
  bloom?: number; // 0..100
  animSpeed?: number; // 0..100+
  animIntensity?: number; // 0..100
  maxCells?: number;
  /** normalized origin of the pulse wave */
  originX?: number;
  originY?: number;
  className?: string;
}

export function AsciiStars({
  src = "/hero/source.jpg",
  scene,
  cellSize = 3,
  contrast = 125,
  brightness = 0,
  vignette = 30,
  bloom = 25,
  animSpeed = 100,
  animIntensity = 60,
  maxCells = 16000,
  originX = 0.5,
  originY = 0.42,
  className = "",
}: AsciiStarsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const origin = [originX, originY] as const;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bloomCanvas = document.createElement("canvas");
    const bctx = bloomCanvas.getContext("2d")!;

    let img: CanvasImageSource | null = null;
    let iw = 0;
    let ih = 0;
    // lighter render on small / touch screens
    const small = window.matchMedia("(max-width: 767px), (hover: none)").matches;
    const cellCap = small ? Math.round(maxCells * 0.5) : maxCells;
    let w = 0;
    let h = 0;
    let cell = cellSize;
    let raf = 0;
    let running = false;
    let visible = true;
    let disposed = false;
    let vignetteFill: CanvasGradient | null = null;

    // per-cell data
    let count = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let lum = new Float32Array(0);
    let dist = new Float32Array(0);
    let bucketOf = new Uint16Array(0);
    let bucketColors: string[] = [];

    // adaptive quality
    let slowFrames = 0;
    let sampleFrames = 0;

    const c = contrast / 100;
    const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

    function sample() {
      if (!img || w === 0 || h === 0) return;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);

      // cover-fit source rect
      const ir = iw / ih;
      const vr = cols / rows;
      let sw = iw;
      let sh = ih;
      if (ir > vr) sw = sh * vr;
      else sh = sw / vr;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      // 2-step downscale approximates per-cell averaging
      const mid = document.createElement("canvas");
      mid.width = cols * 4;
      mid.height = rows * 4;
      const mctx = mid.getContext("2d")!;
      mctx.imageSmoothingQuality = "high";
      mctx.drawImage(img, sx, sy, sw, sh, 0, 0, mid.width, mid.height);
      const small = document.createElement("canvas");
      small.width = cols;
      small.height = rows;
      const sctx = small.getContext("2d", { willReadFrequently: true })!;
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(mid, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      const n = cols * rows;
      const tx = new Float32Array(n);
      const ty = new Float32Array(n);
      const tl = new Float32Array(n);
      const td = new Float32Array(n);
      const tb = new Uint16Array(n);
      const bucketMap = new Map<number, number>();
      const sums: number[][] = [];
      const ox = origin[0] * cols;
      const oy = origin[1] * rows;
      const maxD = Math.hypot(Math.max(ox, cols - ox), Math.max(oy, rows - oy));
      let k = 0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          if (data[i + 3] < 10) continue;
          const r = clamp((data[i] - 128) * c + 128 + brightness * 2.55);
          const g = clamp((data[i + 1] - 128) * c + 128 + brightness * 2.55);
          const b = clamp((data[i + 2] - 128) * c + 128 + brightness * 2.55);
          const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          if (L < 0.07) continue; // bgMode "none": dark cells stay empty
          // quantize color → bucket (6 levels / channel)
          const key = ((r / 51) | 0) * 36 + ((g / 51) | 0) * 6 + ((b / 51) | 0);
          let bi = bucketMap.get(key);
          if (bi === undefined) {
            bi = sums.length;
            bucketMap.set(key, bi);
            sums.push([0, 0, 0, 0]);
          }
          const s = sums[bi];
          s[0] += r;
          s[1] += g;
          s[2] += b;
          s[3]++;
          tx[k] = x * cell + cell / 2;
          ty[k] = y * cell + cell / 2;
          tl[k] = L;
          td[k] = Math.hypot(x - ox, y - oy) / maxD;
          tb[k] = bi;
          k++;
        }
      }
      count = k;
      xs = tx;
      ys = ty;
      lum = tl;
      dist = td;
      bucketOf = tb;
      bucketColors = sums.map(([r, g, b, n2]) => {
        // lift saturation/brightness a touch for the neon look
        const rr = Math.min(255, (r / n2) * 1.15 + 8) | 0;
        const gg = Math.min(255, (g / n2) * 1.15 + 8) | 0;
        const bb = Math.min(255, (b / n2) * 1.15 + 8) | 0;
        return `rgb(${rr},${gg},${bb})`;
      });
    }

    function resize() {
      const rect = wrap!.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas!.width = w; // DPR 1 on purpose
      canvas!.height = h;
      bloomCanvas.width = Math.max(1, Math.round(w / 4));
      bloomCanvas.height = Math.max(1, Math.round(h / 4));
      cell = Math.max(cellSize, Math.ceil(Math.sqrt((w * h) / cellCap)));
      const vr0 = Math.min(w, h) * 0.35;
      const vr1 = Math.hypot(w, h) / 2;
      vignetteFill = ctx!.createRadialGradient(w * origin[0], h * origin[1], vr0, w / 2, h / 2, vr1);
      vignetteFill.addColorStop(0, "rgba(7,6,11,0)");
      vignetteFill.addColorStop(1, `rgba(7,6,11,${Math.min(0.95, (vignette / 100) * 2.6)})`);
      sample();
      if (!running) draw(performance.now());
    }

    function star(p: Path2D, x: number, y: number, s: number) {
      if (s < 1.1) {
        p.rect(x - s, y - s, s * 2, s * 2);
        return;
      }
      const q = s * 0.28;
      p.moveTo(x, y - s);
      p.lineTo(x + q, y - q);
      p.lineTo(x + s, y);
      p.lineTo(x + q, y + q);
      p.lineTo(x, y + s);
      p.lineTo(x - q, y + q);
      p.lineTo(x - s, y);
      p.lineTo(x - q, y - q);
      p.closePath();
    }

    function draw(now: number) {
      const t0 = performance.now();
      const t = reduce ? 0 : (now / 1000) * (animSpeed / 100);
      const intensity = animIntensity / 100;
      ctx!.clearRect(0, 0, w, h);
      if (count === 0) return;

      const nb = bucketColors.length;
      const hi: (Path2D | null)[] = new Array(nb).fill(null);
      const lo: (Path2D | null)[] = new Array(nb).fill(null);
      const base = cell * 0.62;
      const breathe = 0.5 + 0.5 * Math.sin(t * 1.4);

      for (let i = 0; i < count; i++) {
        // pulse: rings radiating outward from origin + gentle global breathing
        const wave = 0.5 + 0.5 * Math.sin(dist[i] * 14 - t * 3.2);
        const p = wave * 0.8 + breathe * 0.2;
        const scale = 1 - intensity * 0.6 + intensity * 0.6 * p * 1.35;
        const L = lum[i];
        const s = base * (0.3 + 0.95 * L) * scale;
        if (s < 0.35) continue;
        const b = bucketOf[i];
        const bright = p > 0.55;
        let path = bright ? hi[b] : lo[b];
        if (!path) {
          path = new Path2D();
          if (bright) hi[b] = path;
          else lo[b] = path;
        }
        star(path, xs[i], ys[i], s);
      }

      for (let b = 0; b < nb; b++) {
        const color = bucketColors[b];
        if (lo[b]) {
          ctx!.globalAlpha = 1 - intensity * 0.45;
          ctx!.fillStyle = color;
          ctx!.fill(lo[b]!);
        }
        if (hi[b]) {
          ctx!.globalAlpha = 1;
          ctx!.fillStyle = color;
          ctx!.fill(hi[b]!);
        }
      }
      ctx!.globalAlpha = 1;

      // bloom (blurred additive pass)
      if (bloom > 0) {
        bctx.clearRect(0, 0, bloomCanvas.width, bloomCanvas.height);
                bctx.drawImage(canvas!, 0, 0, bloomCanvas.width, bloomCanvas.height);
        ctx!.globalCompositeOperation = "lighter";
        ctx!.globalAlpha = Math.min(1, (bloom / 100) * 2.4);
        ctx!.imageSmoothingEnabled = true;
        ctx!.drawImage(bloomCanvas, 0, 0, w, h);
        ctx!.globalAlpha = 1;
        ctx!.globalCompositeOperation = "source-over";
      }

      // vignette
      if (vignette > 0 && vignetteFill) {
        ctx!.fillStyle = vignetteFill;
        ctx!.fillRect(0, 0, w, h);
      }

      // adaptive quality: if we're consistently slow, coarsen the grid
      if (!reduce && running) {
        const ms = performance.now() - t0;
        sampleFrames++;
        if (ms > 12) slowFrames++;
        if (sampleFrames >= 20) {
          if (slowFrames > 10 && cell < 10) {
            cell += 1;
            sample();
          }
          slowFrames = 0;
          sampleFrames = 0;
        }
      }
    }

    // 30fps is plenty for the slow pulse and halves CPU cost
    let lastDraw = 0;
    const loop = (now: number) => {
      if (now - lastDraw >= 32) {
        lastDraw = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce || !visible || disposed) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onSource = (source: CanvasImageSource, width: number, height: number) => {
      if (disposed) return;
      img = source;
      iw = width;
      ih = height;
      resize();
      canvas.dataset.ready = "true";
      if (reduce) draw(0);
      else start();
    };
    if (scene) {
      // defer to next frame so first paint (LCP text) isn't blocked
      requestAnimationFrame(() => {
        const sc = scene();
        onSource(sc, sc.width, sc.height);
      });
    } else {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => onSource(image, image.naturalWidth, image.naturalHeight);
      image.src = src;
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(wrap);
    const onVis = () => (document.hidden ? stop() : visible && start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disposed = true;
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [src, scene, cellSize, contrast, brightness, vignette, bloom, animSpeed, animIntensity, maxCells, originX, originY]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden>
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-[1400ms] data-[ready=true]:opacity-100"
      />
    </div>
  );
}

