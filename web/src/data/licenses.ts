// Beat license tiers + loop license summary.
// Prices: EUR, no VAT (seller not VAT-registered — small business); USD same number. Wording is a SUMMARY — binding text is the agreement
// delivered with each purchase (see docs/PLAN.md and /licenses).

export type LicenseId = "basic" | "premium" | "trackout" | "unlimited" | "exclusive";

export interface LicenseTier {
  id: LicenseId;
  name: string;
  short: string;
  price: number; // "from" price for exclusive
  priceUSD?: number;
  fromPrice?: boolean;
  files: string;
  streams: string;
  sales: string;
  videos: string;
  paidPerformances: string;
  radio: string;
  /** SLAPGOD's share of the new song's composition (writer + publisher side). */
  compositionShare: string;
  /** SLAPGOD's share of the licensee's master income. */
  masterRoyalty: string;
  popular?: boolean;
  extra?: string[];
}

export const licenseTiers: LicenseTier[] = [
  {
    id: "basic",
    name: "Basic MP3 Lease",
    short: "MP3",
    price: 29,
    files: "MP3 320kbps untagged",
    streams: "100,000",
    sales: "2,500",
    videos: "1",
    paidPerformances: "Non-profit only",
    radio: "No",
    compositionShare: "50%",
    masterRoyalty: "None",
  },
  {
    id: "premium",
    name: "Premium WAV Lease",
    short: "WAV",
    price: 49,
    files: "MP3 + WAV",
    streams: "500,000",
    sales: "10,000",
    videos: "1",
    paidPerformances: "Yes",
    radio: "2 stations",
    compositionShare: "50%",
    masterRoyalty: "None",
    popular: true,
  },
  {
    id: "trackout",
    name: "Trackout (Stems) Lease",
    short: "STEMS",
    price: 99,
    files: "MP3 + WAV + stems",
    streams: "1,000,000",
    sales: "50,000",
    videos: "3",
    paidPerformances: "Yes",
    radio: "Yes",
    compositionShare: "50%",
    masterRoyalty: "None",
  },
  {
    id: "unlimited",
    name: "Unlimited Lease",
    short: "UNLTD",
    price: 199,
    files: "MP3 + WAV + stems",
    streams: "Unlimited",
    sales: "Unlimited",
    videos: "Unlimited",
    paidPerformances: "Yes",
    radio: "Yes",
    compositionShare: "50%",
    masterRoyalty: "None",
  },
  {
    id: "exclusive",
    name: "Exclusive Rights",
    short: "EXCL",
    price: 999,
    fromPrice: true,
    files: "All files + project notes",
    streams: "Unlimited",
    sales: "Unlimited",
    videos: "Unlimited",
    paidPerformances: "Yes",
    radio: "Yes",
    compositionShare: "50%",
    masterRoyalty: "5%",
    extra: [
      "Beat removed from the store — only you from now on",
      "Exclusive licence — SLAPGOD keeps the copyright",
      "5% master royalty to SLAPGOD",
      "Leases sold before your purchase stay valid (disclosed at checkout)",
    ],
  },
];

export const TABLE_ROWS: { key: keyof LicenseTier; label: string }[] = [
  { key: "files", label: "Files" },
  { key: "streams", label: "Streams" },
  { key: "sales", label: "Sales / downloads" },
  { key: "videos", label: "Music videos" },
  { key: "paidPerformances", label: "Paid performances" },
  { key: "radio", label: "Radio" },
  { key: "compositionShare", label: "SLAPGOD composition share" },
  { key: "masterRoyalty", label: "SLAPGOD master royalty" },
];

/** Applies to every lease tier. */
export const leaseTerms = [
  'Credit "Prod. by SLAPGOD" on every release',
  "Non-exclusive (except Exclusive Rights)",
  "Distribute on Spotify, Apple Music, YouTube & more",
  "Monetize on YouTube — but no Content ID registration",
  "No resale or redistribution of the beat",
  "No use in AI training or datasets",
  "No sync (film, TV, ads, games) without written permission",
  "Tell SLAPGOD within 14 days of release — ISRC + distributor",
  "No expiry — your license never runs out",
];

export const licenseDeals = {
  bundle: "Buy 2 leases, get 1 free",
  upgrade: "Upgrade anytime — just pay the difference",
  customBeat: { label: "Custom beat", from: 400 },
};

export const loopLicenseSummary = {
  title: "Loops & sample packs",
  points: [
    "Royalty-free for beats, songs and content — use them in unlimited productions.",
    "Beats you make with the loops can be sold or leased — the placement split still applies to the final song.",
    "Commercially released songs using the loops: SLAPGOD receives 25% of the composition.",
    "Tell SLAPGOD within 14 days of a commercial release — ISRC + distributor.",
    "No sync (film, TV, ads, games) without written permission.",
    'Credit: "Prod. by SLAPGOD" / "loops by @slapgodmadeit".',
    "No Content ID registration, no reselling loops as-is or inside other sample packs, no AI training.",
  ],
};

export const CREDIT_FORMAT = "Prod. by SLAPGOD (@slapgodmadeit)";
