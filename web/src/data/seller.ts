// Seller / business identity — shown in footer, /contact, /terms, /privacy.
export const seller = {
  name: "SLAPGOD",
  legalForm: "sole trader",
  businessId: "3535677-9", // Finnish Business ID (Y-tunnus)
  /** PRIVATE — never rendered on the website. Only printed inside licence PDFs sent to buyers. */
  street: "Tasanteenkatu 23 E",
  postalCode: "33610",
  city: "Tampere",
  country: "Finland",
  email: "slapgodmadeit@gmail.com",
  handle: "@slapgodmadeit",
  instagram: "@slapgodmadeit",
  instagramUrl: "https://instagram.com/slapgodmadeit",
  tiktokUrl: "https://tiktok.com/@slapgodmadeit",
  youtubeUrl: "https://youtube.com/@slapgodmadeit",
};

/** What the public website shows as the address: town only, no street. */
export const publicAddress = `${seller.postalCode} ${seller.city}, ${seller.country}`;

export const sellerLine = `${seller.name} (${seller.legalForm}) · Business ID: ${seller.businessId} · ${publicAddress} · ${seller.email}`;

export const isTBD = (v: string) => v.includes("TBD");

/** Social links — same handle everywhere. */
export const socials = [
  { name: "Instagram", href: seller.instagramUrl },
  { name: "TikTok", href: seller.tiktokUrl },
  { name: "YouTube", href: seller.youtubeUrl },
] as const;
