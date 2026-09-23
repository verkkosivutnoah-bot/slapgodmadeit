#!/bin/bash
# Install / update the loop bot as a macOS background service (launchd).
# It starts at login, restarts if it crashes, and runs without Claude or a terminal.
#
# macOS doesn't let background services read the Desktop folder, so the bot
# runs from a copy in ~/slapgod-loop-bot. Re-run this script after changing code.
#
#   ./install_service.sh            install or update + restart
#   ./install_service.sh uninstall  stop and remove the service
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/slapgod-loop-bot"
LABEL="com.slapgod.loopbot"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
for _ in $(seq 1 30); do  # bootout is asynchronous; wait until the old one is gone
  launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1 || break
  sleep 1
done

if [[ "${1:-}" == "uninstall" ]]; then
  rm -f "$PLIST"
  echo "Loop bot service removed. (Files in $DEST were left in place.)"
  exit 0
fi

mkdir -p "$DEST"
cp "$SRC"/*.py "$SRC/requirements.txt" "$SRC/.env" "$DEST/"
# /tags saves to tags.json in the running copy — don't overwrite it.
[[ -f "$SRC/tags.json" && ! -f "$DEST/tags.json" ]] && cp "$SRC/tags.json" "$DEST/"

if [[ ! -x "$DEST/.venv/bin/python" ]]; then
  echo "Setting up Python environment (first time only, takes a few minutes)…"
  python3 -m venv "$DEST/.venv"
  "$DEST/.venv/bin/pip" install -q --upgrade pip
fi
"$DEST/.venv/bin/pip" install -q -r "$DEST/requirements.txt"

mkdir -p "$(dirname "$PLIST")"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$DEST/.venv/bin/python</string>
    <string>$DEST/bot.py</string>
  </array>
  <key>WorkingDirectory</key><string>$DEST</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>15</integer>
  <key>StandardOutPath</key><string>$DEST/bot.log</string>
  <key>StandardErrorPath</key><string>$DEST/bot.log</string>
</dict>
</plist>
EOF

launchctl bootstrap "$DOMAIN" "$PLIST"
echo "Loop bot service running. Log: $DEST/bot.log"
echo "Stop it for good: $SRC/install_service.sh uninstall"
