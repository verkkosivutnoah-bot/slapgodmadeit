import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackDetail } from "@/components/packs/PackDetail";
import { allPacks, getPack } from "@/data/packs";

export function generateStaticParams() {
  return allPacks.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/packs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPack(slug);
  return pack ? { title: pack.title, description: pack.tagline } : { title: "Pack not found" };
}

export default async function PackPage({ params }: PageProps<"/packs/[slug]">) {
  const { slug } = await params;
  const pack = getPack(slug);
  if (!pack) notFound();
  return <PackDetail slug={pack.slug} />;
}
