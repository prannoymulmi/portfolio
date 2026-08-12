import Image from 'next/image';

interface ChapterGradientOverlayProps {
  /** One of the mesh gradient assets under public/images/. */
  src: string;
  /**
   * Literal Tailwind opacity classes, e.g. `opacity-20 dark:opacity-0`.
   * Written out by the caller rather than composed from a number: Tailwind
   * scans class strings as literal text, so an interpolated `opacity-${n}`
   * never reaches the stylesheet (constitution, Technology & Quality
   * Constraints).
   *
   * Every caller MUST include a `dark:` cutoff. Three of the four gradient
   * sources are pale washes — 0.84-0.93 mean relative luminance on a 32x18
   * sample grid, the method ADR 0015 used for the photograph — and over the
   * near-black dark-appearance scrim they lift it enough to drop body text
   * below AA.
   */
  opacityClassName: string;
}

/**
 * A decorative gradient wash for one chapter.
 *
 * Layers *inside* a chapter's existing `chapter-scrim`, above the pinned
 * photograph and below the chapter's content. It is a positioned image, not a
 * background: ADR 0015 made one photograph the surface of the whole story and
 * gave chapters a translucent scrim instead of backgrounds of their own, and a
 * `bg-*` utility here would paint over the photograph and reintroduce exactly
 * the seven-flat-panels problem that ADR replaced.
 *
 * Static, unlike the opening's HeroGradientLayers: those drift at four
 * different strengths because the opening needs a foreground depth cue against
 * a pinned backdrop. A chapter further down the page needs the texture, not the
 * parallax, and a second moving surface mid-story reads as a drifting seam.
 *
 * Served through next/image rather than a CSS background-image, which bypasses
 * the optimizer entirely.
 */
export function ChapterGradientOverlay({ src, opacityClassName }: ChapterGradientOverlayProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image src={src} alt="" fill sizes="100vw" className={`object-cover ${opacityClassName}`} />
    </div>
  );
}
