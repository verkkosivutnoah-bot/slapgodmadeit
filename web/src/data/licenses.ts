// Beat license tiers + loop license summary.
// Prices: EUR incl. VAT; USD same number. Wording is a SUMMARY — binding text is the agreement
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
  writerShare: string;
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
    writerShare: "50%",
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
    writerShare: "50%",
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
    writerShare: "50%",
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
    writerShare: "50%",
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
    writerShare: "50%",
    extra: [
      "Beat removed from the store — only you from now on",
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
  { key: "writerShare", label: "SLAPGOD writer share" },
];

/** Applies to every lease tier. */
export const leaseTerms = [
  'Credit "Prod. by SLAPGOD" on every release',
  "Non-exclusive (except Exclusive Rights)",
  "Distribute on Spotify, Apple Music, YouTube & more",
  "Monetize on YouTube — but no Content ID registration",
  "No resale or redistribution of the beat",
  "No use in AI training or datasets",
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
    "Commercially released songs using the loops: SLAPGOD receives a 25% publishing split.",
    'Credit: "Prod. by SLAPGOD" / "loops by @slapgodmadeit".',
    "No Content ID registration, no reselling loops as-is or inside other sample packs, no AI training.",
  ],
};

export const CREDIT_FORMAT = "Prod. by SLAPGOD (@slapgodmadeit)";
