// Seller / business identity — shown in footer, /contact, /terms, /privacy.
// TODO(owner): fill in the [TBD] fields before launch.
export const seller = {
  name: "SLAPGOD",
  legalForm: "sole trader",
  businessId: "[Business ID TBD]", // Finnish Business ID (Y-tunnus), e.g. 1234567-8
  street: "[Street address TBD]",
  postalCode: "33610",
  city: "Tampere",
  country: "Finland",
  email: "[email TBD]",
  handle: "@slapgodmadeit",
  instagram: "@slapgodmadeit",
  instagramUrl: "https://instagram.com/slapgodmadeit",
  tiktokUrl: "https://tiktok.com/@slapgodmadeit",
  youtubeUrl: "https://youtube.com/@slapgodmadeit",
};

export const sellerLine = `${seller.name} (${seller.legalForm}) · Business ID: ${seller.businessId} · ${seller.street}, ${seller.postalCode} ${seller.city}, ${seller.country} · ${seller.email}`;

export const isTBD = (v: string) => v.includes("TBD");

/** Social links — same handle everywhere. */
export const socials = [
  { name: "Instagram", href: seller.instagramUrl },
  { name: "TikTok", href: seller.tiktokUrl },
  { name: "YouTube", href: seller.youtubeUrl },
] as const;
