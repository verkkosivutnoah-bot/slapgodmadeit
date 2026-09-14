// Placeholder Open Graph image (generated at build). Replace with a designed 1200×630 image later
// by dropping src/app/opengraph-image.png and deleting this file.
import { ImageResponse } from "next/og";

export const alt = "SLAPGOD — Beats, Guitar Loops & Sample Packs";
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
          background: "radial-gradient(circle at 70% 35%, #F2B544 0%, #FF4B2B 22%, #5C0F1C 48%, #0B0708 75%)",
          color: "#F3EBDD",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", opacity: 0.8 }}>Beats · Guitar loops · Sample packs</div>
        <div style={{ fontSize: 190, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>SLAPGOD</div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>100% original · Prod. by SLAPGOD (@slapgodmadeit)</div>
      </div>
    ),
    size
  );
}
