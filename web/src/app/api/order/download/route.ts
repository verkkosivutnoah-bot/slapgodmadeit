/**
 * Paid file download: /api/order/download?session=cs_…&line=0&file=wav
 *
 * Re-checks with Stripe on every request that the session is paid and that this line's
 * licence actually includes the requested file, then streams it from private storage.
 */
import { FILE_LABEL, type FileKind } from "@/lib/catalog";
import { downloadName, openDeliverable } from "@/lib/deliverables";
import { loadPaidOrder } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const order = await loadPaidOrder(q.get("session") ?? "");
  if (!order) return new Response("Order not found or not paid.", { status: 404 });

  const line = order.lines.find((l) => l.index === Number(q.get("line")));
  const file = q.get("file") as FileKind;
  if (!line || !line.fileKinds.includes(file)) {
    return new Response("That file isn't part of this licence.", { status: 403 });
  }

  const opened = await openDeliverable(line.kind, line.slug, file);
  if (!opened) {
    return new Response(
      `The ${FILE_LABEL[file]} for "${line.title}" isn't uploaded yet. Reply to your receipt and it'll be sent to you.`,
      { status: 503 }
    );
  }

  return new Response(opened.stream as unknown as BodyInit, {
    headers: {
      "Content-Type": opened.contentType,
      ...(opened.size ? { "Content-Length": String(opened.size) } : {}),
      "Content-Disposition": `attachment; filename="${downloadName(line.title, file)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
