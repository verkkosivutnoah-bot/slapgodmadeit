"use client";
import { CoverArt } from "@/components/ui/CoverArt";
import Link from "next/link";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { CheckIcon, DownloadIcon, SparkIcon } from "@/components/ui/Icons";
import { freePacks, guitarVault } from "@/data/packs";
import { loopLicenseSummary } from "@/data/licenses";

export function FreeDownloads() {
  const [lite, ...others] = freePacks;
  return (
    <div className="container-sg space-y-16">
      <Reveal>
        <section aria-labelledby="lite-title" className="panel grid gap-10 overflow-hidden p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-14 grid-cols-1">
          <div>
            <MusicPlayer id="free-lite" label="Guitar Vault Lite preview" tracks={lite.demo} />
          </div>
          <div>
            <p className="eyebrow text-ember">
              <DownloadIcon size={12} className="mr-1 inline" /> Free · {lite.soundLabel}
            </p>
            <h2 id="lite-title" className="display mt-3 text-6xl sm:text-8xl">
              {lite.title}
            </h2>
            <p className="mt-4 text-lg text-bone/85">{lite.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {lite.specs.map((s) => (
                <li key={s} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 font-mono text-[11px]">
                  <CheckIcon size={12} className="text-ember" /> {s}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <EmailCaptureForm
                source="free_page_guitar_vault_lite"
                cta="Send me the loops"
                successTitle="Check your inbox to confirm"
                successText="Click the confirmation link (double opt-in) and Guitar Vault Lite is delivered to your inbox."
              />
            </div>
            <p className="mt-6 text-xs text-mute">
              *{loopLicenseSummary.points[0]} 25% publishing split on commercially released songs.{" "}
              <Link href="/licenses" className="underline underline-offset-2">
                License
              </Link>
            </p>
          </div>
        </section>
      </Reveal>

      <section aria-labelledby="more-free">
        <h2 id="more-free" className="display mb-6 text-5xl">
          More freebies
        </h2>
        <Stagger className="grid gap-4 md:grid-cols-2 grid-cols-1">
          {others.map((p) => (
            <StaggerItem key={p.slug}>
              <div className="panel flex items-center gap-5 p-4">
                <CoverArt src={p.cover} title={p.title} alt="" sizes="96px" className="h-24 w-24 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-mute">{p.tagline}</p>
                </div>
                <button type="button" className="btn btn-sm btn-ghost" disabled>
                  Soon
                </button>
              </div>
            </StaggerItem>
          ))}
          <StaggerItem>
            <Link href={`/packs/${guitarVault.slug}`} className="panel group flex items-center gap-5 border-ember/30 p-4">
              <CoverArt src={guitarVault.cover} title={guitarVault.title} alt="" sizes="96px" className="h-24 w-24 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ember">
                  <SparkIcon size={10} /> Want all 50?
                </p>
                <p className="font-semibold">{guitarVault.title}</p>
                <p className="text-sm text-mute">Upgrade to the full Vault →</p>
              </div>
            </Link>
          </StaggerItem>
        </Stagger>
      </section>
    </div>
  );
}
