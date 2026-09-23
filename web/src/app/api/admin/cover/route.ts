/** Admin — attach cover art to a job folder created by /api/admin/analyze (DEV ONLY). */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { devOnly } from "../shared";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  const form = await request.formData();
  const file = form.get("file");
  const jobDir = form.get("jobDir");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No image uploaded." }, { status: 400 });
  }
  if (typeof jobDir !== "string" || !jobDir.includes("sg-admin-")) {
    return NextResponse.json({ ok: false, error: "Unexpected job folder." }, { status: 400 });
  }
  if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
    return NextResponse.json({ ok: false, error: "Cover must be a JPG, PNG or WebP." }, { status: 415 });
  }

  const ext = file.name.slice(file.name.lastIndexOf("."));
  await writeFile(join(jobDir, `cover${ext}`), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ ok: true });
}
