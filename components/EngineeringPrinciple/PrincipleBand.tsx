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
          (0.28-0.90 in that region). At opacity-35 the worst case there —
          composited over the pinned photo's own darkest sampled region —
          still clears 5.23:1 against text-on-photo's foreground text, so the
          floor from specs/004-photo-background-hero-merge/research.md holds. */}
      <motion.div
        style={{ y: washY, willChange: 'transform' }}
        className="absolute inset-x-0 -inset-y-32 -z-10"
      >
        <ChapterGradientOverlay
          src="/images/parallax-mid.jpg"
          opacityClassName="opacity-35 dark:opacity-0"
        />
      </motion.div>

      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          style={{ y: statementY, willChange: 'transform' }}
          className="label-mono text-xs text-primary"
        >
          Engineering principle
        </motion.p>

        <motion.blockquote
          style={{ y: statementY, willChange: 'transform' }}
          className="mt-6 text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
        >
          &ldquo;{statement}&rdquo;
        </motion.blockquote>

        <motion.p
          style={{ y: supportingY, willChange: 'transform' }}
          className="text-on-photo mx-auto mt-8 max-w-xl"
        >
          {supporting}
        </motion.p>
      </div>
    </section>
  );
}
