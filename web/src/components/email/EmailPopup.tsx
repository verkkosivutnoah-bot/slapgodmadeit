"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { CoverArt } from "@/components/ui/CoverArt";
import { coverFor } from "@/data/covers";
import { EmailCaptureForm, OPT_IN_KEY } from "./EmailCaptureForm";

const SEEN_KEY = "sg_popup_seen_v1";
const DELAY_MS = 15000;
const EXCLUDED = ["/privacy", "/terms", "/cart", "/free"];

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}

/** Email capture popup: after 15s, 50% scroll, or exit-intent (desktop). Once per visitor. */
export function EmailPopup() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (EXCLUDED.includes(pathname)) return;
    if (safeGet(SEEN_KEY) || safeGet(OPT_IN_KEY)) return;
    // if storage is blocked we still show at most once per page session (fired ref)

    const trigger = () => {
      if (fired.current) return;
      if (document.body.dataset.dialogOpen === "true") return; // don't stack on another dialog
      fired.current = true;
      safeSet(SEEN_KEY, String(Date.now()));
      setOpen(true);
      cleanup();
    };

    const timer = window.setTimeout(trigger, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) trigger();
    };
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (desktop) document.documentElement.addEventListener("mouseleave", onLeave);

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    }
    return cleanup;
  }, [pathname]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Get 10 free loops" className="max-w-[520px]">
      <div className="bg-[radial-gradient(70%_50%_at_30%_0%,rgb(var(--coral-rgb)/0.16),transparent_70%),radial-gradient(60%_45%_at_80%_10%,rgb(var(--lilac-rgb)/0.14),transparent_70%)] p-7 pt-14 text-center sm:p-10 sm:pt-12">
        <CoverArt src={coverFor("packs", "guitar-vault-lite")} title="Guitar Vault Lite" alt="" sizes="96px" className="mx-auto h-20 w-20 rounded-2xl shadow-[0_16px_40px_-14px_var(--coral)]" />
        <p className="eyebrow mt-6 !text-amber">Free download</p>
        <h2 className="display mt-2 text-[clamp(32px,7vw,44px)]">
          10 <span className="text-grad pr-[0.06em] italic">free</span> loops
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-stone-300">
          Guitar Vault Lite — ten live guitar loops. Email required; the download link lands in your inbox right away. The download is yours.
        </p>
        <div className="mt-7 text-left">
          <EmailCaptureForm
            source="popup_guitar_vault_lite"
            cta="Get the loops"
            autoFocus
            successTitle="You're in — check your inbox"
            successText="Guitar Vault Lite is on its way. Nothing there? Check spam."
          />
        </div>
      </div>
    </Dialog>
  );
}
