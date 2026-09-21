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
  { label: "Term", lease: "3–10 years depending on tier", exclusive: "Perpetual" },
  { label: "On exclusive sale", lease: "Your lease stays valid until it expires", exclusive: "Earlier leases run out their term — disclosed up front" },
  { label: "Writer share", lease: "SLAPGOD 50%", exclusive: "SLAPGOD 50%" },
];

export const canDo = [
  "Release on Spotify, Apple Music & more via DistroKid, TuneCore, Amuse, etc.",
  "Monetize your song on YouTube (without Content ID)",
  "Perform it live (paid shows from Premium WAV up)",
  "Shoot music videos (per tier)",
  "Sync within your tier's limits",
  "Register YOUR lyrics / topline share with your PRO",
];

export const cantDo = [
  "Register the beat or loops in YouTube Content ID",
  "Resell, share or redistribute the beat or loops",
  "Claim the beat or loops as your own work",
  "Put the loops inside your own sample packs",
  "Use any SLAPGOD audio for AI training or datasets",
  "Go past your tier's caps without upgrading",
];

export const splits = {
  beats: { label: "Beats", share: 50, text: "SLAPGOD keeps 50% of the writer share on songs made with a leased or exclusive beat." },
  loops: { label: "Loops", share: 25, text: "On commercially released songs that use SLAPGOD loops, SLAPGOD receives a 25% publishing split." },
};

export const registerSteps = [
  { title: "Fill in the split sheet", text: "List every writer and their % — include SLAPGOD's share (50% beats / 25% loops)." },
  { title: "Register with your PRO", text: "Teosto, BMI, ASCAP, PRS, GEMA, SOCAN… list SLAPGOD as co-writer with the agreed share." },
  { title: "Add distributor credits", text: 'In DistroKid / TuneCore metadata add the credit "Prod. by SLAPGOD".' },
  { title: "Email us the split sheet", text: "Send the signed sheet via the contact form so we can register our side too." },
];

export const SPLIT_SHEET_URL = "/downloads/split-sheet.pdf"; // placeholder template

export const faqs: { q: string; a: string }[] = [
  {
    q: "Can I use a free loop commercially?",
    a: "Yes. Free loops (like Vault Sampler) follow the same loop license: royalty-free in your productions, with a 25% publishing split for SLAPGOD if a song using them is commercially released or placed.",
  },
  {
    q: "Do I own my song?",
    a: "You own your master recording and your lyrics/topline. SLAPGOD keeps the copyright in the beat or loops and the agreed writer/publishing share of the composition.",
  },
  {
    q: "What happens if the beat is sold exclusively after my lease?",
    a: "Your lease stays valid for its full term. You can keep your song up — you just can't renew or buy another lease on that beat afterwards.",
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
