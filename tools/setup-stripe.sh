#!/usr/bin/env bash
# One-time Stripe setup for the SLAPGOD store. Run it yourself; it never prints a secret.
#
#   1. reads STRIPE_SECRET_KEY from web/.env.local (you paste it there first)
#   2. creates the webhook endpoint through the Stripe API
#   3. saves the webhook signing secret to web/.env.local
#   4. adds both secrets to Vercel (Production) and triggers a redeploy
#
# Usage:  bash tools/setup-stripe.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV="$ROOT/web/.env.local"
SITE="https://slapgodmadeit.vercel.app"
HOOK_URL="$SITE/api/stripe/webhook"

val() { grep -E "^$1=" "$ENV" 2>/dev/null | tail -1 | cut -d= -f2-; }

KEY="$(val STRIPE_SECRET_KEY)"
if [[ -z "$KEY" ]]; then
  echo "✗ STRIPE_SECRET_KEY missing from web/.env.local."
  echo "  Add a line:  STRIPE_SECRET_KEY=sk_test_...   then run this again."
  exit 1
fi
if [[ "$KEY" != sk_test_* ]]; then
  echo "✗ That isn't a test key (sk_test_...). Set up in test mode first."
  exit 1
fi
echo "✓ found test secret key"

# --- account check -----------------------------------------------------------
ACCT="$(curl -s https://api.stripe.com/v1/account -u "$KEY:")"
if echo "$ACCT" | grep -q '"error"'; then
  echo "✗ Stripe rejected the key:"; echo "$ACCT" | python3 -c "import json,sys;print(' ',json.load(sys.stdin)['error']['message'])"
  exit 1
fi
echo "✓ key works — account $(echo "$ACCT" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('settings',{}).get('dashboard',{}).get('display_name') or d['id'])")"

# --- webhook -----------------------------------------------------------------
EXISTING="$(curl -s "https://api.stripe.com/v1/webhook_endpoints?limit=100" -u "$KEY:" \
  | python3 -c "import json,sys;print(next((e['id'] for e in json.load(sys.stdin)['data'] if e['url']=='$HOOK_URL'),''))")"
if [[ -n "$EXISTING" ]]; then
  echo "• webhook already exists ($EXISTING) — deleting it so a fresh signing secret can be issued"
  curl -s -X DELETE "https://api.stripe.com/v1/webhook_endpoints/$EXISTING" -u "$KEY:" >/dev/null
fi

HOOK="$(curl -s https://api.stripe.com/v1/webhook_endpoints -u "$KEY:" \
  -d url="$HOOK_URL" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=checkout.session.async_payment_succeeded" \
  -d description="SLAPGOD store")"
WHSEC="$(echo "$HOOK" | python3 -c "import json,sys;print(json.load(sys.stdin).get('secret',''))")"
if [[ -z "$WHSEC" ]]; then
  echo "✗ couldn't create the webhook:"; echo "$HOOK" | head -c 400; echo; exit 1
fi
echo "✓ webhook created → $HOOK_URL"

# --- save locally ------------------------------------------------------------
tmp="$(mktemp)"
grep -vE "^STRIPE_WEBHOOK_SECRET=" "$ENV" > "$tmp" || true
printf 'STRIPE_WEBHOOK_SECRET=%s\n' "$WHSEC" >> "$tmp"
mv "$tmp" "$ENV"
echo "✓ STRIPE_WEBHOOK_SECRET saved to web/.env.local"

# --- Vercel (Production) -----------------------------------------------------
cd "$ROOT/web"
for NAME in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET; do
  vercel env rm "$NAME" production --yes >/dev/null 2>&1 || true
  printf '%s' "$(val "$NAME")" | vercel env add "$NAME" production >/dev/null 2>&1
  echo "✓ $NAME added to Vercel (Production)"
done

# --- redeploy ----------------------------------------------------------------
cd "$ROOT"
git commit -q --allow-empty -m "Redeploy with Stripe keys" && git push -q origin main
echo "✓ redeploy triggered — checkout is live in test mode in about a minute"
echo
echo "Test it: add a lease to the cart on $SITE, checkout, pay with 4242 4242 4242 4242."
