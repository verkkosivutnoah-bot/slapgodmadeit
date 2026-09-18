import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { LineReveal, Reveal } from "@/components/ui/motion";

export function FreeTeaser() {
  return (
    <section className="section relative overflow-hidden" aria-labelledby="free-title">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_55%_at_50%_50%,rgb(255_255_255/0.06),transparent_75%)]"
        aria-hidden
      />
      <div className="container-sg flex flex-col items-center text-center">
        <Reveal y={8}>
          <p className="eyebrow">Free download · Guitar Vault Lite</p>
        </Reveal>
        <LineReveal
          as="h2"
          id="free-title"
          inView
          lines={["Ten loops.", <span key="2" className="text-silver">On the house.</span>]}
          className="display mt-5 text-[clamp(44px,8vw,96px)] leading-[1]"
        />
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-stone-400">
            Ten live guitar loops straight from the Vault. Drop your email, confirm the link, and they&apos;re yours.
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10 w-full max-w-[540px] text-left">
          <EmailCaptureForm source="home_free_teaser" cta="Get the loops" />
        </Reveal>
      </div>
    </section>
  );
}
