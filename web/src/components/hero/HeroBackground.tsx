"use client";
/**
 * SLAPGOD hero background — a slow, seamlessly looping liquid/aurora field.
 *
 * One full-screen triangle + a single GLSL fragment shader (three, no post-processing).
 * Domain-warped fBm paints smoky coral → orange → amber → lilac ribbons over the warm
 * near-black base, with a vertical falloff (darkest at the bottom, where the copy sits),
 * a gentle vignette and cheap in-shader film grain.
 *
 * SEAMLESS LOOP: all motion is driven by `uTheta` (0 → 2π over LOOP_SECONDS) and only ever
 * enters the shader through sin/cos of integer multiples of it, so frame 0 and frame P are
 * identical — no visible restart. Change LOOP_SECONDS to change the speed.
 *
 * PERF (see README-DESIGN.md): ≤30fps, 0.75× internal resolution, DPR capped at 1.25/1,
 * paused offscreen and while the tab is hidden, single static frame under prefers-reduced-motion,
 * skipped entirely without WebGL or on ≤4-core machines.
 */
import { useEffect, useRef, useState } from "react";

/** Loop period in seconds — the animation repeats exactly every LOOP_SECONDS. */
const LOOP_SECONDS = 48;
/** Frame cap. The motion is slow; 30fps looks identical to 60 and halves GPU cost. */
const FPS = 30;
/** Internal render scale (canvas is CSS-upscaled). Lower = cheaper, shader tolerates it. */
const RENDER_SCALE = 0.75;
const MAX_DPR_DESKTOP = 1.25;
const MAX_DPR_MOBILE = 1;

const VERT = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTheta;      // 0..2PI, one full loop
uniform float uSeed;       // grain seed (does not need to loop)
uniform vec2 uPointer;     // pointer in uv space
uniform float uPointerAmt; // 0 on touch / when the pointer left
uniform vec3 uInk;
uniform vec3 uCoral;
uniform vec3 uOrange;
uniform vec3 uAmber;
uniform vec3 uLilac;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic — no visible cell facets
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 4 octaves — smooth, smoky, still cheap.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

  // --- looping time offsets: sin/cos of theta and 2*theta only ---
  vec2 t1 = vec2(cos(uTheta), sin(uTheta)) * 0.55;
  vec2 t2 = vec2(cos(uTheta * 2.0 + 1.7), sin(uTheta * 2.0 + 1.7)) * 0.3;

  // pointer warp/brighten (desktop only; uPointerAmt is 0 otherwise)
  vec2 pp = vec2((uPointer.x - 0.5) * aspect, uPointer.y - 0.5);
  float pd = length(p - pp);
  float cursor = exp(-pd * pd * 7.0) * uPointerAmt;

  // very subtle "sound wave" horizontal displacement (period divides the loop)
  vec2 sp = p * 3.4;
  sp.x += 0.05 * sin(p.y * 7.0 + uTheta * 2.0) + cursor * 0.12;

  // --- domain-warped fBm ---
  vec2 q = vec2(fbm(sp + t1), fbm(sp + vec2(4.3, 1.9) + t1));
  float f = fbm(sp + 2.6 * q + t2);

  float ribbon = smoothstep(0.2, 0.86, f + 0.26 * q.x);

  // --- color ramp: coral → orange → amber → lilac ---
  // a spatial bias (warm at the lower left, cool at the upper right) guarantees the
  // whole palette is on screen instead of collapsing into one hue.
  float g = clamp(f * 0.9 + q.y * 0.4 + uv.x * 0.42 + uv.y * 0.3 - 0.26, 0.0, 1.0);
  vec3 col = mix(uCoral, uOrange, smoothstep(0.0, 0.38, g));
  col = mix(col, uAmber, smoothstep(0.3, 0.62, g));
  col = mix(col, uLilac, smoothstep(0.55, 1.0, g));

  // --- shaping: dark at the bottom (copy sits there), vignette, cursor lift ---
  float vert = smoothstep(-0.05, 0.92, uv.y);
  vert *= vert;
  vec2 d = (uv - 0.5) * vec2(1.15, 1.0);
  float vignette = 1.0 - smoothstep(0.32, 0.82, length(d));

  // keep the middle column calm so the serif headline / search pill always read
  vec2 cd = (uv - vec2(0.5, 0.78)) * vec2(1.0, 1.7);
  float copyGuard = 1.0 - 0.5 * exp(-dot(cd, cd) * 4.0);

  float intensity = ribbon * vert * vignette * copyGuard * 0.5 + cursor * 0.1 * vignette;
  intensity = clamp(intensity, 0.0, 1.0);

  vec3 outCol = uInk + col * intensity;

  // --- film grain (cheap hash, low amplitude) ---
  float grain = hash21(frag + uSeed) - 0.5;
  outCol += grain * 0.022;

  gl_FragColor = vec4(outCol, 1.0);
}
`;

function readRGB(styles: CSSStyleDeclaration, name: string, fallback: [number, number, number]) {
  const raw = styles.getPropertyValue(name).trim();
  const parts = raw.split(/[\s,]+/).map(Number);
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return fallback.map((n) => n / 255) as [number, number, number];
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255] as [number, number, number];
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Very low-power / no-WebGL machines keep the CSS gradient fallback (<= 2 cores).
    // `?shader=force` overrides the core-count check (debugging on low-core machines / VMs).
    const forced = typeof location !== "undefined" && location.search.includes("shader=force");
    const cores = navigator.hardwareConcurrency ?? 8;
    if ((cores <= 2 && !forced) || !hasWebGL()) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("three")
      .then((THREE) => {
        if (disposed || !canvas.isConnected) return;

        let renderer: import("three").WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power", depth: false, stencil: false });
        } catch {
          return;
        }

        const styles = getComputedStyle(document.documentElement);
        const uniforms = {
          uRes: { value: new THREE.Vector2(1, 1) },
          uTheta: { value: 0 },
          uSeed: { value: 0 },
          uPointer: { value: new THREE.Vector2(0.5, 0.7) },
          uPointerAmt: { value: 0 },
          uInk: { value: new THREE.Vector3(...readRGB(styles, "--ink-rgb", [28, 25, 23])) },
          uCoral: { value: new THREE.Vector3(...readRGB(styles, "--coral-rgb", [255, 90, 60])) },
          uOrange: { value: new THREE.Vector3(...readRGB(styles, "--orange-rgb", [255, 138, 61])) },
          uAmber: { value: new THREE.Vector3(...readRGB(styles, "--amber-rgb", [255, 181, 71])) },
          uLilac: { value: new THREE.Vector3(...readRGB(styles, "--lilac-rgb", [169, 139, 255])) },
        };

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
        const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        const scene = new THREE.Scene().add(mesh);
        const camera = new THREE.Camera();

        const mobile = window.matchMedia("(max-width: 767px)").matches;
        const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dpr = Math.min(window.devicePixelRatio || 1, mobile ? MAX_DPR_MOBILE : MAX_DPR_DESKTOP) * RENDER_SCALE;

        function resize() {
          const w = canvas!.clientWidth || window.innerWidth;
          const h = canvas!.clientHeight || window.innerHeight;
          renderer.setPixelRatio(dpr);
          renderer.setSize(w, h, false);
          uniforms.uRes.value.set(w * dpr, h * dpr);
        }
        resize();

        function draw() {
          renderer.render(scene, camera);
        }

        // ---- pointer (desktop only) ----
        const target = { x: 0.5, y: 0.7, amt: 0 };
        function onPointerMove(e: PointerEvent) {
          if (e.pointerType !== "mouse") return;
          const r = canvas!.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = 1 - (e.clientY - r.top) / r.height;
          const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
          target.amt = inside ? 1 : 0;
          if (inside) {
            target.x = x;
            target.y = y;
          }
        }
        if (finePointer && !reduce) window.addEventListener("pointermove", onPointerMove, { passive: true });

        // ---- static single frame under prefers-reduced-motion ----
        if (reduce) {
          uniforms.uTheta.value = 1.1;
          uniforms.uSeed.value = 17;
          draw();
          setReady(true);
          cleanup = () => {
            window.removeEventListener("pointermove", onPointerMove);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
          };
          return;
        }

        // ---- animation loop: 30fps cap, paused offscreen / hidden ----
        let raf = 0;
        let running = false;
        let visible = true;
        let onScreen = true;
        let elapsed = 0;
        let last = 0;
        const step = 1000 / FPS;
        let acc = 0;

        function frame(now: number) {
          raf = requestAnimationFrame(frame);
          const dt = Math.min(now - last, 100);
          last = now;
          acc += dt;
          if (acc < step) return;
          elapsed = (elapsed + acc) % (LOOP_SECONDS * 1000);
          acc = 0;

          uniforms.uTheta.value = (elapsed / (LOOP_SECONDS * 1000)) * Math.PI * 2;
          uniforms.uSeed.value = (uniforms.uSeed.value + 13.7) % 1000;
          const k = 0.08;
          uniforms.uPointer.value.x += (target.x - uniforms.uPointer.value.x) * k;
          uniforms.uPointer.value.y += (target.y - uniforms.uPointer.value.y) * k;
          uniforms.uPointerAmt.value += (target.amt - uniforms.uPointerAmt.value) * k;
          draw();
        }

        function start() {
          if (running || !visible || !onScreen) return;
          running = true;
          last = performance.now();
          acc = step;
          raf = requestAnimationFrame(frame);
        }
        function stop() {
          if (!running) return;
          running = false;
          cancelAnimationFrame(raf);
        }

        const io = new IntersectionObserver(
          ([entry]) => {
            onScreen = entry.isIntersecting;
            if (onScreen) start();
            else stop();
          },
          { rootMargin: "60px" },
        );
        io.observe(canvas);

        function onVisibility() {
          visible = !document.hidden;
          if (visible) start();
          else stop();
        }
        document.addEventListener("visibilitychange", onVisibility);

        const onResize = () => {
          resize();
          if (!running) draw();
        };
        window.addEventListener("resize", onResize, { passive: true });

        function onContextLost(e: Event) {
          e.preventDefault();
          stop();
        }
        function onContextRestored() {
          resize();
          start();
        }
        canvas!.addEventListener("webglcontextlost", onContextLost);
        canvas!.addEventListener("webglcontextrestored", onContextRestored);

        draw();
        setReady(true);
        start();

        cleanup = () => {
          stop();
          io.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
          window.removeEventListener("resize", onResize);
          window.removeEventListener("pointermove", onPointerMove);
          canvas!.removeEventListener("webglcontextlost", onContextLost);
          canvas!.removeEventListener("webglcontextrestored", onContextRestored);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
        };
      })
      .catch(() => {
        /* keep the CSS gradient fallback */
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-[800ms] ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
