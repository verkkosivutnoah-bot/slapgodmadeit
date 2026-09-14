// Scans owner-submitted cover art and writes src/data/covers.manifest.json.
// Runs automatically before `npm run dev` and `npm run build` (predev / prebuild).
//
// Convention:  public/covers/<type>/<slug>.(webp|jpg|jpeg|png|avif)   type = beats | packs
// Spec:        square, 3000×3000 recommended (min 1400×1400), sRGB, < 2 MB
// Missing art → the site falls back to public/covers/placeholders/<type>/<slug>.svg
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COVERS = join(ROOT, "public", "covers");
const OUT = join(ROOT, "src", "data", "covers.manifest.json");
const TYPES = ["beats", "packs"];
const EXT = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  /* optional — without sharp we skip blur/size checks */
}

const manifest = {};
for (const type of TYPES) {
  const dir = join(COVERS, type);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    const ext = extname(file).toLowerCase();
    if (!EXT.includes(ext)) continue;
    const slug = basename(file, extname(file));
    const abs = join(dir, file);
    const entry = { src: `/covers/${type}/${file}` };
    const bytes = statSync(abs).size;
    if (bytes > 2 * 1024 * 1024) console.warn(`[covers] ${type}/${file} is ${(bytes / 1048576).toFixed(1)} MB (recommended < 2 MB)`);
    if (sharp) {
      try {
        const img = sharp(abs);
        const meta = await img.metadata();
        entry.width = meta.width;
        entry.height = meta.height;
        if ((meta.width ?? 0) < 1400 || (meta.height ?? 0) < 1400) console.warn(`[covers] ${type}/${file} is ${meta.width}×${meta.height} (min 1400×1400)`);
        if (meta.width !== meta.height) console.warn(`[covers] ${type}/${file} is not square`);
        const buf = await sharp(abs).resize(10, 10, { fit: "cover" }).toFormat("png").toBuffer();
        entry.blur = `data:image/png;base64,${buf.toString("base64")}`;
      } catch (e) {
        console.warn(`[covers] could not read ${type}/${file}: ${e.message}`);
      }
    }
    const key = `${type}/${slug}`;
    // prefer webp > jpg > png if several exist
    if (!manifest[key] || EXT.indexOf(ext) < EXT.indexOf(extname(manifest[key].src))) manifest[key] = entry;
  }
}

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[covers] ${Object.keys(manifest).length} owner cover(s) found → src/data/covers.manifest.json`);
