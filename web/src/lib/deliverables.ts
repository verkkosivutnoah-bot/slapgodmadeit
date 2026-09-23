/**
 * Paid files (server-side). The repo is public, so paid audio NEVER lives in git.
 *
 * Production: Vercel Blob, private store, deterministic pathnames
 *   beats/<slug>/<slug>.mp3 · beats/<slug>/<slug>.wav · beats/<slug>/<slug>-stems.zip
 *   packs/<slug>.zip
 * Local dev without a Blob token: falls back to web/private/beats/<slug>/ (meta.json maps kinds
 * to the original filenames the ingest tool copied there).
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { get } from "@vercel/blob";
import type { FileKind } from "./catalog";

const EXT: Record<FileKind, string> = { mp3: ".mp3", wav: ".wav", stems: "-stems.zip", zip: ".zip" };
const TYPE: Record<FileKind, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  stems: "application/zip",
  zip: "application/zip",
};

export function blobPath(kind: "beat" | "pack", slug: string, file: FileKind) {
  return kind === "pack" ? `packs/${slug}.zip` : `beats/${slug}/${slug}${EXT[file]}`;
}

export function downloadName(title: string, file: FileKind) {
  const base = `SLAPGOD - ${title}`.replace(/[\\/:*?"<>|]/g, "");
  return `${base}${file === "stems" ? " (stems).zip" : EXT[file]}`;
}

export interface OpenedFile {
  stream: ReadableStream<Uint8Array>;
  size: number | null;
  contentType: string;
}

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function openDeliverable(kind: "beat" | "pack", slug: string, file: FileKind): Promise<OpenedFile | null> {
  if (blobConfigured()) {
    const res = await get(blobPath(kind, slug, file), { access: "private" }).catch(() => null);
    if (res && res.statusCode === 200) {
      return { stream: res.stream, size: res.blob.size, contentType: res.blob.contentType || TYPE[file] };
    }
    if (process.env.NODE_ENV === "production") return null;
  }
  return openLocal(kind, slug, file);
}

/** Dev fallback: the files the ingest tool copied into web/private/beats/<slug>/. */
function openLocal(kind: "beat" | "pack", slug: string, file: FileKind): OpenedFile | null {
  if (kind !== "beat") return null;
  const dir = join(process.cwd(), "private", "beats", slug);
  const metaPath = join(dir, "meta.json");
  if (!existsSync(metaPath)) return null;

  const meta = JSON.parse(readFileSync(metaPath, "utf8")) as { sourceFiles?: Record<string, string> };
  const name = meta.sourceFiles?.[file];
  if (!name) return null;

  const path = join(dir, name);
  if (!existsSync(path)) return null;
  return {
    stream: Readable.toWeb(createReadStream(path)) as unknown as ReadableStream<Uint8Array>,
    size: statSync(path).size,
    contentType: TYPE[file],
  };
}

export type { WebReadableStream };
