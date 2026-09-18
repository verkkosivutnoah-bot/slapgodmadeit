import Link from "next/link";
import type { ReactNode } from "react";
import { LineReveal, Reveal } from "./motion";

/** Section header: uppercase eyebrow + serif title (line reveal) + optional lead and right-aligned "View all" link. */
export function SectionHeader({
  eyebrow,
  title,
  children,
  href,
  hrefLabel = "View all",
  action,
  id,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  href?: string;
  hrefLabel?: string;
  action?: ReactNode;
  id?: string;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <div className={`mb-10 flex flex-col gap-5 md:mb-16 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className="max-w-2xl">
        {eyebrow && (
          <Reveal y={8}>
            <p className="eyebrow mb-4">{eyebrow}</p>
          </Reveal>
        )}
        <LineReveal as="h2" id={id} inView lines={[title]} className="display text-[clamp(36px,5.6vw,60px)]" />
        {children && (
          <Reveal delay={0.1} y={10}>
            <div className={`mt-4 max-w-xl text-[16px] leading-relaxed text-stone-400 ${center ? "mx-auto" : ""}`}>{children}</div>
          </Reveal>
        )}
      </div>
      {(href || action) && (
        <Reveal delay={0.15} y={8} className="shrink-0">
          {action ?? (
            <Link href={href!} className="link-u pb-1 text-[15px] font-medium text-nav hover:text-bone">
              {hrefLabel} →
            </Link>
          )}
        </Reveal>
      )}
    </div>
  );
}
