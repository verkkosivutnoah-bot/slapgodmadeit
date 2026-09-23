"use client";
// EUR is primary. Seller is not VAT-registered (small business), so no VAT is charged. USD prices are set explicitly per product (priceUSD) and currently equal
// the EUR number (€39 / $39). Preference persists in localStorage.
// TODO: Stripe — create one Price per currency per product and pick by `currency` at checkout.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Currency = "EUR" | "USD";
const STORAGE_KEY = "sg_currency";

interface CurrencyCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Format a catalog price. `usd` overrides the USD amount (defaults to the same number). */
  format: (eur: number, opts?: { usd?: number; vat?: boolean; interval?: "month" }) => string;
  vatNote: string;
}

const Ctx = createContext<CurrencyCtx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "USD" || saved === "EUR") setCurrencyState(saved);
    } catch {
      /* storage blocked */
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* storage blocked */
    }
  }, []);

  const value = useMemo<CurrencyCtx>(() => {
    const nf = new Intl.NumberFormat(currency === "EUR" ? "en-IE" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return {
      currency,
      setCurrency,
      vatNote: "No VAT · small business, not VAT-registered",
      format: (eur, opts) => {
        if (eur === 0) return "Free";
        const amount = currency === "EUR" ? eur : opts?.usd ?? eur;
        let s = nf.format(amount);
        if (opts?.interval) s += "/mo";
        return s;
      },
    };
  }, [currency, setCurrency]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}

/** Client price text. */
export function Price({
  eur,
  usd,
  vat = false,
  interval,
  className,
}: {
  eur: number;
  usd?: number;
  vat?: boolean;
  interval?: "month";
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={className}>{format(eur, { usd, vat, interval })}</span>;
}

export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div
      role="group"
      aria-label="Currency"
      className={`relative inline-flex h-9 items-center rounded-full bg-stone-300/[0.08] p-1 text-[13px] font-medium [@media(pointer:coarse)]:h-11 ${className}`}
    >
      {(["EUR", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
          aria-label={c}
          className={`h-7 min-w-8 whitespace-nowrap rounded-full px-2.5 [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:min-w-10 transition-colors ${
            currency === c ? "bg-stone-300/[0.16] text-bone" : "text-mute hover:text-bone"
          }`}
        >
          {c === "EUR" ? "€" : "$"}
        </button>
      ))}
    </div>
  );
}
