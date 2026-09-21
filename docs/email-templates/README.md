# SLAPGOD email templates

`welcome-01-delivery.html` is the base. Emails 2–4 reuse the same file — swap the eyebrow, headline,
body copy, button and the block above the footer. Everything else (wordmark, card, footer) stays.

## Using it in Klaviyo

1. **Templates → Create template → Code / HTML** (not the drag-and-drop editor).
2. Paste the file contents, save, name it `SLAPGOD base`.
3. **Flows → your welcome flow → email → Edit → use this template.**
4. Set the **subject** and **preview text** on the email itself (the preview text in the HTML is a
   fallback; Klaviyo's field wins).
5. Send yourself a preview before turning the flow live.

## Klaviyo tags already wired in

| Tag | What it does |
|---|---|
| `{{ person.sg_free_kit_url }}` | The signed 30-day download link generated per subscriber by the site |
| `{% unsubscribe %}` | Unsubscribe link (legally required) |
| `{{ organization.name }}` / `{{ organization.full_address }}` | Pulled from Klaviyo account settings — fill those in or the footer renders empty |

## Swap the domain later

The file links to `slapgodmadeit.vercel.app`. When the real domain is live, find and replace it.

## Emails 2–4 copy

**Email 2 — +2 days · "How these loops get recorded"**
- Eyebrow: `Behind the loops`
- Headline: `One take, one room.`
- Body: how you record — the guitar, the room, why you play parts instead of using sample packs.
  Close with: everything in the Vault is recorded the same way.
- Button: `Hear the Vault` → `/packs/guitar-vault-vol-1`

**Email 3 — +4 days · "What you can actually do with my loops"**
- Eyebrow: `Your rights`
- Headline: `Use them. Sell the song.`
- Body: plain-language licence — royalty-free in your productions, credit `Prod. by SLAPGOD`,
  25% publishing on released songs, never resell the loops, never register them in Content ID.
- Button: `Read the full terms` → `/licenses`
- Secondary line: link to `/#rights` for the explainer.

**Email 4 — +6 days · "Your code expires tomorrow"**
- Eyebrow: `Last call`
- Headline: `10% off ends tomorrow.`
- Body: short. The code, what it applies to, when it dies.
- Button: `Use the code` → `/packs`

## Rules that keep these out of spam

- Keep the image-to-text ratio low. This template is text-only on purpose — no header image, nothing
  to block.
- Never send a single big image with the text baked in.
- Keep the unsubscribe link visible; don't shrink it to 8px grey-on-grey.
- The footer address is not optional (CAN-SPAM, and EU rules for commercial mail).
