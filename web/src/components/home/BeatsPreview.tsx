"use client";
import { BeatRow, TrackListHeader } from "@/components/beats/BeatRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { beats } from "@/data/beats";

const list = beats.slice(0, 6);

export function BeatsPreview() {
  return (
    <section className="section" aria-labelledby="beats-title">
      <div className="container-sg">
        <SectionHeader id="beats-title" eyebrow="Beat catalog" title="Fresh beats" href="/beats" hrefLabel="All beats">
          Tagged previews, instant delivery, upgrade anytime.
        </SectionHeader>
        <TrackListHeader />
        <Stagger as="ul" className="mt-2 space-y-0.5">
          {list.map((b, i) => (
            <StaggerItem as="li" key={b.id}>
              <BeatRow beat={b} queue={list} index={i} as="div" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
