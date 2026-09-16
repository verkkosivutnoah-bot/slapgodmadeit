"use client";
import Link from "next/link";
import { PackCard } from "@/components/packs/PackCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { packs } from "@/data/packs";

export function FeaturedPacks() {
  const items = packs.filter((p) => p.slug !== "guitar-vault-vol-1").slice(0, 6);
  return (
    <section className="py-20 md:py-28" aria-labelledby="packs-title">
      <div className="container-sg">
        <SectionHeader
          id="packs-title"
          eyebrow="Loops & sample packs"
          title="Packs"
          action={
            <Link href="/packs" className="btn btn-ghost">
              All packs
            </Link>
          }
        >
          Royalty-free loops, drum kits and bundles — every sound original.
        </SectionHeader>
        <Stagger className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <StaggerItem key={p.slug}>
              <PackCard pack={p} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
