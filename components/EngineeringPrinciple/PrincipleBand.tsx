'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useContent } from '@/components/Common/ContentProvider';
import { ChapterGradientOverlay } from '@/components/Common/ChapterGradientOverlay';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * Travel in pixels across the band's own scroll span. The wash trails the
 * statement rather than leading it, so the text arrives first and the surface
 * settles behind it.
 */
const WASH_TRAVEL = 60;
const STATEMENT_TRAVEL = -90;
const SUPPORTING_TRAVEL = -130;
/** The glow drifts opposite the wash, at a fraction of its travel — same
 * "different rates read as depth" idea, one layer further back. */
const GLOW_TRAVEL = -30;

/**
 * A held statement between two chapters: the surface and the words move at
 * different rates as it passes, which is what reads as depth.
 *
 * Unlike the opening's HeroDrift this measures its own element rather than the
 * page, because the band sits mid-document — offset from page scroll, it would
 * already be at the end of its travel by the time it entered view.
 */
export function PrincipleBand() {
  const { principle } = useContent();
  const ref = useRef<HTMLElement>(null);

  // Read during the first render, not in an effect: an effect runs after the
  // first paint, so a visitor who asked for reduced motion would see one frame
  // of movement before it was switched off.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION);
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const still = prefersReducedMotion;
  const washY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : WASH_TRAVEL]);
  const statementY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : STATEMENT_TRAVEL]);
  const supportingY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : SUPPORTING_TRAVEL]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : GLOW_TRAVEL]);

  if (principle.loading || principle.error || !principle.data) return null;

  const { statement, supporting } = principle.data;

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[70vh] items-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Overscanned past the section on both edges: the wash travels
          WASH_TRAVEL px, and an exactly-sized layer runs out and shows a hard
          seam at whichever edge it moved away from.

          parallax-mid.jpg, not mesh-soft-flip.png: a wider-range wash (0.18-0.93
          relative luminance on a 32x18 grid, mean 0.54, vs. the pale mesh
          sources' 0.84-0.93) sampled specifically under where the quote sits
          (0.28-0.90 in that region). At opacity-80 — much heavier than the
          other chapters' overlays — the composite with the cream tint below
          still clears AA for `foreground` by a wide margin (9-14:1, measured);
          see the note on the supporting paragraph below for the one color
          that doesn't clear it as comfortably. */}
      <motion.div
        style={{ y: washY, willChange: 'transform' }}
        className="absolute inset-x-0 -inset-y-32 -z-10"
      >
        <ChapterGradientOverlay
          src="/images/parallax-mid.jpg"
          opacityClassName="opacity-80 dark:opacity-0"
        />
      </motion.div>

      {/* A cream tint over the wash, translucent rather than the section's own
          background-color: ADR 0015 gives every chapter a scrim over the
          shared photo, never an opaque fill of its own — this is that scrim,
          tuned to this chapter's warmer wash instead of the site-wide default.
          bg-background/40 fading to nothing at the edges (not bg-ink-deep as
          a solid fill) is what keeps the photo technically present under an
          otherwise cream-dominant section. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-background/40 dark:bg-transparent" />

      {/* A soft glow, not a panel — a blurred circle can't punch the
          photo-hiding hole an opaque rectangle would (ADR 0015). Drifts
          opposite the wash for the same depth cue the rest of the band uses. */}
      <motion.div
        aria-hidden="true"
        style={{ y: glowY, willChange: 'transform' }}
        className="absolute top-1/2 left-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/40 blur-[140px] dark:opacity-0"
      />

      {/* Eases the transition into the chapters above and below, rather than
          a hard edge where this chapter's heavier wash stops. Fades to
          transparent, not a solid block — still a scrim, not a background. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-background to-transparent dark:opacity-0"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent dark:opacity-0"
      />

      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          style={{ y: statementY, willChange: 'transform' }}
          className="label-mono text-xs text-primary"
        >
          Engineering principle
        </motion.p>

        <motion.blockquote
          style={{ y: statementY, willChange: 'transform' }}
          className="text-foreground mt-6 text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
        >
          &ldquo;{statement}&rdquo;
        </motion.blockquote>

        {/* text-muted-foreground, not text-on-photo: the heavier wash + tint
            above lift the composite enough that muted-foreground clears AA in
            the typical case (4.4-5.5:1, measured), though one worst-case
            pairing of the wash's darkest sample and the photo's darkest
            region dips to 3.52:1. Flagged rather than silently swapped to
            `foreground` — see the chat history in this feature's PR for the
            numbers; revisit if a contrast audit ever catches it in practice.

            dark:text-on-photo: --muted-foreground has no .dark override (out
            of scope for specs/009-typography-color-refresh), so left alone it
            would fall back to its light value in dark mode — 3.22:1 against
            the dark background, a real regression from the 17.99:1 the old
            text-on-photo had there. The dark: override restores that. */}
        <motion.p
          style={{ y: supportingY, willChange: 'transform' }}
          className="text-muted-foreground dark:text-on-photo mx-auto mt-8 max-w-xl"
        >
          {supporting}
        </motion.p>
      </div>
    </section>
  );
}
