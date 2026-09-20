# SLAPGOD web — design notes

Next.js 16 (App Router, Turbopack) · Tailwind v4 · `motion`. Run `npm run dev` → http://localhost:3000.

## Components

| Area | Files |
| --- | --- |
| Music player (owner spec, ported) | `src/components/player/MusicPlayer.tsx`, `music-player.css` |
| One-at-a-time audio + keyboard shortcut owner | `src/components/player/audioFocus.ts` |
| Global sticky dock player (mini bar ⇄ expanded card, persists across pages) | `src/components/player/GlobalPlayer.tsx` (`usePlayer().playQueue(tracks, i)`) |
| Hero background (WebGL shader) | `src/components/hero/HeroBackground.tsx` (+ `.hero-bg-fallback` / `.hero-bg-scrim` in `globals.css`) |
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

## Look & palette (stone base + accents)

Editorial, pill-shaped UI on the warm stone base. All colors live in the `:root` block at the top of `src/app/globals.css`
(`--ink-rgb` #1C1917 bg, `--deep-rgb` #0C0A09, `--surface-rgb` #292524, `--fg` #FAFAF9, `--fg-2` #D6D3D1, `--mute-rgb` #A8A29E).
Accents (Tailwind: `bg-coral`, `text-lilac`, `text-amber`, …):
- `--coral` #FF5A3C — primary: `.btn-primary`, play buttons (`.play-btn`), active pills/chips, prices, progress. Dark text #0C0A09 on coral = 6.4:1.
- `--lilac` #A98BFF — secondary: tags (`.tag`), glows, selection.
- `--amber` #FFB547 — tertiary: "Most popular", badges (`.badge-amber`), BPM chips (`.tag-amber`), stars.
- `--grad` = linear-gradient(120deg, #FF5A3C, #FF8A3D 35%, #FFB547 55%, #A98BFF 100%) — `.text-grad` headline words, `.bg-grad`, `.hairline-grad`, `.grad-ring`, player progress.
- Secondary CTA = white pill `.btn-light`; `.btn-ghost` stays stone.
- `--track-accent` (from the cover, `src/lib/coverAccent.ts`) tints rows, cards, detail backdrops and the player; falls back to coral.
Fonts: display = **Newsreader** via `.display`; UI = system stack. No blurs, no backdrop filters. Placeholder covers are colorful SVG art (`npm run covers:placeholders`).

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
- Color/motion layer (bottom of `globals.css`): shimmering gradient word, vinyl glow ring (pulses while playing), `<Marquee>` ticker (`ui/Marquee.tsx`), rotating conic "Most popular" border, footer wordmark gradient drift. All continuous CSS animations pause offscreen via `useOffscreenPause` (`.is-offscreen`) and are static under prefers-reduced-motion (`MotionConfig reducedMotion="user"` in Providers).
- Extra primitives in `motion.tsx`: `Magnetic` (hero "Browse beats", desktop only), `CountUp`, `GradUnderline` (section headers), `spotlightMove` + `.spotlight` (cursor spotlight, fine pointers only), `.card-lift` (hover lift + accent glow).
- Idle cost (outside the home hero / marquees): no continuous animation. The MusicPlayer rAF loops only run while it is visible AND playing (plus ~2s to settle); the equalizer and vinyl spin are CSS and paused when not playing.

## Hero background (WebGL shader)

`src/components/hero/HeroBackground.tsx` — one full-screen triangle, one GLSL fragment shader, plain `three`
(no `@react-three/fiber`, no post-processing). Loaded from `Hero.tsx` via `next/dynamic` with `ssr: false`, so it
never blocks first paint. It replaces the old drifting CSS aurora blobs and the hero cursor spotlight.

**What it draws.** Domain-warped fBm value noise → smoky liquid ribbons of coral → orange → amber → lilac over the
warm near-black base, with a squared vertical falloff (darkest at the bottom, where the copy sits), a gentle
vignette, a "copy guard" that calms the middle column behind the headline/search pill, a faint in-shader film grain,
and a very subtle "sound wave" horizontal displacement. On desktop the pointer gently warps and brightens the field
near the cursor (`uPointer`/`uPointerAmt`, mouse pointers only — nothing on touch).

**Layers in the hero** (`z-index` inside the section): `.hero-bg-fallback` (−20) → canvas (−10) → `.hero-bg-scrim`
(−5) → vinyl (0) → copy (10). The fallback is an instant CSS radial-gradient painting; the canvas fades in over
800ms on top of it, and it stays as-is on devices that skip the shader. The scrim is the dark bottom-to-top gradient
that guarantees text contrast.

**Loop period: 48s, exact.** All motion enters the shader through `uTheta` (0 → 2π over `LOOP_SECONDS`) and only as
`sin`/`cos` of integer multiples of it, so the last frame equals the first — no visible restart. Change
`LOOP_SECONDS` at the top of the file to slow down / speed up the whole thing (bigger = slower).

**Colors.** Read at runtime from the `:root` tokens in `globals.css` (`--ink-rgb`, `--coral-rgb`, `--orange-rgb`,
`--amber-rgb`, `--lilac-rgb`) and passed in as uniforms, so repalettes carry over with no shader edit. To change the
mix, tune the ramp (`smoothstep` stops around `g`) and the spatial hue bias (`uv.x`/`uv.y` terms) in `main()`.
Overall presence lives in the single `intensity` line (currently `… * 0.5`).

**Perf switches** (constants at the top of the file):

| Switch | Default | Notes |
| --- | --- | --- |
| `LOOP_SECONDS` | `48` | loop period / speed |
| `FPS` | `30` | frame cap (time is accumulated, extra frames skipped) |
| `RENDER_SCALE` | `0.75` | internal resolution multiplier, CSS-upscaled |
| `MAX_DPR_DESKTOP` / `MAX_DPR_MOBILE` | `1.25` / `1` | DPR cap before `RENDER_SCALE` |

Also: 4 fBm octaves (3 `fbm` calls per pixel), `powerPreference: "low-power"`, paused by `IntersectionObserver`
when the hero scrolls away and on `document.hidden`, renderer/geometry/material disposed on unmount,
`webglcontextlost`/`restored` handled. Under `prefers-reduced-motion` it renders **one** static frame and starts no
rAF loop. Without WebGL, or on machines reporting `navigator.hardwareConcurrency <= 2`, `three` is never imported
and only the CSS gradient shows — append `?shader=force` to the URL to override that check when testing.

## Cover art direction

Two shelves, one house style. Every cover: square (2000×2000+), dark, one warm light source, haze,
deep black shadows, subject small with empty space, **no text / logos / signage / faces**.

- **Beats → urban night scenes.** Alleys, underpasses, rooftops, car interiors, rain on asphalt, one
  sodium streetlight. Same hour of night across the set so the catalog reads as a series.
- **Loop & sample packs → instruments.** Guitars, drum machines, keys, tape — lit by a single warm
  beam in a dark room (see `covers/packs/guitar-vault-vol-1.jpg` for the reference look).

Prompt formulas (Gemini):
- Beats: `Square album cover, <scene> at night, wet asphalt reflections, one warm sodium streetlight
  glow, haze, deep black shadows, cinematic 35mm photo, high contrast, shallow depth of field, empty
  space in the lower third, no text, no logos, no signage, no faces, no license plates, clean walls
  (no graffiti).`
- Packs: `Square album cover, <instrument> in a dark room, single dramatic warm light beam from upper
  right, haze and smoke, deep black background, cinematic photo, high contrast, shallow depth of
  field, no text, no logos.`

Keep to the site accents (coral / amber / lilac) — reject covers that skew cold blue-green.

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
- Players pause their rAF DOM work while offscreen/idle; the hero shader canvas is capped at 30fps and 0.75× resolution, pauses offscreen and when the tab is hidden, and renders one static frame under `prefers-reduced-motion` (see "Hero background").
