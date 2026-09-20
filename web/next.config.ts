import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: path.join(__dirname),
  },
  // Free kits live outside /public and are streamed by /api/download — keep them in the
  // serverless bundle (nothing imports them statically, so tracing can't find them).
  outputFileTracingIncludes: {
    "/api/download": ["./private/**"],
  },
};

export default nextConfig;
