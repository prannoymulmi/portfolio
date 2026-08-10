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

/** The photo's own orange, kept bright — the card's accent on deep navy. */
export const SUNGLOW = '#ffa62b';

/** Ink used on SUNGLOW fills. */
export const SUNGLOW_TEXT = '#1a1005';

/** The card body: a shade off INK so the card reads as an object on the page. */
export const CARD_INK = '#0e1b33';

/**
 * Body copy over the photo — warm near-black, not a neutral grey.
 * Mirrored as a literal in Tailwind classes, which are scanned as text and so
 * can't be built from this constant.
 */
export const WARM_INK = '#3d2318';
