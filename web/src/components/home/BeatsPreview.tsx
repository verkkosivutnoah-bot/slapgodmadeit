"use client";
import Link from "next/link";
import { BeatRow } from "@/components/beats/BeatRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/motion";
import { beats } from "@/data/beats";

const list = beats.slice(0, 6);

export function BeatsPreview() {
  return (
    <section className="py-20 md:py-28" aria-labelledby="beats-title">
      <div className="container-sg max-w-[920px]">
        <SectionHeader
          id="beats-title"
          eyebrow="Beat catalog"
          title="Fresh beats"
          action={
            <Link href="/beats" className="btn btn-ghost">
              All beats
            </Link>
          }
        >
          Tagged previews, instant delivery, upgrade anytime.
        </SectionHeader>
        <Reveal>
          <ul className="space-y-1">
            {list.map((b) => (
              <BeatRow key={b.id} beat={b} queue={list} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
