import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SLAPGOD — Beats, Guitar Loops & Sample Packs",
    short_name: "SLAPGOD",
    start_url: "/",
    display: "standalone",
    background_color: "#1C1917",
    theme_color: "#1C1917",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
