import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { LineReveal, Reveal } from "@/components/ui/motion";

export function FreeTeaser() {
  return (
    <section className="section relative overflow-hidden" aria-labelledby="free-title">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(38%_50%_at_35%_50%,rgb(var(--coral-rgb)/0.14),transparent_75%),radial-gradient(38%_50%_at_65%_55%,rgb(var(--lilac-rgb)/0.14),transparent_75%)]"
        aria-hidden
      />
      <div className="container-sg flex flex-col items-center text-center">
        <Reveal y={8}>
          <p className="eyebrow">
            <span className="text-amber">Free download</span> · Vault Sampler
          </p>
        </Reveal>
        <LineReveal
          as="h2"
          id="free-title"
          inView
          lines={["Ten loops.", <span key="2" className="text-grad pr-[0.05em] italic">On the house.</span>]}
          className="display mt-5 text-[clamp(44px,8vw,96px)] leading-[1]"
        />
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-stone-400">
            Ten original sounds straight from the Vault. Drop your email and they&apos;re yours.
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10 w-full max-w-[540px] text-left">
          <EmailCaptureForm source="home_free_teaser" cta="Get the loops" />
        </Reveal>
      </div>
    </section>
  );
}
