// "The Vault" — original hero source artwork, drawn procedurally on an offscreen canvas.
// A Spanish guitar floating at an angle in front of a setting sun, framed by an Andalusian
// horseshoe arch. High contrast on black so the AsciiStars renderer reads it well.
// Geometry is exported so the SVG string overlay can line up exactly (same 1600×1000 space).

export const SCENE_W = 1600;
export const SCENE_H = 1000;

export const SUN = { x: 800, y: 390, r: 270 };
export const ARCH = { x: 800, y: 370, r: 410, spread: 24 }; // spread = degrees below horizontal

export type SceneLayout = "wide" | "tall";
/** guitar placement per layout: local origin = waist. "tall" keeps the guitar centred for portrait crops. */
export const GUITARS: Record<SceneLayout, { x: number; y: number; angle: number; scale: number }> = {
  wide: { x: 1080, y: 420, angle: -46, scale: 0.66 },
  tall: { x: 800, y: 350, angle: -14, scale: 0.4 },
};
let GUITAR = GUITARS.wide;

const NUT_Y = -560;
const SADDLE_Y = 212;

/** local → scene coords */
export function toScene(x: number, y: number): [number, number] {
  const a = (GUITAR.angle * Math.PI) / 180;
  const s = GUITAR.scale;
  return [GUITAR.x + s * (x * Math.cos(a) - y * Math.sin(a)), GUITAR.y + s * (x * Math.sin(a) + y * Math.cos(a))];
}

/** 6 strings as [x1, y1, x2, y2] in scene coords (saddle → nut) */
export function stringLines(layout: SceneLayout = "wide"): [number, number, number, number][] {
  GUITAR = GUITARS[layout];
  return Array.from({ length: 6 }, (_, i) => {
    const t = i / 5 - 0.5;
    const [x1, y1] = toScene(t * 36, SADDLE_Y);
    const [x2, y2] = toScene(t * 26, NUT_Y);
    return [x1, y1, x2, y2];
  });
}

function horseshoePath(ctx: CanvasRenderingContext2D | Path2D, r: number) {
  const sp = (ARCH.spread * Math.PI) / 180;
  const a0 = Math.PI - -sp; // left, slightly below centre
  const a1 = Math.PI * 2 + -sp + Math.PI * 0; // right
  const lx = ARCH.x + r * Math.cos(Math.PI + sp);
  const ly = ARCH.y - r * Math.sin(Math.PI + sp);
  ctx.moveTo(lx, SCENE_H + 10);
  ctx.lineTo(lx, ly);
  ctx.arc(ARCH.x, ARCH.y, r, Math.PI - sp, Math.PI * 2 + sp, false);
  const rx = ARCH.x + r * Math.cos(sp);
  ctx.lineTo(rx, SCENE_H + 10);
  void a0;
  void a1;
}

export function drawVaultScene(layout: SceneLayout = "wide"): HTMLCanvasElement {
  GUITAR = GUITARS[layout];
  const c = document.createElement("canvas");
  c.width = SCENE_W;
  c.height = SCENE_H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, SCENE_W, SCENE_H);

  /* ---------------- arch voussoirs (alternating wedges, Córdoba style) */
  const sp = (ARCH.spread * Math.PI) / 180;
  const wedges = 34;
  const startA = Math.PI - sp;
  const endA = Math.PI * 2 + sp;
  for (let i = 0; i < wedges; i++) {
    const a0 = startA + ((endA - startA) * i) / wedges;
    const a1 = startA + ((endA - startA) * (i + 1)) / wedges;
    g.beginPath();
    g.arc(ARCH.x, ARCH.y, ARCH.r + 78, a0, a1);
    g.arc(ARCH.x, ARCH.y, ARCH.r + 8, a1, a0, true);
    g.closePath();
    const lit = 1 - Math.abs((a0 + a1) / 2 - Math.PI * 1.5) / (Math.PI * 0.75); // brighter at top
    g.fillStyle = i % 2 ? `rgba(242,181,68,${0.25 + lit * 0.55})` : `rgba(120,22,34,${0.5 + lit * 0.4})`;
    g.fill();
  }
  // jamb pilasters
  for (const side of [-1, 1]) {
    const x = ARCH.x + side * (ARCH.r + 40) * Math.cos(sp);
    const y0 = ARCH.y + (ARCH.r + 40) * Math.sin(sp);
    const grad = g.createLinearGradient(0, y0, 0, SCENE_H);
    grad.addColorStop(0, "rgba(242,181,68,.55)");
    grad.addColorStop(1, "rgba(92,15,28,.15)");
    g.fillStyle = grad;
    g.fillRect(x - 34, y0, 68, SCENE_H - y0);
  }

  /* ---------------- inside the arch: sky + setting sun */
  g.save();
  g.beginPath();
  horseshoePath(g, ARCH.r);
  g.closePath();
  g.clip();

  const sky = g.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, "#1a0a1e");
  sky.addColorStop(0.55, "#4a0f1c");
  sky.addColorStop(1, "#120608");
  g.fillStyle = sky;
  g.fillRect(0, 0, SCENE_W, SCENE_H);

  // corona
  const corona = g.createRadialGradient(SUN.x, SUN.y, SUN.r * 0.9, SUN.x, SUN.y, SUN.r * 1.7);
  corona.addColorStop(0, "rgba(255,120,60,.55)");
  corona.addColorStop(1, "rgba(255,75,43,0)");
  g.fillStyle = corona;
  g.fillRect(0, 0, SCENE_W, SCENE_H);

  // sun disc with horizon bands
  const sun = g.createLinearGradient(0, SUN.y - SUN.r, 0, SUN.y + SUN.r);
  sun.addColorStop(0, "#FFE3A0");
  sun.addColorStop(0.35, "#F2B544");
  sun.addColorStop(0.7, "#FF4B2B");
  sun.addColorStop(1, "#7a1424");
  g.fillStyle = sun;
  g.beginPath();
  g.arc(SUN.x, SUN.y, SUN.r, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 9; i++) {
    const y = SUN.y + 30 + i * i * 4.2 + i * 18;
    g.fillRect(SUN.x - SUN.r, y, SUN.r * 2, 3 + i * 1.6);
  }
  g.globalCompositeOperation = "source-over";

  // violet dusk on the far side
  const dusk = g.createRadialGradient(1150, 250, 0, 1150, 250, 420);
  dusk.addColorStop(0, "rgba(140,108,255,.35)");
  dusk.addColorStop(1, "rgba(140,108,255,0)");
  g.fillStyle = dusk;
  g.fillRect(0, 0, SCENE_W, SCENE_H);

  // horizon haze
  const haze = g.createLinearGradient(0, 640, 0, 1000);
  haze.addColorStop(0, "rgba(255,120,70,0)");
  haze.addColorStop(0.4, "rgba(255,120,70,.25)");
  haze.addColorStop(1, "rgba(20,6,8,1)");
  g.fillStyle = haze;
  g.fillRect(0, 600, SCENE_W, 400);
  g.restore();

  // arch inner rim light
  g.beginPath();
  horseshoePath(g, ARCH.r);
  const rim = g.createLinearGradient(ARCH.x - ARCH.r, 0, ARCH.x + ARCH.r, 0);
  rim.addColorStop(0, "#F2B544");
  rim.addColorStop(0.5, "#FFE3A0");
  rim.addColorStop(1, "#8C6CFF");
  g.strokeStyle = rim;
  g.lineWidth = 10;
  g.stroke();

  /* ---------------- guitar */
  g.save();
  g.translate(GUITAR.x, GUITAR.y);
  g.rotate((GUITAR.angle * Math.PI) / 180);
  g.scale(GUITAR.scale, GUITAR.scale);

  // drop shadow
  g.save();
  g.translate(40, 60);
  g.fillStyle = "rgba(0,0,0,.65)";
  bodyPath(g);
  g.fill();
  g.restore();

  // neck
  const neck = g.createLinearGradient(-30, 0, 30, 0);
  neck.addColorStop(0, "#f2b544");
  neck.addColorStop(0.25, "#7a3418");
  neck.addColorStop(1, "#3a130c");
  g.fillStyle = neck;
  g.beginPath();
  g.moveTo(-30, -60);
  g.lineTo(-23, NUT_Y);
  g.lineTo(23, NUT_Y);
  g.lineTo(30, -60);
  g.closePath();
  g.fill();
  // frets
  g.strokeStyle = "rgba(255,227,160,.8)";
  g.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const y = NUT_Y + 30 + i * (34 - i * 0.9);
    const w = 23 + ((y - NUT_Y) / (-60 - NUT_Y)) * 7;
    g.beginPath();
    g.moveTo(-w, y);
    g.lineTo(w, y);
    g.stroke();
  }

  // headstock (slotted classical)
  const head = g.createLinearGradient(-45, 0, 45, 0);
  head.addColorStop(0, "#F2B544");
  head.addColorStop(0.3, "#8a3a1a");
  head.addColorStop(1, "#2a0d08");
  g.fillStyle = head;
  g.beginPath();
  g.moveTo(-25, NUT_Y);
  g.lineTo(-44, NUT_Y - 170);
  g.quadraticCurveTo(0, NUT_Y - 200, 44, NUT_Y - 170);
  g.lineTo(25, NUT_Y);
  g.closePath();
  g.fill();
  g.fillStyle = "#050203";
  for (const sx of [-14, 14]) g.fillRect(sx - 7, NUT_Y - 150, 14, 120);
  // tuning pegs
  for (let i = 0; i < 3; i++) {
    const y = NUT_Y - 130 + i * 40;
    for (const side of [-1, 1]) {
      g.fillStyle = "#FFE3A0";
      g.fillRect(side * 44 - (side < 0 ? 26 : 0), y - 5, 26, 10);
      g.beginPath();
      g.ellipse(side * 78, y, 12, 17, 0, 0, Math.PI * 2);
      g.fillStyle = side < 0 ? "#F2B544" : "#b0703a";
      g.fill();
    }
  }
  // nut
  g.fillStyle = "#F3EBDD";
  g.fillRect(-25, NUT_Y - 6, 50, 10);

  // body
  const wood = g.createRadialGradient(-60, -40, 20, 0, 60, 320);
  wood.addColorStop(0, "#ff8a4c");
  wood.addColorStop(0.35, "#b8401c");
  wood.addColorStop(0.75, "#6e1a16");
  wood.addColorStop(1, "#5C0F1C");
  g.fillStyle = wood;
  bodyPath(g);
  g.fill();
  // binding / rim light
  g.lineWidth = 14;
  const bind = g.createLinearGradient(-200, 0, 200, 0);
  bind.addColorStop(0, "#FFE9B8");
  bind.addColorStop(0.6, "#FF4B2B");
  bind.addColorStop(1, "#8C6CFF");
  g.strokeStyle = bind;
  bodyPath(g);
  g.stroke();
  // shade on right side
  const shade = g.createLinearGradient(-200, 0, 220, 0);
  shade.addColorStop(0, "rgba(0,0,0,0)");
  shade.addColorStop(0.6, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(30,6,12,.7)");
  g.fillStyle = shade;
  bodyPath(g);
  g.fill();

  // fingerboard over body
  g.fillStyle = "#3a130c";
  g.beginPath();
  g.moveTo(-30, -60);
  g.lineTo(-31, 5);
  g.lineTo(31, 5);
  g.lineTo(30, -60);
  g.fill();

  // rosette + soundhole
  const hole = { x: 0, y: 60, r: 58 };
  for (let ring = 0; ring < 4; ring++) {
    const rr = hole.r + 12 + ring * 11;
    const n = 36 + ring * 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.beginPath();
      g.arc(hole.x + Math.cos(a) * rr, hole.y + Math.sin(a) * rr, 3.4 - ring * 0.4, 0, Math.PI * 2);
      g.fillStyle = ["#FFE3A0", "#FF4B2B", "#F3EBDD", "#8C6CFF"][(i + ring) % 4];
      g.fill();
    }
  }
  g.beginPath();
  g.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
  g.fillStyle = "#000";
  g.fill();

  // bridge
  g.fillStyle = "#2a0d08";
  g.fillRect(-70, SADDLE_Y - 14, 140, 34);
  g.fillStyle = "#F3EBDD";
  g.fillRect(-24, SADDLE_Y - 4, 48, 6);

  // strings (drawn faint — the live SVG overlay adds the bright vibrating ones)
  g.strokeStyle = "rgba(243,235,221,.55)";
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const t = i / 5 - 0.5;
    g.beginPath();
    g.moveTo(t * 36, SADDLE_Y);
    g.lineTo(t * 26, NUT_Y);
    g.stroke();
  }
  g.restore();

  return c;
}

function bodyPath(g: CanvasRenderingContext2D) {
  // classical figure-eight: upper bout (narrow) + waist + lower bout (wide)
  g.beginPath();
  g.moveTo(0, -120);
  g.bezierCurveTo(95, -125, 140, -70, 125, -5);
  g.bezierCurveTo(115, 45, 100, 60, 130, 115);
  g.bezierCurveTo(185, 200, 185, 330, 0, 345);
  g.bezierCurveTo(-185, 330, -185, 200, -130, 115);
  g.bezierCurveTo(-100, 60, -115, 45, -125, -5);
  g.bezierCurveTo(-140, -70, -95, -125, 0, -120);
  g.closePath();
}
