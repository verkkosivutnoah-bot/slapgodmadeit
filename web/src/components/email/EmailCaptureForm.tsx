"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { MailIcon } from "@/components/ui/Icons";

export const OPT_IN_KEY = "sg_subscribed";

/** Shared email capture (popup, newsletter, /free gate). Posts to /api/subscribe. */
export function EmailCaptureForm({
  source,
  cta = "Send it",
  successTitle = "Check your inbox",
  successText = "Confirm the link we just sent you (double opt-in) and your download unlocks right away.",
  compact = false,
  autoFocus = false,
  onSuccess,
}: {
  source: string;
  cta?: string;
  successTitle?: string;
  successText?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSuccess?: () => void;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const hp = (new FormData(e.currentTarget).get("website") as string) ?? "";
    if (!consent) {
      setStatus("error");
      setError("Please tick the consent box to continue.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source, website: hp }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
      try {
        localStorage.setItem(OPT_IN_KEY, "1");
      } catch {
        /* ignore */
      }
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "done" ? (
        <motion.div
          key="done"
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 rounded-[22px] border border-coral/30 bg-coral/[0.06] p-5"
        >
          <motion.span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coral text-deep"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <motion.path d="M5 12l5 5L20 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
          </motion.span>
          <div>
            <p className="font-semibold text-bone">{successTitle}</p>
            <p className="mt-1 text-sm text-mute">{successText}</p>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -8 }} className="space-y-3">
          <div className={`flex gap-2 ${compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row"}`}>
            <label htmlFor={`${id}-email`} className="sr-only">
              Email address
            </label>
            <div className="relative flex-1">
              <MailIcon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
              <input
                id={`${id}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input !pl-11"
                data-autofocus={autoFocus || undefined}
                aria-invalid={status === "error" && !!error}
                aria-describedby={error ? `${id}-err` : undefined}
              />
            </div>
            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <button type="submit" className="btn btn-primary !h-[52px] shrink-0 !px-6" disabled={status === "loading"}>
              {status === "loading" ? "Sending…" : cta}
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
              I agree to receive emails from SLAPGOD about free sounds, new releases and offers. Unsubscribe anytime. See the{" "}
              <Link href="/privacy" className="text-bone underline decoration-coral/60 underline-offset-2 hover:decoration-coral">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <p className="text-[12px] text-mute/90">Double opt-in: we&apos;ll email you a link to confirm.</p>
          {error && (
            <p id={`${id}-err`} role="alert" className="text-sm text-coral">
              {error}
            </p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
