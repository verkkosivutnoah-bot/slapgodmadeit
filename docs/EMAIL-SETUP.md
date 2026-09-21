# Email capture setup (Klaviyo)

The site code is done. These are the steps only you can do — they need logins and keys.
**Never paste API keys into chat.** Put them in the files/fields described below.

## How the flow works now

1. Visitor submits the popup / `/free` form → `POST /api/subscribe`.
2. The server validates the address, drops bots (honeypot), rate-limits (5 per IP / 10 min).
3. It upserts a Klaviyo profile with:
   - `sg_source` — which form they came from (popup, free page, footer…)
   - `sg_consent_text` + `sg_consent_at` + `sg_consent_ip` — proof of consent (GDPR)
   - `sg_free_kit_url` — a signed download link, valid 30 days
4. It subscribes the profile to your list (single opt-in — subscribed immediately).
5. Your welcome flow fires and emails the download link.
6. The link hits `/api/download`, which checks the signature and expiry and streams
   `web/private/guitar-vault-lite.zip`. That file is **not** in `/public`, so it can't be found by URL.

## 1. Klaviyo account

1. Sign up at klaviyo.com (free up to 250 contacts / 500 sends).
2. **Lists & Segments → Create List** → name it `Newsletter`.
3. Open the list → **Settings → Opt-in process → Single opt-in**.
   People are subscribed the moment they submit the form and the welcome email goes out right away.
   The consent proof (wording, timestamp, IP) is stored on the profile instead of a confirmation click.
4. Copy the **List ID** (6 characters, in the list's URL or Settings).
5. **Settings → API keys → Create private API key.** Give it *Full access* to Profiles, Lists and
   Subscriptions (or full access if simpler). Copy the key (starts with `pk_`).

## 2. Add the keys locally

Open the file `web/.env.local` (create it if missing — `.env*` is gitignored) and add:

```
KLAVIYO_PRIVATE_KEY=pk_your_key_here
KLAVIYO_LIST_ID=YourListId
DOWNLOAD_SECRET=paste_a_long_random_string
NEXT_PUBLIC_SITE_URL=https://slapgodmadeit.vercel.app
```

Generate the download secret with:

```bash
openssl rand -hex 32
```

`web/.env.example` lists the same variables as a template.

## 3. Add the keys to Vercel

Vercel Dashboard → project **slapgodmadeit** → **Settings → Environment Variables**. Add the same four
for **Production** and **Preview**, then redeploy (or just push again).

Keep `DOWNLOAD_SECRET` identical everywhere — changing it invalidates download links already emailed.

## 4. Build the welcome flow in Klaviyo

**Flows → Create Flow → List triggered → Newsletter.**

| # | Timing | Email |
|---|---|---|
| 1 | Immediately | "Here are your loops" — download button linking to `{{ person.sg_free_kit_url }}`, credit line, Instagram link |
| 2 | +2 days | Your story, how the loops are recorded, link to Guitar Vault Vol. 1 |
| 3 | +4 days | How licensing works (link `/licenses` and `/#rights`), beats catalog |
| 4 | +6 days | Discount code reminder before it expires |

In email 1, add a button and set its link to `{{ person.sg_free_kit_url }}` — that's the signed link the
site generated for that person. Add a fallback line: "Link expired? Grab a fresh one at
slapgodmadeit.vercel.app/free".

## 5. Verify the domain (important)

Klaviyo → **Settings → Domains → Add a sending domain.** Add the DNS records it gives you
(SPF, DKIM, DMARC) at your domain registrar. Without this, Gmail and Outlook push your mail to spam.
This needs a real domain — worth buying `slapgod.com` or similar before the store opens.

## 6. Test end to end

1. Submit the form on the live site with your own address.
2. The welcome email should arrive within a minute.
3. Check the profile in Klaviyo shows `sg_source`, `sg_consent_at`, `sg_consent_ip`, `sg_free_kit_url`.
4. Click the download link in the welcome email — the zip should download.

## Known gaps

- **Free loops are also public as previews.** `/public/audio/packs/spanish-guitar/*.mp3` are the same
  five files that are inside the gated zip, so a determined visitor can grab them from the player.
  Fix when the real kit is ready: make previews short/tagged clips, and put the full-quality
  (ideally WAV) loops only in the zip.
- The zip currently holds 5 loops; the site advertises 10. Drop the final files into
  `web/private/` (rebuild the zip) when they're recorded.
- Rate limiting is per server instance, which is fine at this scale but not a hard limit.
