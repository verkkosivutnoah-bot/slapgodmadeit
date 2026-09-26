/**
 * Site-wide switches.
 *
 * LOOPS_LIVE — loop & sample packs (Guitar Vault, Vault Sampler, /packs, /free, the loop
 * licence tab, the free-loops popup). Off while the real loop pack is being made: the site is
 * beats-only. Nothing is deleted — flip to `true` and every loop surface comes back.
 */
export const LOOPS_LIVE = false;

/** Headline copy that depends on what's for sale. */
export const SITE_TAGLINE = LOOPS_LIVE ? "Beats, Guitar Loops & Sample Packs" : "Beats";
