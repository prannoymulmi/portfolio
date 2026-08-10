import Image from 'next/image';

/**
 * The photograph the whole story sits on.
 *
 * Pinned rather than parallaxed: seven chapters only read as one continuous
 * surface if the surface never moves. The depth cue lives in the foreground
 * instead — see HeroDrift in components/Hero/HeroParallax.tsx.
 *
 * Served through next/image rather than a CSS background-image. The source is
 * 5600x3550 and 1.73 MB; a background-image bypasses the optimizer entirely and
 * ships all of it to every visitor at every viewport size.
 *
 * See docs/adr/0015-photograph-as-page-surface.md
 */
export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      // `fixed inset-0` rather than `background-attachment: fixed`, which is
      // unreliable and janky on iOS Safari.
      className="pointer-events-none fixed inset-0 -z-10 opacity-100 dark:opacity-20"
    >
      <Image
        src="/images/normal.jpg"
        alt=""
        fill
        sizes="100vw"
        // The backdrop is the largest contentful paint element. `priority` is
        // deprecated in Next 16; `preload` is its replacement.
        preload
        className="object-cover"
      />
    </div>
  );
}
