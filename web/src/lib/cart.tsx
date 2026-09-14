"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  key: string; // unique line key (e.g. beat_x:premium)
  kind: "beat" | "pack";
  productId: string;
  title: string;
  variant?: string; // license tier name
  priceEUR: number;
  cover: string;
  href: string;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotalEUR: number;
  add: (item: CartItem) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  lastAdded: CartItem | null;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "sg_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      // one license per beat: replace any other tier of the same beat
      const filtered = prev.filter((p) => !(p.productId === item.productId && p.kind === item.kind));
      return [...filtered, item];
    });
    setLastAdded(item);
  }, []);
  const remove = useCallback((key: string) => setItems((prev) => prev.filter((p) => p.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.length,
      subtotalEUR: items.reduce((s, i) => s + i.priceEUR, 0),
      add,
      remove,
      clear,
      has: (key) => items.some((i) => i.key === key),
      lastAdded,
    }),
    [items, add, remove, clear, lastAdded]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
