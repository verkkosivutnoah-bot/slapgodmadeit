"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { ArrowIcon, CheckIcon, CloseIcon, DownloadIcon } from "@/components/ui/Icons";
import { canDo, cantDo, faqs, leaseVsExclusive, registerSteps, SPLIT_SHEET_URL, splits, twoCopyrights } from "@/data/rights";
import { CREDIT_FORMAT, licenseTiers } from "@/data/licenses";

const EASE = [0.22, 1, 0.36, 1] as const;

function FullTerms({ className = "" }: { className?: string }) {
  return (
    <Link href="/licenses" className={`inline-flex items-center gap-1.5 text-[12px] text-mute transition hover:text-white ${className}`}>
      Full terms <ArrowIcon size={12} />
    </Link>
  );
}

/** Accordion-style block: serif title row, content revealed on open. */
function Block({ id, n, title, children }: { id: string; n: string; title: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(n === "01");
  const panelId = useId();
  return (
    <div id={id} className="scroll-mt-28 border-t border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center gap-4 py-6 text-left sm:gap-6 sm:py-8"
        >
          <span className="w-6 shrink-0 text-[13px] text-mute">{n}</span>
          <span className="display flex-1 text-[clamp(24px,3.6vw,38px)] transition-colors duration-300 group-hover:text-coral">{title}</span>
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${open ? "rotate-45 bg-coral text-deep" : "bg-stone-300/[0.12] text-nav"}`} aria-hidden>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.55, ease: EASE }, opacity: { duration: 0.35 } }}
            className="overflow-hidden"
          >
            <div className="pb-12 sm:pl-12">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function KnowYourRights() {
  return (
    <section id="rights" className="section relative scroll-mt-24" aria-labelledby="rights-title">
            <div className="container-sg">
        <SectionHeader
          id="rights-title"
          eyebrow="Producer & artist education"
          align="center"
          title="Know your rights"
        >
          Licensing shouldn&apos;t need a lawyer to understand. Here&apos;s exactly what you get, what you can do, and how splits work — in plain language.
        </SectionHeader>


        <div className="mx-auto max-w-[960px] border-b border-line">
          <TwoCopyrights />
          <LeaseVsExclusive />
          <CanCant />
          <Splits />
          <CreditsClaims />
          <Caps />
          <Faq />
        </div>
        <div className="mx-auto mt-10 max-w-[960px]">
          <p className="mx-auto max-w-2xl text-center text-[13px] text-mute">
            <strong className="text-bone">Summary only</strong> — the license agreement delivered with your purchase is the binding document. Not legal advice.{" "}
            <Link href="/licenses" className="text-bone underline underline-offset-2">
              Read the license agreements
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

/* 1 ------------------------------------------------------------------ */
function TwoCopyrights() {
  const reduce = useReducedMotion();
  const card = (key: "composition" | "master", color: string, accent: string) => {
    const c = twoCopyrights[key];
    return (
      <div className={`relative h-full rounded-[22px] border p-6 sm:p-8 ${color}`}>
        <p className={`text-[12px] ${accent}`}>© {key === "composition" ? "Copyright #1" : "Copyright #2"}</p>
        <p className="display mt-2 text-[32px]">{c.title}</p>
        <p className="mt-1 text-sm text-mute">{c.aka}</p>
        <ul className="mt-6 space-y-2.5 text-[15px]">
          {c.points.map((p) => (
            <li key={p} className="flex gap-2.5">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${key === "composition" ? "bg-coral" : "bg-lilac"}`} aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  return (
    <Block id="rights-copyrights" n="01" title={<>Every song = two copyrights</>}>
      <Reveal>
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-line px-6 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-coral" />
          <span className="display text-2xl">Your song</span>
        </div>
      </Reveal>
      <svg viewBox="0 0 800 90" className="mx-auto hidden h-[90px] w-full max-w-[800px] md:block" aria-hidden>
        {[
          ["M400 0 C400 50 200 40 200 90", "var(--coral)"],
          ["M400 0 C400 50 600 40 600 90", "var(--lilac)"],
        ].map(([d, col]) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            style={{ stroke: col }}
            strokeWidth="1.5"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE }}
          />
        ))}
      </svg>
      <div className="mt-6 grid gap-4 md:mt-0 md:grid-cols-2 grid-cols-1">
        <Reveal>{card("composition", "border-coral/30 bg-coral/[0.05]", "text-coral")}</Reveal>
        <Reveal delay={0.1}>{card("master", "border-lilac/30 bg-lilac/[0.05]", "text-lilac")}</Reveal>
      </div>
      <FullTerms className="mt-5" />
    </Block>
  );
}

/* 2 ------------------------------------------------------------------ */
function LeaseVsExclusive() {
  return (
    <Block id="rights-lease-vs-exclusive" n="02" title={<>Lease vs exclusive</>}>
      <Reveal>
        <div className="overflow-hidden rounded-[22px] border border-line">
          <div className="grid grid-cols-[1fr_1fr] border-b border-line bg-bone/[0.03] sm:grid-cols-[0.8fr_1fr_1fr]">
            <div className="hidden p-5 sm:block" />
            <div className="p-5">
              <p className="text-[12px] text-white">Lease</p>
              <p className="display text-[26px]">Basic → Unlimited</p>
            </div>
            <div className="border-l border-line p-5">
              <p className="text-[12px] text-stone-300">Exclusive</p>
              <p className="display text-[26px]">Exclusive rights</p>
            </div>
          </div>
          <Stagger>
            {leaseVsExclusive.map((r) => (
              <StaggerItem key={r.label}>
                <div className="grid grid-cols-2 border-b border-line/60 last:border-0 sm:grid-cols-[0.8fr_1fr_1fr]">
                  <p className="col-span-2 px-5 pt-4 text-[12px] text-mute sm:col-span-1 sm:py-4">{r.label}</p>
                  <p className="p-5 pt-2 text-[15px] sm:pt-4">{r.lease}</p>
                  <p className="border-l border-line p-5 pt-2 text-[15px] sm:pt-4">{r.exclusive}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Reveal>
      <FullTerms className="mt-5" />
    </Block>
  );
}

/* 3 + 4 --------------------------------------------------------------- */
function CanCant() {
  const list = (items: string[], ok: boolean) => (
    <Stagger as="ul" className="space-y-3">
      {items.map((t) => (
        <StaggerItem as="li" key={t}>
          <div className="flex items-start gap-3 text-[15px]">
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${ok ? "bg-coral text-deep" : "bg-stone-300/[0.12] text-nav"}`}>
              {ok ? <CheckIcon size={13} /> : <CloseIcon size={12} />}
            </span>
            {t}
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
  return (
    <Block id="rights-can-cant" n="03" title={<>What you can &amp; can&apos;t do</>}>
      <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
        <div className="rounded-[22px] border border-line p-6 sm:p-8">
          <p className="display mb-6 text-[26px]">You can</p>
          {list(canDo, true)}
        </div>
        <div className="rounded-[22px] border border-line p-6 sm:p-8">
          <p className="display mb-6 text-[26px] text-stone-300">You can&apos;t</p>
          {list(cantDo, false)}
        </div>
      </div>
      <FullTerms className="mt-5" />
    </Block>
  );
}

/* 5 ------------------------------------------------------------------ */
function Donut({ share, color, label }: { share: number; color: string; label: string }) {
  const reduce = useReducedMotion();
  return (
    <figure className="flex flex-col items-center">
      <div className="relative h-44 w-44 sm:h-52 sm:w-52">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${label}: SLAPGOD ${share}%, you ${100 - share}%`}>
          <circle cx="60" cy="60" r="48" fill="none" style={{ stroke: "rgb(255 255 255 / 0.08)" }} strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            style={{ stroke: color }}
            strokeWidth="10"
            strokeLinecap="round"
            initial={reduce ? { pathLength: share / 100 } : { pathLength: 0 }}
            whileInView={{ pathLength: share / 100 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="display text-[26px]" style={{ color }}>
              {share}%
            </p>
            <p className="text-[12px] text-mute">SLAPGOD</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs">{label}</figcaption>
    </figure>
  );
}

function Splits() {
  return (
    <Block id="rights-splits" n="04" title={<>Publishing splits</>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr] grid-cols-1">
        <div className="grid gap-6 rounded-[22px] border border-line bg-surface/40 p-6 sm:grid-cols-2 sm:p-8 grid-cols-1">
          <div>
            <Donut share={splits.beats.share} color="var(--coral)" label={splits.beats.label} />
            <p className="mt-3 text-center text-[13px] text-mute">{splits.beats.text}</p>
          </div>
          <div>
            <Donut share={splits.loops.share} color="var(--lilac)" label={splits.loops.label} />
            <p className="mt-3 text-center text-[13px] text-mute">{splits.loops.text}</p>
          </div>
        </div>
        <div className="rounded-[22px] border border-line p-6 sm:p-8">
          <p className="display text-[26px]">How to register your song</p>
          <Stagger as="ul" className="relative mt-6 space-y-5">
            {registerSteps.map((s, i) => (
              <StaggerItem as="li" key={s.title}>
                <div className="flex gap-4">
                  <span className="display grid h-11 w-11 shrink-0 place-items-center rounded-full bg-coral/[0.14] text-xl text-coral">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-0.5 text-[14px] text-mute">{s.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={SPLIT_SHEET_URL} className="btn btn-primary btn-sm" download>
              <DownloadIcon size={14} /> Split sheet template
            </a>
            <Link href="/contact?topic=split-sheet" className="btn btn-ghost btn-sm">
              Email your split sheet
            </Link>
          </div>
        </div>
      </div>
      <FullTerms className="mt-5" />
    </Block>
  );
}

/* 6 + 7 + 8 ----------------------------------------------------------- */
function CreditsClaims() {
  const [copied, setCopied] = useState(false);
  return (
    <Block id="rights-credits" n="05" title={<>Credits, claims &amp; originality</>}>
      <div className="grid gap-4 lg:grid-cols-3 grid-cols-1">
        <Reveal className="lg:col-span-2">
          <div className="flex h-full flex-col justify-between rounded-[22px] border border-line bg-surface/40 p-6 sm:p-8">
            <div>
              <p className="eyebrow">Credit format</p>
              <p className="mt-4 break-words text-2xl text-bone sm:text-4xl">
                &ldquo;{CREDIT_FORMAT}&rdquo;
              </p>
              <p className="mt-4 text-[14px] text-mute">Use it in song titles/descriptions where possible, and in your distributor&apos;s producer credit field.</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-6 w-fit"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(CREDIT_FORMAT);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard blocked */
                }
              }}
            >
              {copied ? (
                <>
                  <CheckIcon size={14} /> Copied
                </>
              ) : (
                "Copy credit"
              )}
            </button>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[22px] border border-line p-8 text-center">
            <span className="bg-grad grid h-16 w-16 place-items-center rounded-full">
              <CheckIcon size={26} />
            </span>
            <p className="display mt-6 text-[28px]">Sample-safe guarantee</p>
            <p className="mt-2 text-[14px] text-mute">100% original — every guitar played by SLAPGOD. No uncleared samples.</p>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-3">
          <div className="grid gap-6 rounded-[22px] border border-line p-6 sm:p-8 md:grid-cols-[1fr_1.4fr] md:items-center grid-cols-1">
            <div>
              <p className="eyebrow !text-amber">Got a Content ID claim?</p>
              <p className="display mt-3 text-[32px]">Don&apos;t panic. We&apos;ll whitelist you.</p>
            </div>
            <div>
              <ol className="grid gap-3 text-[14px] sm:grid-cols-3 grid-cols-1">
                {["Grab the video link + your order number", "Send them via the contact form (topic: Content ID)", "We clear it fast — usually within 48h"].map((s, i) => (
                  <li key={s} className="rounded-2xl border border-line p-4">
                    <span className="text-xs font-semibold text-coral">0{i + 1}</span>
                    <p className="mt-1">{s}</p>
                  </li>
                ))}
              </ol>
              <Link href="/contact?topic=content-id" className="btn btn-sm btn-ghost mt-4">
                Report a claim <ArrowIcon size={14} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Block>
  );
}

/* 9 ------------------------------------------------------------------ */
function Caps() {
  const reduce = useReducedMotion();
  const tiers = licenseTiers.slice(0, 4);
  const widths = [18, 42, 66, 100];
  return (
    <Block id="rights-caps" n="06" title={<>Stream caps &amp; upgrades</>}>
      <div className="grid gap-8 rounded-[22px] border border-line p-6 sm:p-8 lg:grid-cols-[1fr_1.5fr] grid-cols-1">
        <div className="space-y-4 text-[15px] text-bone/85">
          <p>Each lease covers your song up to a stream + sales cap, for a set term. Caps count across all platforms combined.</p>
          <p>
            Getting close? <strong className="text-white">Upgrade anytime and just pay the difference</strong> — your release stays up, nothing resets.
          </p>
          <FullTerms />
        </div>
        <ul className="space-y-4" aria-label="Stream caps per tier">
          {tiers.map((t, i) => (
            <li key={t.id}>
              <div className="mb-1.5 flex justify-between text-[12px]">
                <span>{t.name}</span>
                <span className="text-mute">{t.streams} streams</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-bone/10">
                <motion.div
                  className="h-full origin-left rounded-full bg-grad"
                  style={{ width: "100%" }}
                  initial={reduce ? { scaleX: widths[i] / 100 } : { scaleX: 0 }}
                  whileInView={{ scaleX: widths[i] / 100 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i * 0.12, ease: EASE }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Block>
  );
}

/* 10 ----------------------------------------------------------------- */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <Block id="rights-faq" n="07" title={<>FAQ</>}>
      <div className="divide-y divide-line rounded-[22px] border border-line">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h4>
                <button
                  type="button"
                  id={`${base}-q${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${base}-a${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left text-[16px] font-semibold transition hover:text-coral sm:px-7"
                >
                  {f.q}
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 ${isOpen ? "rotate-45 border-coral bg-coral text-deep" : ""}`}
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
              </h4>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`${base}-a${i}`}
                    role="region"
                    aria-labelledby={`${base}-q${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl px-5 pb-6 text-[15px] leading-relaxed text-mute sm:px-7">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Block>
  );
}
