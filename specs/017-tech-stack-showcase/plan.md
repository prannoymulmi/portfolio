# Implementation Plan: Technologies Chapter

**Branch**: `feat/tech-stack-showcase` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-tech-stack-showcase/spec.md`

## Summary

Add a mid-page "Technologies" chapter to the single-page story. It lists every
technology the site owner has professionally used, grouped by category, each
with a duration of use and a derived proficiency level, filterable by category,
with a detail panel that updates on hover, tap, or keyboard focus.

Technical approach: a new `public/data/technologies.json` carries only what
cannot be derived (category, context note, the raw strings in
`experiences.json` each entry matches). Durations and proficiency levels are
computed at render time from `public/data/experiences.json` by a pure module,
`lib/utils/techDuration.ts`, which unions the real date ranges of every role a
technology appears in. No duration is ever authored by hand, which is what
makes FR-004 / SC-004 structurally true rather than a promise. Content loading
follows the existing `useContentLoader` + Zod + `ContentProvider` pattern; the
chapter component follows the shape of `components/Work/ThreeSystems.tsx`.

## Technical Context

**Language/Version**: TypeScript (strict mode), React 19, Next.js 16 App Router

**Primary Dependencies**: Framer Motion (entrance + interaction motion only),
Zod (content validation), Tailwind CSS v4. No new dependency is added by this
feature.

**Storage**: JSON in `public/data/` fetched client-side and Zod-validated
(ADR 0001, ADR 0003). New file: `public/data/technologies.json`. Existing file
read as the source of truth for dates: `public/data/experiences.json`.

**Testing**: Jest + React Testing Library. Unit tests under `tests/unit/`,
cross-file content invariants under `tests/integration/`.

**Target Platform**: Modern browsers, mobile → desktop, deployed on Vercel.

**Project Type**: Single-page Next.js web application (one scrolling story at
`/`; sections are anchors, not routes — ADR 0012).

**Performance Goals**: Lighthouse performance ≥ 90 on production builds. The
chapter adds one small JSON fetch and pure client-side computation over ≤ 15
roles — negligible. No new images, no new fonts.

**Constraints**:
- Must not be the most visually dominant chapter (FR-008).
- Motion respects `prefers-reduced-motion` via `lib/utils/animations.ts`
  (`prefersReducedMotion`), not a new detection path.
- Tailwind utility classes only; inline `style` is permitted only for values
  from a shared token module — see the progress-bar decision in research.md.
- Every interactive element keyboard-operable with visible focus (FR-009).

**Scale/Scope**: One new chapter component (plus a detail panel and a filter
row), one new content file + schema + type, one new pure utility module, one
registration in `ContentProvider`, one section in `app/page.tsx`, one entry in
`StoryProgressNav`'s `STORY_SECTIONS`, one copy tightening in
`public/data/projects.json`, one ADR.

## Constitution Check

*GATE: evaluated against `.specify/memory/constitution.md` v1.5.0.*

| Principle | Status | Notes |
|---|---|---|
| I. KISS & Maintainability | PASS | One chapter component, one pure util, one schema. The util is the only non-obvious piece and it is pure and directly testable. |
| II. Test-First | PASS (obligation) | Duration/level derivation, category filtering, hover/tap/focus selection, keyboard operability, and the "every technology traces to a role" invariant all get tests alongside implementation. |
| III. Atomic Commits | PASS (obligation) | Natural split: (1) content file + schema + type, (2) duration util + tests, (3) chapter component + tests, (4) page wiring + nav entry, (5) projects.json copy tightening, (6) ADR + index. |
| IV. Technology Stack | PASS with one item to settle | Content: new JSON in `public/data/`, Zod-validated, no CMS/DB — compliant. Animation: Framer Motion only (entrance + interaction) — no fourth library, no GSAP needed since nothing here is scroll-sequenced. Styling: Tailwind only. **Open item**: the reference prototype draws its duration bar with an interpolated inline `style={{ width: '…%' }}`, which the "Technology & Quality Constraints" inline-style rule does not permit (it is not a shared token value). Resolved in research.md (R-006) in favour of discrete Tailwind-class segments. |
| V. Token Efficiency | PASS | Planning artifacts reference existing files rather than restating them. |
| VI. Recorded Decisions (ADRs) | ACTION REQUIRED | This feature changes how content is stored/derived (a new content file whose numbers are computed from another content file) and adds a chapter/anchor to the story. An ADR is required and MUST land in the same PR as the implementation — not in this planning pass. `docs/adr/README.md` must be updated in the same commit. |

**Structural gates**:
- Single-page story preserved; new `#technologies` anchor, no new route, no
  retired path, so no redirect is needed (ADR 0012 unaffected).
- Football-pitch metaphor (ADR 0004) is NOT reintroduced. The skills formation
  was removed by ADR 0020 precisely because tool names on pitch positions
  carried no meaning; this chapter is the evidence-backed replacement for that
  list and must not resurrect its visual form.
- Dark mode: `dark:` utilities only, no hand-written `.dark` selectors.

**Post-Phase-1 re-check**: PASS. The design in data-model.md and research.md
introduces no new dependency, no new animation library, no CSS-in-JS, no
inline style outside the token exception, and no second source of truth for
dates. Complexity Tracking below is therefore empty.

## Project Structure

### Documentation (this feature)

```text
specs/017-tech-stack-showcase/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── technologies.content.md   # Content-file contract (JSON shape + rules)
│   └── chapter.ui.md             # UI/interaction + a11y contract
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
app/
└── page.tsx                       # MODIFIED: new <section id="technologies">

components/
├── Common/
│   └── ContentProvider.tsx        # MODIFIED: loads technologies.json
├── Navigation/
│   └── StoryProgressNav.tsx       # MODIFIED: STORY_SECTIONS entry
└── Technologies/                  # NEW
    ├── TechnologiesChapter.tsx    # chapter shell: heading, note, filters, grid
    ├── TechnologyList.tsx         # the filterable list of selectable rows
    └── TechnologyDetail.tsx       # the detail panel

lib/
├── types/portfolio.ts             # MODIFIED: Technology, TechnologiesFile
├── utils/
│   ├── validation.ts              # MODIFIED: TechnologiesFileSchema
│   └── techDuration.ts            # NEW: date parsing, interval union, levels
public/data/
├── technologies.json              # NEW
└── projects.json                  # MODIFIED: "This Portfolio" copy tightening

tests/
├── unit/
│   ├── validation.test.ts         # MODIFIED: new schema cases
│   ├── technologies/
│   │   └── techDuration.test.ts   # NEW
│   └── components/
│       ├── TechnologiesChapter.test.tsx   # NEW
│       └── StoryProgressNav.test.tsx      # MODIFIED
└── integration/
    ├── story-page.test.tsx        # MODIFIED: section present, ordering, weight
    └── content-sources.test.ts    # MODIFIED: durations trace to real roles

docs/adr/
├── 0023-technologies-derive-from-experiences.md   # NEW (with implementation)
└── README.md                                       # MODIFIED: index entry
```

**Structure Decision**: The existing feature-folder-per-chapter convention
under `components/` (`Work/`, `Career/`, `Education/`, `Projects/`, `Contact/`)
is followed with a new `components/Technologies/` folder. Derivation logic
lives in `lib/utils/` rather than inside the component so it can be unit-tested
without rendering, matching how `lib/utils/animations.ts` is already treated.

## Complexity Tracking

*No constitution violations require justification. This section is
intentionally empty.*
