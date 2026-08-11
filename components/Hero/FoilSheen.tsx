'use client';

import { motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { prefersReducedMotion } from '@/lib/utils/animations';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * The card's one motion treatment: a highlight travelling across the foil, the
 * way a real collectible catches light when it is tilted. Plays once on
 * entrance and again on hover.
 *
 * Framer Motion rather than GSAP because the constitution gives each animation
 * library one domain and no overlap — entrance and interaction motion is
 * Framer's (ADR 0005, ADR 0009).
 *
 * It returns null under reduced motion rather than leaving the element in place
 * with a shortened duration, and that distinction matters: globals.css carries a
 * global `prefers-reduced-motion` rule collapsing every animation to 0.01ms,
 * which applied to a travelling highlight does not remove it — it freezes it at
 * its end position, leaving a bright band stuck across the frame. That is the
 * mid-state FR-023a forbids, so the gate has to be this helper.
 *
 * The preference is read through useSyncExternalStore rather than an effect,
 * for two reasons. React re-runs the snapshot after hydration, so a component
 * that renders nothing on one side and something on the other does not trip a
 * mismatch — which a plain mounted-flag would. And the snapshot is the existing
 * `prefersReducedMotion()` helper, so this is not a second detection path, as
 * the constitution requires. Toggling the preference live also switches the
 * sheen off without a reload, because the store is subscribed.
 */
export function FoilSheen() {
  const reduced = useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    // The server has no matchMedia. Assuming motion is allowed matches the
    // common case; the client corrects it on hydration.
    () => false,
  );

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[2rem]"
      initial="rest"
      animate="sweep"
      whileHover="sweep"
    >
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-[linear-gradient(100deg,transparent,var(--card-foil-lite),transparent)] opacity-40 mix-blend-plus-lighter"
        variants={{
          rest: { x: '-150%' },
          sweep: { x: '350%' },
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
