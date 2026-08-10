/**
 * Reduced-motion detection, deliberately kept free of any animation library.
 *
 * This used to live in `lib/utils/animations.ts`, which imports GSAP and calls
 * `gsap.registerPlugin` at module scope. Three components in the initial bundle
 * imported the helper from there, which pulled ~107 KB of GSAP into the first
 * load and defeated the lazy imports ADR 0012 added for exactly that reason.
 *
 * Anything importing this must stay dependency-free.
 */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
