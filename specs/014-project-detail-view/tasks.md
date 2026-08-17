# Tasks: Featured Project Detail View

**Input**: Design documents from `/specs/014-project-detail-view/`

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

Single Next.js project. Components: `components/Projects/`. Tests:
`tests/unit/components/`. No `backend/`/`frontend/` split.

---

## Phase 1: Setup

**Purpose**: Confirm the environment is ready; no new dependency is needed
(Framer Motion is already installed — plan.md, research.md).

- [X] T001 Run `npm run type-check && npm run lint && npm test` on the
      current branch to confirm a clean baseline before changes begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stand up the modal's structural shell (portal, backdrop, dialog
semantics, open/close plumbing, focus handling, reduced motion) and wire it
into `ProjectGallery`'s existing `selectedProjectId` state. No user story's
content or behavior can be tested until this exists.

**⚠️ CRITICAL**: Complete this phase before any user story work.

- [X] T002 [P] Create `components/Projects/ProjectDetailModal.tsx`: accepts
      `project: Project | null` and `onClose: () => void`; renders nothing
      when `project` is `null`. Follows the `HamburgerMenu.tsx` pattern —
      `createPortal` to `document.body` (gated on a `mounted` flag set in
      `useEffect`, per the same hydration-mismatch reasoning), a dimmed
      backdrop `div`, and an `AnimatePresence` + `motion.div` panel with
      `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the
      rendered project title. For now render only the title inside the panel
      — content tasks come in US1.
- [X] T003 [P] Create `tests/unit/components/ProjectDetailModal.test.tsx`
      with the same `framer-motion` + `prefersReducedMotion` mock pattern
      used in `tests/unit/components/HamburgerMenu.test.tsx`, and one test
      asserting the modal renders nothing when `project` is `null` and
      renders the dialog with the project's title when `project` is set.
- [X] T004 Implement close plumbing in
      `components/Projects/ProjectDetailModal.tsx`: an explicit close
      button, `Escape` key, and outside click/backdrop click all call
      `onClose` (mirrors `HamburgerMenu.tsx`'s `handleKeyDown`/
      `handlePointerDown` listeners, attached only while `project` is set).
      Depends on T002.
- [X] T005 Implement focus trap and scroll lock in
      `components/Projects/ProjectDetailModal.tsx`: on open, move focus into
      the panel and lock `document.body` scroll (e.g. toggling an
      `overflow-hidden` class); trap `Tab`/`Shift+Tab` inside the panel's
      focusable elements (mirrors `HamburgerMenu.tsx`'s `onKeyDown` Tab
      handler); restore body scroll on close. Depends on T002.
- [X] T006 Branch open/close motion on `prefersReducedMotion()` from
      `lib/utils/animations.ts` (instant show/hide instead of the Framer
      Motion transition) in `components/Projects/ProjectDetailModal.tsx`.
      Depends on T002.
- [X] T007 Update `components/Projects/ProjectGallery.tsx`: capture
      `document.activeElement` as the triggering element when
      `selectedProjectId` is set, render
      `<ProjectDetailModal project={...} onClose={...} />` (looking up the
      selected project from `projectList` by id/index, matching the existing
      `project.id || idx.toString()` key logic), and on close clear
      `selectedProjectId` and refocus the captured triggering element.
      Depends on T002.

**Checkpoint**: Clicking a project card opens an empty-but-functional modal
(title only) that closes via all three paths, traps focus, locks scroll, and
respects reduced motion. No story's actual content ships yet.

---

## Phase 3: User Story 1 - Read a project's full description (Priority: P1) 🎯 MVP

**Goal**: Opening a project's modal shows its complete description, with no
truncation, plus its tags and optional role/metric.

**Independent Test**: Click/tap a featured project card and confirm the full,
untruncated description is readable, with no further action required.

### Tests for User Story 1

- [X] T008 [P] [US1] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting the modal renders a project's complete `bodyText` verbatim,
      with no `line-clamp` class and no truncation (FR-002).
- [X] T009 [P] [US1] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting `role` and `metric` render when present and are omitted
      (no empty label) when absent (Edge Cases).
- [X] T010 [P] [US1] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting Escape closes the modal and returns focus to the element
      that had focus before it opened (FR-004, FR-005).
- [X] T011 [P] [US1] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting Tab cycles only among the modal's own focusable elements
      while it is open (FR-005).
- [X] T012 [P] [US1] Add test to `tests/unit/components/ProjectCard.test.tsx`
      asserting a card click and an Enter/Space keypress on a focused card
      both invoke `onSelect` (confirms the existing handler still opens the
      modal path) (FR-001).

### Implementation for User Story 1

- [X] T013 [US1] Render the full `project.bodyText`, `project.tags`, and
      (conditionally) `project.role`/`project.metric` inside the panel body
      in `components/Projects/ProjectDetailModal.tsx`, styled with the
      `text-on-photo` token for contrast over the page's photo surface
      (Constitution IV — Surface). Depends on T002.
- [X] T014 [US1] Confirm `components/Projects/ProjectCard.tsx`'s existing
      `line-clamp-3` truncation on `bodyText` is intentionally left as the
      card's own summary (the fix is the modal, not the card — spec
      Assumptions) — no code change expected; note in the task if the
      review finds otherwise. Depends on T013.

**Checkpoint**: User Story 1 is independently testable and complete — every
featured project's full description is one click away, keyboard-operable,
and reduced-motion-safe. This is the MVP slice.

---

## Phase 4: User Story 2 - Go to the project on GitHub (Priority: P2)

**Goal**: The open modal shows a clearly labeled link to the project's GitHub
repository, opening in a new tab.

**Independent Test**: Open a project's modal and confirm a clearly labeled
GitHub link is visible and opens the repository in a new tab.

### Tests for User Story 2

- [X] T015 [P] [US2] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting the modal renders a link whose `href` is the first
      `project.links` entry containing `github.com` (FR-003).
- [X] T016 [P] [US2] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting that when no `links` entry contains `github.com`, the modal
      falls back to `project.links[0]` (research.md decision).
- [X] T017 [P] [US2] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting the resolved link has `target="_blank"` and
      `rel="noopener noreferrer"` (FR-003).

### Implementation for User Story 2

- [X] T018 [US2] Implement the GitHub-link resolution (first `links` entry
      whose `route` contains `github.com`, else `links[0]`) and render it as
      a clearly labeled, visually prominent link (e.g. "View on GitHub ↗"
      using an inline SVG external-link glyph, not `react-icons` —
      Constitution IV) inside
      `components/Projects/ProjectDetailModal.tsx`. Depends on T013.

**Checkpoint**: User Stories 1 and 2 both work independently — the modal
reads well and offers one clear path to the code behind it.

---

## Phase 5: User Story 3 - Discover there are more projects on GitHub (Priority: P3)

**Goal**: A low-emphasis link near the gallery's heading points to the full
GitHub profile, without outranking any featured project visually.

**Independent Test**: View the projects gallery (modal open or closed) and
confirm a subtle, secondary link to the GitHub profile is present near the
section heading.

### Tests for User Story 3

- [X] T019 [P] [US3] Add test to `tests/unit/components/ProjectGallery.test.tsx`
      asserting a link to `https://github.com/prannoymulmi` renders near the
      "Featured Projects" heading, with `target="_blank"` and
      `rel="noopener noreferrer"` (FR-007, FR-008).
- [X] T020 [P] [US3] Add test to `tests/unit/components/ProjectGallery.test.tsx`
      asserting the profile link's accessible text communicates a curated
      subset (e.g. contains "More on GitHub" or similar wording), distinct
      from any per-project GitHub link's text (FR-008).

### Implementation for User Story 3

- [X] T021 [US3] Add the low-emphasis GitHub profile link
      (`https://github.com/prannoymulmi`, `text-sm text-on-photo/70` or
      equivalent secondary-weight styling, positioned beside/below the
      "Featured Projects" heading, outside the project grid) in
      `components/Projects/ProjectGallery.tsx`. Independent of T002–T018 —
      no dependency on the modal.

**Checkpoint**: All three user stories are independently functional — full
descriptions are readable, each links out to its repo, and the gallery
low-key signals there's more on GitHub.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases from spec.md not owned by a single story, plus final
validation.

- [X] T022 [P] Add test to `tests/unit/components/ProjectGallery.test.tsx`
      asserting only one modal is ever open at a time — clicking a second
      card while a modal is open replaces the shown project rather than
      stacking a second modal (Edge Cases).
- [X] T023 [P] Add test to `tests/unit/components/ProjectDetailModal.test.tsx`
      asserting the modal and its controls (close button, GitHub link) stay
      present and reachable after a simulated viewport resize while open
      (Edge Cases).
- [ ] T024 Run `specs/014-project-detail-view/quickstart.md` end to end:
      manual click-through, keyboard-only pass, reduced-motion pass, and a
      production Lighthouse check confirming the score stays ≥ 90
      (Constitution Technology & Quality Constraints). NOT completed by the
      coder agent — this requires a manual browser/Lighthouse pass outside
      this environment; flagging for a human or follow-up session to run.
- [X] T025 Run `npm run type-check && npm run lint && npm test && npm run build`
      and confirm everything passes before opening the change for review.
      All four commands pass (type-check: clean; lint: clean; test: 36
      suites / 252 tests passed; build: compiled successfully).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS User Stories 1 and 2.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational and on US1's T013
  (renders inside the same panel body).
- **User Story 3 (Phase 5)**: Depends on Setup only — no dependency on
  Foundational, US1, or US2; touches a different file
  (`ProjectGallery.tsx`'s header, not the modal) and can be built in
  parallel with Phases 2–4.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2) only — the MVP slice.
- **US2 (P2)**: Depends on Foundational and US1's T013 (both render inside
  `ProjectDetailModal.tsx`'s panel body); logically independent content, but
  not file-parallel with US1's implementation task.
- **US3 (P3)**: Fully independent of US1/US2 and the modal entirely — could
  ship first, last, or in parallel.

### Within Each User Story

- Tests are written before their corresponding implementation task and
  should fail first.
- Story is complete and checkpointed before moving to the next priority.

### Parallel Opportunities

- T002 and T003 (Phase 2) touch different files and can run in parallel.
- Within US1: T008–T012 are independent test additions (two different test
  files) — draft in parallel, land as one commit per file.
- Within US2: T015, T016, T017 are independent assertions in the same new
  test file — draft in parallel, land as one commit.
- Within US3: T019, T020 likewise.
- T022 and T023 (Polish tests) are independent additions and can be drafted
  in parallel.
- **US3 (T019–T021) can be implemented in parallel with Phases 2–4 entirely**
  — different file, no shared state.
- Implementation tasks inside `ProjectDetailModal.tsx` (T002, T004–T006,
  T013, T018) are **not** file-parallel — apply sequentially per the stated
  dependencies even where no `[P]` marker conflict is implied by story
  grouping alone.

---

## Parallel Example: Foundational Phase

```bash
Task: "Create components/Projects/ProjectDetailModal.tsx shell"
Task: "Create tests/unit/components/ProjectDetailModal.test.tsx with framer-motion mock"
```

## Parallel Example: User Story 1 tests

```bash
Task: "Test: modal renders full bodyText with no truncation in tests/unit/components/ProjectDetailModal.test.tsx"
Task: "Test: role/metric omitted when absent in tests/unit/components/ProjectDetailModal.test.tsx"
Task: "Test: Escape closes and restores focus in tests/unit/components/ProjectDetailModal.test.tsx"
Task: "Test: Tab stays trapped inside the modal in tests/unit/components/ProjectDetailModal.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — modal opens and
   closes but shows only a title.
2. Complete Phase 3 (US1) — full description, tags, role/metric, keyboard
   and reduced-motion support.
3. **STOP and VALIDATE**: click through every project card, confirm no
   truncated text remains.
4. This is a legitimate, demoable MVP — the core complaint (truncated "...")
   is fixed even before the GitHub link or profile link exist.

### Incremental Delivery

1. Setup + Foundational → modal plumbing exists, shows a title only.
2. Add US1 → full descriptions readable → validate → demo (MVP).
3. Add US2 → GitHub link in the modal → validate → demo.
4. Add US3 → low-key profile link in the gallery → validate → demo.
5. Polish → edge cases, quickstart, full suite green.

### Single-Implementer Note

Because Phases 2–4 share `components/Projects/ProjectDetailModal.tsx`, work
them in phase order (Foundational → US1 → US2). US3 touches only
`ProjectGallery.tsx`'s header and can be done whenever convenient — before,
after, or interleaved with the others.

---

## Notes

- [P] tasks touch different files, or independent non-conflicting regions of
  a shared test file — never the same region of `ProjectDetailModal.tsx`.
- [Story] labels map every user-story-phase task to spec.md's US1/US2/US3.
- Tests are written to fail first, then made to pass by the paired
  implementation task.
- Commit after each task or logical group (Constitution III: atomic commits,
  `<type>(<scope>): <what> — <why>`).
- Stop at any checkpoint to validate a story independently before continuing.
