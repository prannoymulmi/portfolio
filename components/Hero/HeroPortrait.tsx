import Image from 'next/image';

interface HeroPortraitProps {
  /** Subject's name, used to build the alt text. */
  name: string;
  /**
   * Address of the cut-out portrait, from `home.imageSource`. Undefined renders
   * nothing at all — the opening falls back to text rather than to a
   * placeholder graphic.
   */
  imageSource?: string;
}

/**
 * The portrait that replaced the player card (ADR 0018).
 *
 * The image is a background-removed derivative of the studio original: its
 * alpha channel follows the subject's silhouette, so the page shows through
 * around him in either theme with no per-theme treatment. That is the whole
 * reason no gradient, blend mode or scrim appears below — none of them can
 * remove a grey backdrop that sits *behind* the subject in the middle of the
 * frame, where any positional mask that reaches it also erases the face.
 * See specs/006-hero-portrait-floating-nav/research.md R2.
 *
 * The edge pixels were colour-corrected when the asset was made. Raw
 * segmentation leaves partially-transparent pixels holding a subject/backdrop
 * blend, which reads as a light halo on a dark surface — invisible in light
 * mode, obvious in dark. If a halo ever appears here, suspect the wrong file
 * before suspecting this CSS.
 *
 * The asset is trimmed to the subject's own bounding box. The studio frame
 * carried 340px of empty space above his head — 22% of its height — so the
 * element was a fifth taller than the person in it, which both pushed him down
 * the page and made him smaller than the layout suggested.
 *
 * Two of the four edges cut through him rather than through empty space, so
 * both are faded. Mean alpha along each one-pixel edge after the trim: bottom
 * 0.490 (the photograph crops mid-torso) and right 0.235 (it clips his upper
 * arm). Top and left measure 0.0006 and 0.0002 — the silhouette itself, which
 * needs nothing.
 *
 * The two masks compose because Tailwind emits `mask-composite: intersect`;
 * without that the second would cancel the first.
 */
export function HeroPortrait({ name, imageSource }: HeroPortraitProps) {
  if (!imageSource) return null;

  return (
    <Image
      src={imageSource}
      // A person is content, not decoration, so this is never empty.
      alt={`${name}, portrait`}
      width={929}
      height={1197}
      // Stacked below lg the full 2:3 frame would run 563px tall on a phone —
      // most of the viewport, under text that already carries three role
      // lines, a tagline, a bio and two buttons. Capping the height and
      // anchoring to the top keeps head and shoulders instead of the torso.
      // The height cap alone is enough to size this: next/image emits the
      // intrinsic aspect-ratio, so capping height scales width with it. No
      // width bound is needed, and adding one would imply the height cap could
      // not be trusted.
      //
      // The bottom fade starts at 55% rather than 60% because the trim removed
      // the empty band above his head: the same percentage now falls further
      // down his body, so it is moved back up to keep the dissolve where it
      // was.
      //
      // From lg the cap is a fraction of the viewport rather than a fixed
      // pixel height, so the portrait keeps its share of the opening on a
      // laptop and a large display alike instead of shrinking into the corner
      // of the second.
      className="mask-b-from-55% mask-b-to-100% mask-r-from-88% mask-r-to-100% mx-auto max-h-[380px] w-auto object-contain object-top lg:mx-0 lg:ml-auto lg:max-h-[92vh]"
      // Without this the optimizer assumes 100vw and ships a far larger file
      // than a half-width column needs.
      sizes="(min-width: 1024px) 55vw, 70vw"
      // Preloaded because this element *is* the largest contentful paint —
      // measured, against an earlier assumption that the backdrop would keep
      // that role. It does not: at 1440x900 this covers 643x828px and Chrome
      // reports it as the LCP element.
      //
      // Preloading it alongside the backdrop was the specific risk raised when
      // this was left off, so it was measured rather than argued: four runs
      // each, cache disabled. With preload 196/208/208/196ms; without
      // 216/216/212/216ms. The ranges do not overlap. Baseline on main, where
      // the card's portrait was LCP, was 348ms. Re-measured at 200-220ms after
      // the portrait was enlarged — the trim took 23% off the file, so the
      // larger display costs nothing.
      preload
    />
  );
}
