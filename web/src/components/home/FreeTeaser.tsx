"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { Reveal } from "@/components/ui/motion";
import { DownloadIcon, Sticker } from "@/components/ui/Icons";
import { freePacks } from "@/data/packs";

export function FreeTeaser() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-14, 10]);
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const lite = freePacks[0];

  return (
    <section ref={ref} className="py-20 md:py-28" aria-labelledby="free-title">
      <div className="container-sg">
        <div className="relative overflow-hidden rounded-[36px] border border-ember/25 bg-[radial-gradient(90%_120%_at_100%_0%,rgb(var(--ember-rgb)/0.18),transparent_55%),linear-gradient(160deg,var(--color-raised),var(--color-ink))] p-7 sm:p-12 lg:p-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] grid-cols-1">
            <div>
              <Reveal>
                <p className="eyebrow text-ember">Free samples</p>
                <h2 id="free-title" className="display mt-4 text-[14vw] sm:text-8xl">
                  10 free
                  <br />
                  <span className="text-ember">loops.</span>
                </h2>
                <p className="mt-5 max-w-lg text-lg text-bone/85">
                  Get <strong className="text-bone">Guitar Vault Lite</strong> — ten live guitar loops straight from the Vault. Drop your email, confirm the double
                  opt-in and they&apos;re yours.
                </p>
              </Reveal>
              <Reveal delay={0.1} className="mt-8 max-w-xl">
                <EmailCaptureForm source="home_free_teaser" cta="Unlock loops" />
              </Reveal>
              <ul className="mt-8 flex flex-wrap gap-2">
                {freePacks.map((f) => (
                  <li key={f.slug}>
                    <Link href="/free" className="chip gap-2">
                      <DownloadIcon size={12} /> {f.title}
                      {f.placeholder && <span className="text-mute/70">· soon</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div className="relative mx-auto w-full max-w-[380px]" style={reduce ? undefined : { rotate, y }}>
              <CoverArt src={lite.cover} title={lite.title} sizes="(max-width: 1024px) 80vw, 380px" className="aspect-square w-full rounded-3xl shadow-[0_40px_100px_-30px_rgb(var(--ember-rgb)/0.35)]" />
              <Sticker text="FREE DOWNLOAD • FREE DOWNLOAD • " className="absolute -left-8 -top-8 h-28 w-28 text-ember">
                <DownloadIcon size={26} />
              </Sticker>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
