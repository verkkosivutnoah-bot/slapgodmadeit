"use client";
/**
 * Free tagged download — how most leases start: build the song on the tagged file, buy the
 * clean one when it's finished. Email in exchange, then a signed 7-day link.
 */
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { DownloadIcon } from "@/components/ui/Icons";

export function FreeTaggedDownload({ slug, title }: { slug: string; title: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setError("Please tick the consent box to continue.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const hp = (new FormData(e.currentTarget).get("website") as string) ?? "";
      const res = await fetch("/api/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, slug, website: hp }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setUrl(data.url);
      setStatus("done");
      window.location.href = data.url; // start the download straight away
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="mt-6 rounded-[22px] border border-line p-5 sm:p-6">
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="status">
            <p className="text-[16px] font-medium text-bone">Your tagged download is on its way.</p>
            <p className="mt-2 text-[14px] leading-relaxed text-mute">
              Nothing happened?{" "}
              <a href={url} className="link-u text-bone">
                Download again
              </a>{" "}
              — the link works for 7 days. Finish the song, then come back for the clean files.
            </p>
          </motion.div>
        ) : open ? (
          <motion.form key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="space-y-4">
            <p className="text-[15px] leading-relaxed text-stone-300">
              Free tagged version of <span className="text-bone">{title}</span> — write to it, see if it fits.
              Buying a lease gets you the untagged files.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id={`${id}-email`}
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="input flex-1"
                aria-label="Your email"
              />
              <button type="submit" disabled={status === "loading"} className="btn btn-primary shrink-0">
                {status === "loading" ? "Sending…" : "Get it"}
              </button>
            </div>
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
                Email me new drops and offers. Unsubscribe anytime — see the{" "}
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
          </motion.form>
        ) : (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[16px] font-medium text-bone">Try it in your session first</p>
              <p className="mt-1 text-[14px] text-mute">Free tagged download · full length</p>
            </div>
            <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost shrink-0">
              <DownloadIcon size={15} /> Free download
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
