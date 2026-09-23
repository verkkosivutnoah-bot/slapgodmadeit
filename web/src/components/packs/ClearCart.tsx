"use client";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/** Empties the cart once, after a paid checkout lands on the success page. */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
