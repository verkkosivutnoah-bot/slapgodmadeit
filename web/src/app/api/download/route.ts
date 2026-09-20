// Serves free kits from `private/` only when the link carries a valid, unexpired signature.
import { createReadStream, statSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { KITS, verify } from "@/lib/downloads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kit = url.searchParams.get("kit") ?? "";
  const entry = KITS[kit];
  if (!entry) return new Response("Not found", { status: 404 });

  const check = verify(kit, url.searchParams.get("exp"), url.searchParams.get("sig"));
  if (!check.ok) {
    return new Response(
      check.reason === "expired"
        ? "This download link has expired. Ask for a fresh one at /free."
        : "Invalid download link.",
      { status: check.reason === "expired" ? 410 : 403 }
    );
  }

  const path = join(process.cwd(), "private", entry.file);
  let size: number;
  try {
    size = statSync(path).size;
  } catch {
    return new Response("The file isn't available yet.", { status: 503 });
  }

  const stream = Readable.toWeb(createReadStream(path)) as WebReadableStream<Uint8Array>;
  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="${entry.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
