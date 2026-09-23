// Sample / loop pack catalog.
// Prices are set per currency (EUR incl. VAT; USD currently the same number) — see src/lib/currency.tsx.
// FLAGSHIP (real): "guitar-vault-vol-1" — demo previews are the owner's real loops in
// public/audio/packs/spanish-guitar/. Everything marked `placeholder: true` is mock data.
import type { Track } from "@/components/player/MusicPlayer";
import { coverFor } from "./covers";

export type PackType =
  | "Guitar Loops"
  | "Mini Loop Kit"
  | "Drum Kit"
  | "Loop Pack"
  | "Premium Pack"
  | "Bundle"
  | "Subscription"
  | "Free Kit";

export interface PackCategory {
  name: string;
  count: number;
  unit: "loops" | "hits" | "folders" | "sounds" | "files" | "packs";
  detail?: string;
  examples?: string[];
}

export interface Pack {
  slug: string;
  title: string;
  type: PackType;
  /** Amount in the store currency (EUR incl. VAT). USD uses `priceUSD` or the same number. 0 = free. */
  price: number;
  priceUSD?: number;
  compareAt?: number;
  interval?: "month";
  placeholder?: boolean;
  comingSoon?: boolean;
  tagline: string;
  description: string;
  soundCount: number;
  soundLabel?: string;
  specs: string[];
  genres: string[];
  bpmRange?: string;
  categories: PackCategory[];
  cover: string;
  badge?: "NEW" | "FLAGSHIP" | "BESTSELLER" | "FREE" | "SAVE 30%" | "BEST VALUE" | "SOON";
  deal?: string;
  featured?: boolean;
  demo: Track[];
}

const cover = (slug: string) => coverFor("packs", slug);
const guitar = (n: number) => `/audio/packs/spanish-guitar/spanish-guitar-0${n}-100bpm-cmin.mp3`;
function withCover(p: Omit<Pack, "cover">): Pack {
  const c = cover(p.slug);
  return { ...p, cover: c, demo: p.demo.map((t) => ({ ...t, cover: c })) };
}

export const GUITAR_SPECS = [
  "WAV 24-bit / 48kHz",
  "Wet + dry versions",
  "BPM + key in filenames",
  "70–160 BPM",
  "Tempo-synced",
  "100% royalty-free*",
];

/* ------------------------------------------------------------ flagship */

export const guitarVault: Pack = withCover({
  slug: "guitar-vault-vol-1",
  title: "SLAPGOD Guitar Vault Vol. 1",
  type: "Guitar Loops",
  price: 39,
  compareAt: 59,
  deal: "Launch deal",
  tagline: "50 live guitar loops + one-shots. Every note played by SLAPGOD.",
  description:
    "The Guitar Vault is SLAPGOD's personal stash of original live guitar — nylon and steel-string chord progressions, melodies, fingerstyle arps, strums, ambient textures and percussive body hits, recorded clean and delivered wet + dry. Built to flip into trap, drill, R&B, reggaeton and afro. No uncleared samples, no recycled presets: 100% original, played by hand.",
  soundCount: 90,
  soundLabel: "50 loops + ~40 one-shots",
  specs: GUITAR_SPECS,
  genres: ["Trap", "R&B", "Drill", "Latin", "Afro"],
  bpmRange: "70–160",
  categories: [
    {
      name: "Chord Progressions",
      count: 10,
      unit: "loops",
      examples: ["SG_GV1_Chords_01_Noche_100bpm_Cmin", "SG_GV1_Chords_04_Velvet_84bpm_Ebmaj", "SG_GV1_Chords_09_Rosa_140bpm_Amin"],
    },
    {
      name: "Melodies & Leads",
      count: 10,
      unit: "loops",
      examples: ["SG_GV1_Melody_02_Sangre_100bpm_Cmin", "SG_GV1_Melody_06_Humo_150bpm_F#min"],
    },
    {
      name: "Fingerstyle & Arpeggios",
      count: 8,
      unit: "loops",
      examples: ["SG_GV1_Arp_03_Luna_92bpm_Dmin", "SG_GV1_Arp_07_Cristal_128bpm_Gmin"],
    },
    {
      name: "Strums & Rhythm",
      count: 6,
      unit: "loops",
      examples: ["SG_GV1_Strum_01_Calle_104bpm_Amin", "SG_GV1_Strum_05_Fuego_96bpm_Emin"],
    },
    {
      name: "Ambient, Reverse & Textures",
      count: 6,
      unit: "loops",
      examples: ["SG_GV1_Texture_02_Reverse_70bpm_Cmin", "SG_GV1_Texture_06_Haze_160bpm_Bmin"],
    },
    {
      name: "Percussive & Body Hits",
      count: 5,
      unit: "loops",
      examples: ["SG_GV1_Perc_01_BodyKnock_100bpm", "SG_GV1_Perc_04_Slap_140bpm"],
    },
    {
      name: "One-Shots",
      count: 5,
      unit: "folders",
      detail: "~40 hits — chords, stabs, harmonics, slides, FX",
      examples: ["Chords/", "Stabs/", "Harmonics/", "Slides/", "FX/"],
    },
  ],
  badge: "FLAGSHIP",
  featured: true,
  demo: [
    ["Vault preview 01", 1],
    ["Vault preview 02", 2],
    ["Vault preview 03", 3],
    ["Vault preview 04", 4],
    ["Vault preview 05", 5],
  ].map(([title, n]) => ({
    id: `guitar-vault-0${n}`,
    title: String(title),
    artist: "Guitar Vault Vol. 1 · 100 BPM · C min",
    cover: "",
    src: guitar(Number(n)),
  })),
});

/* ------------------------------------------------------------ placeholders */

export const packs: Pack[] = [
  guitarVault,
];

export const loopClub: Pack = withCover({
  placeholder: true,
  comingSoon: true,
  slug: "loop-club",
  title: "Loop Club",
  type: "Subscription",
  price: 12,
  interval: "month",
  tagline: "1 new pack every month + member discounts.",
  description: "Join the Loop Club: a fresh SLAPGOD pack in your inbox every month, early access to new drops and member-only discounts on beats and bundles.",
  soundCount: 0,
  specs: ["1 pack / month", "Member discounts", "Cancel anytime"],
  genres: [],
  categories: [],
  badge: "SOON",
  demo: [],
});

/* ------------------------------------------------------------ free */

export const freePacks: Pack[] = [
  withCover({
    slug: "guitar-vault-lite",
    title: "Vault Sampler",
    type: "Free Kit",
    price: 0,
    tagline: "10 free sounds from the Vault — on the house.",
    description:
      "A free cut from the Vault — ten original sounds, made from scratch. Enter your email and the download link lands in your inbox.",
    soundCount: 10,
    soundLabel: "10 sounds",
    specs: ["WAV 24-bit / 48kHz", "BPM + key in filenames", "Royalty-free*"],
    genres: ["Trap", "R&B", "Latin"],
    bpmRange: "100",
    categories: [{ name: "Loops & one-shots", count: 10, unit: "sounds" }],
    badge: "FREE",
    featured: true,
    demo: [{ id: "guitar-vault-lite-01", title: "Sampler 01", artist: "SLAPGOD · 100 BPM · C min", cover: "", src: guitar(1) }],
  }),
];

export const allPacks = [...packs, ...freePacks];

export function getPack(slug: string) {
  return allPacks.find((p) => p.slug === slug);
}

export const loopCount = (p: Pack) =>
  p.categories.filter((c) => c.unit === "loops").reduce((s, c) => s + c.count, 0);
