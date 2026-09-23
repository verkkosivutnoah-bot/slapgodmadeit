"""Rename the original loop file on this Mac once the bot knows its key.

Files are found with Spotlight (by exact name and size). The rename is a
plain file rename; macOS may ask once whether Python can access the folder.
If that's blocked, Finder is asked to do the rename instead.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

SEARCH_ROOTS = [Path.home() / d for d in ("Desktop", "Downloads", "Documents", "Music")]
# Copies other things depend on: website assets, DAW projects, the Music app
# library. Renaming those would break links, so they're left alone.
SKIP = [p.strip() for p in os.getenv(
    "RENAME_SKIP", "/Library/,/.Trash/,/Music/Music/,/Slapgod Website/,/Image-Line/"
).split(",") if p.strip()]


def _spotlight(*args: str) -> str:
    return subprocess.run(["mdfind", *args], capture_output=True, text=True, timeout=20).stdout


def _size(path: str) -> int | None:
    out = subprocess.run(["mdls", "-raw", "-name", "kMDItemFSSize", path],
                         capture_output=True, text=True, timeout=10).stdout.strip()
    return int(out) if out.isdigit() else None


def find_originals(name: str, size: int | None) -> list[str]:
    """Files on this Mac with exactly this name (and size, when known)."""
    query = 'kMDItemFSName == "%s"' % name.replace("\\", "\\\\").replace('"', '\\"')
    found: list[str] = []
    for root in SEARCH_ROOTS:
        for path in _spotlight("-onlyin", str(root), query).splitlines():
            if path and path not in found and not any(s in path for s in SKIP):
                found.append(path)
    if size:
        found = [p for p in found if _size(p) == size]
    return found


def rename_in_finder(path: str, new_name: str) -> None:
    script = [
        "on run argv",
        "tell application \"Finder\" to set name of (POSIX file (item 1 of argv) as alias) to (item 2 of argv)",
        "end run",
    ]
    cmd = ["osascript"] + sum((["-e", line] for line in script), []) + [path, new_name]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "Finder refused the rename")


def rename_originals(original_name: str, new_name: str, size: int | None) -> list[str]:
    """Rename every matching original. Returns lines describing what happened."""
    if original_name == new_name:
        return []
    try:
        os.listdir(Path.home() / "Desktop")
    except PermissionError:
        return ["📁 Couldn't rename the file on your Mac: the bot needs Full Disk Access "
                "(System Settings → Privacy & Security → Full Disk Access → add Python)."]
    matches = find_originals(original_name, size)
    if not matches:
        return [f"📁 Couldn't find {original_name} on your Mac to rename."]
    lines = []
    for path in matches:
        folder = Path(path).parent
        target = folder / new_name
        try:
            try:
                if target.exists():
                    raise FileExistsError(f"{new_name} already exists there")
                os.rename(path, target)
            except PermissionError:
                rename_in_finder(path, new_name)
            lines.append(f"📁 Renamed on your Mac: {str(folder).replace(str(Path.home()), '~')}/{new_name}")
        except Exception as exc:  # noqa: BLE001
            lines.append(f"📁 Couldn't rename {path}: {exc}")
    return lines
