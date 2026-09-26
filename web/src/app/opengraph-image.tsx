// Placeholder Open Graph image (generated at build). Replace with a designed 1200×630 image later
// by dropping src/app/opengraph-image.png and deleting this file.
import { ImageResponse } from "next/og";
import { LOOPS_LIVE, SITE_TAGLINE } from "@/data/site";

export const alt = `SLAPGOD — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "radial-gradient(circle at 50% 110%, #44403C 0%, #292524 35%, #1C1917 70%)",
          color: "#FAFAF9",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", opacity: 0.8 }}>{LOOPS_LIVE ? "Beats · Guitar loops · Sample packs" : "Original beats · Clear licenses"}</div>
        <div style={{ fontSize: 190, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>SLAPGOD</div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>100% original · Prod. by SLAPGOD (@slapgodmadeit)</div>
      </div>
    ),
    size
  );
}
