/**
 * Free tagged download — the same full-length, producer-tagged MP3 the player streams.
 * No gate: the file is already public once it plays, and a frictionless download is how most
 * leases start (people write the song first, then buy the clean files).
 */
import { DownloadIcon } from "@/components/ui/Icons";

export function FreeTaggedDownload({ src, title }: { src: string; title: string }) {
  const filename = `SLAPGOD - ${title} (tagged).mp3`.replace(/[\\/:*?"<>|]/g, "");
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line p-5 sm:p-6">
      <div>
        <p className="text-[16px] font-medium text-bone">Try it in your session first</p>
        <p className="mt-1 text-[14px] text-mute">Free tagged MP3 · full length · buy a lease for the clean files</p>
      </div>
      <a href={src} download={filename} className="btn btn-ghost shrink-0">
        <DownloadIcon size={15} /> Download tagged
      </a>
    </div>
  );
}
