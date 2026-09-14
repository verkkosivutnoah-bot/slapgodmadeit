import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { Reveal } from "@/components/ui/motion";
import { Waveform } from "@/components/ui/Icons";

export function Newsletter() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="newsletter-title">
      <div className="container-sg">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] border border-line bg-surface p-8 sm:p-14">
            <Waveform className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-gold/10" bars={120} seed={2} />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end grid-cols-1">
              <div>
                <p className="eyebrow">Newsletter</p>
                <h2 id="newsletter-title" className="display mt-4 text-[13vw] sm:text-7xl md:text-8xl">
                  Get on the <span className="text-gold">list</span>
                </h2>
                <p className="mt-4 max-w-md text-mute">
                  New packs, free loop drops, beat releases and member-only deals. One or two emails a month — no spam.
                </p>
              </div>
              <EmailCaptureForm
                source="home_newsletter"
                cta="Subscribe"
                successTitle="Almost there — check your inbox"
                successText="Confirm your subscription with the link we just sent (double opt-in)."
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
