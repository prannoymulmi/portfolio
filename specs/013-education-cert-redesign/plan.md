# Implementation Plan: Modernize Education & Certification Grade Display

**Branch**: `feat/education-cert-redesign` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-education-cert-redesign/spec.md`

## Summary

Two education entries carry a result — "Distinction" and "1.9 Grade" — and both
render today as an unstyled paragraph directly beneath the institution line,
indistinguishable from body copy. This feature renders that value as a pill
badge and, for the numeric German grade, shows its English qualitative label
("Good") in place of a number that means nothing to a visitor outside the
German system.

Technical approach: one pure module and one component edit. A colocated
`components/Education/grade.ts` exports `gradeBadgeLabel(value)`, which returns
the English band label for a German numeric grade, the trimmed original for a
non-numeric classification, and `null` for absent or whitespace-only input.
`EducationSection.tsx` swaps its grade paragraph for a `<span>` carrying the
same pill classes the row's "Learn more" anchor already uses — that reuse is
what satisfies both FR-002 (no new accent colour) and FR-003 (contrast),
because those classes are already `text-on-photo` on the photographic surface
and are already proven in both themes. No data file changes, no new dependency,
no motion.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2.8, Next.js 16.3.0 App
Router.

**Primary Dependencies**: Tailwind CSS v4 (tokens via `@theme inline`, custom
utilities via `@utility` in `app/globals.css`); Zod 3 for content validation;
Framer Motion 11, GSAP 3.12 and `rough-notation` 0.5 present but unused by this
feature. Nothing added.

**Storage**: `public/data/education.json`, fetched client-side by
`lib/hooks/useContentLoader.ts` and validated against `EducationFileSchema` in
`lib/utils/validation.ts`. Untouched: FR-005 makes this presentation-only, and
the schema already permits `cardDetailedText` as an optional free string.

**Testing**: Jest + Testing Library, `jest-environment-jsdom` (`npm test`).
Files in scope: `tests/unit/education/grade.test.ts` (new, table-driven pure
function) and `tests/unit/components/EducationSection.test.tsx` (new — the
component currently has no test). Contrast and mobile layout are verified
manually per `quickstart.md`; jsdom has no layout engine and cannot compute a
composite contrast ratio over a photograph.

**Target Platform**: Modern evergreen browsers; reference targets mobile Safari
and Chrome on Android.

**Project Type**: Web frontend (single Next.js app, no backend).

**Performance Goals**: Lighthouse performance ≥ 90 on production builds
(constitution, SC-004). This feature adds no script, no image, no dependency
and no network request — the mapping is a synchronous comparison chain over a
string already in memory.

**Constraints**: Tailwind utilities only, ordered by
`prettier-plugin-tailwindcss`; no CSS-in-JS and no inline `style` (the token
exception in the constitution does not apply — every value this badge needs is
already a Tailwind class). Badge reuses the neutral `border-border` pill tone of
the "Learn more" link; no new accent colour (FR-002). Dark mode via `dark:`
utilities only, never a hand-written `.dark` selector (constitution, ADR 0011)
— and in practice this feature needs zero `dark:` utilities, because
`text-on-photo` and `border-border` both resolve through custom properties the
`.dark` block already redefines. Any motion, if added, goes through the
existing Framer Motion / `rough-notation` domains and the existing
`prefersReducedMotion` helper in `lib/utils/animations.ts` (FR-008) — this plan
recommends adding none.

**Scale/Scope**: 3 user stories, 8 functional requirements, 5 success criteria.
Expected footprint: 1 new module, 1 edited component, 2 new test files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Result |
|---|---|---|
| I. KISS & Maintainability | Simplest thing that satisfies FR-001 and FR-006? | **PASS** — one comparison chain and one `<span>`. The one abstraction introduced (a pure function in its own file) exists to make the bands testable, not to generalise them; no config, no registry, no data-driven rule table. |
| II. Test-First (NON-NEGOTIABLE) | Tests written before/alongside, readable, not over-mocked? | **PASS** — and this is the reason the mapping is a separate module (research R1). The band table is directly assertable without rendering. `EducationSection` gains its first test. |
| III. Atomic Commits | Separable parts split? | **PASS** — two natural commits: the grade mapping module + its tests, then the badge markup + its component test. |
| IV. Technology Stack (NON-NEGOTIABLE) | Any addition or substitution? | **PASS** — none. No dependency, no CSS-in-JS, no fourth animation library, no `react-icons` use outside `SocialIcons.tsx`, no route or structure change. ADR 0015's pinned-photograph rule is honoured by reusing `text-on-photo` rather than painting an opaque badge background. |
| V. Token Efficiency | — | **PASS** — no new prompt scaffolding; `contracts/` deliberately not generated. |
| VI. Recorded Decisions (ADRs) | Does anything here need an ADR? | **PASS** — no. A decision is significant if it adds/removes a dependency, changes structure or URLs, changes how content is stored/loaded/validated, or commits the design to a metaphor. This does none: the JSON, the schema and the loader are untouched, and the badge follows the existing pill treatment rather than establishing a new visual language. |
| Quality constraints | Tailwind utilities, class ordering, no hand-written `.dark`, `prefers-reduced-motion`, a11y, Lighthouse ≥ 90 | **PASS** — reused utility classes; no new selector; no motion added, so no reduced-motion path to get wrong; badge is non-interactive text needing no ARIA beyond its own content. |

**Gate violations**: none. Complexity Tracking below is therefore empty, as the
template directs.

**Post-design re-check (after Phase 1)**: still PASS, unchanged. Phase 1
introduced no dependency, no directory beyond `tests/unit/education/`, and no
module boundary that did not already have a precedent in the repo
(`components/Career/chapters.ts`, `components/Hero/palette.ts`).
`data-model.md` records a presentation-only mapping and explicitly no data-file
change; `contracts/` was skipped as inapplicable; `quickstart.md` is
documentation. The one decision with any constitutional weight is research R1's
choice of a separate module over an inline helper, and it moves *towards*
Principle II rather than away from Principle I: the file is roughly fifteen
lines with no branching beyond the band chain.

One item carried into implementation rather than treated as a violation:
the two mapping decisions that are not obvious from the code — the closed-gap
upper-bound chain, and why detection tolerates a trailing word — need a short
`WHY` comment in `grade.ts`. Principle I forbids comments that explain *what*
code does; both of these explain why it is shaped that way, which is the
opposite case.

## Project Structure

### Documentation (this feature)

```text
specs/013-education-cert-redesign/
├── plan.md              # This file
├── spec.md              # Clarified 2026-08-16 (3 questions)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output — visual verification guide
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

**No `contracts/` directory is generated.** Contracts describe an external
interface — an HTTP API, a message schema, a published library surface. This
feature has none: it is an internal presentational change to one client
component, its only data source is static JSON already validated by
`lib/utils/validation.ts`, and neither that data nor its shape changes.
Generating an empty folder would be scaffolding, which Principle V rules out.

### Source Code (repository root)

```text
components/Education/
├── EducationSection.tsx   # EDIT — grade paragraph becomes a pill badge
└── grade.ts               # NEW — gradeBadgeLabel(), the band mapping

public/data/
└── education.json         # READ ONLY — FR-005 forbids changes here

app/data/
└── education.json         # Stale unserved duplicate — see Risks in research.md

lib/utils/
└── validation.ts          # Verify only: EducationSchema needs no change

tests/
├── unit/education/
│   └── grade.test.ts               # NEW — band table, detection, edge cases
└── unit/components/
    └── EducationSection.test.tsx   # NEW — badge present/absent per entry
```

**Structure Decision**: the existing single-app layout is used unchanged —
`components/<Chapter>/` for chapter components with colocated non-React helpers
alongside them, `tests/unit/<area>/` mirroring that split. `grade.ts` sits beside
its only consumer, following `components/Career/chapters.ts` (tested at
`tests/unit/career/chapters.test.ts`) and `components/Hero/palette.ts`. No new
top-level directory, module boundary or shared abstraction is introduced.

## Complexity Tracking

> No Constitution Check violations. Table intentionally empty.
