import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], display: "swap" });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SLAPGOD — Beats, Guitar Loops & Sample Packs",
    template: "%s · SLAPGOD",
  },
  description:
    "Beats, live guitar loops and sample packs by SLAPGOD (@slapgodmadeit). 100% original sounds, clear licenses, instant delivery.",
  openGraph: {
    title: "SLAPGOD",
    description: "Beats, live guitar loops and sample packs. 100% original.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0708",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${grotesk.variable} ${jetbrains.variable}`}>
      <body className="min-h-svh">
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
