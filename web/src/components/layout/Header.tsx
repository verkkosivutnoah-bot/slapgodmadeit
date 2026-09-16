"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { CurrencyToggle } from "@/lib/currency";
import { CartIcon, CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { scrollLock } from "@/components/ui/SmoothScroll";

export const NAV = [
  { href: "/beats", label: "Beats" },
  { href: "/packs", label: "Packs" },
  { href: "/free", label: "Free" },
];

const MORE = [
  { href: "/licenses", label: "Licenses" },
  { href: "/#rights", label: "Know your rights" },
  { href: "/contact", label: "Contact" },
];

export function Logo({ className = "" }: { className?: string }) {
  return <span className={`display text-[22px] tracking-[-0.01em] ${className}`}>SLAPGOD</span>;
}

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    scrollLock.lock();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPop = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    return () => {
      scrollLock.unlock();
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-deep"
      >
        Skip to content
      </a>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? "bg-ink" : "bg-transparent"}`}>
        <div className="container-sg flex h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex min-h-11 items-center" aria-label="SLAPGOD home">
              <Logo />
            </Link>
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={pathname === n.href ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-[15px] font-medium transition-colors ${
                    pathname.startsWith(n.href) ? "text-bone" : "text-nav hover:text-bone"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <CurrencyToggle />
            </div>
            <Link
              href="/cart"
              className="relative flex h-11 items-center gap-2 rounded-full px-3 text-[15px] font-medium text-nav transition-colors hover:text-bone"
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <CartIcon size={18} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-semibold text-deep">{count}</span>
              )}
            </Link>
            <Link href="/free" className="btn btn-primary hidden sm:inline-flex">
              Free loops
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full text-nav md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-24 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {[{ href: "/", label: "Home" }, ...NAV, ...MORE, { href: "/cart", label: "Cart" }].map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="display block py-2 text-[34px] text-bone active:text-stone-400">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between gap-4 pt-8">
            <CurrencyToggle />
            <Link href="/free" className="btn btn-primary">
              Free loops
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
