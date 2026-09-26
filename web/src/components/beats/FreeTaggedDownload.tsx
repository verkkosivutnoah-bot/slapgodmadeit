"use client";
/** Beat-page card for the free tagged download (email-gated via TaggedDownloadProvider). */
import { DownloadIcon } from "@/components/ui/Icons";
import { useTaggedDownload } from "./TaggedDownload";

export function FreeTaggedDownload({ slug, src, title }: { slug: string; src: string; title: string }) {
  const download = useTaggedDownload();
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line p-5 sm:p-6">
      <div>
        <p className="text-[16px] font-medium text-bone">Try it in your session first</p>
        <p className="mt-1 text-[14px] text-mute">Free tagged MP3 · full length · buy a lease for the clean files</p>
      </div>
      <button type="button" onClick={() => download({ slug, src, title })} className="btn btn-ghost shrink-0">
        <DownloadIcon size={15} /> Download tagged
      </button>
    </div>
  );
}
