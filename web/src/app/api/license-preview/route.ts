/**
 * License PDF preview (DEV ONLY).
 *
 * /api/license-preview?tier=premium&beat=No%20Faces&name=Jane%20Doe
 * Lets you read the agreement before a real order exists. Checkout will call
 * renderLicensePdf() the same way, with the buyer's details from Stripe.
 */
import { NextResponse } from "next/server";
import { licenseTiers, type LicenseId } from "@/data/licenses";
import { licenseNumber, renderLicensePdf, renderLoopLicensePdf } from "@/lib/licensePdf";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const q = new URL(request.url).searchParams;
  if (q.get("tier") === "loop") {
    const pdf = await renderLoopLicensePdf({
      licenseNumber: licenseNumber("preview"),
      packTitle: q.get("pack") ?? "Guitar Vault Vol. 1",
      licenseeName: q.get("name") ?? "Sample Buyer",
      licenseeEmail: q.get("email") ?? "buyer@example.com",
      orderRef: "PREVIEW",
      amountLabel: "39.00 EUR",
    });
    return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf" } });
  }
  const tier = (q.get("tier") ?? "premium") as LicenseId;
  if (!licenseTiers.some((t) => t.id === tier)) {
    return NextResponse.json({ error: `Unknown tier. Try: ${licenseTiers.map((t) => t.id).join(", ")}` }, { status: 400 });
  }

  const pdf = await renderLicensePdf({
    licenseNumber: licenseNumber("preview"),
    tierId: tier,
    beatTitle: q.get("beat") ?? "No Faces",
    bpm: Number(q.get("bpm")) || 100,
    musicalKey: q.get("key") ?? "C# maj",
    licenseeName: q.get("name") ?? "Sample Buyer",
    licenseeEmail: q.get("email") ?? "buyer@example.com",
    orderRef: "PREVIEW",
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="license-${tier}.pdf"` },
  });
}
