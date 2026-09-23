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

const a = (f: string) => `/audio/${f}.m4a`;
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
  beat("No-Faces", "EBK Young Joc Type Beat | No faces", "beats/No-Faces", "Drill", 100, "C# maj", ["Dark", "Aggressive"], ["piano", "808"], { isNew: true, duration: "0:45" }),
  beat("midnight-ritual", "Midnight Ritual", "midnight-ritual", "Trap", 142, "F min", ["Dark", "Hypnotic"], ["bells", "808 glide"], { featured: true, isNew: true }),
  beat("glass-teeth", "Glass Teeth", "glass-teeth", "Drill", 144, "C# min", ["Aggressive", "Dark"], ["uk drill", "sliding 808"], { featured: true }),
  beat("velvet-static", "Velvet Static", "velvet-static", "R&B", 96, "D# min", ["Sensual", "Moody"], ["pads", "late night"], { featured: true, isNew: true }),
  beat("lagos-neon", "Lagos Neon", "lagos-neon", "Afrobeats", 108, "G min", ["Bouncy", "Energetic"], ["percs", "summer"], { featured: true }),
  beat("dusty-halo", "Dusty Halo", "dusty-halo", "Boom Bap", 90, "A min", ["Nostalgic", "Moody"], ["swing", "keys"]),
  beat("plum-smoke", "Plum Smoke", "plum-smoke", "Dark Trap", 130, "B min", ["Dark", "Moody"], ["pads", "ambient"], { isNew: true }),
  beat("chrome-halo", "Chrome Halo", "midnight-ritual", "Trap", 150, "F min", ["Energetic", "Hypnotic"], ["bells", "rage"]),
  beat("no-signal", "No Signal", "glass-teeth", "Drill", 142, "C# min", ["Aggressive"], ["ny drill", "choir"]),
  beat("cigarette-sunday", "Cigarette Sunday", "dusty-halo", "Boom Bap", 88, "A min", ["Nostalgic"], ["dusty", "jazz"]),
  beat("silk-alarm", "Silk Alarm", "velvet-static", "R&B", 98, "D# min", ["Sensual"], ["guitar", "slow jam"]),
  beat("heatwave-mirage", "Heatwave Mirage", "lagos-neon", "Afrobeats", 110, "G min", ["Bouncy"], ["amapiano", "log drum"]),
  beat("ghost-parade", "Ghost Parade", "plum-smoke", "Dark Trap", 132, "B min", ["Dark", "Hypnotic"], ["horror", "choir"]),
];

export const GENRES: Genre[] = ["Trap", "Drill", "Dark Trap", "R&B", "Boom Bap", "Afrobeats"];
export const MOODS: Mood[] = ["Dark", "Aggressive", "Hypnotic", "Nostalgic", "Sensual", "Bouncy", "Moody", "Energetic"];
export const KEYS = Array.from(new Set(beats.map((b) => b.key))).sort();

export function toPlayerTrack(b: Pick<Beat, "id" | "title" | "artist" | "cover" | "src">) {
  return { id: b.id, title: b.title, artist: b.artist, cover: b.cover, src: b.src };
}
