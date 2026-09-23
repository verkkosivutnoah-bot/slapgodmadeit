/**
 * Admin — publish an analysed beat (DEV ONLY).
 *
 * Re-runs tools/ingest_beat.py over the temp folder from /api/admin/analyze, this time
 * with --publish and the values you edited in the dashboard: encodes the tagged preview,
 * copies masters to web/private, appends the entry to beats.ts. Optionally commits + pushes,
 * which Vercel then deploys.
 */
import { NextResponse } from "next/server";
import { REPO, devOnly, run, runIngest } from "../shared";

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
