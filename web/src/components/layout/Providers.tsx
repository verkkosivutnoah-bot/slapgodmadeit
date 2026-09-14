"use client";
import type { ReactNode } from "react";
import { CurrencyProvider } from "@/lib/currency";
import { CartProvider } from "@/lib/cart";
import { PlayerProvider } from "@/components/player/GlobalPlayer";
import { LicenseModalProvider } from "@/components/beats/LicenseModal";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { EmailPopup } from "@/components/email/EmailPopup";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      <CartProvider>
        <PlayerProvider>
          <LicenseModalProvider>
            <SmoothScroll />
            {children}
            <EmailPopup />
          </LicenseModalProvider>
        </PlayerProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}
