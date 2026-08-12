# Implementation Plan: Parallax Gradient Scrolling

**Branch**: `feat/parallax-gradient-scroll` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-parallax-gradient-scroll/spec.md`

## Summary

Add four gradient image layers (`gradient-hero`, `gradient-text`, `mesh-soft`, `mesh-soft-flip`)
as **foreground** decorative elements within the Hero section, each drifting at its own speed on
scroll via the existing `HeroDrift` component. This extends the depth-cue pattern ADR 0015 already
established — the pinned page-wide photograph (`Backdrop.tsx`) does not move and does not gain new
layers; the new gradients join `HeroPortrait` and the role-bar list as things that drift *against*
that static backdrop, confined to the opening.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19

**Primary Dependencies**: `framer-motion` (existing — `useScroll`/`useTransform`, the same primitives
`HeroDrift` already uses), `next/image` for asset optimization. No new dependency.

**Storage**: N/A — static image assets in `public/images/`, already present.

**Testing**: Jest + React Testing Library, following `tests/unit/components/HeroParallax.test.tsx`
and `tests/integration/backdrop-coverage.test.tsx` conventions.

**Target Platform**: Web, modern browsers (latest 2 major versions), responsive desktop-first.

**Project Type**: Single Next.js web application (existing structure, no new project).

**Performance Goals**: ≥55 fps average during scroll; Lighthouse performance ≥90 (constitution floor).

**Constraints**: Must not move or add layers to the pinned page-wide `Backdrop.tsx` (ADR 0015
explicitly rejected backdrop parallax — "a drifting seam" across seven chapters). Must respect
`prefers-reduced-motion` via the existing read-before-first-paint pattern. Images served through
`next/image`, never CSS `background-image`. No CLS from layer mount.

**Scale/Scope**: Four gradient layers, confined to the Hero section only. No other chapter is touched.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Animation library (Principle IV)**: `HeroDrift` already uses Framer Motion's `useScroll` /
  `useTransform` for scroll-linked drift in the Hero section — a pattern the constitution's text
  nominally assigns to GSAP + ScrollTrigger ("scroll-sequenced ... motion"). That precedent predates
  this feature and was not introduced by it. This plan **extends the existing `HeroDrift` component**
  rather than opening a second scroll-animation path with GSAP for the same section, which would mean
  two libraries doing one job in one place — a KISS violation more concrete than the domain-label
  question. No new library is added. **Not a gate failure**; noted for the record.
- **Surface (ADR 0015, Principle IV)**: The pinned photograph in `Backdrop.tsx` MUST NOT move or
  gain new layers. This plan adds gradients to the Hero's foreground DOM only, alongside the existing
  `HeroPortrait`/role-bar drift — it does not touch `Backdrop.tsx`. **Pass.**
- **No CMS/inline styles**: Gradient selection is static, defined in component code; no inline
  `style` beyond the existing token-based exception `HeroDrift` already uses for its `y` transform.
  **Pass.**
- **ADR obligation (Principle VI)**: Does this decision add/remove a dependency, change structure/URLs,
  change content storage, or commit to a new metaphor? No — it extends an already-ratified pattern
  (`HeroDrift` foreground drift) with new visual assets. **No ADR required.**

**Gate result: PASS.** No violations to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-parallax-gradient-scroll/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

No `contracts/` directory: this feature has no external interface (API, CLI, schema). It is a
purely internal UI component change.

### Source Code (repository root)

```text
components/Hero/
├── Hero.tsx              # Modified: mounts new gradient layers inside existing drift wrappers
├── HeroParallax.tsx      # Modified: HeroDrift gains support for gradient-layer children,
│                          #   or a small sibling export (e.g. GradientLayer) reusing its scroll logic
└── HeroPortrait.tsx       # Unchanged

public/images/
├── gradient-hero.png      # Existing (already added)
├── gradient-text.png      # Existing
├── mesh-soft.png          # Existing
└── mesh-soft-flip.png     # Existing

tests/unit/components/
└── HeroParallax.test.tsx  # Extended: covers new gradient-layer drift + reduced-motion behavior

tests/integration/
└── backdrop-coverage.test.tsx  # Extended or sibling test: confirms Backdrop.tsx is untouched
                                  #   (no new fixed/pinned layer added at the page level)
```

**Structure Decision**: Single Next.js project (existing structure, no new app/package). Changes are
scoped to `components/Hero/` plus corresponding tests — no changes to `components/Common/Backdrop.tsx`,
routing, or data layer.

## Complexity Tracking

*No violations — table omitted.*
