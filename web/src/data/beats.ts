// Placeholder beat catalog. Replace with CMS / DB data later.
// Audio: public/audio/*.m4a (synthesized placeholders — see scripts/gen-audio.py)
// Covers: public/covers/beats/<slug>.(webp|jpg|png) — falls back to generated placeholders (src/data/covers.ts)

import { coverFor } from "./covers";

export type Genre = "Trap" | "Drill" | "Boom Bap" | "R&B" | "Afrobeats" | "Dark Trap";
export type Mood =
  | "Dark"
  | "Aggressive"
  | "Hypnotic"
  | "Nostalgic"
  | "Sensual"
  | "Bouncy"
  | "Moody"
  | "Energetic";

export interface Beat {
  id: string;
  slug: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  genre: Genre;
  moods: Mood[];
  tags: string[];
  duration: string;
  cover: string;
  src: string;
  priceFrom: number;
  isNew?: boolean;
  featured?: boolean;
}

/** Public tagged audio. Pass "beats/<slug>.mp3"; a bare name keeps the old .m4a placeholders working. */
const a = (f: string) => `/audio/${/\.(mp3|m4a)$/.test(f) ? f : `${f}.m4a`}`;
const c = (slug: string) => coverFor("beats", slug);

function beat(
  slug: string,
  title: string,
  audio: string,
  genre: Genre,
  bpm: number,
  key: string,
  moods: Mood[],
  tags: string[],
  extra: Partial<Beat> = {}
): Beat {
  return {
    id: `beat_${slug}`,
    slug,
    title,
    artist: "SLAPGOD",
    bpm,
    key,
    genre,
    moods,
    tags,
    duration: "0:27",
    cover: c(slug),
    src: a(audio),
    priceFrom: 29,
    ...extra,
  };
}

export const beats: Beat[] = [
  beat("no-faces", "No Faces", "beats/no-faces.mp3", "Drill", 100, "C# maj", ["Dark", "Aggressive"], ["ebk young joc type beat", "piano", "808"], { isNew: true, duration: "2:45" }),
];

export const GENRES: Genre[] = ["Trap", "Drill", "Dark Trap", "R&B", "Boom Bap", "Afrobeats"];
export const MOODS: Mood[] = ["Dark", "Aggressive", "Hypnotic", "Nostalgic", "Sensual", "Bouncy", "Moody", "Energetic"];
export const KEYS = Array.from(new Set(beats.map((b) => b.key))).sort();

export function toPlayerTrack(b: Pick<Beat, "id" | "title" | "artist" | "cover" | "src">) {
  return { id: b.id, title: b.title, artist: b.artist, cover: b.cover, src: b.src };
}
