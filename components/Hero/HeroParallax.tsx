'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Travel ceiling, in pixels. The drift has to stay small enough that a card
 * moving as the opening scrolls away never reaches into the chapter below.
 */
const MAX_DRIFT = 80;

/** Scroll distance the drift is measured over — roughly one screen. */
const DRIFT_OVER = 500;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

interface HeroDriftProps {
  children: ReactNode;
  /** Pixels of travel across DRIFT_OVER, clamped to MAX_DRIFT. */
  strength: number;
  className?: string;
}

/**
 * Drifts a single element of the opening against the pinned backdrop.
 *
 * The backdrop used to carry the parallax; now it is fixed for the whole page
 * (components/Common/Backdrop.tsx), so the depth cue moves here. Two elements
 * drifting at different strengths read as depth in a way a moving background
 * cannot once there is no boundary for it to move against.
 *
 * Movement is transform-only, and collapses to zero under a reduced-motion
 * preference — the element keeps its normal flow position either way, so
 * switching the drift off shifts no layout.
 */
export function HeroDrift({ children, strength, className }: HeroDriftProps) {
  const { scrollY } = useScroll();
  // Read once during the first render, not in an effect: an effect runs after
  // the first paint, so a visitor who asked for reduced motion would get one
  // frame of drift before it was switched off.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION);
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const travel = prefersReducedMotion ? 0 : Math.min(Math.abs(strength), MAX_DRIFT);
  const y = useTransform(scrollY, [0, DRIFT_OVER], [0, travel]);

  return (
    <motion.div style={{ y, willChange: 'transform' }} className={className}>
      {children}
    </motion.div>
  );
}
