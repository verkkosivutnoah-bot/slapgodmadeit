#!/usr/bin/env bash
# Checks owner-supplied cover art: right names, square, big enough, sane file size.
# Usage: bash scripts/check-covers.sh
set -u
cd "$(dirname "$0")/.." || exit 1

slugs_beats=$(grep -oE 'beat\("[^"]+"' src/data/beats.ts | cut -d'"' -f2)
slugs_packs=$(grep -oE 'slug: "[^"]+"' src/data/packs.ts | cut -d'"' -f2)

check_one() {
  local dir=$1 slug=$2 f=""
  for ext in jpg jpeg webp png; do
    [ -f "public/covers/$dir/$slug.$ext" ] && f="public/covers/$dir/$slug.$ext" && break
  done
  if [ -z "$f" ]; then
    printf '  %-22s —  no cover yet (placeholder in use)\n' "$slug"
    return
  fi
  local w h size note=""
  w=$(sips -g pixelWidth "$f" 2>/dev/null | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$f" 2>/dev/null | awk '/pixelHeight/{print $2}')
  size=$(du -k "$f" | cut -f1)
  [ "$w" != "$h" ] && note="$note NOT SQUARE;"
  [ "${w:-0}" -lt 1400 ] && note="$note TOO SMALL (<1400px);"
  [ "$size" -gt 3000 ] && note="$note HEAVY (>3MB, consider compressing);"
  printf '  %-22s OK %sx%s %sKB%s\n' "$slug" "$w" "$h" "$size" "${note:+  ⚠$note}"
}

echo "Beats (urban night scenes):"
for s in $slugs_beats; do check_one beats "$s"; done
echo
echo "Packs (instrument shots):"
for s in $slugs_packs; do check_one packs "$s"; done
echo
echo "Stray files (wrong name — rename to <slug>.jpg):"
for d in beats packs; do
  for f in public/covers/$d/*; do
    [ -e "$f" ] || continue
    base=$(basename "$f"); base=${base%.*}
    [ "$base" = ".gitkeep" ] && continue
    list=$([ "$d" = beats ] && echo "$slugs_beats" || echo "$slugs_packs")
    echo "$list" | grep -qx "$base" || echo "  $f"
  done
done
