// Seller / business identity — shown in footer, /contact, /terms, /privacy.
// TODO(owner): fill in the [TBD] fields before launch.
export const seller = {
  name: "SLAPGOD",
  legalForm: "toiminimi",
  businessId: "[Y-tunnus TBD]", // Finnish Business ID, e.g. 1234567-8
  street: "[Street address TBD]",
  postalCode: "33610",
  city: "Tampere",
  country: "Finland",
  email: "[email TBD]",
  instagram: "@slapgodmadeit",
  instagramUrl: "https://instagram.com/slapgodmadeit",
};

export const sellerLine = `${seller.name} (${seller.legalForm}) · Y-tunnus: ${seller.businessId} · ${seller.street}, ${seller.postalCode} ${seller.city}, ${seller.country} · ${seller.email}`;

export const isTBD = (v: string) => v.includes("TBD");
