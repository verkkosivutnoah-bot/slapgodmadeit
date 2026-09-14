import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BeatDetail } from "@/components/beats/BeatDetail";
import { beats } from "@/data/beats";

export function generateStaticParams() {
  return beats.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/beats/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const beat = beats.find((b) => b.slug === slug);
  return beat
    ? { title: `${beat.title} — ${beat.genre} beat`, description: `${beat.title} · ${beat.bpm} BPM · ${beat.key}. Prod. by SLAPGOD. Leases from €29.` }
    : { title: "Beat not found" };
}

export default async function BeatPage({ params }: PageProps<"/beats/[slug]">) {
  const { slug } = await params;
  if (!beats.some((b) => b.slug === slug)) notFound();
  return <BeatDetail slug={slug} />;
}
