# SLAPGOD web — design notes

Next.js 16 (App Router, Turbopack) · Tailwind v4 · `motion` · `lenis`. Run `npm run dev` → http://localhost:3000.

## Components

| Area | Files |
| --- | --- |
| Music player (owner spec, ported) | `src/components/player/MusicPlayer.tsx`, `music-player.css` |
| One-at-a-time audio + keyboard shortcut owner | `src/components/player/audioFocus.ts` |
| Global sticky dock player (mini bar ⇄ expanded card, persists across pages) | `src/components/player/GlobalPlayer.tsx` (`usePlayer().playQueue(tracks, i)`) |
| Hero ("The Vault") | `src/components/home/Hero.tsx` (layers + parallax), `hero/vaultScene.ts` (procedural guitar/sun/arch source), `hero/AsciiStars.tsx` (stars renderer), `hero/GuitarStrings.tsx` (vibrating SVG strings, visual only), `hero/DustMotes.tsx` |
| Cover art (next/image + fallback) / accent color | `src/components/ui/CoverArt.tsx`, `ui/CoverShowcase.tsx`, `src/lib/coverAccent.ts` |
| Beat detail page | `src/app/beats/[slug]`, `src/components/beats/BeatDetail.tsx` |
| Motion primitives (Reveal, Stagger, Parallax, Magnetic, Tilt, Marquee) | `src/components/ui/motion.tsx` |
| Lenis smooth scroll + scroll lock | `src/components/ui/SmoothScroll.tsx` |
| Accessible dialog (focus trap, Esc, restore focus) | `src/components/ui/Dialog.tsx` |
| Email capture form / popup | `src/components/email/EmailCaptureForm.tsx`, `EmailPopup.tsx` |
| License modal / cards / table | `src/components/beats/LicenseModal.tsx`, `src/components/licenses/LicenseCards.tsx` |
| Beat catalog (filters, list/grid) | `src/components/beats/BeatCatalog.tsx`, `BeatRow.tsx` |
| Packs grid / detail / free / cart | `src/components/packs/*` |
| Home sections | `src/components/home/*`, `src/components/rights/KnowYourRights.tsx` |
| Cart + currency state (localStorage) | `src/lib/cart.tsx`, `src/lib/currency.tsx` |

## Data (edit here)

- `src/data/beats.ts` — beats (placeholder)
- `src/data/packs.ts` — packs; **Guitar Vault Vol. 1** is the real flagship, others `placeholder: true`; free kits; Loop Club
- `src/data/licenses.ts` — lease tiers, lease terms, deals, loop license summary, credit format
- `src/data/rights.ts` — "Know your rights" copy + FAQ
- `src/data/seller.ts` — **fill in `[TBD]` Y-tunnus, street address, email**

## Palette ("flamenco noir")

All colors live in **one place**: the `:root` channel variables at the top of `src/app/globals.css`
(`--ink-rgb`, `--surface-rgb`, `--raised-rgb`, `--oxblood-rgb`, `--ember-rgb`, `--gold-rgb`, `--violet-rgb`, `--bone-rgb`, `--mute-rgb`).
Tailwind classes (`bg-ember`, `text-gold/80`, …) and all component CSS read from them. CTAs on ember/gold use dark ink text (AA).
Generated placeholder covers use the same hex values in `scripts/gen-covers.mjs` (re-run `npm run covers:placeholders` after a palette change).

## Adding a beat / pack

1. **Audio preview** → `public/audio/...` (MP3/M4A, tagged preview for beats). Path goes in `src` / `demo[].src`.
2. **Cover art** → `public/covers/beats/<slug>.jpg` or `public/covers/packs/<slug>.jpg` (`.webp`/`.png` also work).
   - Square, **3000×3000 recommended** (min 1400×1400), sRGB, **< 2 MB**.
   - The filename must equal the product `slug`. No code change needed: `scripts/sync-covers.mjs` runs before `dev`/`build`,
     writes `src/data/covers.manifest.json` (incl. a tiny blur placeholder) and warns about wrong sizes. Run `npm run covers:sync` manually while the dev server is running.
   - Until art exists the generated placeholder `public/covers/placeholders/<type>/<slug>.svg` is used; if a file fails to load, `CoverArt` shows on-brand fallback art with the title.
   - The player / rows / cards / detail pages pick an accent color from the cover automatically (`--track-accent`).
3. **Data entry**:
   - Beat → add a `beat("slug", "Title", …)` line in `src/data/beats.ts` (genre, BPM, key, moods, tags). A detail page `/beats/<slug>` is generated.
   - Pack → add an object in `src/data/packs.ts` (`withCover({ slug, title, type, price, categories, specs, demo: [...] })`). Page `/packs/<slug>` is generated.
4. `npm run build` to verify.

## Swap in real assets

- **Hero**: the source is procedural (`hero/vaultScene.ts`, "wide" + "tall"/portrait layouts). To use a photo instead: `<AsciiStars src="/hero/source.jpg" />` in `Hero.tsx` and remove `<GuitarStrings>` (strings are aligned to the procedural guitar).
- **Covers**: see "Adding a beat / pack".
- **Audio**: real guitar previews in `public/audio/packs/spanish-guitar/`; producer tag `public/audio/tag/slapgod-tag.mp3` (kept for future preview tagging — not used on the site; the only sound on the site comes from the music players); placeholder beat loops `public/audio/*.m4a` (synthesized by `scripts/gen-audio.py`) — replace with tagged beat previews.
- **Instagram tiles**: `src/components/home/InstagramStrip.tsx`.
- **Split sheet**: `public/downloads/split-sheet.pdf` is a placeholder PDF.

## TODO hook points

- **Stripe**: `src/components/packs/CartView.tsx` → `checkout()` (`// TODO: Stripe Checkout`). Prices must be resolved server-side; lease "buy 2 get 1" discount is display-only. Currency: one Stripe Price per currency (`src/lib/currency.tsx`).
- **Email / ESP**: `src/app/api/subscribe/route.ts` (`// TODO: Klaviyo/ESP`) — double opt-in, store consent text/timestamp/source, deliver Guitar Vault Lite only after confirmation. Note: the free loop MP3 currently lives in `/public` (not truly gated).
- **Contact form**: `src/components/layout/ContactForm.tsx` (UI only).
- **Legal copy**: `/terms`, `/privacy`, `/refunds`, `/licenses` agreement text are stubs.

## Mobile / deploy notes

- No Lenis on touch devices (native momentum scroll); gentler parallax ≤767px; pointer parallax desktop only.
- Hero canvases are client-only dynamic imports; the HTML wordmark is the LCP element. Mobile renders fewer cells/particles.
- Global player: compact bar respecting `safe-area-inset-bottom`; expanded = full-screen sheet on phones (swipe the handle down or tap the chevron; Esc closes).
- Dialogs (license, email popup) are bottom sheets on phones (swipe handle / close button / Esc). Popup exit-intent is desktop-only.
- Beat filters collapse into a drawer on phones; license comparison table scrolls horizontally with a sticky first column.
- Metadata: `metadataBase` = `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → localhost (dev). Set `NEXT_PUBLIC_SITE_URL` in Vercel for correct OG URLs. Placeholder OG image: `src/app/opengraph-image.tsx`; icon `src/app/icon.svg`; `manifest.ts`.

## Notes

- Keyboard shortcuts (Space, ←/→ seek, ⇧←/→ prev/next, S, L) only act on the player that last started playing (default: the dock), and are ignored in inputs/buttons/open dialogs.
- Players pause their rAF DOM work while offscreen/idle; the hero canvas renders at DPR 1 with capped cells, adaptive cell size, pauses offscreen, and renders one static frame under `prefers-reduced-motion`.
