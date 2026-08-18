---
description: "Task list for the Technologies chapter"
---

# Tasks: Technologies Chapter

**Input**: Design documents from `/specs/017-tech-stack-showcase/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are included and are NOT optional. Constitution Principle II
(Test-First, NON-NEGOTIABLE) requires tests written before or alongside every
feature, and the repo already carries `tests/unit/` and `tests/integration/`
suites for every existing chapter.

**Organization**: Tasks are grouped by user story so each story can be
implemented, tested, and shipped as its own increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete work)
- **[Story]**: `[US1]`, `[US2]`, `[US3]` — maps to the user stories in spec.md
- Every task names the exact file it touches

## Path Conventions

Single Next.js app at the repository root: `app/`, `components/`, `lib/`,
`public/data/`, `tests/unit/`, `tests/integration/`, `docs/adr/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Get the content file and folders in place so everything downstream
has something real to read.

- [X] T001 Author `public/data/technologies.json` per `specs/017-tech-stack-showcase/contracts/technologies.content.md`: `intro`, `builtWithNote`, `categories`, and one entry per technology with `name`, `category`, `matches`, `note`. Derive `matches` by reading the `technologies` arrays in `public/data/experiences.json` literally — that file contains `Spring` and `Spring Boot`, `CSS` and `CSS3`, `Angular.js`, `React.js`, `Node.js`, `HTML5`. No `years`, `months`, or `level` field may appear anywhere in this file.
- [X] T002 [P] Create the directories `components/Technologies/` and `tests/unit/technologies/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, schema, derivation logic, and content wiring. Every user
story reads from these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Add `Technology` and `TechnologiesFile` interfaces to `lib/types/portfolio.ts`, beside the existing content types, with a doc comment explaining why no duration or level field exists (they are derived — research R-001).
- [X] T004 [P] Write failing unit tests in `tests/unit/technologies/techDuration.test.ts` covering: `parseDateText` for `11/2020 – 03/2026`, `04/2026 – Present`, em dash and hyphen separators, extra whitespace, and a malformed string returning `null` (not throwing); `unionMonths` merging overlapping and adjacent intervals and being order-independent; `deriveLevel` at each threshold boundary; `formatDuration` returning `null` for `null`, `"< 1 yr"` under twelve months, and rounding **down** to one decimal above it.
- [X] T005 Add `TechnologySchema` and `TechnologiesFileSchema` to `lib/utils/validation.ts` with the bounds in `data-model.md`, including a `superRefine` on the file schema asserting every entry's `category` is a member of `categories` and every `name` is unique. Depends on T003.
- [X] T006 [P] Extend `tests/unit/validation.test.ts` with cases proving `TechnologiesFileSchema` accepts the real `public/data/technologies.json` and rejects an unknown `category`, an empty `matches` array, a duplicate `name`, and an out-of-range `note`.
- [X] T007 Implement `parseDateText`, `unionMonths`, `deriveLevel`, and `formatDuration` in `lib/utils/techDuration.ts` with the level thresholds as named constants and a comment stating they are a presentation rule, not a skill claim. Makes T004 pass.
- [X] T008 Implement `buildUsage(file, experiences): TechnologyUsage[]` in `lib/utils/techDuration.ts`: case-insensitive trimmed exact matching of `matches` against each role's `technologies`, union of matched roles' intervals, `totalMonths: null` when no matched role parses, `isCurrent` from a `Present` end, `roles` most-recent-first, and deterministic ordering (category order → `totalMonths` descending → `name` ascending). Log a `console.error` naming any role whose `dateText` fails to parse. Depends on T007.
- [X] T009 Register the new file in `components/Common/ContentProvider.tsx`: `useContentLoader('technologies.json', TechnologiesFileSchema)`, added to `ContentContextType` and the context value alongside the seven existing entries. Depends on T005.

**Checkpoint**: content loads and validates, durations compute and are unit-tested. User story work can begin.

---

## Phase 3: User Story 1 - Browse technologies by category and depth (Priority: P1) 🎯 MVP

**Goal**: The chapter exists on the page, lists every technology with category
and duration, filters by category in one interaction, and updates a detail panel
on hover, tap, or keyboard focus.

**Independent Test**: Load `/`, scroll to `#technologies`. Every technology
shows a category and a duration with no interaction. Click one category — the
list narrows; `All` restores it. Hover, Tab to, and tap a row — each updates the
detail panel with duration, level, and context note.

### Tests for User Story 1

> Write these first and confirm they fail before implementing T011–T013.

- [X] T010 [P] [US1] Write `tests/unit/components/TechnologiesChapter.test.tsx` covering: every technology renders with its category and a duration; clicking a category button narrows the list and `All` restores it; `mouseEnter`, `focus`, and `click` on a row each update the detail panel; a filter yielding a single entry still renders; the active technology moves to the first visible row when the current one is filtered out; the loading state renders `ProjectsSkeleton`; a failure in either `technologies` or `experiences` renders the failure line.

### Implementation for User Story 1

- [X] T011 [US1] Create `components/Technologies/TechnologyDetail.tsx`: the sticky panel showing category eyebrow, name heading, duration text, level label, context note, and the discrete year-cell strip. Cells use literal Tailwind classes for filled/unfilled — no interpolated `style={{ width }}` (research R-006, constitution inline-style rule). Strip is `aria-hidden="true"`; the panel is `aria-live="polite"`.
- [X] T012 [US1] Create `components/Technologies/TechnologyList.tsx`: one `<button type="button">` per technology with `onMouseEnter`, `onFocus`, and `onClick` all setting the active technology, `aria-current` on the selected row, name and duration text, and the per-row year-cell strip. `shadow-glow` is permitted on the selected row only.
- [X] T013 [US1] Create `components/Technologies/TechnologiesChapter.tsx`: reads `technologies` and `experiences` from `useContent()`, treats either-loading as loading (`ProjectsSkeleton`) and either-failed as failed (single failure line, matching `components/Work/ThreeSystems.tsx`), calls `buildUsage`, owns `activeCategory` and `activeTechName` state per `data-model.md`, renders the eyebrow, `h2` at `text-3xl sm:text-4xl`, the `intro` paragraph, the category filter row with `aria-pressed`, and the `lg:grid-cols-[1.4fr_1fr]` grid. Makes T010 pass.
- [X] T014 [US1] Add `<section id="technologies" aria-label="Technologies" className="chapter-scrim px-4 py-16 sm:px-6 lg:px-8">` with an inner `div.mx-auto.max-w-6xl` to `app/page.tsx`, placed after `<PrincipleBand />` and before the `#education` section. Do NOT add a `ChapterGradientOverlay` (research R-008).
- [X] T015 [US1] Add `{ id: 'technologies', label: 'Technologies' }` to `STORY_SECTIONS` in `components/Navigation/StoryProgressNav.tsx` between `career` and `education`, and update the expected section list in `tests/unit/components/StoryProgressNav.test.tsx`. Leave `public/data/navbar.json` untouched — its path-style `sections` are not what this nav renders.
- [X] T016 [US1] Add Framer Motion entrance to the list rows and detail panel (staggered fade/rise via `whileInView`) and a short cross-fade on panel content change, collapsing all durations to zero when `prefersReducedMotion()` from `lib/utils/animations.ts` returns true. No GSAP, no `rough-notation`, no new dependency.
- [X] T017 [US1] Extend `tests/integration/story-page.test.tsx` to assert `#technologies` renders, sits between the principle band and `#education`, carries no `ChapterGradientOverlay`, and that its `h2` scale classes match those of the `ThreeSystems` heading (FR-008 guard).

**Checkpoint**: User Story 1 is fully functional and independently testable. This is the shippable MVP.

---

## Phase 4: User Story 2 - The site was built with Claude Code + spec-driven development (Priority: P2)

**Goal**: One clearly readable, body-sized sentence in the chapter, and the
featured "This Portfolio" entry actually naming Claude Code.

**Independent Test**: Read the Technologies chapter — the sentence appears
exactly once at body-copy size, no badge or banner. Open the "This Portfolio,
Spec-Driven" card in Projects — it names Claude Code and spec-driven
development, at the same position and size in the gallery as before.

- [X] T018 [US2] Render `builtWithNote` in `components/Technologies/TechnologiesChapter.tsx` as its own paragraph directly after `intro`, at identical body-copy typography — no badge, callout, border, or accent colour (FR-005, research R-009).
- [X] T019 [US2] Extend `tests/unit/components/TechnologiesChapter.test.tsx` to assert the Claude Code sentence appears exactly once in the chapter and carries no heading-level element or emphasis wrapper.
- [X] T020 [US2] Edit the `bodyText` of the "This Portfolio, Spec-Driven" entry in `public/data/projects.json` so it names **Claude Code** explicitly, and add `Claude Code` to its `tags`. Constraints: `bodyText` is `min(100).max(500)` and currently **495** characters — words must be replaced, not appended; `tags` holds 6 of a maximum 8; the entry's index in the `projects` array, its `links`, and its `image` MUST NOT change (FR-006, research R-010). While editing, replace the stale "ADRs (21 and counting)" with a form that does not need updating every feature. **Open question with the user**: exact wording — this task is deliberately small so it can be reworded or dropped without disturbing anything else.
- [X] T021 [US2] Add a test to `tests/integration/content-sources.test.ts` asserting the "This Portfolio, Spec-Driven" entry's `bodyText` contains both "Claude Code" and "spec-driven", and that its index within `projects` is unchanged (no elevation above the other featured projects).

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Trust the numbers are real (Priority: P3)

**Goal**: A visitor can see which real roles a duration came from, and CI
guarantees no technology can render an untraceable number.

**Independent Test**: Select any technology; the detail panel lists the roles
and date ranges its duration was computed from. Cross-check each against
`public/data/experiences.json` by hand — every one is a real, dated role.

- [X] T022 [US3] Extend `components/Technologies/TechnologyDetail.tsx` with a traceability block listing the `roles` from `TechnologyUsage` (title, employer, `dateText`), most recent first, and render no duration and no level at all when `totalMonths` is `null` rather than showing `0` (spec Edge Cases, FR-004).
- [X] T023 [US3] Extend `tests/unit/components/TechnologiesChapter.test.tsx` to assert the detail panel lists the contributing roles, and that a technology whose matched roles have unparseable dates renders with neither a duration nor a level.
- [X] T024 [US3] Add the SC-004 guard to `tests/integration/content-sources.test.ts`: every string in every `matches` array of `public/data/technologies.json` appears in at least one role's `technologies` array in `public/data/experiences.json`; every technology resolves to at least one role; no two technologies claim the same source string; and every `dateText` in `experiences.json` parses via `parseDateText`.

**Checkpoint**: all three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T025 [P] Write `docs/adr/0023-technologies-derive-from-experiences.md` recording that the chapter's durations and levels are computed from `experiences.json` rather than stored, that `matches` is an explicit alias list, and the rejected alternatives (hand-authored durations, build-time generation, fuzzy matching). Required by Principle VI and MUST land in the same PR as this implementation.
- [X] T026 Add the ADR 0023 row to `docs/adr/README.md` with status Accepted. Depends on T025.
- [X] T027 [P] Accessibility pass over `components/Technologies/`: `aria-pressed` on category buttons, `aria-current` on the selected row, `aria-live="polite"` on the detail panel, visible focus rings, level conveyed as text and not colour alone, decorative strips `aria-hidden`. Verify tab order matches DOM order (FR-009).
- [X] T028 [P] Responsive check at 375px, 768px, and 1440px: the two-column grid stacks on narrow widths, the detail panel stays reachable, and nothing introduces horizontal overflow (FR-010; see `tests/integration/mobile-overflow.test.tsx` for the existing guard and extend it if the chapter can overhang).
- [X] T029 Walk the manual validation list in `specs/017-tech-stack-showcase/quickstart.md` end to end, including the reduced-motion pass and the "rename technologies.json" failure path.
- [X] T030 Run `pnpm lint`, `pnpm type-check`, and `pnpm test` clean, then confirm Lighthouse performance ≥ 90 on a production build of `/`. (lint/type-check/test/build all verified clean; Lighthouse itself could not be executed in this sandboxed environment — no `lighthouse` CLI or browser available — flagged for manual/CI verification.)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: needs T001 (a real content file to validate and derive from). Blocks all user stories.
- **User Story 1 (Phase 3)**: needs Phase 2 complete.
- **User Story 2 (Phase 4)**: needs T013 for T018/T019; T020/T021 need only Phase 1 and can be done at any point.
- **User Story 3 (Phase 5)**: needs T011 for T022; T024 needs only T007 and T001.
- **Polish (Phase 6)**: after the stories you intend to ship.

### Within-story ordering

- T004 before T007; T010 before T011–T013; T019 after T018; T023 after T022. Tests are written first and must fail before the implementation task that satisfies them.
- T003 → T005 → T009 (types before schema before provider registration).
- T007 → T008 (primitives before composition).
- T011, T012 → T013 (leaf components before the shell that composes them).

### Parallel Opportunities

- Phase 1: T002 runs alongside T001.
- Phase 2: T003, T004, and T006 are three different files with no dependency between them — run together. T005 and T007 can then proceed in parallel (different files) before converging on T008/T009.
- Phase 3: T011 and T012 are different files and can be built in parallel once T010 exists.
- Phase 4: T020 and T021 touch only `public/data/projects.json` and `tests/integration/content-sources.test.ts` — independent of the whole chapter, and can be done first if the user's wording answer arrives early.
- Phase 6: T025, T027, and T028 are independent.
- Across stories: US2's content half (T020, T021) and US3's CI guard (T024) do not depend on US1's UI at all.

---

## Parallel Example: Phase 2

```bash
# Three independent files, no shared dependency:
Task: "Add Technology/TechnologiesFile types in lib/types/portfolio.ts"
Task: "Write failing techDuration unit tests in tests/unit/technologies/techDuration.test.ts"
Task: "Add TechnologiesFileSchema cases in tests/unit/validation.test.ts"
```

## Parallel Example: User Story 1

```bash
# After T010 exists and fails:
Task: "Create components/Technologies/TechnologyDetail.tsx"
Task: "Create components/Technologies/TechnologyList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 → Phase 2 → Phase 3.
2. **STOP and VALIDATE**: chapter renders, filters in one click, detail panel responds to hover/tap/focus, durations are real.
3. This is a coherent shippable chapter on its own — US2 and US3 add copy and traceability, not function.

### Incremental Delivery

1. Setup + Foundational → derivation is proven by unit tests before any pixel exists.
2. + US1 → MVP, deployable.
3. + US2 → the Claude Code sentence and the projects.json copy fix.
4. + US3 → role traceability in the panel and the CI guard that keeps SC-004 true forever.
5. + Polish → ADR, a11y, responsive, quickstart, Lighthouse.

### Commit Strategy (Principle III)

Natural atomic units, none exceeding five files: (1) content file, (2) types +
schema + provider, (3) duration util + its tests, (4) chapter components + their
tests, (5) page + nav wiring, (6) projects.json copy, (7) ADR + index.

---

## Notes

- `[P]` means different files with no incomplete dependency.
- Verify each test task fails before writing the implementation it covers.
- The one constitution trap in this feature is the duration bar: the reference
  prototype uses an interpolated inline `style={{ width }}`, which the
  inline-style rule forbids. Use discrete Tailwind-class cells (T011, T012).
- No new dependency is added by any task in this list.
