"use client";
import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { CurrencyProvider } from "@/lib/currency";
import { CartProvider } from "@/lib/cart";
import { PlayerProvider } from "@/components/player/GlobalPlayer";
import { LicenseModalProvider } from "@/components/beats/LicenseModal";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { EmailPopup } from "@/components/email/EmailPopup";
import { TaggedDownloadProvider } from "@/components/beats/TaggedDownload";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
    <CurrencyProvider>
      <CartProvider>
        <PlayerProvider>
          <LicenseModalProvider>
            <TaggedDownloadProvider>
              <SmoothScroll />
              {children}
              <EmailPopup />
            </TaggedDownloadProvider>
          </LicenseModalProvider>
        </PlayerProvider>
      </CartProvider>
    </CurrencyProvider>
    </MotionConfig>
  );
}
