---

description: "Task list for Annotated Hero & Working Theme Switching"
---

# Tasks: Annotated Hero & Working Theme Switching

**Input**: Design documents from `/specs/003-hero-annotations-theming/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — the project constitution's Principle II (Test-First, NON-NEGOTIABLE) requires tests written before or alongside every feature.

**Organization**: Grouped by user story so each can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: US1–US4, mapping to the user stories in spec.md
- File paths are exact and relative to the repo root

## ⚠️ Blocking governance gate

The plan's Constitution Check **fails Principle IV** (fixed technology stack) because this feature adds two dependencies. Per the constitution's Governance clause, the stack "MUST NOT be substituted without a constitution amendment". **T002 must be accepted before any `rough-notation` work (US1) begins.** Theming work (US2) is unblocked by T003, which is new ground rather than an amendment.

---

## Phase 1: Setup

**Purpose**: Confirm a clean baseline and land the governance amendments the stack change requires.

- [X] T001 Run `npm run type-check`, `npm run lint`, and `npm test` on the current `main` to confirm a clean 28-test baseline before changes
- [X] T002 Write `docs/adr/0009-rough-notation-third-animation-library.md` — amends ADR 0005's two-library ceiling to three, with the domain rule "GSAP for scroll-driven, Framer for interaction/entrance, RoughJS for hand-drawn marks"; state context, decision, positive/negative consequences, and the rejected alternatives from `research.md` §4 (FR-018, FR-020, FR-021)
- [X] T003 [P] Write `docs/adr/0010-next-themes-for-theme-state.md` — records adopting `next-themes` and deleting the hand-rolled hook; cite the pre-paint-script rationale from `research.md` §2 (FR-018, FR-021)
- [X] T004 [P] Write `docs/adr/0011-class-based-dark-mode.md` — records replacing the OS media query with a class-based `dark` variant; state that it supersedes ADR 0006's appearance-switching mechanism while ADR 0006 otherwise stands (FR-018, FR-020)
- [X] T005 Add the three new records to the index table in `docs/adr/README.md` with their statuses (FR-018)
- [X] T006 Install dependencies: `npm install --legacy-peer-deps next-themes@^0.4.6 rough-notation@^0.5.1`. Note: `--legacy-peer-deps` **is** required, but for the pre-existing `@testing-library/react@14` React ^18 pin recorded in ADR 0007 — a bare `npm install` fails identically. Neither new package adds a peer conflict.

**Checkpoint**: Amendments accepted and dependencies installed — implementation may begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The content-schema change both hero stories read from. Must land before US1 or US3 touch the hero.

**⚠️ CRITICAL**: No hero story work can begin until this phase is complete

- [ ] T007 Update the `Home` interface in `lib/types/portfolio.ts` — add `intro: string`, keep `roles: string[]` (see `data-model.md` → HeroIntroduction)
- [ ] T008 Update `HomeSchema` in `lib/utils/validation.ts` — add `intro` (20–200 chars), and change `roles` from `.min(10).max(100)` per entry / 1–3 entries to **3–40 chars per entry / 2–5 entries** so short phrases like "AI enthusiast" validate (see `contracts/content-schema.md`)
- [ ] T009 Update `public/data/home.json` — add the `intro` line and replace `roles` with `["Software Engineer", "AI enthusiast", "Security Nerd"]` (FR-017)
- [ ] T010 [P] Add a schema test in `tests/unit/validation.test.ts` asserting the new `home.json` validates, that a 2-entry and a 5-entry `roles` array both pass, and that a 1-entry array fails (contract C3)

**Checkpoint**: Content schema and data updated and validating — hero stories can start.

---

## Phase 3: User Story 2 - Theme switching that actually works (Priority: P1) 🎯 MVP

**Goal**: A visible, keyboard-reachable control switches the whole site between light and dark; the choice persists, beats the OS setting, and never flashes the wrong theme on load.

**Independent Test**: Load the site, find and activate the theme control, confirm every section changes. Reload and confirm the choice survived. Hard-reload with dark stored and confirm no white flash.

**Why first**: This is a four-part repair of broken advertised functionality (`research.md` §1), it is independent of the hero work, and every other story's visual output must be verified in *both* themes — so fixing theming first makes the rest verifiable.

### Tests for User Story 2

- [ ] T011 [P] [US2] Integration test in `tests/integration/theming.test.tsx` asserting an explicitly chosen theme takes precedence over the OS preference (contract T-precedence, FR-013)
- [ ] T012 [P] [US2] Integration test in `tests/integration/theming.test.tsx` asserting the chosen theme is restored from storage on remount (contract T3, FR-012)
- [ ] T013 [P] [US2] Unit test in `tests/unit/components/ThemeToggle.test.tsx` asserting the control renders with an accessible label, is keyboard-operable, and calls through to set the opposite theme (contract T1, FR-010, SC-009)

### Implementation for User Story 2

- [ ] T014 [US2] Add `@custom-variant dark (&:where(.dark, .dark *));` to `app/globals.css` so Tailwind's `dark:` utilities key off the class instead of `prefers-color-scheme` (`research.md` §3 — fixes defect 2)
- [ ] T015 [US2] In `app/globals.css`, move the custom-property overrides out of `@media (prefers-color-scheme: dark)` and onto a `.dark` selector so `--background`/`--foreground`/`--border` follow the explicit choice (fixes defect 3)
- [ ] T016 [US2] Create `components/Common/ThemeProvider.tsx` — a thin client wrapper around `next-themes`' provider configured for class-based switching with system default
- [ ] T017 [US2] Wrap the app in `ThemeProvider` in `app/layout.tsx` and add `suppressHydrationWarning` to the `<html>` element (required: the pre-paint script mutates it before React hydrates — fixes defect 4)
- [ ] T018 [US2] Rewire `components/Common/ThemeToggle.tsx` to read and set theme via `next-themes` instead of the local hook; keep the existing icons, ARIA label, and hydration guard
- [ ] T019 [US2] Mount `<ThemeToggle />` inside `components/Navigation/StoryProgressNav.tsx`, in the sticky bar beside the section links (fixes defect 1 — FR-010)
- [ ] T020 [US2] Delete `lib/hooks/useTheme.ts` and confirm via grep that nothing imports it

**Checkpoint**: All four theming defects fixed. Site is switchable, persistent, and flash-free — independently shippable.

---

## Phase 4: User Story 1 - Hand-annotated introduction (Priority: P1)

**Goal**: Each role phrase in the hero carries a hand-drawn mark that draws in on load, stays aligned through reflow, and respects reduced motion.

**Independent Test**: Load the site and confirm all three phrases are annotated with visibly different marks; resize the window and confirm each mark re-aligns; enable reduced motion and confirm marks appear complete but unanimated.

**⚠️ Depends on T002** (constitution amendment) being accepted.

### Tests for User Story 1

- [ ] T021 [P] [US1] Unit test in `tests/unit/components/RoughAnnotation.test.tsx` asserting the wrapper renders its children as readable text regardless of annotation state (spec Edge Case: text must carry the meaning, never the mark)
- [ ] T022 [P] [US1] Unit test in `tests/unit/components/RoughAnnotation.test.tsx` asserting annotation animation is disabled when `prefers-reduced-motion: reduce` is set, while the annotation is still shown (FR-003, SC-008)
- [ ] T023 [P] [US1] Unit test in `tests/unit/components/Hero.test.tsx` asserting every entry in `roles` renders wrapped in an annotation, and that a 4-entry list still annotates all four (FR-002, FR-025, contract C2/C3)

### Implementation for User Story 1

- [ ] T024 [US1] Create `components/Common/RoughAnnotation.tsx` — a client wrapper around `rough-notation` taking children and a mark type; draws on mount, disables animation under reduced motion via the existing `prefersReducedMotion()` in `lib/utils/animations.ts` (do not add a second detection path — `research.md` §6)
- [ ] T025 [US1] In `RoughAnnotation.tsx`, re-run the annotation when the element's box changes (resize/orientation) and delay the first draw until web fonts have loaded, so marks never strand after reflow (FR-004, SC-006 — `research.md` §5)
- [ ] T026 [US1] In `RoughAnnotation.tsx`, resolve mark colour per theme so annotated text stays legible in both light and dark (FR-006, SC-007)
- [ ] T027 [US1] Define the fixed mark-style sequence as a constant in `components/Hero/Hero.tsx` (e.g. `highlight`, `circle`, `underline`) and zip it positionally against `roles`, wrapping when phrases outnumber styles; do **not** read style from content (FR-024, FR-025)
- [ ] T028 [US1] Render the annotated phrases and the new `intro` line in `components/Hero/Hero.tsx`, reading both from content rather than hardcoded copy (FR-001, FR-005)

**Checkpoint**: Hero introduction is annotated, reflow-safe, and reduced-motion aware.

---

## Phase 5: User Story 3 - Portrait beside the introduction (Priority: P2)

**Goal**: On desktop the portrait sits beside the introduction; on mobile they stack. The Core Expertise card is gone.

**Independent Test**: At desktop width, portrait and text are side by side; at 320px they stack with no horizontal scroll; the Core Expertise card is absent while the Skills chapter below still shows that content.

### Tests for User Story 3

- [ ] T029 [P] [US3] Unit test in `tests/unit/components/Hero.test.tsx` asserting the hero renders the name, annotated phrases, intro line, and both CTA buttons (FR-026)
- [ ] T030 [P] [US3] Unit test in `tests/unit/components/Hero.test.tsx` asserting the "Core Expertise" heading is **not** present — replacing the existing assertion at `tests/unit/components/Hero.test.tsx:60` that requires it (FR-027)

### Implementation for User Story 3

- [ ] T031 [US3] Restructure the hero layout in `components/Hero/Hero.tsx` into a two-column arrangement — introduction on one side, portrait on the other — collapsing to a single stacked column at mobile widths (FR-007, FR-008)
- [ ] T032 [US3] Remove the "Core Expertise" card and its `TopSkillsPreview` usage from `components/Hero/Hero.tsx` (FR-027)
- [ ] T033 [US3] Delete `components/Hero/TopSkillsPreview.tsx` once nothing imports it, confirming via grep
- [ ] T034 [US3] Verify in `components/Hero/Hero.tsx` that the existing `ProfilePicturePlaceholder` still renders correctly in its new column position, and that setting `imageSource` in `public/data/about.json` swaps a real photo in without a layout break (FR-009)

**Checkpoint**: Hero is fully composed — annotated text beside the portrait, responsive, uncluttered.

---

## Phase 6: User Story 4 - Decision records complete (Priority: P3)

**Goal**: Every significant decision has a record a newcomer can read cold.

**Independent Test**: Open `docs/adr/README.md`, follow each new entry, and confirm each states context, decision, consequences, and rejected alternatives.

**Note**: The records themselves are written in Phase 1 (T002–T005), because they gate the work rather than follow it. This phase verifies them against reality after implementation.

- [ ] T035 [US4] Review `docs/adr/0009-rough-notation-third-animation-library.md`, `docs/adr/0010-next-themes-for-theme-state.md`, and `docs/adr/0011-class-based-dark-mode.md` against what was actually built, correcting any drift between the recorded decision and the shipped implementation (FR-021)
- [ ] T036 [US4] Confirm every decision in plan.md's Complexity Tracking has a corresponding record, and that ADR 0005 and ADR 0006 both carry the cross-reference to their amending record (FR-019, FR-020, SC-010)

**Checkpoint**: Decisions documented and accurate.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T037 [P] Update the site-wide description in `app/layout.tsx` metadata to the professional framing "Senior software engineer and cloud architect, with a focus on AI and security", keeping it independent of the hero copy (FR-022, FR-023, SC-012)
- [ ] T038 [P] Verify the background accent's `dark:invert` in `app/layout.tsx` behaves correctly now that `dark` is class-driven rather than OS-driven (spec Dependencies)
- [ ] T039 Check WCAG AA contrast across the hero, annotated phrases, and body text in both themes with an accessibility inspector (FR-016, SC-007)
- [ ] T040 Run `npm run type-check`, `npm run lint`, and `npm test`; fix any failures
- [ ] T041 Run `npm run build`, then measure Lighthouse performance against the production build and confirm it remains ≥ 90 with the ~11KB gz of new dependencies (constitution Quality Constraints)
- [ ] T042 Walk every scenario in `specs/003-hero-annotations-theming/quickstart.md` and confirm each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T002 is a **governance gate on US1**.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks US1 and US3** (both read the new content shape). Does not block US2.
- **US2 — Theming (Phase 3)**: Depends only on Setup. Can start immediately alongside Phase 2.
- **US1 — Annotations (Phase 4)**: Depends on Phase 2 (content shape) and T002 (amendment). T026 (per-theme colours) is best verified after US2 lands.
- **US3 — Layout (Phase 5)**: Depends on Phase 2. Touches the same file as US1 (`Hero.tsx`), so run it after US1 to avoid conflicts.
- **US4 — ADR review (Phase 6)**: Depends on all implementation being done.
- **Polish (Phase 7)**: Depends on all stories.

### Within Each User Story

- Tests are written first and must fail before the matching implementation.
- In US1: the wrapper (T024–T026) precedes its use in the hero (T027–T028).
- In US3: layout restructure (T031) precedes card removal (T032) precedes component deletion (T033).

### Parallel Opportunities

- T003 and T004 (two independent ADR files) — after T002
- T011, T012, T013 (US2 tests, separate concerns)
- T021, T022, T023 (US1 tests)
- T029, T030 (US3 tests, same file — coordinate or write together)
- T037, T038 (polish, different concerns)
- **US2 (Phase 3) can run fully in parallel with Phase 2** — different files entirely

---

## Parallel Example: User Story 2

```bash
# Write all three US2 tests first, confirm they fail:
Task: "Precedence test — explicit choice beats OS in tests/integration/theming.test.tsx"
Task: "Persistence test — theme restored on remount in tests/integration/theming.test.tsx"
Task: "Toggle test — accessible label + keyboard operable in tests/unit/components/ThemeToggle.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 2 only)

1. Phase 1: Setup — amendments + dependencies
2. Phase 3: US2 — all four theming defects fixed
3. **STOP and VALIDATE**: toggle works, persists, no flash, whole page responds
4. Deploy — this alone repairs broken advertised functionality and is independently valuable

### Incremental Delivery

1. Setup → governance clear, dependencies in
2. **US2** → theming repaired → validate in both themes → deploy (MVP)
3. Foundational → content schema updated
4. **US1** → annotated hero → validate → deploy
5. **US3** → portrait layout + decluttered hero → validate → deploy
6. US4 + Polish → records verified, contrast and Lighthouse confirmed

### Why US2 before US1 despite equal priority

Both are P1. US2 goes first because it repairs a *regression* rather than adding new surface, it is independent of the content-schema work, and every subsequent visual change has to be checked in both themes — which is only meaningful once switching works.

---

## Notes

- [P] tasks touch different files with no unmet dependencies
- Commit per task or small logical group, using the constitution's format: `<type>(<scope>): <what> — <why>`
- Each ADR should land in the same commit as the change it documents (T002 excepted — it gates the work)
- Reuse `prefersReducedMotion()` from `lib/utils/animations.ts`; do not add a third reduced-motion detection path (ADR 0005 already flags the duplication)
- Stop at any checkpoint to validate a story independently
