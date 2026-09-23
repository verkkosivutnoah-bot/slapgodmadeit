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
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No file uploaded." }, { status: 400 });
  }
  const tooBig = files.find((f) => f.size > 200 * 1024 * 1024);
  if (tooBig) {
    return NextResponse.json({ ok: false, error: `${tooBig.name} is over 200 MB.` }, { status: 413 });
  }

  // Everything lands in one folder — the Python side works out which file is which
  // (master / tagged / stems / cover).
  const dir = await mkdtemp(join(tmpdir(), "sg-admin-"));
  for (const f of files) {
    await writeFile(join(dir, f.name.replace(/[^\w.\- ]/g, "_")), Buffer.from(await f.arrayBuffer()));
  }

  const result = await runIngest([dir, "--json"]);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true, jobDir: dir, ...result.data });
}
