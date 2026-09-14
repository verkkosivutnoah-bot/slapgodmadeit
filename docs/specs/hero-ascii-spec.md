# Hero section spec — "neon citi" ASCII-art effect

Recreate the "neon citi" ASCII-art effect from 21st.dev (https://21st.dev/community/ascii) using Canvas2D (or an equivalent 2D raster API).

Source photo: not recorded for this recipe — use any photo with a clear subject.

Render pipeline (reimplement, don't assume internal code is available):
1. Draw the source photo into a canvas at the target size; `bgMode`/`bgBlur`/`bgOpacity` control what shows behind the effect (blurred copy, solid color, the original photo, or nothing).
2. Divide the canvas into a grid of `cellSize`px cells and sample the average color/luminance of each cell.
3. For each cell, draw a shape per `renderMode`: "characters" draws a glyph from `charSet` sized/colored by luminance; "dither"/"mosaic"/"pixel"/"dots"/"cross"/"diamond"/"voxel"/"lego"/"mixed"/"lines"/"diagonal"/"braille"/"disco"/"hexdump" (hex-digit glyphs)/"matrix" (green code rain, self-animated)/"rings"/"hearts"/"stars"/"hexagons" (honeycomb)/"triangles" (low-poly)/"bubbles"/"hatch" (pencil cross-hatch)/"contour" (topographic iso-lines)/"halfblocks" (double vertical detail) each draw their own primitive shape instead. Respect `coverage` (% of cells drawn), `density`, `invert`, and `edgeEmphasis`.
4. Apply color adjustments in order: `brightness`, `contrast`, `saturation`, `grayscale`, then the `tint` color at `tintOpacity` via `overlayBlend`, then `blurType`/`blurAmount`.
5. Layer post-effects from `pfx` for every key where `enabled` is true, at its `intensity` (0-100): scanLines, vignette, bloom, chromatic, filmGrain, glitch, halftone, pixelate, filmDust.
6. If `lights.enabled`, add glow at each point in `lights.points` (normalized x/y, radius, intensity).
7. If `mask.enabled`, use `mask.dataUrl` as a reveal mask back to the plain photo (inverted if `mask.invert`).
8. This look is animated — see `animSpeed`, `animStyle` (wave/pulse/shimmer/ripple/flicker), and `animIntensity` for how it moves over time.

Only the parameters below need to be supported (renderMode "stars"); other modes are optional.

```json
{
  "renderMode": "stars",
  "bgMode": "none",
  "bgBlur": 12,
  "bgOpacity": 96,
  "cellSize": 3,
  "coverage": 100,
  "invert": false,
  "styleBlend": "source-over",
  "charSet": "standard",
  "customChars": "",
  "brightness": 0,
  "contrast": 125,
  "edgeEmphasis": 0,
  "density": 0,
  "toneCurve": [{ "x": 0, "y": 0 }, { "x": 1, "y": 1 }],
  "tint": "#3ca6ff",
  "tintOpacity": 0,
  "overlayBlend": "multiply",
  "saturation": 100,
  "grayscale": 0,
  "blurType": "off",
  "blurAmount": 35,
  "pfx": {
    "vignette": { "enabled": true, "intensity": 30 },
    "scanLines": { "enabled": false, "intensity": 40 },
    "chromatic": { "enabled": false, "intensity": 15 },
    "bloom": { "enabled": true, "intensity": 25 },
    "filmGrain": { "enabled": false, "intensity": 30 },
    "glitch": { "enabled": false, "intensity": 20 },
    "pixelate": { "enabled": false, "intensity": 15 },
    "halftone": { "enabled": false, "intensity": 20 },
    "filmDust": { "enabled": false, "intensity": 20 }
  },
  "animated": true,
  "animStyle": "pulse",
  "animSpeed": { "enabled": true, "intensity": 100 },
  "animIntensity": { "enabled": true, "intensity": 60 },
  "lights": { "enabled": false, "points": [] },
  "mask": { "enabled": false, "invert": false, "dataUrl": null }
}
```
