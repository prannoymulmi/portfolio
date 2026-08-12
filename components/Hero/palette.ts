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
 * display size.
 */
/**
 * Dusk navy, and deliberately not darker. Taken lower — toward the near-black
 * the deleted card used — the first bar stops reading as one of three notes
 * sampled from the sunset and starts reading as a black box over it.
 */
export const INK = '#1d3a6b';
export const EMBER = '#93280f';
export const TEAL = '#0d5457';

/** Text on any of the three bars. */
export const CREAM = '#fff5ec';

/**
 * The card's own tokens — CARD_INK, SUNGLOW and SUNGLOW_TEXT — were removed
 * with the card itself (ADR 0018). The photo's orange, `#ffa62b`, went with
 * the dark theme (ADR 0019): it existed to keep the primary action the
 * brightest thing on a near-black page, and there is no near-black page now.
 */

/**
 * The rule beside the tagline. Sampled from the reference design rather than
 * picked: #f2540d, a brighter orange than EMBER, which is what lets a 4px line
 * read as an accent against the sunset instead of disappearing into it.
 *
 * Mirrored as a literal in a Tailwind class for the same reason as WARM_INK
 * below — class strings are scanned as text, so an interpolated one never
 * reaches the stylesheet.
 */
export const ACCENT = '#f2540d';

/**
 * Body copy over the photo — warm near-black, not a neutral grey.
 * Mirrored as a literal in Tailwind classes, which are scanned as text and so
 * can't be built from this constant.
 */
export const WARM_INK = '#3d2318';
