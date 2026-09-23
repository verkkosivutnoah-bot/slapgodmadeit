#!/usr/bin/env bash
# Switch the store from slapgodmadeit.vercel.app to slapgodmadeit.com — run AFTER the Zoner DNS
# records are in and https://slapgodmadeit.com loads the site.
#
#   1. refuses to run until the domain actually serves this site over HTTPS
#   2. rewrites every hardcoded vercel.app URL (code, docs, email template, meta)
#   3. sets NEXT_PUBLIC_SITE_URL locally and on Vercel
#   4. moves the Stripe webhook to the new domain (new signing secret, saved + uploaded)
#   5. commits and pushes → Vercel redeploys
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OLD="slapgodmadeit.vercel.app"
NEW="slapgodmadeit.com"
ENV="$ROOT/web/.env.local"
val() { grep -E "^$1=" "$ENV" 2>/dev/null | tail -1 | cut -d= -f2-; }

# --- 1. is the domain live? -------------------------------------------------
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://$NEW/" || true)"
if [[ "$code" != "200" ]]; then
  echo "✗ https://$NEW isn't serving the site yet (got $code). DNS can take up to an hour."
  echo "  Check again with:  curl -I https://$NEW"
  exit 1
fi
echo "✓ https://$NEW is live"

# --- 2. rewrite hardcoded URLs ---------------------------------------------
cd "$ROOT"
files="$(grep -rl "$OLD" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git . || true)"
for f in $files; do
  [[ "$f" == *switch-domain.sh ]] && continue
  sed -i '' "s#$OLD#$NEW#g" "$f"
  echo "  rewrote $f"
done

# --- 3. site URL -------------------------------------------------------------
tmp="$(mktemp)"
grep -vE "^NEXT_PUBLIC_SITE_URL=" "$ENV" > "$tmp" || true
printf 'NEXT_PUBLIC_SITE_URL=https://%s\n' "$NEW" >> "$tmp"
mv "$tmp" "$ENV"
cd "$ROOT/web"
vercel env rm NEXT_PUBLIC_SITE_URL production --yes >/dev/null 2>&1 || true
printf 'https://%s' "$NEW" | vercel env add NEXT_PUBLIC_SITE_URL production >/dev/null 2>&1
echo "✓ NEXT_PUBLIC_SITE_URL → https://$NEW (local + Vercel)"

# --- 4. Stripe webhook -------------------------------------------------------
KEY="$(val STRIPE_SECRET_KEY)"
if [[ -n "$KEY" ]]; then
  for id in $(curl -s "https://api.stripe.com/v1/webhook_endpoints?limit=100" -u "$KEY:" \
      | python3 -c "import json,sys;print(' '.join(e['id'] for e in json.load(sys.stdin)['data'] if 'slapgodmadeit' in e['url']))"); do
    curl -s -X DELETE "https://api.stripe.com/v1/webhook_endpoints/$id" -u "$KEY:" >/dev/null
  done
  WHSEC="$(curl -s https://api.stripe.com/v1/webhook_endpoints -u "$KEY:" \
    -d url="https://$NEW/api/stripe/webhook" \
    -d "enabled_events[]=checkout.session.completed" \
    -d "enabled_events[]=checkout.session.async_payment_succeeded" \
    -d description="SLAPGOD store" | python3 -c "import json,sys;print(json.load(sys.stdin).get('secret',''))")"
  if [[ -n "$WHSEC" ]]; then
    tmp="$(mktemp)"
    grep -vE "^STRIPE_WEBHOOK_SECRET=" "$ENV" > "$tmp" || true
    printf 'STRIPE_WEBHOOK_SECRET=%s\n' "$WHSEC" >> "$tmp"
    mv "$tmp" "$ENV"
    vercel env rm STRIPE_WEBHOOK_SECRET production --yes >/dev/null 2>&1 || true
    printf '%s' "$WHSEC" | vercel env add STRIPE_WEBHOOK_SECRET production >/dev/null 2>&1
    echo "✓ Stripe webhook moved to https://$NEW/api/stripe/webhook"
  else
    echo "! couldn't recreate the Stripe webhook — do it in the dashboard"
  fi
fi

# --- 5. deploy --------------------------------------------------------------
cd "$ROOT"
git add -A
git commit -q -m "Switch site URL to $NEW" || true
git push -q origin main
echo "✓ pushed — Vercel redeploys in about a minute"
echo
echo "Still manual: Klaviyo template links (find/replace $OLD there) and Stripe → Public details → website."
