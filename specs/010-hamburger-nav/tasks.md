# Tasks: Minimal Nav with Hamburger Sections

**Input**: Design documents from `/specs/010-hamburger-nav/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — Constitution Principle II (Test-First, NON-NEGOTIABLE)
requires tests written before or alongside every feature.

**Organization**: Tasks are grouped by user story (spec.md) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and relative to the repo root.

## Path Conventions

Single Next.js project. Component: `components/Navigation/`. Tests:
`tests/unit/components/`. No `backend/`/`frontend/` split.

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependencies are needed
(Framer Motion and Tailwind are already installed — plan.md, research.md).

- [ ] T001 Run `npm run type-check && npm run lint && npm run test` on the
      current branch to confirm a clean baseline before changes begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove the inline section-link list from the bar and stand up the
new component both stories build on. No user story can be implemented or
tested until this lands.

**⚠️ CRITICAL**: Complete this phase before any user story work.

- [ ] T002 [P] Create `components/Navigation/HamburgerMenu.tsx`: accepts a
      `sections: { id: string; label: string }[]` prop, renders a toggle
      button (closed by default, no menu-open behavior yet).
- [ ] T003 [P] Create `tests/unit/components/HamburgerMenu.test.tsx` with the
      same `framer-motion` mock pattern used in
      `tests/unit/components/StoryProgressNav.test.tsx`, and one test
      asserting the toggle button renders with the seven `STORY_SECTIONS`
      passed in.
- [ ] T004 Update `components/Navigation/StoryProgressNav.tsx`: replace the
      inline `<nav aria-label="Story sections">` link list (and its overflow
      measurement/mask logic) with
      `<HamburgerMenu sections={STORY_SECTIONS} />`, rendered in the same
      controls area as `SocialIcons`, `EmailLink`, and `ThemeToggle`. Depends
      on T002.
- [ ] T005 Update `tests/unit/components/StoryProgressNav.test.tsx`: remove
      the tests tied to the retired inline scrolling list — "scrolls the
      section links inside itself...", "marks the edge only when...",
      "shows no edge fade...", "drops the edge fade...", "scrolls a focused
      link fully into view..." and the "puts the wordmark first and the
      chapters after it" ordering test — since section links no longer render
      inline. Keep the wordmark, floating-shape, icon-group, and progress
      hairline tests. Depends on T004.

**Checkpoint**: The bar renders wordmark, toggle, and icons only; the old
inline link tests are gone; new component exists but the toggle does not yet
open anything.

---

## Phase 3: User Story 1 - Scan a quiet nav bar (Priority: P1) 🎯 MVP

**Goal**: The nav bar shows only the wordmark, hamburger toggle, and icon
group — no section links inline, at every viewport width.

**Independent Test**: Load the site at any viewport width; confirm no
chapter/section links render inline and the toggle + icon group are visible.

### Tests for User Story 1

- [ ] T006 [P] [US1] Add test to
      `tests/unit/components/StoryProgressNav.test.tsx` asserting none of the
      seven section labels (Introduction, Selected Work, Career Journey,
      Education, Projects, Technical Playbook, Contact) resolve via
      `screen.queryByRole('link', { name: ... })` while the menu is closed
      (FR-001).
- [ ] T007 [P] [US1] Add test to
      `tests/unit/components/StoryProgressNav.test.tsx` asserting the
      wordmark heading, the hamburger toggle, and the social/email/theme
      controls are all present together in one render (FR-001, FR-010).

### Implementation for User Story 1

- [ ] T008 [US1] Style the closed-state toggle button in
      `components/Navigation/HamburgerMenu.tsx` to match the bar's existing
      glass/icon visual language (size, hover, focus-visible ring, `dark:`
      variants), consistent with `SocialIcons.tsx`'s icon styling. Depends on
      T002, T004.

**Checkpoint**: User Story 1 is independently testable and complete — the bar
reads as minimal at every width. This is the MVP slice.

---

## Phase 4: User Story 2 - Reach any chapter from the hamburger menu (Priority: P1)

**Goal**: Opening the toggle reveals all seven section links in their
existing order; selecting one navigates and closes the menu; the menu also
closes on toggle re-activation, Escape, or an outside click.

**Independent Test**: Open the menu, confirm all seven links appear in order,
click one, confirm the page jumps to that anchor and the menu closes.

### Tests for User Story 2

- [ ] T009 [P] [US2] Add test to
      `tests/unit/components/HamburgerMenu.test.tsx`: activating the toggle
      renders all seven links, in order, each with the correct label and
      `href="#<id>"` (FR-002, FR-003).
- [ ] T010 [P] [US2] Add test to
      `tests/unit/components/HamburgerMenu.test.tsx`: clicking a link closes
      the menu (FR-004).
- [ ] T011 [P] [US2] Add test to
      `tests/unit/components/HamburgerMenu.test.tsx`: re-activating the
      toggle, pressing Escape, and a `pointerdown` outside the panel each
      close the menu without navigating (FR-005).

### Implementation for User Story 2

- [ ] T012 [US2] Implement open/closed state and the `AnimatePresence`/
      `motion.div` menu panel rendering `sections` as links in
      `components/Navigation/HamburgerMenu.tsx`. Depends on T002.
- [ ] T013 [US2] Implement close-on-link-select in
      `components/Navigation/HamburgerMenu.tsx`. Depends on T012.
- [ ] T014 [US2] Implement close-on-outside-click via a `document`
      `pointerdown` listener (checking target against panel/toggle refs with
      `.contains()`), attached only while open, in
      `components/Navigation/HamburgerMenu.tsx`. Depends on T012.
- [ ] T015 [US2] Implement close-on-Escape via a `document` `keydown`
      listener, attached only while open, in
      `components/Navigation/HamburgerMenu.tsx`. Depends on T012.
- [ ] T016 [US2] Branch open/close motion on `prefersReducedMotion()` from
      `lib/utils/animations.ts` (instant show/hide instead of the Framer
      Motion transition) in `components/Navigation/HamburgerMenu.tsx`.
      Depends on T012.

**Checkpoint**: User Stories 1 and 2 both work independently — the bar is
minimal and the menu is fully usable by mouse/touch.

---

## Phase 5: User Story 3 - Operate the menu without a mouse (Priority: P2)

**Goal**: The hamburger control and menu are fully keyboard- and
screen-reader-operable: correct accessible name/state, focus moves into the
menu on open and back to the toggle on close.

**Independent Test**: Tab to the toggle, open with Enter/Space, confirm focus
moves into the menu, Tab cycles through its links, Escape closes it and
returns focus to the toggle.

### Tests for User Story 3

- [ ] T017 [P] [US3] Add test to
      `tests/unit/components/HamburgerMenu.test.tsx`: pressing Enter or Space
      on the focused toggle opens the menu and moves focus to the first link
      (FR-007).
- [ ] T018 [P] [US3] Add test to
      `tests/unit/components/HamburgerMenu.test.tsx`: closing the menu (via
      Escape, outside click, or re-activating the toggle) returns focus to
      the toggle button (FR-007).
- [ ] T019 [P] [US3] Add test to
      `tests/unit/components/HamburgerMenu.test.tsx`: the toggle exposes
      `aria-expanded` reflecting open/closed state and an accessible name
      identifying it as a menu control (FR-006).

### Implementation for User Story 3

- [ ] T020 [US3] Add `aria-expanded`, `aria-haspopup`, and `aria-label` to the
      toggle button in `components/Navigation/HamburgerMenu.tsx`. Depends on
      T012.
- [ ] T021 [US3] Move focus to the first menu link on open (`useEffect` keyed
      on the open flag, using a ref on the first link) in
      `components/Navigation/HamburgerMenu.tsx`. Depends on T012.
- [ ] T022 [US3] Return focus to the toggle button ref whenever the menu
      closes, from any close path (link select, outside click, Escape,
      re-activation) in `components/Navigation/HamburgerMenu.tsx`. Depends on
      T013, T014, T015.

**Checkpoint**: All three user stories are independently functional — the nav
is minimal, fully mouse-operable, and fully keyboard/screen-reader-operable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases from spec.md not owned by a single story, plus final
validation.

- [ ] T023 [P] Add test to `tests/unit/components/HamburgerMenu.test.tsx`:
      the menu closes when the viewport resizes past a breakpoint (Edge
      Cases).
- [ ] T024 Implement a resize listener that closes the open menu on
      breakpoint change in `components/Navigation/HamburgerMenu.tsx`. Depends
      on T012.
- [ ] T025 [P] Add test to `tests/unit/components/HamburgerMenu.test.tsx`:
      keyboard focus does not leave the open menu silently — Tab past the
      last link lands at a definite next stop (wraps to the first link or the
      toggle) (Edge Cases).
- [ ] T026 Implement the focus-boundary behavior for T025 in
      `components/Navigation/HamburgerMenu.tsx`. Depends on T021.
- [ ] T027 [P] Add test to `tests/unit/components/HamburgerMenu.test.tsx`:
      passing an empty `sections` array still renders a working (if empty)
      toggle/menu rather than breaking (Edge Cases — content not yet loaded).
- [ ] T028 Run `specs/010-hamburger-nav/quickstart.md` end to end: manual
      viewport check, keyboard/screen-reader pass, reduced-motion pass, and a
      production Lighthouse run confirming the score stays ≥ 90 (SC-004).
- [ ] T029 Run `npm run type-check && npm run lint && npm run test` and
      confirm everything passes before opening the change for review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational only.
- **User Story 2 (Phase 4)**: Depends on Foundational only; independent of
  US1's styling task (T008) but shares `HamburgerMenu.tsx`, so within-file
  edits are sequential (see below).
- **User Story 3 (Phase 5)**: Depends on Foundational and on US2's T012–T015
  (needs the open/close paths to attach focus behavior to).
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3 — can ship alone as the MVP
  (toggle present, no inline links; toggle need not open anything yet).
- **US2 (P1)**: No dependency on US1's specific styling; both touch
  `HamburgerMenu.tsx`, so implementation tasks across the two stories are not
  file-parallel even though they are logically independent.
- **US3 (P2)**: Builds on US2's open/close state machine (T012–T015) to wire
  in focus management; cannot be implemented before US2's core state exists.

### Within Each User Story

- Tests are written before their corresponding implementation task and
  should fail first.
- Story is complete and checkpointed before moving to the next priority.

### Parallel Opportunities

- T002 and T003 (Phase 2) touch different files and can run in parallel.
- Within US1: T006 and T007 (different assertions, same test file — safe to
  draft in parallel, sequential to commit).
- Within US2: T009, T010, T011 are independent test additions to the same new
  file — draft in parallel, land as one commit.
- Within US3: T017, T018, T019 likewise.
- T023, T025, T027 (Polish tests) are independent additions and can be
  drafted in parallel.
- Implementation tasks inside `HamburgerMenu.tsx` (T012–T016, T020–T022,
  T024, T026) are **not** file-parallel — apply sequentially per the stated
  dependencies even where no `[P]` marker conflict is implied by story
  grouping alone.

---

## Parallel Example: Foundational Phase

```bash
Task: "Create components/Navigation/HamburgerMenu.tsx toggle shell"
Task: "Create tests/unit/components/HamburgerMenu.test.tsx with framer-motion mock"
```

## Parallel Example: User Story 2 tests

```bash
Task: "Test: menu lists all seven links in order in tests/unit/components/HamburgerMenu.test.tsx"
Task: "Test: selecting a link closes the menu in tests/unit/components/HamburgerMenu.test.tsx"
Task: "Test: toggle/Escape/outside-click close the menu in tests/unit/components/HamburgerMenu.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — bar is already
   minimal at this point, toggle renders inert.
2. Complete Phase 3 (US1) — styled, tested minimal bar.
3. **STOP and VALIDATE**: confirm no inline links at any width.
4. This is a legitimate, demoable MVP even before the menu opens, since US1's
   acceptance criteria only requires presence, not function.

### Incremental Delivery

1. Setup + Foundational → bar is minimal, toggle inert.
2. Add US1 → styled toggle → validate → demo (MVP).
3. Add US2 → menu opens, lists links, navigates, closes → validate → demo.
4. Add US3 → full keyboard/screen-reader support → validate → demo.
5. Polish → edge cases, quickstart, full suite green.

### Single-Implementer Note

Because Phases 3–5 share `components/Navigation/HamburgerMenu.tsx`, a solo
implementer should work them in phase order (US1 → US2 → US3) rather than
interleaving, even though each phase is independently testable once reached.

---

## Notes

- [P] tasks touch different files or independent, non-conflicting regions of
  a shared test file — never the same region of `HamburgerMenu.tsx`.
- [Story] labels map every user-story-phase task to spec.md's US1/US2/US3.
- Tests are written to fail first, then made to pass by the paired
  implementation task.
- Commit after each task or logical group (Constitution III: atomic
  commits, `<type>(<scope>): <what> — <why>`).
- Stop at any checkpoint to validate a story independently before continuing.
