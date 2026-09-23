# SLAPGOD Store — Build Plan

Webstore for beats, loops, and sample packs by **SLAPGOD** (@slapgodmadeit).
Payments: Stripe. Free teaser samples. Email capture popup feeding automated marketing.

> **Not legal or tax advice.** This plan covers the areas you need to handle and gives sensible defaults. Before launch, have a lawyer check the license agreements and Terms, and have an accountant confirm VAT/tax setup. Budget roughly €300–800 for a one-time legal review of the templates. It's worth it.

---

## 0. Reference: amyth/beatstore

The repo is an early Django skeleton: `accounts`, `beats`, `transactions`, `mailers`, `dashboard`, `home` apps, mostly empty. It shows the **domain model** a beat store needs: catalog, user accounts, orders, transactional mail, admin dashboard. It's licensed **GPLv3**. Copying its code would force the whole site to be GPL. **Use it as a concept only. Don't copy code.**

What we keep conceptually, and what we add:

| beatstore concept | Our version |
|---|---|
| beats app | `products` (beats, loops, sample packs, free samples) + `license_tiers` |
| transactions | Stripe Checkout + webhooks → `orders`, `order_items`, `licenses` |
| mailers | Transactional: Resend. Marketing: Klaviyo (or Kit) |
| accounts | Passwordless magic-link "My Library" (re-download purchases) |
| dashboard | Admin: upload products, set prices, view orders, resend licenses |

---

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TS) | SSR/SEO for product pages, API routes, same codebase for admin |
| Hosting | Vercel (localhost during dev) | Zero-config, preview deploys |
| DB | Postgres (Neon or Supabase) + Drizzle ORM | Orders, licenses, subscribers |
| File storage | **Private** bucket (Cloudflare R2 or Vercel Blob private) for WAV/stems/packs; **public** CDN for tagged MP3 previews + artwork | Paid files never publicly reachable |
| Payments | Stripe Checkout + Stripe Tax + Radar | Hosted, PCI-compliant, handles VAT calc, Apple/Google Pay, MobilePay, Klarna |
| Transactional email | Resend (+ React Email templates) | Receipts, download links, license PDFs |
| Marketing email | Klaviyo (recommended) or Kit | Flows, segmentation, campaigns |
| License PDFs | `@react-pdf/renderer` generated server-side per order | Personalized, stored with order |
| Analytics | Vercel Analytics or Plausible (cookieless) | Avoids cookie-consent friction |
| Audio player | Owner's `MusicPlayer` component (`docs/specs/MusicPlayer.tsx`) | Demos everywhere |

---

## 2. Product and license model

### 2.1 Product types

1. **Beats** (instrumentals): sold as licenses, not ownership.
2. **Loops / melody loops**: royalty-free, in packs.
3. **Sample packs / drum kits**: royalty-free.
4. **Free samples**: small teaser kits pulled from paid packs. They're gated behind email (see §6.3 about GDPR).

### 2.2 Beat license tiers (suggested prices, EUR incl. VAT / USD)

| Tier | Price | Files | Streams | Sales/downloads | Music videos | Paid perf. | Radio |
|---|---|---|---|---|---|---|---|
| Basic MP3 Lease | €29 / $29 | MP3 320 untagged | 100k | 2,500 | 1 | Non-profit | No |
| **Premium WAV Lease** (most popular) | €49 / $49 | MP3 + WAV | 500k | 10,000 | 1 | Yes | 2 stations |
| Trackout (Stems) Lease | €99 / $99 | MP3 + WAV + stems | 1M | 50,000 | 3 | Yes | Yes |
| Unlimited Lease | €199 / $199 | MP3 + WAV + stems | Unlimited | Unlimited | Unlimited | Yes | Yes |
| Exclusive Rights | from €999 / $999 (Make an Offer) | All + project notes | Unlimited | Unlimited | Unlimited | Yes | Yes |

Extras: **Buy 2 leases get 1 free**, **upgrade anytime by paying the difference**, **Custom beat** from €400, **exclusive offers** via form (negotiate, invoice with Stripe Payment Link).

Why these numbers: market range 2026 for independent producers roughly MP3 $20–40, WAV $40–75, stems $80–150, unlimited $150–300, exclusive $500–3000+. Start mid-range; raise after placements or IG growth. Basic is an entry point; Premium WAV is priced to be the obvious pick (decoy effect).

### 2.2b Sample / loop pack pricing

| Product | Content | Price |
|---|---|---|
| Free "Vault Sampler" | 5 loops (email-gated teaser) | Free |
| Mini loop kit | 15–20 loops | €19 / $19 |
| Drum kit | one-shots + drum loops | €24 / $24 |
| Standard loop pack | 30–40 loops | €29 / $29 |
| **Guitar Vault Vol. 1** (flagship) | 50 loops + one-shot folders, wet/dry, WAV 24-bit | **€39 / $39** (launch; list €49–59) |
| Premium pack | 50+ loops + stems + MIDI | €49 / $49 |
| Vault Bundle | any 3 packs | €79 / $79 (~30% off) |
| Everything Bundle | all packs, updated | €129 / $129 |
| Loop Club (later) | 1 new pack/month + member discounts | €12 / $12 per month |

Guitar Vault Vol. 1 structure (50 loops):
- Chord Progressions: 10
- Melodies & Leads: 10
- Fingerstyle & Arpeggios: 8
- Strums & Rhythm: 6
- Ambient, Reverse & Textures: 6
- Percussive & Body Hits: 5
- Pattern variations / extra takes: 5
- One-shots (not counted in 50): chords, stabs, harmonics, slides, FX, ~40 hits

File conventions: `SLAPGOD_GV1_Melody_03_Toledo_100bpm_Cmin_Wet.wav`, 24-bit 48kHz WAV, wet + dry, exact loop length (4/8 bars), BPM + key in name, `LICENSE.pdf` + `README.txt` (credit format, 25% split, split-sheet link) in zip root. Previews: one ~60–90s tagged MP3 medley per pack + short per-loop previews.

Pricing psychology: launch discount with countdown for email list first (24h early access), then public. Same number in EUR and USD keeps it simple (EUR includes VAT, so EUR margin is lower; fine at this scale).

All non-exclusive leases share these terms:
- **Non-exclusive.** You keep selling the beat to others.
- **You keep copyright** in the beat (composition + sound recording). The licensee gets the right to make *one* new song with it.
- **Credit** is required: "Prod. by SLAPGOD".
- **Composition share (decided 2026-09-23):** you own **50% of the new song's composition — writer AND publisher share**. The artist registers the split with their PRO or publisher. Some producers take a smaller split on cheap leases. Pick one and put it in the contract.
- **No Content ID by licensee.** The artist may not register the song in YouTube Content ID, Facebook Rights Manager, or similar systems. Other licensees of the same beat would get claimed. This is the #1 source of producer disputes.
- **No resale** or redistribution of the beat alone. No use of the beat for **AI training**.
- **Stream caps.** When the licensee hits a cap, they must upgrade. Licenses have **no time limit** (decided 2026-09-23) — caps are the only ceiling, so there is no renewal revenue.
- **Exclusive sale.** Existing non-exclusive licenses stay valid **forever** (no expiry). You **must disclose this** in the exclusive contract. The beat gets removed from the store after an exclusive sale.
- **Governing law:** Finland (or wherever you're based). Name a venue.

### 2.3 Sample pack / loop license (royalty-free EULA)

- Worldwide, perpetual, non-exclusive, **royalty-free** use inside new musical works, commercial use allowed.
- **Prohibited:** redistributing or reselling the samples as-is or in other sample packs, libraries, construction kits, or "loop kits". Also prohibited: use in AI/ML training datasets and uploading samples to Splice-style marketplaces.
- **Content ID:** the buyer may register their finished song *only* if the samples aren't the dominant element. They may never register the raw loops. Melody loops are the risky part. Many loop makers require **publishing credit/split if a loop is placed** ("loop placements"). **Decided: 25% publishing split** + credit on any commercially released song using the loops (see §10).
- Free samples use the same EULA with "free" marked. That keeps it consistent and professional.

### 2.4 Preview protection

- Beat previews: **voice-tagged MP3 128–192kbps** served from a public CDN. Full untagged files are never exposed to the browser.
- Paid downloads: **signed, expiring URLs** (e.g. 24h, max 5 downloads per file), generated after payment is confirmed.
- Log download IP and timestamp per order. That's your evidence in chargeback disputes.

---

## 3. Copyright, publishing rights, and registrations

### 3.1 Two copyrights in every beat

1. **Composition** (melody, chords, lyrics): the "publishing" side.
2. **Sound recording / master** (the actual audio file).

When you make a beat alone, from original sounds or properly licensed samples, **you own both automatically**. In Finland/EU there's no registration requirement.

### 3.2 Registrations to set up

| What | Where (Finland) | Where (US / global) | Why |
|---|---|---|---|
| Composer / publishing royalties | **Teosto** (join as composer) | PRO: BMI/ASCAP; **The MLC** for US mechanicals; or publishing admin: **Songtrust** | Collect your writer share when artists release songs on your beats |
| Master / neighbouring rights | **Gramex** | SoundExchange (if you release your own masters) | Radio and public-performance income for recordings |
| Copyright evidence | Keep dated project files, stems, exports (git-like archive or cloud with timestamps) | Optional **US Copyright Office** registration for key beats/packs. Needed to sue in the US for statutory damages. | Proof of authorship |
| Brand | Check "SLAPGOD" at **PRH (Finnish trademark)**, **EUIPO**, USPTO. Register later in classes 9 (downloadable music) and 41 (entertainment). | | Stops copycat stores and IG impersonation |
| Domain | slapgod.com / slapgodmadeit.com + common typos | | |

### 3.3 Samples inside YOUR products (the biggest legal risk)

- **Every sound in a paid beat or pack must be original or cleared.** Audit each project.
- Third-party royalty-free kits (Splice, other producers' kits) usually **allow using them inside beats you sell**. They **never allow putting their sounds into your sample packs**, even chopped or processed. **Sample packs must be 100% your original recordings/synthesis.**
- Read each kit's EULA. Some forbid use in beats sold on marketplaces, or require credit.
- **No uncleared samples from commercial records** in anything you sell. Loop-based beats using copyrighted records need clearance from both the master owner and the publisher. In practice that means don't.
- **Collabs.** When another producer or loop maker contributes, sign a **split sheet** *before* selling: ownership %, who can sell/lease, revenue split, publishing split. Store it with the product.
- **AI tools.** If you use AI generation (e.g. AI stems or melodies), check that tool's terms for commercial rights. Purely AI-generated material may not be copyrightable, which weakens your license. Disclose this where relevant.

### 3.4 Content ID strategy

- **Don't** register leased beats or sample packs in Content ID. Otherwise your own customers get claimed.
- If you distribute your *own* releases, whitelist customers or register only the exclusive-sold and self-released versions.
- Put a "Claim release" contact on the Licenses page so buyers can report wrongful claims and you can fix them fast.

### 3.5 Opt out of AI scraping

Under EU DSM Directive Art. 4, you can reserve text-and-data-mining rights in a machine-readable way. Do this:
- Add to `robots.txt`: block known AI crawlers (GPTBot, CCBot, Google-Extended, anthropic-ai, ClaudeBot, Bytespider, etc.).
- Add a `/.well-known/tdmrep.json` or `<meta name="tdm-reservation" content="1">`.
- Add an explicit TDM/AI-training reservation clause in Terms and every EULA.

---

## 4. Store legal pages and consumer law (EU/Finland defaults)

Required pages. The design agent is creating stubs; content gets drafted in Phase 3.

1. **Terms of Sale / Service.** Seller identity (name or trade name, **Y-tunnus**, address, email), prices incl. VAT, delivery (instant digital download), payment, withdrawal-right waiver, liability, governing law, consumer dispute body (Finnish Consumer Disputes Board / EU ODR link).
2. **License Agreements.** One page per beat tier, the sample EULA, and the free-sample EULA. **A PDF copy is attached to each order.**
3. **Privacy Policy** (GDPR). Controller identity, what's collected (email, name, IP, order data, consent logs), purposes, legal bases (contract for orders; consent for marketing), processors (Stripe, Vercel, Klaviyo, Resend, DB host), transfers outside the EU (SCCs/DPF), retention (bookkeeping records: 6 yrs + current in Finland), rights, and the right to complain to the **Data Protection Ombudsman (Tietosuojavaltuutettu)**.
4. **Cookie Policy + consent banner.** Only needed if you use non-essential cookies (Meta Pixel, GA4, TikTok Pixel). Cookieless analytics avoid the banner. If you run IG/Meta ads later, add a proper CMP.
5. **Refund Policy.**
6. **Contact / Imprint.**

### 4.1 14-day withdrawal right (critical for digital downloads)

EU consumers normally get 14 days to cancel. For digital content, they **lose that right only if** they have both:
1. **expressly consented** to immediate delivery, and
2. **acknowledged** they lose the withdrawal right.

Implementation:
- An unticked, required checkbox before checkout: *"I agree to immediate delivery of the digital content and acknowledge I lose my 14-day right of withdrawal once the download starts."*
- Store the consent (timestamp, text version) on the order.
- Confirm it in the order email. That email counts as the "durable medium".
- Refund policy: no refunds after download, except for corrupted or wrong files. Offer exchange or credit.

### 4.2 Price display

Show prices **including VAT** to EU consumers. Show the currency clearly (EUR primary, optional USD).

---

## 5. Payments: Stripe

### 5.1 Flow

```
Cart → POST /api/checkout (server validates items, prices from DB, never from client)
     → stripe.checkout.sessions.create({
         mode: 'payment',
         line_items (Price IDs or inline price_data),
         automatic_tax: { enabled: true },
         customer_creation: 'always',
         consent_collection: { promotions: 'auto', terms_of_service: 'required' },
         custom_text: { terms_of_service_acceptance: withdrawal waiver text },
         allow_promotion_codes: true,
         metadata: { orderDraftId }
       })
     → redirect to Stripe Checkout
     → webhook `checkout.session.completed` (verify signature, idempotent on event.id)
         → mark order paid
         → create license records (buyer name, email, product, tier, date, license ID)
         → render license PDF(s) → private storage
         → generate signed download URLs
         → send Resend email: receipt + downloads + license PDFs
         → push "Placed Order" event to Klaviyo (+ subscribe only if promo consent given)
         → if Exclusive: unpublish beat
     → /success page polls order status and shows downloads
```

Also handle: `checkout.session.async_payment_succeeded` / `_failed` (Klarna, bank methods), `charge.refunded` (revoke download links, mark license void), and `charge.dispute.created` (alert yourself, attach download logs as evidence).

### 5.2 Stripe setup checklist

- [ ] Account in business name. Business type: individual/sole trader (**toiminimi**) or company.
- [ ] Enable **Stripe Tax** and register tax locations (see §7).
- [ ] Payment methods: cards, Apple Pay, Google Pay, **MobilePay** (big in Finland), Klarna, Link.
- [ ] **Radar** rules: block high-risk, require 3DS for large orders.
- [ ] Customer emails: Stripe receipts on, or send our own via Resend.
- [ ] Promotion codes / coupons for sales (Black Friday, drop launches, email-subscriber welcome code).
- [ ] Webhook endpoint + signing secret in env vars. Use Stripe CLI `stripe listen` for localhost dev.
- [ ] Test mode end-to-end before going live.
- [ ] Evaluate **Stripe Managed Payments** (Stripe acting as merchant of record for digital goods). If available for your account, it takes over global VAT/sales-tax filing. Compare its fee to doing Stripe Tax + OSS yourself.

---

## 6. Email capture and marketing automation

### 6.1 ESP choice

- **Klaviyo** (recommended). Best e-commerce flows: abandoned cart, browse abandonment, purchase-based segments, predictive analytics. Free up to 250 contacts / 500 sends, then paid. We send custom events from our API.
- **Kit (ConvertKit)**. Creator-focused, generous free tier (≤10k subscribers), simpler automations. Pick this if budget matters more than e-comm depth.
- Keep **transactional** mail (receipts, downloads) on **Resend**, separate from marketing. Deliverability stays safe, and unsubscribes never block receipts.

### 6.2 Popup behaviour

- Trigger: 15s on page, or 50% scroll, or exit-intent (desktop). Show max once per 14 days. Never show on checkout or success pages.
- Offer: "Free SLAPGOD drum kit + 10% off your first pack".
- Fields: email (+ optional first name). **Consent checkbox unticked** with clear text and a Privacy link.
- Submit → `POST /api/subscribe` → validate + rate-limit + honeypot/Turnstile → store consent log (email, timestamp, IP, form version, consent text) → Klaviyo "Subscribe Profiles" API into list `Newsletter`, source `popup`.
- **Double opt-in** (recommended in EU): confirmation email → confirmed → deliver the free-kit link. Better list quality, stronger GDPR proof.

### 6.3 GDPR notes for "free download for email"

- Consent must be **freely given, specific, informed, and unambiguous**. Tying a freebie to marketing consent is a grey area under GDPR.
- Safest pattern: say plainly what they get *and* that they'll receive marketing, keep the checkbox explicit, and make unsubscribing one click. Alternatively, deliver the free kit to anyone and make newsletter consent a separate optional box. Lower list growth, zero risk. Decide with your lawyer. Default in build: explicit checkbox + double opt-in.
- **Customers who buy** can get emails about *similar products* without prior consent in Finland/EU (soft opt-in), **only if** they were given an easy opt-out at checkout and in every email. Stripe `consent_collection.promotions` covers this.
- Every marketing email needs a working **unsubscribe link** and your **postal address** (CAN-SPAM for US recipients).
- Sign a **DPA** with Klaviyo/Kit, Resend, and the DB host (usually click-through in their settings).
- Authenticate the sending domain: **SPF, DKIM, DMARC** (required by Gmail/Yahoo bulk sender rules).

### 6.4 Automated flows (build in ESP)

| Flow | Trigger | Emails |
|---|---|---|
| Welcome series | Subscribed (confirmed) | 1: free kit download + 10% code (instant). 2: your story + best-selling pack (day 2). 3: beat catalog + how licensing works (day 4). 4: code expiry reminder (day 6). |
| Abandoned checkout | Checkout started, no order in 1h | 1h reminder → 24h with player preview → 48h small incentive |
| Browse abandonment | Viewed product ≥2x, no cart (needs identified visitor) | 1 email with that product |
| Post-purchase | Placed order | Thank-you + license recap → day 3: how to credit and register splits → day 7: cross-sell (pack ↔ beats) → day 30: review / IG tag request |
| Lease upgrade nudge | Purchased Basic/Premium, 60 days | "Song blowing up? Upgrade to Unlimited/Exclusive" |
| Win-back | No open/click in 90 days | 2 emails, then suppress |
| Free-kit → paid | Downloaded free kit, no purchase in 14 days | Pitch the full pack the teaser came from |

**Campaigns (manual/scheduled):** new drop announcements, weekly beat drop, seasonal sales (Black Friday, New Year, anniversary), IG content cross-promo, limited exclusive-beat auctions.

**Segments:** buyers vs non-buyers, beat buyers vs pack buyers, genre preference (from clicks/purchases), VIP (≥2 orders), engaged 30/90 days.

---

## 7. Tax (Finland/EU defaults — confirm with accountant)

- **Business registration:** register a **toiminimi** (sole trader) at YTJ/PRH, or use an existing company. You need a Y-tunnus for Terms and invoices.
- **Finnish VAT:** standard rate **25.5%**. Registration is mandatory once turnover exceeds **€20,000/yr**. Below that you can stay unregistered, but you still must handle EU OSS once cross-border sales pass the threshold.
- **EU B2C digital sales:** VAT is charged at the **buyer's country rate**. Once total cross-border EU B2C sales exceed **€10,000/yr**, register for the **OSS scheme** (via Vero) and file quarterly. Stripe Tax calculates and reports but **does not file** for you.
- **Non-EU:** UK VAT, US state sales tax on digital goods, Norway VOEC, etc. apply above local thresholds. Stripe Tax monitors thresholds and alerts you.
- **Income tax:** profit is taxable income. Keep bookkeeping. A simple tool (e.g. Holvi, Procountor, or an accountant) syncs with Stripe exports.
- A **merchant-of-record** option (Stripe Managed Payments, Lemon Squeezy, Paddle) removes most of this burden for ~5% fees. Worth comparing once volume is known.

---

## 8. Data model (Drizzle / Postgres)

```
products        id, type(beat|loop|pack|free), slug, title, description, bpm, key, genre[], mood[],
                cover_url, preview_url, status(draft|live|sold_exclusive), created_at
product_files   id, product_id, kind(mp3|wav|stems|zip), storage_key, size_bytes
license_tiers   id, code(basic|premium|trackout|unlimited|exclusive|pack_eula|free_eula),
                name, terms_json (caps, term, files), contract_version
product_prices  id, product_id, tier_id, stripe_price_id, amount_cents, currency, active
orders          id, stripe_session_id, stripe_payment_intent, email, name, country,
                subtotal, tax, total, currency, status, withdrawal_waiver_at, waiver_text_version,
                marketing_consent, created_at
order_items     id, order_id, product_id, tier_id, amount_cents
licenses        id (public license number), order_item_id, licensee_name, pdf_storage_key,
                issued_at, expires_at, status(active|void)
downloads       id, order_item_id, file_id, ip, user_agent, created_at
subscribers     id, email, status(pending|confirmed|unsubscribed), source, consent_text_version,
                consent_ip, consent_at, confirmed_at
collaborators   id, product_id, name, split_pct, split_sheet_url
```

---

## 9. Roadmap

**Phase 1: Design + frontend (in progress, parallel agent)**
Next.js app in `web/`, ASCII-stars hero, MusicPlayer demos, catalog, pack pages, popup UI, parallax/Lenis motion, legal page stubs. Runs on `localhost:3000`.

**Phase 2: Backend core**
- DB + Drizzle schema, seed script.
- Private storage + signed-URL download route.
- Admin dashboard (auth-protected): upload product, auto-generate tagged preview (ffmpeg), set tier prices → sync Stripe Products/Prices.

**Phase 3: Stripe + delivery**
- Checkout route, webhook handler, license PDF generation, Resend emails, success page, My Library magic-link.
- Test mode end-to-end, including refund and dispute paths.

**Phase 4: Email**
- Klaviyo account, domain auth (SPF/DKIM/DMARC), `/api/subscribe` wired, double opt-in, event tracking (Viewed Product, Added to Cart, Started Checkout, Placed Order), build flows from §6.4.

**Phase 5: Legal + launch**
- Draft Terms, Privacy, Cookie, Refund, all License/EULA texts → lawyer review.
- Teosto/Gramex membership, trademark search, business + VAT/OSS registration.
- Sample audit of every product + split sheets on file.
- robots.txt AI block + TDM reservation.
- Lighthouse/perf pass, SEO (product JSON-LD, OG images, sitemap), deploy to Vercel, connect domain, Stripe live mode.
- Launch campaign on IG @slapgodmadeit: link in bio, reels with the ASCII hero visual, free-kit giveaway.

---

## 10. Decisions (confirmed 2026-09-14)

| # | Decision | Consequence |
|---|---|---|
| 1 | **Finland, toiminimi** (has Y-tunnus) | Seller = trade name + owner name + Y-tunnus. Terms/Privacy under Finnish law. Legally required geographic address on site: consider a business address service (virtual address) instead of home address. Stripe account type: individual/sole proprietor. |
| 2 | **Klaviyo** | Marketing flows §6.4 built in Klaviyo. Resend stays for transactional. |
| 3 | **EUR + USD** | Stripe Price per product with `currency_options` (EUR default, USD). Currency toggle on site; Checkout uses selected currency. EUR shown incl. VAT; USD shown with "tax calculated at checkout" for US. Stripe payouts convert USD→EUR (FX fee ~1–2%). Bookkeeping in EUR. |
| 4 | **50% writer share on beats; 25% publishing split on loops** | Beat lease contracts: 50% writer share of composition. Loop/pack EULA: royalty-free use, but if a song using the loops is commercially released, licensee credits SLAPGOD and grants **25% of composition/publishing**, registered with their PRO/publisher. Enforceability on cheap loops is weak in practice — main value is major placements. Loop pack EULA must state this clearly *before* purchase (checkbox/summary on product page). |
| 5 | **Free kit: email required** | Explicit unticked consent checkbox + **double opt-in** + clear text "you'll receive marketing emails from SLAPGOD, unsubscribe anytime". Store consent log. Flag this for lawyer review (GDPR "freely given" grey area). |
| 6 | **Stripe Tax, self-file** | Register VAT at Vero when > €20k/yr turnover (or voluntarily earlier). OSS registration once cross-border EU B2C > €10k/yr → quarterly OSS returns. Monitor US/UK thresholds via Stripe Tax dashboard. Monthly: export Stripe Tax report → bookkeeping. |
| 7 | **Content: Spanish Guitar Loops** — 5 original loops, 100 BPM, C minor + producer voice tag (`/Desktop/Guitar Loops Slapgod/`) | First real product: **"Spanish Guitar Loops Vol. 1"** pack. Loop 01 = free email-gated teaser. Voice tag used on beat previews. **Confirm all guitar parts are your own playing/recording** (no third-party loops chopped in) — required to sell as a loop pack. |

### Remaining open items
- Final tier prices: suggestions in §2.2 / §2.2b, awaiting confirmation.
- Business address: **address service, 33610 Tampere, Finland** — need full street address from provider, plus Y-tunnus and contact email, for Terms/Privacy/footer (`web/src/data/seller.ts`).
- Mixed-in third-party sounds in future beats: audit per product before listing.


## 11. Decisions (2026-09-23)

- **VAT:** not registered (small business under the €20k threshold). No VAT charged or stated; site shows "No VAT · small business". Once EU cross-border B2C sales pass €10k/yr, VAT becomes due in the buyer's country — register for OSS at that point.
- **Beats:** SLAPGOD owns 50% of the composition (writer + publisher) of every song made with a beat.
- **Exclusives:** 5% master royalty to SLAPGOD, statements every six months; exclusive = licence, not copyright transfer.
- **Loops:** 25% of the composition on commercially released songs; own licence PDF per pack.
- **All licences:** no sync without written consent; licensee notifies within 14 days of release (ISRC + distributor); SLAPGOD may use the work for promotion; no sublicensing.
