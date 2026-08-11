/**
 * Hero palette, sampled from the backdrop photo (public/images/normal.jpg):
 * a sunset wash that runs from burnt orange in the lower left to pink and
 * near-white across the top.
 *
 * The bars are the three darkest notes that photo suggests — dusk navy, the
 * ember its orange cools into, and the teal that sits opposite it. Read as a
 * group they behave like type printed on a sunset poster rather than
 * highlighter over paper, which is what a light-on-light mark would become
 * against a backdrop this warm.
 *
 * Every bar carries CREAM text and clears 7:1, so the headline stays AAA at
 * display size in both themes.
 */
/**
 * Dusk navy. Lighter than the card it echoes on purpose: at CARD_INK the first
 * bar disappears into the dark theme's background and that phrase alone loses
 * its bar, which breaks the rhythm of the three.
 */
export const INK = '#1d3a6b';
export const EMBER = '#93280f';
export const TEAL = '#0d5457';

/** Text on any of the three bars. */
export const CREAM = '#fff5ec';

/*
 * The card's three colours — SUNGLOW, SUNGLOW_TEXT and CARD_INK — used to live
 * here. They moved to app/globals.css as custom properties when the card gained
 * a second edition: a value consumed as inline `style` cannot carry a theme,
 * which is exactly why the old card was the same navy in both. See ADR 0018.
 *
 * What remains is the annotation bars, which are one colour each in both themes
 * and are still applied as inline style for the reason ADR 0013 gives — Tailwind
 * scans class strings as literal text, so an interpolated class never reaches
 * the stylesheet.
 */

/**
 * Body copy over the photo — warm near-black, not a neutral grey.
 * Mirrored as a literal in Tailwind classes, which are scanned as text and so
 * can't be built from this constant.
 */
export const WARM_INK = '#3d2318';
