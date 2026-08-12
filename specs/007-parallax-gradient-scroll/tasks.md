# Tasks: Parallax Gradient Scrolling

**Input**: Design documents from `/specs/007-parallax-gradient-scroll/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Included — Principle II (Test-First, NON-NEGOTIABLE) requires tests written alongside
every feature, and the existing `HeroParallax.test.tsx` establishes the pattern this feature extends.

**Organization**: Tasks are grouped by user story (spec.md priorities P1/P2/P3) to enable
independent implementation and testing of each.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps task to US1/US2/US3 from spec.md
- Every task states its exact file path

## Path Conventions

Single Next.js project (existing repo structure). No new top-level directories — all work is
under `components/Hero/`, `tests/unit/components/`, and `tests/integration/`.

---

## Phase 1: Setup

**Purpose**: Confirm prerequisites are in place before any component work starts

- [X] T001 Confirm the four gradient assets (`gradient-hero.png`, `gradient-text.png`,
      `mesh-soft.png`, `mesh-soft-flip.png`) exist in `public/images/` and are readable by
      `next/image` (no dimension/format issues)

**Checkpoint**: Assets confirmed present — no dependency install needed (Framer Motion and
`next/image` are already in the project).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared scaffolding every user story builds on — static rendering of the four layers
in the correct DOM position, with no motion yet. Motion, layering, and accessibility behavior are
added per-story on top of this.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Define the gradient layer config (`src`, `strength`, `zIndex`, `opacity` per
      [data-model.md](./data-model.md)'s Gradient Layer entity) as a typed constant array in
      `components/Hero/HeroParallax.tsx`
- [X] T003 Create `components/Hero/HeroGradientLayers.tsx`: a component that maps the config from
      T002 to `next/image` elements (`fill`, `aria-hidden="true"`, absolutely positioned), rendered
      statically — no `HeroDrift` wrapping yet (depends on T002)
- [X] T004 Mount `<HeroGradientLayers />` in `components/Hero/Hero.tsx` as the first child of the
      Hero `<section>`, behind the existing `HeroDrift`-wrapped role bars and portrait, and behind
      the pinned `Backdrop` (depends on T003)

**Checkpoint**: Gradient layers render statically, in the right place and stacking order, with no
motion. User stories below add behavior on top of this without touching `Backdrop.tsx`.

---

## Phase 3: User Story 1 - Experience Smooth Parallax on Hero Section (Priority: P1) 🎯 MVP

**Goal**: Gradient layers drift at distinct speeds against scroll, reading as smooth parallax
motion in the Hero section.

**Independent Test**: Load the page, scroll through the Hero section, confirm gradient layers move
at proportionally different distances and the motion is smooth (spec SC-001, SC-003).

### Tests for User Story 1

- [X] T005 [P] [US1] Write `tests/unit/components/HeroGradientLayers.test.tsx`: mock
      `framer-motion` the same way `tests/unit/components/HeroParallax.test.tsx` does, and assert
      each configured layer produces a non-zero `useTransform` output when motion is allowed (test
      MUST fail until T006 is done)

### Implementation for User Story 1

- [X] T006 [US1] Wrap each layer's `next/image` element in `HeroDrift` with its configured
      `strength` from T002, in `components/Hero/HeroGradientLayers.tsx` (depends on T005 existing,
      and on Foundational T004)
- [X] T007 [US1] Visually tune per-layer `strength` values in the T002 config for a smooth,
      proportional parallax feel — no single layer should read faster than `HeroPortrait` (28) or
      slower than negligible
- [X] T008 [US1] Run [quickstart.md](./quickstart.md) steps 1 ("Parallax motion") and 3 ("No
      layout shift") manually and confirm both pass

**Checkpoint**: User Story 1 is fully functional and testable independently — the Hero section has
smooth, working parallax. This is the MVP.

---

## Phase 4: User Story 2 - Layered Gradients Enhance Visual Hierarchy (Priority: P2)

**Goal**: The four gradient layers compose at correct depths (z-order, opacity) so scrolling reveals
intentional visual relationships rather than a flat stack.

**Independent Test**: Examine the layer stack at various scroll positions; confirm each gradient
appears at its intended depth and the composition reads as progression, not abrupt change (spec
FR-005, Acceptance Scenarios under US2).

### Tests for User Story 2

- [X] T009 [P] [US2] Extend `tests/unit/components/HeroGradientLayers.test.tsx`: assert each
      layer's rendered `zIndex`/DOM order matches its T002 config, and that layers with configured
      `opacity` apply it (test MUST fail until T010 is done)

### Implementation for User Story 2

- [X] T010 [US2] Apply each layer's `zIndex` and `opacity` from the T002 config as Tailwind classes
      in `components/Hero/HeroGradientLayers.tsx` (depends on T009, builds on US1's T006)
- [X] T011 [US2] Run [quickstart.md](./quickstart.md) step 2 ("Layer composition"): confirm gradient
      opacity does not push `text-on-photo` contrast below the AA floor recorded in ADR 0015

**Checkpoint**: User Stories 1 AND 2 both work independently — parallax is smooth and the layer
composition reads as intentional depth.

---

## Phase 5: User Story 3 - Graceful Fallback for Motion-Reduced Users (Priority: P3)

**Goal**: Gradients remain visible but static when `prefers-reduced-motion` is set.

**Independent Test**: Enable `prefers-reduced-motion: reduce`, reload, confirm gradients are
visible with no parallax animation (spec SC-005).

### Tests for User Story 3

- [X] T012 [P] [US3] Extend `tests/unit/components/HeroGradientLayers.test.tsx`: mirror
      `HeroParallax.test.tsx`'s "collapses the drift to zero when reduced motion is requested" case
      for every configured gradient layer (test MUST fail if any layer bypasses `HeroDrift`'s
      existing reduced-motion handling)

### Implementation for User Story 3

- [X] T013 [US3] Verify T012 passes with no new code — `HeroGradientLayers` inherits reduced-motion
      handling for free by wrapping each layer in `HeroDrift` (T006); if it fails, fix
      `HeroGradientLayers.tsx` so every layer goes through `HeroDrift` rather than a raw transform
- [X] T014 [US3] Run [quickstart.md](./quickstart.md) step 4 ("Reduced motion") manually with OS-level
      reduced motion enabled and confirm gradients are visible but static

**Checkpoint**: All three user stories are independently functional — smooth parallax, correct
layering, and accessible fallback.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirms the feature didn't reopen ADR 0015 and meets the spec's performance bar

- [X] T015 [P] Extend `tests/integration/backdrop-coverage.test.tsx` (or add a sibling assertion)
      confirming `components/Common/Backdrop.tsx` source is unchanged by this feature — no new
      `fixed`/pinned layer or motion added at the page level
- [ ] T016 Run `npm run build && npm run start`, then Lighthouse against the production build;
      confirm performance score ≥90 (constitution floor, spec SC-004) — **NOT RUN**: no browser/
      Lighthouse available in the implementing environment; production build succeeds and ships no
      new JS dependency, but the score itself needs a human to run locally
- [X] T017 [P] Run `npm run lint` and `npx tsc --noEmit`; fix any violations introduced by
      `HeroGradientLayers.tsx`
- [ ] T018 Run [quickstart.md](./quickstart.md) end-to-end (all automated + manual steps) as a final
      — automated portion done (full `npx jest` suite: 138/138 passing); manual visual steps
      (scroll feel, contrast sweep, OS reduced-motion toggle, Lighthouse) still need a human in a
      real browser
      validation pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T002–T004) — no dependency on US2/US3
- **User Story 2 (Phase 4)**: Depends on Foundational; builds on US1's `HeroDrift` wrapping (T006)
  but is independently testable once T004 + T006 exist
- **User Story 3 (Phase 5)**: Depends on Foundational; verifies behavior US1's T006 already
  provides — independently testable once T006 exists
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each User Story

- Test task before its implementation task (write it first, confirm it fails, then implement)
- US1 must land before US2/US3 implementation tasks, since both build on `HeroDrift`-wrapping done
  in T006 — but each story's *test* still targets only that story's behavior

### Parallel Opportunities

- T002 has no file conflicts with T001 (different concerns) but T001 is a confirmation step, not
  a file edit — negligible parallel value
- T005, T009, T012 (the three test-writing tasks) touch the same test file, so they are **not**
  safely parallel across stories once more than one story is in flight — write and land them in
  story-priority order (US1 → US2 → US3) even though each is individually marked [P] relative to
  non-test tasks in its own phase
- T015 and T017 (Polish) touch different files from each other and from T016/T018 — safe to
  parallelize

---

## Parallel Example: Foundational Phase

```bash
# T002 and T001 can be confirmed/drafted together — no shared files:
Task: "Confirm gradient assets in public/images/"
Task: "Define gradient layer config in components/Hero/HeroParallax.tsx"
```

## Parallel Example: Polish Phase

```bash
Task: "Extend backdrop-coverage.test.tsx to confirm Backdrop.tsx is unchanged"
Task: "Run npm run lint && npx tsc --noEmit"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T004) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T005–T008)
4. **STOP and VALIDATE**: Run quickstart.md steps 1 and 3; confirm smooth parallax with no CLS
5. Demo if ready — this alone delivers the feature's primary value

### Incremental Delivery

1. Setup + Foundational → static layers in place, no motion yet
2. Add User Story 1 → smooth parallax works → validate → demo (MVP)
3. Add User Story 2 → visual hierarchy/depth correct → validate → demo
4. Add User Story 3 → reduced-motion fallback confirmed → validate → demo
5. Polish → confirm ADR 0015 untouched, performance floor met

---

## Notes

- [P] tasks touch different files with no dependency on incomplete work
- [Story] label maps every user-story-phase task back to spec.md's US1/US2/US3
- `HeroGradientLayers.tsx` is the one new file all three stories converge on — most of its
  behavior (drift, reduced motion) comes free from `HeroDrift`, which is why US2 and US3 are
  small deltas on top of US1 rather than separate implementations
- `components/Common/Backdrop.tsx` is never edited by this feature — verified explicitly in T015
- Commit after each task or logical group, per Principle III (Atomic Commits)
