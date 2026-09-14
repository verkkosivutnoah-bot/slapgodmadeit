"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { CurrencyToggle } from "@/lib/currency";
import { CartIcon, CloseIcon, MenuIcon, SparkIcon } from "@/components/ui/Icons";
import { scrollLock } from "@/components/ui/SmoothScroll";

export const NAV = [
  { href: "/beats", label: "Beats" },
  { href: "/packs", label: "Packs" },
  { href: "/free", label: "Free" },
  { href: "/#rights", label: "Rights" },
  { href: "/licenses", label: "Licenses" },
];

export function Header() {
  const { count } = useCart();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 240 && y > prev + 2);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Mobile menu: scroll lock, Esc closes; route changes (incl. browser Back) close it via pathname effect.
  // (No manual history entries — they would conflict with the App Router's history state.)
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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ember focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
            scrolled || open ? "border-b border-line bg-ink/70 backdrop-blur-xl" : "border-b border-transparent"
          }`}
        >
          <div className="container-sg flex h-16 items-center justify-between gap-6 md:h-20">
            <Link href="/" className="group flex items-center gap-2" aria-label="SLAPGOD home">
              <SparkIcon size={18} className="text-ember transition-transform duration-700 group-hover:rotate-180" />
              <span className="display text-2xl tracking-wide md:text-[28px]">SLAPGOD</span>
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {NAV.map((n) => {
                const active = n.href === pathname;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-full px-4 py-2 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors ${
                      active ? "text-bone" : "text-mute hover:text-bone"
                    }`}
                  >
                    {n.label}
                    {active && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ember"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <CurrencyToggle />
              </div>
              <Link
                href="/cart"
                className="relative grid h-11 w-11 place-items-center rounded-full border border-line transition hover:border-bone/40"
                aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
              >
                <CartIcon size={18} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 font-mono text-[10px] font-bold text-ink"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink/95 px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-24 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {[{ href: "/", label: "Home" }, ...NAV, { href: "/cart", label: "Cart" }].map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={n.href} onClick={() => setOpen(false)} className="display block py-1 text-[clamp(40px,13vw,64px)] leading-[1.05] text-bone hover:text-ember active:text-ember">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex items-center justify-between">
              <CurrencyToggle />
              <a href="https://instagram.com/slapgodmadeit" target="_blank" rel="noreferrer" className="eyebrow">
                @slapgodmadeit
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
