# Implementation Plan: Scroll-Progressive Hero Blur

**Branch**: `feat/scroll-blur-hero` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-scroll-blur-hero/spec.md`

## Summary

As the visitor scrolls down from the top of the page, the opening section's own foreground
content (portrait, role bars, intro/bio copy, hero-local gradient washes) grows progressively
blurred, capping at a fixed maximum within roughly one viewport height of scrolling and
reversing exactly on scroll-up. The pinned photographic backdrop and every chapter below the
hero stay sharp.

Technical approach: a single GSAP `ScrollTrigger` instance pinned to the hero `<section>`,
started at `top top` and ended at `+=100%` (one viewport height), whose `onUpdate` maps
`self.progress` (0 → 1) to a CSS `filter: blur(Npx)` written directly onto the section
element. No tween and no `scrub` easing, so the blur is a pure function of scroll position
with zero catch-up lag (FR-002, FR-006). Under `prefers-reduced-motion` the trigger is never
created and no filter is ever applied (FR-005). The trigger is killed in the effect cleanup
(constitution, Technology & Quality Constraints).

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), React 19.2.8, Next.js 16.3.0 (App Router)

**Primary Dependencies**: `gsap` ^3.12 with the `ScrollTrigger` plugin (already installed and
registered in `lib/utils/animations.ts`); Tailwind CSS v4 for all static styling. No new
dependency is added by this feature.

**Storage**: N/A — no content, no persisted state. The hero's content still comes from
`public/data/` via `ContentProvider`; this feature does not read or write any of it.

**Testing**: Jest 29 + `jest-environment-jsdom` + React Testing Library, run with `pnpm test`.
`gsap` and `gsap/ScrollTrigger` are module-mocked in the new unit test (jsdom has no layout,
so a real ScrollTrigger cannot compute progress). Existing precedent for asserting
reduced-motion behaviour without a real scroll: `tests/unit/components/HeroParallax.test.tsx`.

**Target Platform**: Modern evergreen browsers, desktop and mobile (iOS Safari included), as a
statically-exported-per-route Next.js app served from Vercel.

**Project Type**: Single-page web frontend (one scrolling story at `/`; sections are anchors,
not routes).

**Performance Goals**: No dropped frames during normal scroll (FR-007, SC-001) — one
`ScrollTrigger.onUpdate` callback doing one style write per scroll tick, blur value rounded to
0.1px to avoid redundant repaints. Lighthouse performance ≥ 90 on production builds (SC-005);
protected by writing no `filter` at all while progress is 0, so the first paint and the LCP
element (the portrait/backdrop) are never rasterised through a filter.

**Constraints**:
- Blur applies only to the hero's own foreground; the pinned `Backdrop` (a `fixed inset-0 -z-10`
  sibling outside `Hero`) and all chapters below stay sharp (FR-004, SC-003).
- Blur must be a direct function of scroll position, never an animated catch-up (FR-006 and the
  fast-scroll / anchor-jump edge cases).
- Must coexist with the existing Framer Motion `HeroDrift` parallax (spec 007) rather than
  replace it.
- Must reach its cap within one viewport height regardless of viewport size (SC-002, short-phone
  edge case) — hence a viewport-relative `end`, not a hero-height-relative one.
- Degrade to unblurred, never broken, where `filter: blur()` is unsupported (edge case).

**Scale/Scope**: One section of one page. Expected diff: one new hook file, one new test file,
a ~3-line change to `components/Hero/Hero.tsx`, and a one-line re-export in
`lib/utils/animations.ts`. No migration, no data changes, no public API.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.5.0.

| Principle / constraint | Verdict | Notes |
|---|---|---|
| I. KISS & Maintainability | PASS | One hook, one clamped linear mapping from scroll progress to a blur radius. No abstraction over ScrollTrigger, no per-element blur orchestration. |
| II. Test-First (NON-NEGOTIABLE) | PASS | The pure mapping (`blurPxAt(progress)`) and the hook's reduced-motion / cleanup behaviour are unit-testable and are written before the wiring. See Phase 1 and `quickstart.md`. |
| III. Atomic Commits | PASS | Four files, one unit of work. |
| IV. Technology Stack — Animation | PASS | The constitution assigns "scroll-sequenced and timeline motion" to GSAP + ScrollTrigger, which is what this feature uses; no fourth library and no new dependency. Spec 007 had built the hero's existing scroll motion (`HeroDrift`) on Framer Motion and rejected GSAP *for this section*; the user confirmed on 2026-08-18 that this feature takes the constitution's literal split instead, leaving the hero running both. See Risks item 1. |
| IV. Technology Stack — Styling | PASS, with a noted gray area | The blur radius is written imperatively to `element.style.filter` from the ScrollTrigger callback. A continuously varying per-frame value cannot be expressed as a Tailwind class (Tailwind scans class strings as literal text), which is the same constraint the constitution's inline-style exception exists for. Every *static* style in this feature stays a Tailwind utility. |
| IV. Technology Stack — Surface | PASS | The pinned photograph is untouched. The blur target is the hero `<section>` only; `Backdrop` is a sibling of `Hero` in `app/page.tsx`, outside the filtered subtree, so the filter cannot reach it. `tests/integration/backdrop-coverage.test.tsx` already guards this and must keep passing. |
| V. Token Efficiency | PASS | N/A to runtime code. |
| VI. Recorded Decisions (ADRs) | PASS — no ADR required | No dependency is added or removed, no URL/structure/content-loading change, no new design metaphor, so Principle VI's significance test is not met. An ADR recording the reversal of spec 007's "Framer, not GSAP, in the hero" reasoning was offered and declined by the user on 2026-08-18; the record lives in Risks item 1 and `research.md` (R1) instead. |
| GSAP ScrollTrigger killed in cleanup | PASS | The `useEffect` returns `() => trigger.kill()` and clears the inline `filter`/`will-change`. |
| Reduced motion via existing helpers | PASS | Uses `prefersReducedMotion()` from `lib/utils/animations.ts`, read through a lazy `useState` initializer — the exact convention in `CareerPitch.tsx` and `HeroDrift`. No new detection path. |
| TypeScript strict, no `any` | PASS | Hook signature is `(ref: RefObject<HTMLElement | null>) => void`. |
| Lighthouse ≥ 90 | PASS | No filter is applied at rest (progress 0), so first paint is unfiltered. See Performance Goals. |
| Accessible SVG labels | N/A | No SVG in this feature. |

**Gate result: PASS.** No unjustified violation; the Complexity Tracking table below stays
empty. The one judgement call (Principle IV animation-library precedent) was confirmed by the
user on 2026-08-18 in favour of GSAP + ScrollTrigger, with no ADR requested.

### Post-Design Re-evaluation (after Phase 1)

Re-checked after `research.md`, `data-model.md` and `quickstart.md` were written. Nothing in the
design changed the verdicts above:

- The design added no files beyond those anticipated, no new dependency, and no new abstraction —
  Principles I and III still hold.
- Research resolved the `scrub` question in favour of *no tween at all* (`onUpdate` + explicit
  first call), which removes GSAP easing from the path entirely and makes FR-002/FR-006
  ("direct function of scroll position") provable rather than assumed.
- Research confirmed the blur target must be the hero `<section>` itself rather than a new
  wrapper element, which keeps the layout diff at zero and avoids the flex/absolute-positioning
  regression risk a wrapper introduces — a KISS improvement over the first sketch.
- `data-model.md` confirmed the feature has no entities, and `contracts/` is intentionally absent.
- The Principle IV precedent question is closed: GSAP + ScrollTrigger, confirmed by the user,
  no ADR. Nothing else in the design depends on that choice beyond the hook's internals.

**Post-design gate result: PASS.**

## Project Structure

### Documentation (this feature)

```text
specs/016-scroll-blur-hero/
├── spec.md              # Feature specification (already present)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (records that there are no entities)
├── quickstart.md        # Phase 1 output — manual/QA validation guide
├── checklists/          # Existing
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

No `contracts/` directory is generated. This feature exposes no external interface: it is a
visual effect internal to one React component, with no API, no CLI, no schema, and no props
crossing a package boundary. The only surface another engineer touches is the hook signature,
which is stated in `research.md`.

### Source Code (repository root)

```text
components/
└── Hero/
    ├── Hero.tsx                 # CHANGED — adds a ref on the <section> and calls the hook
    ├── HeroParallax.tsx         # UNCHANGED — Framer Motion drift stays exactly as-is
    ├── HeroGradientLayers.tsx   # UNCHANGED — blurred as a descendant, no code change
    ├── HeroPortrait.tsx         # UNCHANGED
    └── useHeroScrollBlur.ts     # NEW — the ScrollTrigger + blur mapping

lib/
└── utils/
    └── animations.ts            # CHANGED — one-line re-export of the registered ScrollTrigger

tests/
└── unit/
    └── components/
        └── useHeroScrollBlur.test.tsx   # NEW
```

**Structure Decision**: The hook is colocated in `components/Hero/` rather than added to
`lib/hooks/`. It is hero-specific and reads the hero's own layout assumptions; `lib/hooks/`
currently holds only `useContentLoader.ts`, which is genuinely cross-cutting. Colocation also
matches the existing precedent in this folder, where `palette.ts` and `HeroParallax.tsx` keep
hero-only concerns beside the component that uses them.

## Risks & open questions

1. **Two scroll-animation libraries in one section — resolved.** Spec 007's `research.md` and
   `plan.md` explicitly chose Framer Motion over GSAP *for the hero* and deferred a full
   migration as "a separate decision". User confirmed (2026-08-18) that this feature proceeds
   with GSAP ScrollTrigger per the constitution's literal domain split, leaving the hero running
   Framer Motion for drift and GSAP for blur. The Framer alternative worked out in `research.md`
   (R1) is not being used. No ADR required (Principle VI's significance test is not met — no
   dependency added/removed, no structure/content/metaphor change) and none requested by the
   user; this note is the record of the decision.
2. **Blur bleed past the section edge.** A CSS `filter: blur(r)` renders roughly `3r` beyond the
   element's box. At the recommended 8px cap that is ~24px of soft edge over the top of the next
   chapter. Chapters below sit later in DOM order and paint over the hero, so no chapter content
   is blurred (SC-003 holds), but the seam should be eyeballed at the cap during QA.
3. **Filter creates a containing block and a stacking context.** Verified: the hero `<section>`
   contains no `position: fixed` descendants (`Backdrop` and the navigation are siblings in
   `app/page.tsx` / the layout), so nothing is re-parented. A future fixed-position child of the
   hero would break silently — worth a comment in the hook.
4. **Repaint cost of a large blurred subtree.** The hero is a full-viewport section containing
   four `next/image` gradient layers plus the portrait. Blur is a per-frame repaint, not a
   compositor-only property. Mitigations in the design: rounding to 0.1px, `will-change: filter`
   only while the effect is live, and no filter at all at progress 0. If mobile Safari still
   stutters, the fallback is quantising to 0.5px steps — visually still continuous at these radii.
5. **Test coverage gap.** jsdom cannot exercise real scroll progress, so the ScrollTrigger
   configuration itself (`start`/`end` strings) is asserted structurally, not behaviourally. The
   acceptance scenarios in the spec are covered by the manual QA script in `quickstart.md`
   instead. This is the same coverage shape the existing hero motion tests have.
6. **Interaction with `HeroDrift`.** The drift moves children with `transform`; the blur filters
   an ancestor. These compose without conflict, but both are scroll-linked, so a change to
   `DRIFT_OVER` (500px) and the blur's one-viewport ramp will visibly desynchronise. Not a defect;
   worth knowing.

## Complexity Tracking

> No Constitution Check violations to justify — this table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_ | | |
