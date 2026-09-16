import type { ReactNode } from "react";
import { Reveal } from "./motion";

/** Calm section header: small muted eyebrow, big serif title, optional lead + action. */
export function SectionHeader({
  eyebrow,
  title,
  children,
  action,
  id,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  ghost?: string;
  children?: ReactNode;
  action?: ReactNode;
  id?: string;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <Reveal className={`mb-10 flex flex-col gap-5 md:mb-14 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 id={id} className="display text-[clamp(36px,6vw,56px)]">
          {title}
        </h2>
        {children && <div className={`mt-4 max-w-xl text-[16px] leading-relaxed text-stone-300 ${center ? "mx-auto" : ""}`}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
