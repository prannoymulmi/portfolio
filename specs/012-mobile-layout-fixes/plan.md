# Implementation Plan: Mobile Layout Fixes

**Branch**: `012-mobile-layout-fixes` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-mobile-layout-fixes/spec.md`

## Summary

Three fixes, one of which is the cause of another. A decorative glow in the
contact chapter is 640px wide and centred with a negative translate; on a
375px phone it hangs roughly 130px past each edge, and the right-hand
overhang is what makes the whole document scrollable sideways. Because the
navigation bar is pinned vertically only, pushing the document sideways
slides the bar out of alignment with the screen — which is the "navbar does
not scroll all the way together" complaint. Containing the overhang is
therefore expected to resolve both User Story 1 and User Story 2, and the
plan verifies them separately so that a second cause, if one exists, is not
hidden by the first fix. Separately, the career chapter panel's date line
moves from the foot of the panel to just above the "What I built" summary.

Technical approach: contain the overhang at the section that hosts it, using
`overflow-x-clip` rather than `overflow-hidden` and rather than a global
guard. `overflow-x: hidden` forces the cross axis to `auto`, turning the
section into a nested scroll container and breaking `position: sticky` in any
descendant — exactly what FR-004 forbids. `overflow: clip` clips without
creating a scroll container, so nothing sticky, fixed or smooth-scrolling is
disturbed. A global `html/body` guard is rejected because it would satisfy
FR-001 while leaving FR-002 violated in place — the element would still
extend past the viewport, merely invisibly. The date move is a DOM reorder
inside one component with its classes carried over verbatim. No new
dependency, no content-schema change, no new route, and — per the clarify
session — no new test tooling.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16.3 App
Router

**Primary Dependencies**: Tailwind CSS v4 (theme tokens via `@theme inline`,
utilities registered with `@utility` in `app/globals.css`). No new dependency
is added by this feature.

**Storage**: `public/data/*.json`, fetched client-side and validated with
Zod. Untouched — this feature changes presentation only.

**Testing**: Jest + Testing Library, `jest-environment-jsdom` (`npm test`).
jsdom has no layout engine, so geometry is unobservable to it; per the
clarify session the split is manual-for-geometry, automated-for-structure.
The precedent for structural assertions already exists in
`tests/integration/backdrop-coverage.test.tsx`, which asserts against
component source text rather than rendered layout. Files in scope:
`tests/unit/components/ChapterDetail.test.tsx` (extend), one new
source-level test for overflow containment.

**Target Platform**: Modern evergreen browsers; reference targets mobile
Safari and Chrome on Android. `overflow: clip` requires Safari 16+ /
Chrome 90+ / Firefox 81+, all comfortably inside that range.

**Project Type**: Web frontend (single Next.js app, no backend).

**Performance Goals**: Lighthouse performance ≥ 90 on production builds
(constitution). This feature adds no script and no image; the CSS change is
one utility class per affected section.

**Constraints**: Must not clip readable content or shrink decorative
full-bleed layers (FR-003). Must not disturb the pinned nav, smooth anchor
scrolling, or the pinned backdrop (FR-004). Date line keeps its existing
calendar mark and `font-mono-ui` treatment (FR-011). Tailwind utilities only,
ordered by `prettier-plugin-tailwindcss` — no hand-written CSS and no inline
styles (constitution, Technology & Quality Constraints).

**Scale/Scope**: 3 user stories, 13 functional requirements, 7 success
criteria. Expected footprint: 2–4 source files plus 2 test files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Result |
|---|---|---|
| I. KISS & Maintainability | Is this the simplest fix that removes the cause? | **PASS** — containment at the one section that overflows, rather than a global guard that hides the cause. |
| II. Test-First (NON-NEGOTIABLE) | Tests written before/alongside, readable, not over-mocked? | **PASS** — jsdom tests for the two structurally assertable guarantees, written alongside; geometry covered by the SC-007 manual checklist because no installed tool can observe it. |
| III. Atomic Commits | Separable parts split? | **PASS** — three natural commits: overflow containment, nav verification, date reorder. Nav needs no commit if it resolves with the first. |
| IV. Technology Stack (NON-NEGOTIABLE) | Any addition or substitution? | **PASS** — none. No test runner added (the clarify session settled this), no CSS-in-JS, no new animation library, no icon usage outside `SocialIcons.tsx`. |
| V. Token Efficiency | — | **PASS** — no new prompt/context scaffolding. |
| VI. Recorded Decisions (ADRs) | Does anything here need an ADR? | **PASS** — no. An ADR is required for stack or architecture decisions; this reverses no ADR. ADR 0015's pinned-photograph rule is actively protected by FR-004 rather than challenged. |
| Quality constraints | Tailwind utilities, class ordering, no hand-written `.dark`, a11y preserved, Lighthouse ≥ 90 | **PASS** — one utility class per affected section; no theme-selector or motion changes. |

**Gate violations**: none. Complexity Tracking table below is therefore left
empty, as the template directs.

**Post-design re-check (after Phase 1)**: still PASS, unchanged. Phase 1
added no dependency, no directory, no module boundary and no abstraction —
`data-model.md` records a presentation-order change and nothing else,
`contracts/` was skipped as inapplicable, and `quickstart.md` is
documentation. The one design decision with constitutional weight is
research R2's choice of `overflow-x-clip` over a global guard, and it moves
*towards* Principle I rather than away: it removes a cause instead of masking
a symptom. Principle IV is untouched — `tests/e2e/` is still empty and no
browser runner was introduced.

One constitutional note carried into implementation rather than treated as a
violation: Principle VI's companion convention — "code that exists because of
an ADR SHOULD name that ADR in a comment" — has a local analogue in
`components/Career/ChapterDetail.tsx`, whose file docblock and an inline
comment both explain *why* the date currently sits at the foot of the panel.
Those comments are the record of a decision this feature reverses, so they
must be rewritten to explain the new placement, not deleted and not left
contradicting the code.

## Project Structure

### Documentation (this feature)

```text
specs/012-mobile-layout-fixes/
├── plan.md              # This file
├── spec.md              # Clarified 2026-08-14
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (intentionally minimal — see file)
├── quickstart.md        # Phase 1 output — validation guide, incl. SC-007 checklist
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

**No `contracts/` directory is generated.** Contracts describe an external
interface — an HTTP API, a message schema, a published library surface. This
feature has none: the site is a single client-rendered story with no backend,
its only data source is static JSON already validated by
`lib/utils/validation.ts`, and nothing about that data or its shape changes
here. Generating an empty contracts folder would be scaffolding, which
Principle V rules out.

### Source Code (repository root)

```text
app/
├── globals.css                       # Verify: no global overflow guard is added here
├── layout.tsx                        # Verify only: body/html classes, sticky nav ancestry
└── page.tsx                          # Chapter sections — likely site of the containment utility

components/
├── Contact/ContactSection.tsx        # Confirmed overflow source (decorative glow)
├── EngineeringPrinciple/PrincipleBand.tsx  # Reference: same pattern, already contained
├── Navigation/StoryProgressNav.tsx   # Sticky bar — verify after the overflow fix
├── Hero/HeroPortrait.tsx             # Secondary suspect — measure, change only if it overflows
└── Career/ChapterDetail.tsx          # Date line reorder + comment rewrite

tests/
├── integration/
│   ├── backdrop-coverage.test.tsx    # Precedent for source-level structural assertions
│   └── mobile-overflow.test.tsx      # NEW — containment present, no global guard
└── unit/components/
    └── ChapterDetail.test.tsx        # Extend — date renders before "What I built"
```

**Structure Decision**: The existing single-app layout is used unchanged —
`app/` for routing and global styles, `components/<Chapter>/` for chapter
components, `tests/unit` and `tests/integration` mirroring that split. This
feature adds one test file and edits existing components in place; no new
directory, module boundary or shared abstraction is introduced. The
`tests/e2e/` directory stays empty, deliberately: filling it requires a test
runner that Principle IV does not include.

## Complexity Tracking

> No Constitution Check violations. Table intentionally empty.
