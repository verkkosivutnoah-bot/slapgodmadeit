// "Know your rights" education content. Plain-language summaries — NOT legal advice.
// The license agreement delivered with each purchase is the binding document.

export const twoCopyrights = {
  composition: {
    title: "Composition",
    aka: "the publishing / the song",
    points: ["Melody, chords, lyrics & topline", "Earns performance + mechanical royalties", "Registered with PROs (Teosto, BMI, ASCAP, PRS, GEMA…)", "Split between writers — incl. the producer"],
  },
  master: {
    title: "Master",
    aka: "the sound recording",
    points: ["The actual recorded audio file", "Earns streaming & sales income via your distributor", "Owned by whoever paid for / made the recording", "On a lease: you own your master, SLAPGOD owns the beat"],
  },
};

export const leaseVsExclusive: { label: string; lease: string; exclusive: string }[] = [
  { label: "Who owns the beat", lease: "SLAPGOD", exclusive: "SLAPGOD keeps copyright — you get exclusive usage rights" },
  { label: "Can others license it?", lease: "Yes — non-exclusive", exclusive: "No — removed from the store" },
  { label: "Caps", lease: "Streams / sales / videos per tier", exclusive: "Unlimited" },
  { label: "On exclusive sale", lease: "Your lease stays valid", exclusive: "Earlier leases stay valid — disclosed up front" },
  { label: "Composition share", lease: "SLAPGOD 50%", exclusive: "SLAPGOD 50%" },
  { label: "Master royalty", lease: "None", exclusive: "5% to SLAPGOD" },
];

export const canDo = [
  "Release on Spotify, Apple Music & more via DistroKid, TuneCore, Amuse, etc.",
  "Monetize your song on YouTube (without Content ID)",
  "Perform it live (paid shows from Premium WAV up)",
  "Shoot music videos (per tier)",
  "Register your share of the song (lyrics, topline) with your PRO",
  "Post it on TikTok, Reels and Shorts",
];

export const cantDo = [
  "Register the beat or loops in YouTube Content ID",
  "Resell, share or redistribute the beat or loops",
  "Claim the beat or loops as your own work",
  "Put the loops inside your own sample packs",
  "Use any SLAPGOD audio for AI training or datasets",
  "Go past your tier's caps without upgrading",
  "Place it in film, TV, ads or games without written permission",
  "Release without telling SLAPGOD within 14 days",
];

export const splits = {
  beats: { label: "Beats", share: 50, text: "SLAPGOD keeps 50% of the composition — writer and publisher side — on songs made with a leased or exclusive beat." },
  loops: { label: "Loops", share: 25, text: "On commercially released songs that use SLAPGOD loops, SLAPGOD receives 25% of the composition." },
};

export const registerSteps = [
  { title: "Fill in the split sheet", text: "List every writer and their % of the composition — SLAPGOD gets 50% on beats, 25% on loops." },
  { title: "Register with your PRO", text: "Teosto, BMI, ASCAP, PRS, GEMA, SOCAN… list SLAPGOD as co-writer and co-publisher with that share." },
  { title: "Add distributor credits", text: 'In DistroKid / TuneCore metadata add the credit "Prod. by SLAPGOD".' },
  { title: "Tell SLAPGOD within 14 days", text: "Send the signed split sheet, the ISRC and your distributor via the contact form — it's part of the license." },
];

export const SPLIT_SHEET_URL = "/downloads/split-sheet.pdf"; // placeholder template

export const faqs: { q: string; a: string }[] = [
  {
    q: "Can my song be used in a film, ad or game?",
    a: "Not under a lease on its own. Sync needs separate written permission and a fee split — ask through the contact form and it's usually quick to agree.",
  },
  {
    q: "What's the 5% master royalty on exclusives?",
    a: "With exclusive rights you own and earn from your recording; SLAPGOD receives 5% of the net income from it (streams, sales, sync), reported twice a year. Leases have no master royalty.",
  },
  {
    q: "Can I use a free loop commercially?",
    a: "Yes. Free loops (like Vault Sampler) follow the same loop license: royalty-free in your productions, with 25% of the composition to SLAPGOD if a song using them is commercially released or placed.",
  },
  {
    q: "Do I own my song?",
    a: "You own your master recording and your lyrics/topline. SLAPGOD keeps the copyright in the beat or loops and 50% of the composition (25% for loops). On exclusives SLAPGOD also takes a 5% master royalty.",
  },
  {
    q: "What happens if the beat is sold exclusively after my lease?",
    a: "Your lease stays valid. You can keep your song up — you just can't buy another lease on that beat afterwards.",
  },
  {
    q: "Do I need to register with a PRO?",
    a: "It's not required to release music, but it's how songwriters collect performance royalties. If your song earns, register it and list SLAPGOD's share.",
  },
  {
    q: "Can I sell my song on Bandcamp?",
    a: "Yes — downloads and sales on Bandcamp, iTunes, etc. count toward your tier's sales/downloads cap.",
  },
  {
    q: "Can I use the loops in a beat I sell or lease?",
    a: "Yes. Beats made with SLAPGOD loops can be sold or leased. The 25% placement split still applies to the final song that gets released.",
  },
  {
    q: "What if my stream count goes past my cap?",
    a: "Upgrade to a higher tier anytime and just pay the difference. No need to take anything down.",
  },
  {
    q: "Why can't I register my song in Content ID?",
    a: "Leases are non-exclusive, so other artists use the same beat. Content ID would flag their songs (and SLAPGOD's) — so it's not allowed on leases or loops.",
  },
  {
    q: "I got a Content ID claim. What now?",
    a: "Don't panic. Send us the video link and your license (order) number via the contact form — we whitelist your channel fast, usually within 48 hours.",
  },
  {
    q: "How do I credit SLAPGOD?",
    a: 'Use "Prod. by SLAPGOD (@slapgodmadeit)" in titles/descriptions where possible and in your distributor credits.',
  },
  {
    q: "Are the sounds really sample-free?",
    a: "Yes. Every guitar is played by SLAPGOD and every beat is built from original sounds — no uncleared samples.",
  },
];
