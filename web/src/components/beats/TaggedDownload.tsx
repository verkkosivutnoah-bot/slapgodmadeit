"use client";
/**
 * Email-gated free tagged download.
 *
 * First time: a small dialog asks for an email + consent, then the download starts at once.
 * After that the email is remembered on this device, so every later free download is one click
 * (it's still logged per beat in Klaviyo — that's the follow-up tag).
 */
import Link from "next/link";
import { createContext, useCallback, useContext, useId, useState, type FormEvent, type ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { DownloadIcon } from "@/components/ui/Icons";
import type { Beat } from "@/data/beats";

const STORE = "sg_dl_email";

type Target = Pick<Beat, "slug" | "title" | "src">;
const Ctx = createContext<((b: Target) => void) | null>(null);

export function useTaggedDownload() {
  const open = useContext(Ctx);
  if (!open) throw new Error("useTaggedDownload must be inside TaggedDownloadProvider");
  return open;
}

function remembered(): string | null {
  try {
    return localStorage.getItem(STORE);
  } catch {
    return null;
  }
}

function startDownload(url: string, title: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `SLAPGOD - ${title} (tagged).mp3`.replace(/[\\/:*?"<>|]/g, "");
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function request(body: Record<string, unknown>) {
  const res = await fetch("/api/beat-download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
  return data.url as string;
}

export function TaggedDownloadProvider({ children }: { children: ReactNode }) {
  const id = useId();
  const [beat, setBeat] = useState<Target | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const open = useCallback((b: Target) => {
    const known = remembered();
    if (known) {
      // returning downloader: log the beat, download immediately; fall back to the file if the API hiccups
      request({ email: known, consent: true, slug: b.slug, returning: true })
        .then((url) => startDownload(url, b.title))
        .catch(() => startDownload(b.src, b.title));
      return;
    }
    setError("");
    setBeat(b);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!beat) return;
    if (!consent) {
      setError("Please tick the consent box to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const hp = (new FormData(e.currentTarget).get("website") as string) ?? "";
      const url = await request({ email, consent, slug: beat.slug, website: hp });
      try {
        localStorage.setItem(STORE, email.trim().toLowerCase());
      } catch {
        /* private mode — they'll just be asked again next time */
      }
      startDownload(url, beat.title);
      setBeat(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Ctx.Provider value={open}>
      {children}
      <Dialog open={!!beat} onClose={() => setBeat(null)} title="Free tagged download" className="max-w-[460px]">
        {beat && (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-[15px] leading-relaxed text-stone-300">
              Get <span className="text-bone">{beat.title}</span> as a full-length tagged MP3 — write to it, see if it
              fits. Leases get you the clean files.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="input w-full"
              aria-label="Your email"
            />
            <label htmlFor={`${id}-consent`} className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-mute">
              <input
                id={`${id}-consent`}
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[var(--coral)]"
                required
              />
              <span>
                I agree to receive emails from SLAPGOD about new beats, free sounds and offers. Unsubscribe anytime. See
                the{" "}
                <Link href="/privacy" className="text-bone underline decoration-coral/60 underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            {error && (
              <p role="alert" className="text-sm text-coral">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              <DownloadIcon size={15} /> {busy ? "Starting download…" : "Download"}
            </button>
            <p className="text-center text-[12px] text-mute">Asked once — next downloads are one click.</p>
          </form>
        )}
      </Dialog>
    </Ctx.Provider>
  );
}
