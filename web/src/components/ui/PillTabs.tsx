"use client";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { EASE } from "./motion";

/** Single-select pill tabs with a sliding active indicator (layoutId). Scrolls horizontally on small screens. */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
  labels?: Partial<Record<T, string>>;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div role="tablist" aria-label={label} className={`no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-stone-300/[0.07] p-1 [scrollbar-width:none] ${className}`}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o)}
            className={`relative h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-colors duration-300 [@media(pointer:coarse)]:h-10 ${
              active ? "text-deep" : "text-stone-400 hover:text-bone"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`pill-${id}`}
                className="absolute inset-0 rounded-full bg-coral shadow-[0_6px_18px_-6px_rgb(var(--coral-rgb)/0.8)]"
                transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
              />
            )}
            <span className="relative">{labels?.[o] ?? o}</span>
          </button>
        );
      })}
    </div>
  );
}
