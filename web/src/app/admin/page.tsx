import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminUploader } from "@/components/admin/AdminUploader";

export const metadata: Metadata = { title: "Upload a beat", robots: { index: false, follow: false } };

/** Local tool: exists only while `next dev` runs. In production this 404s. */
export default function AdminPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="container-sg pb-28 pt-32">
      <p className="eyebrow">
        <span className="text-amber">Local only</span> · not on the live site
      </p>
      <h1 className="display mt-4 text-[clamp(36px,5vw,60px)]">
        Upload a <span className="text-grad">beat</span>
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-stone-400">
        Drop the files for one beat. The key comes from the audio, the BPM from the filename — put it
        in there, like <span className="text-bone">Midnight Ritual 140bpm.wav</span>. Only a tagged
        45-second preview becomes public; masters and stems stay private.
      </p>
      <AdminUploader />
    </div>
  );
}
