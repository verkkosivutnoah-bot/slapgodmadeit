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
const mock = (packTitle: string, files: [string, string][]): Track[] =>
  files.map(([title, file], i) => ({
    id: `${packTitle}-${i}`,
    title,
    artist: `${packTitle} · demo`,
    cover: "",
    src: `/audio/${file}.m4a`,
  }));

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
  withCover({
    placeholder: true,
    slug: "neon-nights-premium",
    title: "Neon Nights Premium",
    type: "Premium Pack",
    price: 45,
    tagline: "55 dark melodic loops with stems + MIDI.",
    description:
      "A premium melody library: bells, choirs, detuned keys and haunted pads, every loop delivered with full stems and MIDI so you can re-voice, rearrange and make it yours.",
    soundCount: 55,
    soundLabel: "55 loops + stems + MIDI",
    specs: ["WAV 24-bit / 48kHz", "Stems", "MIDI", "BPM + key in filenames"],
    genres: ["Dark Trap", "Trap", "Drill"],
    bpmRange: "120–160",
    categories: [
      { name: "Melody Loops", count: 55, unit: "loops" },
      { name: "Stems", count: 240, unit: "files" },
      { name: "MIDI", count: 55, unit: "files" },
    ],
    badge: "NEW",
    featured: true,
    demo: mock("Neon Nights", [["Loop 04 — 130 B min", "plum-smoke"], ["Loop 11 — 142 F min", "midnight-ritual"]]),
  }),
  withCover({
    placeholder: true,
    slug: "velvet-keys",
    title: "Velvet Keys",
    type: "Loop Pack",
    price: 29,
    tagline: "35 R&B chord loops that feel like 2am.",
    description: "Rhodes, guitar and pad loops with lush voicings for R&B, soul and slow trap.",
    soundCount: 35,
    soundLabel: "35 loops",
    specs: ["WAV 24-bit", "BPM + key in filenames"],
    genres: ["R&B", "Soul"],
    bpmRange: "70–100",
    categories: [{ name: "Chord Loops", count: 35, unit: "loops" }],
    featured: true,
    demo: mock("Velvet Keys", [["Keys 02 — 96 D# min", "velvet-static"]]),
  }),
  withCover({
    placeholder: true,
    slug: "slap-theory-drums",
    title: "Slap Theory Drum Kit",
    type: "Drum Kit",
    price: 24,
    tagline: "The drums behind the slaps.",
    description:
      "Punchy kicks, crispy claps, bouncing hats and tuned 808s plus ready-to-drag drum loops — processed through analog chains so they cut through any mix.",
    soundCount: 220,
    soundLabel: "180 one-shots + 40 drum loops",
    specs: ["WAV 24-bit", "Tuned 808s", "Drum loops"],
    genres: ["Trap", "Drill", "Rage"],
    categories: [
      { name: "Kicks", count: 30, unit: "hits" },
      { name: "808s (tuned)", count: 30, unit: "hits" },
      { name: "Snares & Claps", count: 40, unit: "hits" },
      { name: "Hi-hats & Percs", count: 80, unit: "hits" },
      { name: "Drum Loops", count: 40, unit: "loops" },
    ],
    badge: "BESTSELLER",
    featured: true,
    demo: mock("Slap Theory", [["Kit demo — 142", "midnight-ritual"], ["Kit demo — 144", "glass-teeth"]]),
  }),
  withCover({
    placeholder: true,
    slug: "plum-loops-mini",
    title: "Plum Loops Mini",
    type: "Mini Loop Kit",
    price: 19,
    tagline: "18 moody loops for quick sessions.",
    description: "A compact kit of dark, ready-to-flip loops — a fast way into the SLAPGOD sound.",
    soundCount: 18,
    soundLabel: "18 loops",
    specs: ["WAV 24-bit", "BPM + key in filenames"],
    genres: ["Trap", "Dark Trap"],
    bpmRange: "130–150",
    categories: [{ name: "Melody Loops", count: 18, unit: "loops" }],
    demo: mock("Plum Mini", [["Mini demo", "plum-smoke"]]),
  }),
  withCover({
    placeholder: true,
    slug: "vault-bundle",
    title: "Vault Bundle",
    type: "Bundle",
    price: 79,
    compareAt: 113,
    tagline: "Guitar Vault + Neon Nights + Velvet Keys.",
    description: "Three packs, one price. The core SLAPGOD melodic toolkit at 30% off.",
    soundCount: 180,
    soundLabel: "3 packs",
    specs: ["3 packs", "WAV 24-bit", "Stems + MIDI (Neon Nights)"],
    genres: ["Trap", "R&B", "Drill"],
    categories: [{ name: "Packs included", count: 3, unit: "packs", examples: ["SLAPGOD Guitar Vault Vol. 1", "Neon Nights Premium", "Velvet Keys"] }],
    badge: "SAVE 30%",
    featured: true,
    demo: mock("Vault Bundle", [["Bundle medley A", "plum-smoke"], ["Bundle medley B", "velvet-static"]]),
  }),
  withCover({
    placeholder: true,
    slug: "everything-bundle",
    title: "Everything Bundle",
    type: "Bundle",
    price: 129,
    compareAt: 156,
    tagline: "Every pack in the store.",
    description: "Guitar Vault, Neon Nights, Velvet Keys, Slap Theory Drums and Plum Loops Mini.",
    soundCount: 420,
    soundLabel: "All packs",
    specs: ["All packs", "WAV 24-bit", "Stems + MIDI where available"],
    genres: ["Trap", "Drill", "R&B", "Afro"],
    categories: [
      { name: "Packs included", count: 5, unit: "packs", examples: ["SLAPGOD Guitar Vault Vol. 1", "Neon Nights Premium", "Velvet Keys", "Slap Theory Drum Kit", "Plum Loops Mini"] },
    ],
    badge: "BEST VALUE",
    demo: mock("Everything", [["Medley A", "lagos-neon"], ["Medley B", "dusty-halo"], ["Medley C", "glass-teeth"]]),
  }),
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
  withCover({
    placeholder: true,
    slug: "free-808-pack",
    title: "Free 808s",
    type: "Free Kit",
    price: 0,
    tagline: "10 tuned 808s from Slap Theory.",
    description: "Ten of the most-used 808s from the Slap Theory Drum Kit.",
    soundCount: 10,
    soundLabel: "10 one-shots",
    specs: ["WAV 24-bit", "Tuned"],
    genres: ["Trap", "Drill"],
    categories: [{ name: "808s", count: 10, unit: "hits" }],
    badge: "FREE",
    demo: mock("Free 808s", [["808 demo", "glass-teeth"]]),
  }),
];

export const allPacks = [...packs, ...freePacks];

export function getPack(slug: string) {
  return allPacks.find((p) => p.slug === slug);
}

export const loopCount = (p: Pack) =>
  p.categories.filter((c) => c.unit === "loops").reduce((s, c) => s + c.count, 0);
