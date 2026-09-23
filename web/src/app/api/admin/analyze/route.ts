/**
 * Admin — analyse an uploaded beat (DEV ONLY).
 *
 * Saves the upload to a temp folder, runs tools/ingest_beat.py in --json mode
 * (librosa key detection + BPM from the filename) and returns what it found.
 * The temp folder is kept so /api/admin/publish can pick it up by id.
 */
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { devOnly, runIngest } from "../shared";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > 200 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "File over 200 MB." }, { status: 413 });
  }

  const dir = await mkdtemp(join(tmpdir(), "sg-admin-"));
  const safeName = file.name.replace(/[^\w.\- ]/g, "_");
  await writeFile(join(dir, safeName), Buffer.from(await file.arrayBuffer()));

  const result = await runIngest([dir, "--json"]);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true, jobDir: dir, ...result.data });
}
