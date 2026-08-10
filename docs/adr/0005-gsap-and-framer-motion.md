# ADR 0005: GSAP for scroll-driven, Framer for component motion

- **Status**: Accepted, amended by [ADR 0009](0009-rough-notation-third-animation-library.md)
- **Date**: 2026-08-09

> **Amendment note**: the two-library ceiling recorded here was raised to
> three by [ADR 0009](0009-rough-notation-third-animation-library.md),
> which adds RoughJS for hand-drawn annotation marks. The scroll/interaction
> split below still stands.

## Context

Portfolio has two distinct animation needs:

1. **Scroll-driven**: the career player moves along the pitch synced with
   scroll position, needs pixel-perfect scrubbing.
2. **Component/interaction motion**: hero parallax, card expand/collapse,
   AnimatePresence for the skills detail drawer.

Options:

- Framer Motion only (can do scroll-driven via `useScroll`).
- GSAP only (has React bindings, can do everything).
- Both, using each where it fits best.

## Decision

Use **GSAP + ScrollTrigger** for scroll-driven work (`PlayerAnimation`,
future career milestones) and **Framer Motion** for component-scoped
motion (`HeroParallax`, card expansions, drawer transitions).

## Consequences

**Positive**

- GSAP's ScrollTrigger has years of edge-case fixes for scroll pinning,
  progress calculations, and mobile Safari quirks that would take weeks
  to reproduce in a Framer-only setup.
- Framer's declarative `motion.div` and AnimatePresence are dramatically
  cleaner for entrance/exit animations than the equivalent GSAP timeline
  code.
- Each library used to its strengths; no forced fits.

**Negative**

- Two animation libraries in the bundle. Together ~40KB gzipped.
  Acceptable for a portfolio where perceived polish matters; would be a
  red flag on a bandwidth-sensitive product.
- Two mental models. Contributors have to know which one applies where.
  The rule of thumb: "scroll" → GSAP, "interaction" → Framer.
- Both honor `prefers-reduced-motion` but through different mechanisms
  (CSS media query + JS check in `lib/utils/animations.ts` for GSAP,
  Framer's `useReducedMotion` for Framer). Duplicated logic to keep
  in sync.

## Alternatives rejected

- **Framer-only**: `useScroll` works but scrubbing feels less smooth
  than ScrollTrigger, especially on mobile where inertial scrolling
  fights the animation timeline.
- **GSAP-only**: would require hand-rolling AnimatePresence-equivalent
  exit animations, which is exactly the kind of imperative-code creep
  Framer solves.
