import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './motion';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export interface ScrollTriggerConfig {
  trigger: string | HTMLElement;
  start?: string;
  end?: string;
  markers?: boolean;
  scrub?: boolean | number;
}

/**
 * Setup ScrollTrigger for scroll-driven animations
 * Used for career timeline player animation
 */
export function setupScrollTrigger(
  element: string | HTMLElement,
  config: ScrollTriggerConfig,
  animation: gsap.core.Timeline,
): ScrollTrigger {
  const trigger = ScrollTrigger.create({
    trigger: config.trigger,
    start: config.start || 'top center',
    end: config.end || 'bottom center',
    markers: config.markers || false,
    scrub: config.scrub !== undefined ? config.scrub : 1,
    animation,
  });

  return trigger;
}

/**
 * Create player animation along SVG path
 * Moves SVG element along pitch path based on scroll position
 */
export function createPlayerPathAnimation(
  playerElement: string | HTMLElement,
  pathData: { x: number; y: number }[],
): gsap.core.Timeline {
  const tl = gsap.timeline();

  // Animate player along path
  if (pathData.length > 0) {
    const x = pathData.map((p) => p.x);
    const y = pathData.map((p) => p.y);

    tl.to(playerElement, {
      attr: {
        cx: x,
        cy: y,
      },
      duration: 1,
      ease: 'none',
    });
  }

  return tl;
}

/**
 * Setup scroll-sync timing for smooth scroll-driven motion
 * Ensures animations stay in sync with scroll position
 */
export function setupScrollSyncAnimation(
  element: string | HTMLElement,
  fromValue: { [key: string]: string | number },
  toValue: { [key: string]: string | number },
): gsap.core.Timeline {
  const tl = gsap.timeline({
    paused: true,
  });

  tl.to(element, {
    ...toValue,
    duration: 1,
    ease: 'none',
  });

  return tl;
}

/**
 * Create parallax effect for hero section
 * Moves background at different speed than scroll
 */
export function createParallaxAnimation(element: string | HTMLElement, speed: number = 0.5): void {
  gsap.registerEffect({
    name: 'parallax',
    effect: (target: gsap.TweenTarget, config: { speed: number }) => {
      const tl = gsap.timeline();
      tl.to(target, {
        y: () => window.innerHeight * config.speed,
        ease: 'none',
      });
      return tl;
    },
    defaults: { speed },
  });

  gsap.effects.parallax(element, { speed });
}

/**
 * Create fade-in animation (used for content reveal)
 */
export function createFadeInAnimation(
  element: string | HTMLElement,
  duration: number = 0.6,
): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.from(element, {
    opacity: 0,
    y: 20,
    duration,
    ease: 'power2.out',
  });
  return tl;
}

/**
 * Refresh ScrollTrigger instances (needed after DOM changes)
 */
export function refreshScrollTriggers(): void {
  ScrollTrigger.getAll().forEach((trigger) => trigger.refresh());
}

/**
 * Kill all active animations
 */
export function killAllAnimations(): void {
  gsap.killTweensOf('*');
}

/**
 * Check if user prefers reduced motion (accessibility)
 */
// Re-exported so existing importers keep working; the implementation lives in
// lib/utils/motion.ts, which pulls in no animation library.
export { prefersReducedMotion };

/**
 * Disable animations if user prefers reduced motion
 * Returns animation if motion is OK, dummy timeline if not
 */
export function createAccessibleAnimation(
  element: string | HTMLElement,
  animation: (target: string | HTMLElement) => gsap.core.Timeline,
): gsap.core.Timeline {
  if (prefersReducedMotion()) {
    // Return empty timeline (no-op)
    return gsap.timeline();
  }
  return animation(element);
}
