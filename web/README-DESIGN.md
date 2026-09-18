# SLAPGOD web — design notes

Next.js 16 (App Router, Turbopack) · Tailwind v4 · `motion`. Run `npm run dev` → http://localhost:3000.

## Components

| Area | Files |
| --- | --- |
| Music player (owner spec, ported) | `src/components/player/MusicPlayer.tsx`, `music-player.css` |
| One-at-a-time audio + keyboard shortcut owner | `src/components/player/audioFocus.ts` |
| Global sticky dock player (mini bar ⇄ expanded card, persists across pages) | `src/components/player/GlobalPlayer.tsx` (`usePlayer().playQueue(tracks, i)`) |
| Hero | `src/components/home/Hero.tsx` — line-reveal serif headline, pill search (→ `/beats?q=`), trust chips, spinning vinyl centerpiece (plays Guitar Vault previews) |
| Cover art (next/image + fallback) / accent color | `src/components/ui/CoverArt.tsx`, `ui/CoverShowcase.tsx`, `src/lib/coverAccent.ts` |
| Beat / pack detail | `src/components/beats/BeatDetail.tsx` (segmented license picker w/ animated selection + live summary), `src/components/packs/PackDetail.tsx`; both use `ui/CoverShowcase.tsx` + `StickyBuyBar` |
| Track list | `src/components/beats/BeatRow.tsx` — number↔play toggle, equalizer when playing, BPM/key/duration columns |
| Motion primitives (Reveal, Stagger, Parallax, Magnetic, Tilt, Marquee) | `src/components/ui/motion.tsx` |
| Route scroll reset + scroll lock | `src/components/ui/SmoothScroll.tsx` |
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

## Look & palette (monochrome stone)

Editorial, calm, pill-shaped UI. All colors live in the `:root` block at the top of `src/app/globals.css`
(`--ink-rgb` #1C1917 bg, `--deep-rgb` #0C0A09, `--surface-rgb` #292524, `--fg` #FAFAF9, `--fg-2` #D6D3D1, `--mute-rgb` #A8A29E,
`--silver` gradient — the only accent: "Most popular" ring, NEW/Free/flagship badges, a few highlighted words via `.text-silver` / `.bg-silver`).
Fonts: display = **Newsreader** (next/font, 700, tight tracking) via `.display`; UI = system stack (SF Pro, Inter fallback).
Utilities: `.section` (vertical rhythm), `.eyebrow` (uppercase muted label), `.link-u` (underline-slide), `.frame` (rounded image frame, 1.03 hover scale),
`.btn-primary` (white pill ↔ stone on hover), `.btn-ghost` (stone pill ↔ white on hover), `.snap-x-row` (horizontal snap scroll).
No blurs, no backdrop filters, no grain. Placeholder covers are monochrome SVG art (`npm run covers:placeholders`).

## Motion system

One module: `src/components/ui/motion.tsx` (motion/react; transform + opacity + clip-path only; ease `[0.22,1,0.36,1]`, 0.5–0.9s, stagger 0.06; static under prefers-reduced-motion).
- `LineReveal` — headlines slide up line by line (hero, page heros, section titles)
- `Reveal`, `Stagger`/`StaggerItem` — fade-up once (viewport once, -10% margin)
- `RevealImage` — cover clip-path opens + image settles 1.06 → 1
- `Rise` — on-mount entrance (hero search / chips)
- `PillTabs` (`ui/PillTabs.tsx`) — sliding active pill (layoutId): beat genres, pack types, beat-vs-loop licenses
- `DragScroll` (`ui/DragScroll.tsx`) — snap carousel, mouse drag + native touch swipe (home packs)
- `StickyBuyBar` (`ui/StickyBuyBar.tsx`) — mobile buy bar on detail pages (sits above the player dock)
- Page transition: `src/app/template.tsx` 240ms cross-fade. Header fades in; nav active pill slides.
- "Wow" moments: hero vinyl (spins via CSS only while the preview plays; scales/fades on scroll via `useScroll`), packs carousel, footer wordmark rise.
- Idle cost: zero continuous animation. The MusicPlayer rAF loops only run while it is visible AND playing (plus ~2s to settle); the equalizer and vinyl spin are CSS and paused when not playing.

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

- Native scrolling everywhere (Lenis removed). Only gentle fade/slide-up reveals.
- Global player: compact bar respecting `safe-area-inset-bottom`; expanded = full-screen sheet on phones (swipe the handle down or tap the chevron; Esc closes).
- Dialogs (license, email popup) are bottom sheets on phones (swipe handle / close button / Esc). Popup exit-intent is desktop-only.
- Beat filters collapse into a drawer on phones; license comparison table scrolls horizontally with a sticky first column.
- Metadata: `metadataBase` = `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` → localhost (dev). Set `NEXT_PUBLIC_SITE_URL` in Vercel for correct OG URLs. Placeholder OG image: `src/app/opengraph-image.tsx`; icon `src/app/icon.svg`; `manifest.ts`.

## Notes

- Keyboard shortcuts (Space, ←/→ seek, ⇧←/→ prev/next, S, L) only act on the player that last started playing (default: the dock), and are ignored in inputs/buttons/open dialogs.
- Players pause their rAF DOM work while offscreen/idle; the hero canvas renders at DPR 1 with capped cells, adaptive cell size, pauses offscreen, and renders one static frame under `prefers-reduced-motion`.
