// "The Vault" — original hero source artwork, drawn procedurally on an offscreen canvas.
// A huge banded setting sun framed by an Andalusian horseshoe arch.
// High contrast on black so the AsciiStars renderer reads it well.

export const SCENE_W = 1600;
export const SCENE_H = 1000;

export const SUN = { x: 800, y: 390, r: 270 };
export const ARCH = { x: 800, y: 370, r: 410, spread: 24 }; // spread = degrees below horizontal

function horseshoePath(ctx: CanvasRenderingContext2D | Path2D, r: number) {
  const sp = (ARCH.spread * Math.PI) / 180;
  const lx = ARCH.x + r * Math.cos(Math.PI + sp);
  const ly = ARCH.y - r * Math.sin(Math.PI + sp);
  ctx.moveTo(lx, SCENE_H + 10);
  ctx.lineTo(lx, ly);
  ctx.arc(ARCH.x, ARCH.y, r, Math.PI - sp, Math.PI * 2 + sp, false);
  const rx = ARCH.x + r * Math.cos(sp);
  ctx.lineTo(rx, SCENE_H + 10);
}

export function drawVaultScene(): HTMLCanvasElement {
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

  return c;
}
