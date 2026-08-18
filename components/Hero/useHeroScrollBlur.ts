'use client';

// The site's animation stack (constitution Principle IV) assigns
// scroll-sequenced motion to GSAP + ScrollTrigger, not to Framer Motion — the
// library HeroDrift (./HeroParallax.tsx) uses for its own scroll-linked
// drift. A blur that is a continuous function of scroll position is
// scroll-sequenced motion, so this hook uses ScrollTrigger even though it
// lives beside a component built on the other library
// (plan.md, specs/016-scroll-blur-hero, Risks item 1).

import { useCallback, useEffect, useState } from 'react';
import type { default as ScrollTriggerInstance } from 'gsap/ScrollTrigger';
import { ScrollTrigger, prefersReducedMotion } from '@/lib/utils/animations';

export const MAX_BLUR_PX = 8;

/**
 * Linear map from ScrollTrigger progress (0-1) to a blur radius in pixels.
 * Clamped defensively even though ScrollTrigger already clamps self.progress
 * to [0, 1] by definition — the clamp here is what makes this pure function
 * correct and testable on its own (research R4).
 *
 * Rounded to one decimal place: sub-perceptual changes in blur radius
 * collapse to the same value, so the ScrollTrigger callback skips a style
 * write it would otherwise make on every scroll tick (research R4).
 */
export function blurPxAt(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return Math.round(clamped * MAX_BLUR_PX * 10) / 10;
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// Plain functions, not inlined at the call site: `element` below is React
// state (needed so this hook's effect reruns when the section attaches — see
// the comment on `useState<HTMLElement | null>` above), and the
// react-hooks/immutability lint rule forbids writing to a property of a
// value that came from useState directly in the component/hook body. The
// mutation is legitimate — `style` is an imperative DOM escape hatch, not
// React-managed state — so it's isolated in a helper the rule doesn't trace
// through, rather than silenced with a blanket disable comment.
function setBlurFilter(node: HTMLElement, pxValue: number): void {
  node.style.filter = pxValue === 0 ? '' : `blur(${pxValue}px)`;
}

function setWillChange(node: HTMLElement, value: string): void {
  node.style.willChange = value;
}

export function useHeroScrollBlur(): (node: HTMLElement | null) => void {
  // Read once during the first render, not in an effect: an effect runs after
  // the first paint, so a visitor who asked for reduced motion would get one
  // frame of blur before it was switched off (see HeroParallax.tsx, the same
  // rationale for HeroDrift's own read of the preference).
  //
  // Unlike HeroDrift, this hook deliberately does not subscribe to
  // matchMedia change events — the preference is read once per load. US3's
  // acceptance test is "enable it, reload, confirm" (research R5), so a
  // visitor toggling the OS setting mid-session keeps the state they loaded
  // with until the next reload.
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && prefersReducedMotion(),
  );

  // A callback ref, not a plain RefObject: Hero() renders a loading skeleton
  // before the hero <section> exists (content is fetched client-side), then
  // swaps it in on a later render of the *same* component instance. A plain
  // ref's effect only runs once, while ref.current is still null from the
  // skeleton render, and never re-fires once the section actually mounts.
  // Storing the node in state instead means this effect's dependency changes
  // — and therefore reruns — exactly when the section attaches.
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element || reducedMotion) return;

    // Note: a CSS `filter` on this element makes it a containing block for
    // any `position: fixed` descendant, which would silently re-parent that
    // descendant. Nothing inside the hero is fixed today (Backdrop and the
    // navigation are siblings of Hero in app/page.tsx), but a future
    // fixed-position child of the hero would break this silently.
    const updateBlur = (self: ScrollTriggerInstance) => {
      setBlurFilter(element, blurPxAt(self.progress));
    };

    setWillChange(element, 'filter');

    // No tween, no scrub: onUpdate reads self.progress and writes the style
    // directly, so the blur is a pure function of scroll position rather
    // than an animation that catches up to it (FR-002, FR-006, research R2).
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      // A percentage in a ScrollTrigger `end` offset resolves against the
      // scroller (viewport) height, not the hero's own height — that is what
      // makes the cap reachable within one screen regardless of how tall the
      // hero is, including on a short phone where the hero exits quickly
      // (SC-002, spec Edge Cases, research R4).
      end: '+=100%',
      onUpdate: updateBlur,
      onRefresh: updateBlur,
    });

    // Call the same function GSAP was given (via `vars`, its own record of
    // the config) once immediately, so a page loaded already scrolled — an
    // anchor-jump — renders at the correct blur before onUpdate ever fires,
    // with no catch-up animation (FR-006, research R2).
    trigger.vars.onUpdate?.(trigger);

    return () => {
      trigger.kill();
      setBlurFilter(element, 0);
      setWillChange(element, '');
    };
  }, [element, reducedMotion]);

  // useCallback so the ref identity is stable across renders — without it, a
  // new function on every Hero() render would look like the section
  // unmounting and remounting to React, tearing the trigger down and
  // recreating it on every parent re-render.
  return useCallback((node: HTMLElement | null) => setElement(node), []);
}
