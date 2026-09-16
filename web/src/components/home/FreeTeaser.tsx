import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { Reveal } from "@/components/ui/motion";

export function FreeTeaser() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="free-title">
      <Reveal className="container-sg flex flex-col items-center text-center">
        <p className="eyebrow">Free download</p>
        <h2 id="free-title" className="display mt-3 text-[clamp(38px,6vw,60px)]">
          10 free loops
        </h2>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-stone-300">
          Guitar Vault Lite — ten live guitar loops, straight from the Vault. Confirm the link in your inbox and they&apos;re yours.
        </p>
        <div className="mt-8 w-full max-w-[520px] text-left">
          <EmailCaptureForm source="home_free_teaser" cta="Get the loops" />
        </div>
      </Reveal>
    </section>
  );
}
