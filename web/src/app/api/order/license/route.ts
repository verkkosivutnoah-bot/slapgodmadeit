/**
 * Licence PDF for a paid order line: /api/order/license?session=cs_…&line=0
 *
 * Rendered on demand from the Stripe session — the buyer's name and email, the beat, the tier —
 * with a licence number derived from the order, so it's identical every time it's downloaded.
 */
import type { LicenseId } from "@/data/licenses";
import { beats } from "@/data/beats";
import { renderLicensePdf, renderLoopLicensePdf } from "@/lib/licensePdf";
import { loadPaidOrder, orderLicenseNumber } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const order = await loadPaidOrder(q.get("session") ?? "");
  if (!order) return new Response("Order not found or not paid.", { status: 404 });

  const line = order.lines.find((l) => l.index === Number(q.get("line")));
  if (!line) return new Response("No licence for that line.", { status: 404 });
  const number = orderLicenseNumber(order, line.index);

  if (line.kind === "pack") {
    const pdf = await renderLoopLicensePdf({
      licenseNumber: number,
      packTitle: line.title,
      licenseeName: order.name || order.email,
      licenseeEmail: order.email,
      issuedAt: order.createdAt,
      orderRef: order.sessionId.slice(-12),
      amountLabel: `${line.amount.toFixed(2)} ${order.currency}`,
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SLAPGOD Loop License ${number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  if (!line.tier) return new Response("No licence for that line.", { status: 404 });

  const beat = beats.find((b) => b.slug === line.slug);
  const pdf = await renderLicensePdf({
    licenseNumber: number,
    tierId: line.tier as LicenseId,
    beatTitle: line.title,
    bpm: beat?.bpm,
    musicalKey: beat?.key,
    licenseeName: order.name || order.email,
    licenseeEmail: order.email,
    issuedAt: order.createdAt,
    orderRef: order.sessionId.slice(-12),
    amountLabel: `${line.amount.toFixed(2)} ${order.currency}`,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="SLAPGOD License ${number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
