/**
 * Shared bits for the admin routes (DEV ONLY).
 *
 * The admin dashboard writes into the repo and shells out to Python, so it exists
 * only while `next dev` runs on your machine. In production these routes 404.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { NextResponse } from "next/server";

export const REPO = resolve(process.cwd(), "..");
export const PYTHON = join(REPO, "telegram-loop-bot", ".venv", "bin", "python");
export const INGEST = join(REPO, "tools", "ingest_beat.py");

/** 404 in production — the dashboard is a local tool, never a public endpoint. */
export function devOnly() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (!existsSync(PYTHON)) {
    return NextResponse.json(
      { ok: false, error: `Python env missing at ${PYTHON}. It comes from telegram-loop-bot/.venv.` },
      { status: 500 }
    );
  }
  return null;
}

export function run(cmd: string, args: string[], cwd: string, timeoutMs = 300_000) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((res) => {
    const p = spawn(cmd, args, { cwd });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => p.kill("SIGKILL"), timeoutMs);
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("close", (code) => {
      clearTimeout(timer);
      res({ code: code ?? 1, stdout, stderr });
    });
    p.on("error", (err) => {
      clearTimeout(timer);
      res({ code: 1, stdout, stderr: String(err) });
    });
  });
}

/** Runs tools/ingest_beat.py and parses its --json payload. */
export async function runIngest(args: string[]) {
  const { code, stdout, stderr } = await run(PYTHON, [INGEST, ...args], REPO);
  const line = stdout.split("\n").find((l) => l.trim().startsWith("{"));
  if (code !== 0 || !line) {
    return { ok: false as const, error: (stderr || stdout || "ingest failed").slice(-800) };
  }
  try {
    return { ok: true as const, data: JSON.parse(line) as Record<string, unknown> };
  } catch {
    return { ok: false as const, error: `Couldn't parse output:\n${stdout.slice(-400)}` };
  }
}

/* ------------------------------------------------------------------ YouTube */

export const YOUTUBE = join(REPO, "tools", "youtube.py");
const RENDER_SRC = join(REPO, "tools", "render_video.swift");
const RENDER_BIN = join(REPO, "tools", "bin", "render_video");

/**
 * Compile tools/render_video.swift once. The Command Line Tools on this Mac ship a newer SDK
 * than the Swift compiler accepts, so fall back through the installed SDKs until one builds.
 */
export async function ensureRenderer(): Promise<{ ok: true; bin: string } | { ok: false; error: string }> {
  const { existsSync, statSync, mkdirSync, readdirSync } = await import("node:fs");
  if (existsSync(RENDER_BIN) && statSync(RENDER_BIN).mtimeMs >= statSync(RENDER_SRC).mtimeMs) {
    return { ok: true, bin: RENDER_BIN };
  }
  mkdirSync(join(REPO, "tools", "bin"), { recursive: true });
  const sdkDir = "/Library/Developer/CommandLineTools/SDKs";
  const sdks = existsSync(sdkDir)
    ? readdirSync(sdkDir).filter((d) => /^MacOSX\d/.test(d)).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    : [];
  let last = "";
  for (const sdk of ["", ...sdks.map((d) => join(sdkDir, d))]) {
    const args = ["-O", RENDER_SRC, "-o", RENDER_BIN, ...(sdk ? ["-sdk", sdk] : [])];
    const r = await run("swiftc", args, REPO, 300_000);
    if (r.code === 0) return { ok: true, bin: RENDER_BIN };
    last = r.stderr.split("\n").find((l) => l.includes("error")) ?? r.stderr.slice(-300);
  }
  return { ok: false, error: `Couldn't compile the video renderer: ${last}` };
}
