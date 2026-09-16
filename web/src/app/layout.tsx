import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Display: Newsreader (free, variable w/ optical size) as a heavy editorial serif. UI: system stack, Inter as fallback.
const serif = Newsreader({ variable: "--font-serif", subsets: ["latin"], axes: ["opsz"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

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
  themeColor: "#1C1917",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${inter.variable}`}>
      <body className="min-h-svh">
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
