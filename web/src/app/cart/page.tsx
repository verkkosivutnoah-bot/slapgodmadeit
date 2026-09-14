import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CartView } from "@/components/packs/CartView";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <>
      <PageHero eyebrow="Checkout" title="Your cart" ghost="CART" />
      <CartView />
    </>
  );
}
