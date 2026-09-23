"use client";
/**
 * Admin dashboard (dev only): drop a beat in, check what was detected, publish.
 *
 * upload → POST /api/admin/analyze (librosa key detection, BPM from filename)
 *        → edit what it found
 *        → POST /api/admin/publish (preview + private files + catalog, optional git push)
 */
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GENRES, MOODS } from "@/data/beats";
import { CheckIcon } from "@/components/ui/Icons";

type Analysis = {
  jobDir: string;
  slug: string;
  title: string;
  bpm: number;
  bpmSource: string;
  key: string;
  keyConfidence: number;
  keyAlternatives: string[];
  durationLabel: string;
  files: Record<string, string>;
  cover: string | null;
  hashtags: string[];
  caption: string;
};

type Published = { slug: string; title: string; deployed: boolean; caption: string; gitError?: string };

const EASE = [0.22, 1, 0.36, 1] as const;
const field = "w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-bone outline-none focus:border-coral";

export function AdminUploader() {
  const [busy, setBusy] = useState<"" | "analyzing" | "publishing">("");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [a, setA] = useState<Analysis | null>(null);
  const [done, setDone] = useState<Published | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // editable fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [bpm, setBpm] = useState<number>(0);
  const [key, setKey] = useState("");
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [moods, setMoods] = useState<string[]>(["Dark"]);
  const [tags, setTags] = useState("");
  const [deploy, setDeploy] = useState(true);
  const [cover, setCover] = useState<{ name: string; url: string } | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const analyze = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const audio = list.find((f) => /\.(wav|aiff?|flac|mp3|m4a)$/i.test(f.name));
    if (!audio) {
      setError("No audio file in there — drop a .wav or .mp3.");
      return;
    }
    setError("");
    setDone(null);
    setBusy("analyzing");
    try {
      const fd = new FormData();
      for (const f of list) fd.append("file", f);
      const res = await fetch("/api/admin/analyze", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Analysis failed.");
      setA(data);
      const img = list.find((f) => /\.(jpe?g|png|webp)$/i.test(f.name));
      setCover(img ? { name: img.name, url: URL.createObjectURL(img) } : null);
      setTitle(data.title);
      setSlug(data.slug);
      setBpm(data.bpm);
      setKey(data.key);
      setTags("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }, []);

  async function addCover(file: File) {
    if (!a) return;
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobDir", a.jobDir);
      const res = await fetch("/api/admin/cover", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Couldn't attach that cover.");
      setCover({ name: file.name, url: URL.createObjectURL(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function publish() {
    if (!a) return;
    setBusy("publishing");
    setError("");
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDir: a.jobDir,
          title,
          slug,
          bpm,
          key,
          genre,
          moods,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          deploy,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Publish failed.");
      setDone(data);
      setA(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const low = a && a.keyConfidence < 0.6;

  return (
    <div className="mt-10 max-w-3xl">
      {/* drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void analyze(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`grid cursor-pointer place-items-center rounded-[24px] border border-dashed px-6 py-14 text-center transition-colors ${
          drag ? "border-coral bg-coral/[0.06]" : "border-line hover:border-stone-600"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".wav,.aif,.aiff,.flac,.mp3,.m4a,.zip,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => e.target.files && void analyze(e.target.files)}
        />
        <p className="text-[17px] text-bone">
          {busy === "analyzing" ? "Listening for the key…" : "Drop the beat here"}
        </p>
        <p className="mt-2 text-[14px] text-mute">
          {busy === "analyzing" ? "librosa, ~15 seconds" : "wav or mp3 · BPM in the filename"}
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-5 whitespace-pre-wrap rounded-xl border border-coral/40 bg-coral/[0.07] p-4 text-[14px] text-coral">
          {error}
        </p>
      )}

      <AnimatePresence mode="wait">
        {a && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-8 rounded-[24px] border border-line p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[14px] text-mute">
              <span>
                detected key <span className="font-semibold text-bone">{a.key}</span>{" "}
                <span className={low ? "text-amber" : "text-mute"}>({a.keyConfidence.toFixed(2)})</span>
              </span>
              <span>
                bpm <span className="font-semibold text-bone">{a.bpm}</span> ({a.bpmSource})
              </span>
              <span>
                preview <span className="font-semibold text-bone">{a.durationLabel}</span>
              </span>
              <span>files: {Object.values(a.files).join(", ") || "—"}</span>
            </div>
            {low && (
              <p className="mt-3 rounded-xl border border-amber/30 bg-amber/[0.07] p-3 text-[13px] text-amber">
                Low confidence. Could also be {a.keyAlternatives.slice(0, 2).join(" or ")} — check by ear before publishing.
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[13px] text-mute">Title</span>
                <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-mute">URL slug</span>
                <input className={field} value={slug} onChange={(e) => setSlug(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-mute">Key</span>
                <input className={field} value={key} onChange={(e) => setKey(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] text-mute">BPM</span>
                <input className={field} type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
              </label>
            </div>

            <div className="mt-6">
              <span className="mb-3 block text-[13px] text-mute">Genre</span>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    aria-pressed={genre === g}
                    className="chip"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <span className="mb-3 block text-[13px] text-mute">Moods</span>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoods((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]))}
                    aria-pressed={moods.includes(m)}
                    className="chip"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-6 block">
              <span className="mb-2 block text-[13px] text-mute">Descriptors (comma-separated)</span>
              <input className={field} placeholder="bells, 808 glide" value={tags} onChange={(e) => setTags(e.target.value)} />
            </label>

            <div className="mt-6">
              <span className="mb-3 block text-[13px] text-mute">Cover art</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => coverRef.current?.click()}
                  className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-line text-[12px] text-mute transition-colors hover:border-coral hover:text-coral"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "Add"
                  )}
                </button>
                <div className="text-[13px] leading-relaxed text-mute">
                  {cover ? (
                    <>
                      <span className="text-bone">{cover.name}</span>
                      <br />
                      Saved as <span className="text-bone">covers/beats/{slug}</span>
                    </>
                  ) : (
                    <>
                      Square JPG, 2000×2000 or larger.
                      <br />
                      Without one, generated placeholder art is used.
                    </>
                  )}
                </div>
              </div>
              <input
                ref={coverRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && void addCover(e.target.files[0])}
              />
            </div>

            <label className="mt-6 flex cursor-pointer items-center gap-3 text-[14px] text-stone-300">
              <input
                type="checkbox"
                checked={deploy}
                onChange={(e) => setDeploy(e.target.checked)}
                className="h-[18px] w-[18px] accent-[var(--coral)]"
              />
              Commit and push when published (deploys to the live site)
            </label>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={publish} disabled={busy !== ""} className="btn btn-primary">
                {busy === "publishing" ? "Publishing…" : deploy ? "Publish & deploy" : "Publish locally"}
              </button>
              <button type="button" onClick={() => setA(null)} className="btn btn-ghost">
                Discard
              </button>
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-[24px] border border-coral/30 bg-coral/[0.05] p-6 sm:p-8"
          >
            <p className="flex items-center gap-3 text-[18px] text-bone">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-coral text-deep">
                <CheckIcon size={16} />
              </span>
              {done.title} published
            </p>
            <p className="mt-4 text-[14px] text-stone-300">
              <a href={`/beats/${done.slug}`} className="link-u text-bone">
                /beats/{done.slug}
              </a>{" "}
              · {done.deployed ? "pushed — live in about a minute" : "local only, not pushed"}
            </p>
            {done.gitError && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl border border-amber/30 bg-amber/[0.07] p-3 text-[13px] text-amber">
                Published locally, but git failed:{"\n"}
                {done.gitError}
              </p>
            )}
            <p className="mt-5 text-[13px] text-mute">Caption for socials:</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-line bg-deep p-4 text-[13px] text-stone-300">
              {done.caption}
            </pre>
            <p className="mt-5 text-[13px] text-mute">
              Drop the WAV and stems in <span className="text-bone">web/private/beats/{done.slug}/</span> if they
              weren&apos;t in the upload.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
