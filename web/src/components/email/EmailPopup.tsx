"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { CoverArt } from "@/components/ui/CoverArt";
import { coverFor } from "@/data/covers";
import { EmailCaptureForm, OPT_IN_KEY } from "./EmailCaptureForm";
import { Sticker, Waveform } from "@/components/ui/Icons";

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
    <Dialog open={open} onClose={() => setOpen(false)} title="Get Guitar Vault Lite free" className="max-w-[880px]">
      <div className="grid md:grid-cols-[1fr_1.15fr] grid-cols-1">
        <div className="relative hidden overflow-hidden rounded-l-[28px] md:block">
          <CoverArt src={coverFor("packs", "guitar-vault-lite")} title="Guitar Vault Lite" alt="" sizes="400px" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          <Sticker text="FREE • FREE • FREE • FREE • FREE • " className="absolute right-6 top-6 h-24 w-24 text-ember">
            <span className="display text-xl">5</span>
          </Sticker>
          <Waveform className="absolute bottom-8 left-8 right-8 h-10 text-ember/80" />
        </div>
        <div className="p-7 pt-14 sm:p-10">
          <p className="eyebrow text-ember">Free download</p>
          <h2 className="display mt-3 text-5xl sm:text-6xl">
            Guitar Vault <span className="text-ember">Lite</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-mute">
            5 free live guitar loops from SLAPGOD&apos;s Guitar Vault. Email required — confirm the link in your inbox (double opt-in) and the
            download is yours.
          </p>
          <div className="mt-7">
            <EmailCaptureForm
              source="popup_guitar_vault_lite"
              cta="Get the loops"
              autoFocus
              successTitle="Check your inbox to confirm"
              successText="We sent a confirmation link. Click it and Guitar Vault Lite lands in your inbox."
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
