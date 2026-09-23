/**
 * Admin — publish an analysed beat (DEV ONLY).
 *
 * Re-runs tools/ingest_beat.py over the temp folder from /api/admin/analyze, this time
 * with --publish and the values you edited in the dashboard: encodes the tagged preview,
 * copies masters to web/private, appends the entry to beats.ts. Optionally commits + pushes,
 * which Vercel then deploys.
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { FileKind } from "@/lib/catalog";
import { blobConfigured, blobPath } from "@/lib/deliverables";
import { REPO, devOnly, run, runIngest } from "../shared";

/** Push the paid files (never the tagged one) to the private Blob store. */
async function uploadMasters(slug: string) {
  const dir = join(REPO, "web", "private", "beats", slug);
  const metaPath = join(dir, "meta.json");
  if (!existsSync(metaPath)) return { uploaded: [] as string[], skipped: "no meta.json" };
  const meta = JSON.parse(readFileSync(metaPath, "utf8")) as { sourceFiles?: Record<string, string> };

  const uploaded: string[] = [];
  for (const kind of ["mp3", "wav", "stems"] as FileKind[]) {
    const name = meta.sourceFiles?.[kind];
    if (!name || !existsSync(join(dir, name))) continue;
    const pathname = blobPath("beat", slug, kind);
    await put(pathname, createReadStream(join(dir, name)), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      multipart: true,
    });
    uploaded.push(pathname);
  }
  return { uploaded, skipped: null };
}

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  const body = (await request.json()) as {
    jobDir?: string;
    title?: string;
    slug?: string;
    genre?: string;
    moods?: string[];
    tags?: string[];
    key?: string;
    bpm?: number;
    deploy?: boolean;
  };

  if (!body.jobDir?.includes("sg-admin-")) {
    return NextResponse.json({ ok: false, error: "Missing or unexpected job folder." }, { status: 400 });
  }

  const args = [body.jobDir, "--json", "--publish", "--yes"];
  if (body.title) args.push("--title", body.title);
  if (body.slug) args.push("--slug", body.slug);
  if (body.genre) args.push("--genre", body.genre);
  if (body.moods?.length) args.push("--moods", body.moods.join(","));
  if (body.tags?.length) args.push("--tags", body.tags.join(","));
  if (body.key) args.push("--key", body.key);
  if (body.bpm) args.push("--bpm", String(body.bpm));

  const result = await runIngest(args);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });

  const slug = String(result.data.slug ?? "");

  // Paid files go to private storage — the repo is public, so they can't ship with git.
  let storage: { uploaded: string[]; skipped: string | null } = { uploaded: [], skipped: "BLOB_READ_WRITE_TOKEN not set" };
  if (blobConfigured()) {
    try {
      storage = await uploadMasters(slug);
    } catch (err) {
      storage = { uploaded: [], skipped: `upload failed: ${(err as Error).message}` };
    }
  }
  Object.assign(result.data, { storage });

  if (!body.deploy) {
    return NextResponse.json({ ok: true, deployed: false, ...result.data });
  }

  // commit + push — Vercel picks it up from there
  const steps: string[] = [];
  for (const cmd of [
    ["git", "add", "-A"],
    ["git", "commit", "-m", `Add beat: ${result.data.title ?? slug}`],
    ["git", "push", "origin", "main"],
  ]) {
    const r = await run(cmd[0], cmd.slice(1), REPO);
    steps.push(`${cmd.join(" ")} → ${r.code}`);
    if (r.code !== 0) {
      return NextResponse.json(
        { ok: true, deployed: false, ...result.data, gitError: (r.stderr || r.stdout).slice(-500), steps },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({ ok: true, deployed: true, ...result.data, steps });
}
