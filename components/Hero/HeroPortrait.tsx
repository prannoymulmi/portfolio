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
 * Two edges of the frame cut through the subject rather than through empty
 * space, so both are faded. Measured on the asset, as mean alpha along each
 * one-pixel edge: bottom 0.445 (the photograph crops mid-torso) and right
 * 0.183 (it clips his upper arm). The left edge is 0.000 and needs nothing.
 * The right one is easy to miss — it is a narrow sliver, invisible until the
 * portrait sits mid-page rather than against the viewport edge — so it is
 * recorded here rather than left to be rediscovered.
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
      width={1023}
      height={1537}
      // Stacked below lg the full 2:3 frame would run 563px tall on a phone —
      // most of the viewport, under text that already carries three role
      // lines, a tagline, a bio and two buttons. Capping the height and
      // anchoring to the top keeps head and shoulders instead of the torso.
      // The height cap alone is enough to size this: next/image emits the
      // intrinsic aspect-ratio, so capping height scales width with it —
      // measured at 200px wide against the 300px cap, on a 375px viewport.
      // No width bound is needed, and adding one would imply the height cap
      // could not be trusted.
      //
      // From lg the cap is a fraction of the viewport rather than a fixed
      // pixel height, so the portrait keeps its share of the opening on a
      // laptop and a large display alike instead of shrinking into the corner
      // of the second.
      className="mask-b-from-60% mask-b-to-100% mask-r-from-88% mask-r-to-100% mx-auto max-h-[360px] w-auto object-contain object-top lg:mx-0 lg:ml-auto lg:max-h-[86vh]"
      // Without this the optimizer assumes 100vw and ships a far larger file
      // than a half-width column needs.
      sizes="(min-width: 1024px) 55vw, 70vw"
      // Preloaded because this element *is* the largest contentful paint —
      // measured, against an earlier assumption that the backdrop would keep
      // that role. It does not: at 1440x900 this covers 272,580px² against the
      // backdrop's contribution, and Chrome reports it as the LCP element.
      //
      // Preloading it alongside the backdrop was the specific risk raised when
      // this was left off, so it was measured rather than argued: four runs
      // each, cache disabled. With preload 196/208/208/196ms; without
      // 216/216/212/216ms. The ranges do not overlap. Baseline on main, where
      // the card's portrait was LCP, was 348ms.
      preload
    />
  );
}
