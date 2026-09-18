"use client";
import Link from "next/link";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { PackCard } from "./PackCard";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { freePacks, guitarVault } from "@/data/packs";
import { loopLicenseSummary } from "@/data/licenses";

export function FreeDownloads() {
  const [lite, ...others] = freePacks;
  return (
    <div className="container-sg">
      <section aria-labelledby="lite-title" className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <Reveal>
          <MusicPlayer id="free-lite" label="Guitar Vault Lite preview" tracks={lite.demo} />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow">
            <span className="text-amber">Free</span> · {lite.soundLabel}
          </p>
          <h2 id="lite-title" className="display mt-4 text-[clamp(38px,5vw,60px)]">
            {lite.title}
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-stone-300">{lite.description}</p>
          <p className="mt-4 text-[13px] text-mute">{lite.specs.join(" · ")}</p>
          <div className="mt-8 max-w-[540px]">
            <EmailCaptureForm
              source="free_page_guitar_vault_lite"
              cta="Send me the loops"
              successTitle="Check your inbox to confirm"
              successText="Click the confirmation link (double opt-in) and Guitar Vault Lite is delivered to your inbox."
            />
          </div>
          <p className="mt-6 text-[12px] leading-relaxed text-mute">
            *{loopLicenseSummary.points[0]} 25% publishing split on commercially released songs.{" "}
            <Link href="/licenses" className="link-u text-stone-300">
              License
            </Link>
          </p>
        </Reveal>
      </section>

      <section className="section" aria-labelledby="more-free">
        <Reveal>
          <p className="eyebrow">More</p>
          <h2 id="more-free" className="display mb-10 mt-4 text-[clamp(32px,4.4vw,48px)]">
            Keep <span className="text-grad pr-[0.06em] italic">digging</span>
          </h2>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-x-5 gap-y-10 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {[...others, guitarVault].map((p) => (
            <StaggerItem key={p.slug}>
              <PackCard pack={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
