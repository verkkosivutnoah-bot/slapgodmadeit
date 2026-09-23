/**
 * Cart pricing — one implementation, used by the cart UI now and by Stripe Checkout later.
 *
 * The server must recompute this from trusted prices; never take a total from the browser.
 */
export interface PricedItem {
  key: string;
  kind: "beat" | "pack";
  priceEUR: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
  /** keys of the items given away by the lease deal */
  freeKeys: string[];
  /** how many more leases until the next free one (0 when a deal is already applied this cycle) */
  leasesToNextFree: number;
}

/** Buy 2 leases, get 1 free — the cheapest lease in each group of three. */
export const LEASE_DEAL_GROUP = 3;

export function cartTotals(items: PricedItem[]): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + i.priceEUR, 0);
  const leases = items.filter((i) => i.kind === "beat").sort((a, b) => a.priceEUR - b.priceEUR);

  const freeCount = Math.floor(leases.length / LEASE_DEAL_GROUP);
  const free = leases.slice(0, freeCount);
  const discount = free.reduce((sum, i) => sum + i.priceEUR, 0);

  const remainder = leases.length % LEASE_DEAL_GROUP;
  const leasesToNextFree = remainder === 0 ? 0 : LEASE_DEAL_GROUP - remainder;

  return {
    subtotal,
    discount,
    total: subtotal - discount,
    freeKeys: free.map((i) => i.key),
    leasesToNextFree,
  };
}
