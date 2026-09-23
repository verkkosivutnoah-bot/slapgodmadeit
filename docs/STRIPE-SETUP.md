# Stripe setup

The checkout code is built. These steps need your accounts — do them in **test mode** first.
Never paste keys into chat; they go in `web/.env.local` and Vercel only.

## How it works

1. Cart sends only item **keys** to `/api/checkout`. Prices come from the server catalog, and
   the "buy 2 leases, get 1 free" deal is applied there (same code the cart shows).
2. Stripe-hosted Checkout takes the payment (cards, Apple/Google Pay, MobilePay, Klarna —
   whatever you enable in the dashboard). Promo codes are accepted.
3. Buyer lands on `/checkout/success?session_id=…` — the **delivery page**. It asks Stripe
   whether that session is paid and lists downloads + license PDFs. No database: Stripe is the
   order record.
4. Each download re-checks with Stripe that the order is paid and that the licence tier includes
   that file (Basic → MP3, Premium → MP3 + WAV, Trackout/Unlimited → + stems).
5. License PDFs are generated on demand with the buyer's name, the beat and a licence number.
6. The webhook sends a **Placed Order** event to Klaviyo for the post-purchase flow.

Paid files live in **Vercel Blob (private)**, because the GitHub repo is public.

## 1. Stripe account

1. Sign up at stripe.com as a **sole trader** (toiminimi) with your Y-tunnus.
2. Stay in **Test mode** (toggle top right) until an end-to-end test works.
3. **Developers → API keys** → copy the **Secret key** (`sk_test_…`).
4. **Settings → Payment methods** → turn on what you want (cards, Apple Pay, Google Pay,
   MobilePay, Klarna).
5. **Settings → Customer emails** → turn on **Successful payments** so buyers get a receipt.
6. **Settings → Public details** → business name `SLAPGOD`, support email, statement descriptor.

## 2. Webhook

**Developers → Webhooks → Add endpoint**
- URL: `https://slapgodmadeit.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- Copy the **Signing secret** (`whsec_…`).

## 3. Private file storage (Vercel Blob)

Vercel → project **slapgodmadeit** → **Storage → Create → Blob** → access **Private** →
connect it to the project. That adds `BLOB_READ_WRITE_TOKEN` to the project automatically.

The dashboard runs on your Mac, so it needs the token too. In the Blob store's page, open the
**.env.local** tab, copy the `BLOB_READ_WRITE_TOKEN=…` line and add it to `web/.env.local`.

Don't use `vercel env pull` here — it overwrites `.env.local`, and variables stored as
"sensitive" come back empty.

## 4. Keys

Add to **Vercel → Settings → Environment Variables** (Production), and to `web/.env.local`:

```
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…
```

Optional, once Stripe Tax is configured (Settings → Tax, origin address, OSS registration):

```
STRIPE_AUTOMATIC_TAX=true
```

Prices are then treated as **VAT-inclusive** and Stripe works out the VAT per country.

Push once (any commit) to redeploy with the new variables.

## 5. Test end to end

1. Add a lease to the cart on the live site → Checkout.
2. Pay with test card `4242 4242 4242 4242`, any future date, any CVC.
3. You land on **Your downloads**. Click each file and the License PDF.
4. Check Stripe → Payments shows it, and Klaviyo shows a **Placed Order** event.

Files for beats published **before** the Blob store existed aren't in storage yet — re-publish
them through the dashboard (or ask Claude to upload them).

## 6. Go live

Switch Stripe to **Live mode**, repeat steps 1.3 and 2 there (live keys and a live webhook are
separate), replace the two variables in Vercel, push. Do one real €1 test purchase with a promo
code, then refund it.

## Known gaps

- **No email delivery yet.** Buyers get Stripe's receipt and land on the downloads page; if they
  lose that page they need to contact you. Next step: transactional email (Resend) that sends
  the downloads link, and a customer library keyed by email.
- **Exclusives** don't go through the cart — they're negotiated via the offer form and invoiced
  with a Stripe Payment Link.
- **Upgrades** ("pay the difference") are handled manually for now.
