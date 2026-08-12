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

export interface GradientLayerConfig {
  /** Filename under public/images/. */
  src: string;
  /** Pixels of drift travel, same unit and clamp as HeroDrift's strength. */
  strength: number;
  /**
   * Full literal Tailwind classes for opacity and any positional offset.
   * Written out rather than composed from a numeric prop: Tailwind scans
   * class strings as literal text, so an interpolated `opacity-${n}` never
   * reaches the stylesheet (constitution, Technology & Quality Constraints).
   */
  className: string;
}

/**
 * The four gradient layers behind the Hero's foreground content, furthest
 * back to nearest. Order is also DOM/stacking order — later entries paint
 * over earlier ones — so this array is the single place that decides depth.
 *
 * Strengths stay below the role bars' 24 and the portrait's 28 (see Hero.tsx)
 * so these always read as farther away than the foreground content they sit
 * behind, never competing with it for the "nearest" reading.
 */
/**
 * dark:opacity-0 on every layer: three of the four source images are pale
 * washes (mean relative luminance 0.84-0.93, measured on a 32x18 sample grid,
 * the same method ADR 0015 used for the photograph). Layered over the
 * near-black dark-appearance scrim at these opacities, they lighten it enough
 * to drop text-on-photo's gray-100 contrast below AA — the exact failure mode
 * ADR 0015 held the photograph itself to 20% to avoid. Dark appearance is
 * also still unfinished and gated behind ?experiment=true (ADR 0019), so
 * turning the wash off there rather than re-deriving four more opacity floors
 * is the proportionate fix.
 */
export const GRADIENT_LAYERS: GradientLayerConfig[] = [
  { src: '/images/gradient-hero.png', strength: 8, className: 'opacity-40 dark:opacity-0' },
  { src: '/images/mesh-soft.png', strength: 14, className: 'opacity-35 dark:opacity-0' },
  { src: '/images/mesh-soft-flip.png', strength: 18, className: 'opacity-30 dark:opacity-0' },
  { src: '/images/gradient-text.png', strength: 22, className: 'opacity-25 dark:opacity-0' },
];

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
