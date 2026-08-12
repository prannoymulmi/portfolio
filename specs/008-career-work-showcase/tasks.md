# Tasks: Career & Work Showcase

**Input**: Design documents from `/specs/008-career-work-showcase/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Included — Principle II (Test-First, NON-NEGOTIABLE) requires tests alongside every feature.

**Organization**: Grouped by user story (spec.md priorities). US1 and US2 are both P1 and genuinely
independent — either can ship alone.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete work)
- **[Story]**: Maps to US1/US2/US3 from spec.md
- Every task states its exact file path

## Path Conventions

Single Next.js project, existing structure. Work is under `components/`, `lib/`, `public/data/`,
`app/page.tsx`, `docs/adr/`, and `tests/`.

---

## Phase 1: Setup

**Purpose**: Confirm the assets and data this feature builds on are in place

- [X] T001 Confirm `public/images/mesh-soft.png` and `public/images/mesh-soft-flip.png` exist and
      are readable by `next/image` (added by feature 007, reused here — no new assets needed)
- [X] T002 Read `public/data/projects.json` and note, per entry, which headline number already
      present in its `bodyText` will become the `metric` field (e.g. "99.99% uptime") — no new
      figures may be invented (spec FR-011, research.md)

**Checkpoint**: No dependency install needed — Framer Motion, `next/image`, and Zod are all present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared gradient-overlay component every new/reworked section mounts, plus the
type/schema groundwork. Nothing story-specific here.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Write `tests/unit/components/ChapterGradientOverlay.test.tsx`: assert the overlay
      renders one `next/image` with `aria-hidden="true"` and empty alt, and that its className
      carries both a light opacity and a `dark:opacity-0` cutoff (test MUST fail until T004)
- [X] T004 Create `components/Common/ChapterGradientOverlay.tsx`: a static, absolutely-positioned,
      low-opacity `next/image` wash taking `src` + literal `opacityClassName` props per
      [data-model.md](./data-model.md). Never a CSS `background-image`, never `bg-gradient-to-br`
      (constitution; `backdrop-coverage.test.tsx` guards this) (depends on T003)
- [X] T005 [P] Extend `Project` in `lib/types/portfolio.ts` with optional `year`, `role`, `metric`
      (all `string?`) per [data-model.md](./data-model.md)
- [X] T006 [P] Extend `ProjectSchema` in `lib/utils/validation.ts` with matching
      `z.string().optional()` fields for `year`, `role`, `metric` (depends on T005 conceptually,
      but separate file — safe to run alongside)

**Checkpoint**: Shared overlay exists and is tested; `Project` can carry showcase fields. User
stories can now proceed in parallel.

---

## Phase 3: User Story 1 - See Three Systems Worth Defending (Priority: P1) 🎯 MVP

**Goal**: Replace the Skills section with three real systems, each showing year/name/role/what was
built/stack/metric.

**Independent Test**: Load the page, scroll to the section replacing Skills, confirm three systems
each show company, role, description, stack, and a metric — with no SVG pitch required to see them.

### Tests for User Story 1

- [X] T007 [P] [US1] Write `tests/unit/components/ThreeSystems.test.tsx`: assert exactly three
      systems render from mocked `projects.json` content, each showing title, description, stack
      tags, and `metric`/`role` when present — and that the year badge is **omitted entirely** when
      `year` is absent (test MUST fail until T010)

### Implementation for User Story 1

- [X] T008 [US1] Backfill `year`/`role`/`metric` onto the first three entries of
      `public/data/projects.json`, using only the figures identified in T002. Leave `year` absent
      where no real date exists rather than guessing (depends on T002, T006)
- [X] T009 [P] [US1] Create `components/Work/SystemCard.tsx`: renders one `Project` as a showcase
      entry — year (when present), title, role, description, stack tags, headline metric
- [X] T010 [US1] Create `components/Work/ThreeSystems.tsx`: section headed "Three systems I'd
      happily defend in a design review", rendering the first three `projects.json` entries via
      `SystemCard`, with `ChapterGradientOverlay` (`mesh-soft.png`) inside the chapter scrim, and
      `ProjectsSkeleton`/error handling matching the section it replaces (depends on T007, T009, T004)
- [X] T011 [US1] Swap `SkillsFormation` for `ThreeSystems` in `app/page.tsx`, keeping the
      `id="skills"` anchor so existing `/#skills` links and nav entries do not 404 (depends on T010)
- [X] T012 [US1] Delete `components/Skills/` entirely (`SkillsFormation.tsx`, `SkillPosition.tsx`,
      `SkillCard.tsx`) — nothing else imports them once T011 lands (depends on T011)
- [X] T013 [US1] Remove the now-orphaned skills content path: drop the `skills` loader, context
      field, and type from `components/Common/ContentProvider.tsx`, the `SkillsFileSchema`/
      `SkillCategorySchema`/`SkillSchema` from `lib/utils/validation.ts`, the `SkillsFile`/
      `SkillCategory`/`Skill` types from `lib/types/portfolio.ts`, `SkillsSkeleton` from
      `components/Common/LoadingState.tsx`, and `public/data/skills.json`. Nothing reads any of them
      after T012 — leaving them means a fetch on every page load for data nobody renders
      (depends on T012)
- [X] T014 [US1] Update the section's label from "Skills" to match the new content in
      `components/Navigation/StoryProgressNav.tsx` (`STORY_SECTIONS`) and
      `components/Navigation/Footer.tsx`, and update the corresponding assertions in
      `tests/unit/components/StoryProgressNav.test.tsx` (lines ~53, ~222) and
      `tests/unit/components/Footer.test.tsx` (line ~31). The `#skills` **anchor id stays**; only
      the visible label changes (depends on T011)
- [X] T015 [US1] Run `npm test -- content-sources` and fix any assertion that referenced
      `skills.json`, so the content-source integration test reflects the reduced file set
      (depends on T013)

**Checkpoint**: US1 is independently shippable — the Skills section is gone, three systems are in
its place, and no dead content path remains.

---

## Phase 4: User Story 2 - Pass the Ball to See Where I've Played (Priority: P1)

**Goal**: A click/pass-driven chronological pitch navigator, with play-in-order, working equally on
mobile, plus a plain timeline fallback with no pitch or player marker.

**Independent Test**: Scroll to Career Journey, click two different pitch positions in any order and
confirm each shows its own chapter detail; press "play in order" and confirm chronological stepping;
toggle to the plain timeline and confirm no pitch/marker/play control is present.

### Tests for User Story 2

- [ ] T016 [P] [US2] Write `tests/unit/components/CareerPitch.test.tsx`: assert one pitch marker per
      experience; clicking a marker shows that chapter's company/role/years/achievements; chapters
      are ordered chronologically by parsed `dateText`; "play in order" advances and pause halts
      (test MUST fail until T019/T020)

### Implementation for User Story 2

- [ ] T017 [P] [US2] Extend `components/Career/SVGPitch.tsx` to accept an optional build-up-route
      polyline and ball marker as children/props, without changing its existing rendering for
      current callers
- [ ] T018 [P] [US2] Create `components/Career/ChapterDetail.tsx`: single detail panel for the
      active chapter — company (`subtitle`), role (`title`), years (`dateText`), what was built
      (first `workDescription` entry), achievements (full list), tech tags — per the derived shape
      in [data-model.md](./data-model.md)
- [ ] T019 [US2] Create `components/Career/CareerPitch.tsx`: sorts experiences by parsed `dateText`,
      assigns each a fixed formation slot/coordinate by sorted index (cycling if more chapters than
      slots), renders markers inside `SVGPitch`, tracks the active chapter in state, and drives
      `ChapterDetail`. Click/tap only — no scroll-linked animation (depends on T016, T017, T018)
- [ ] T020 [US2] Add the chronological "play in order" control with pause to `CareerPitch.tsx`,
      stepping earliest→most recent and halting on pause (depends on T019)
- [ ] T021 [US2] Rework `components/Career/CareerJourney.tsx` to orchestrate `CareerPitch` (the
      interactive mode) against the existing `TimelineView` (the plain fallback), keeping the
      existing `TimelineToggle`. The timeline branch must render **no** pitch, marker, or play
      control (spec FR-006) (depends on T019, T020)
- [ ] T022 [US2] Delete `components/Career/PlayerAnimation.tsx` and
      `components/Career/MilestoneCard.tsx`, and drop the `usePlayerAnimation` call and its GSAP
      import path from `CareerJourney.tsx` — the scroll-driven single marker and the per-milestone
      expand/collapse cards are both superseded (depends on T021)
- [ ] T023 [US2] Mount `ChapterGradientOverlay` (`mesh-soft.png`) inside the Career chapter in
      `app/page.tsx` or `CareerJourney.tsx`, consistent with how US1 mounted it (depends on T004, T021)
- [ ] T024 [US2] Rewrite `tests/integration/career-in-story.test.tsx` against the new pitch/detail
      structure — the current test asserts `MilestoneCard`'s `aria-expanded` toggle, which no longer
      exists after T022 (depends on T022)
- [ ] T025 [US2] Verify mobile parity by hand per [quickstart.md](./quickstart.md) step 7: at a
      narrow viewport the pitch and chapter detail must both be present and touch-usable — not
      swapped for a plain list (spec FR-007, SC-003)

**Checkpoint**: US2 is independently shippable — the career pitch works by passing, plays in order,
and the plain timeline fallback survives without the playing part.

---

## Phase 5: User Story 3 - Read the Engineering Principle (Priority: P2)

**Goal**: One pinned parallax section carrying a single engineering-principle statement.

**Independent Test**: Scroll to the new section; confirm the statement appears exactly once, and its
background moves at a visibly different rate than the text. With reduced motion on, confirm it is
fully readable and static.

### Tests for User Story 3

- [ ] T026 [P] [US3] Write `tests/unit/components/PrincipleBand.test.tsx`: assert the statement and
      supporting line render, the background transform output is non-zero with motion allowed, and
      collapses to zero under `prefers-reduced-motion` — mirroring
      `tests/unit/components/HeroParallax.test.tsx`'s mocking pattern (test MUST fail until T029)

### Implementation for User Story 3

- [ ] T027 [P] [US3] Create `public/data/principle.json` with a real `statement` and `supporting`
      line per [data-model.md](./data-model.md)
- [ ] T028 [US3] Add the `PrincipleFile` type to `lib/types/portfolio.ts`, `PrincipleFileSchema` to
      `lib/utils/validation.ts`, and register the loader + context field in
      `components/Common/ContentProvider.tsx` (depends on T027)
- [ ] T029 [US3] Create `components/EngineeringPrinciple/PrincipleBand.tsx`: pinned section rendering
      the statement and supporting line, with background and text on two different scroll-linked
      transform magnitudes via the same `useScroll`/`useTransform` + read-before-first-paint
      reduced-motion pattern `HeroDrift` uses, and `ChapterGradientOverlay` (`mesh-soft-flip.png`)
      (depends on T026, T028, T004)
- [ ] T030 [US3] Mount `<PrincipleBand />` as its own section in `app/page.tsx` between two existing
      chapters. Decide deliberately whether it gets a `STORY_SECTIONS` nav entry in
      `components/Navigation/StoryProgressNav.tsx` — a quote band arguably is not a chapter; if it
      is skipped, note why in a comment so a later reader does not "fix" the omission (depends on T029)

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Governance, guardrails, and the performance floor

- [ ] T031 Write `docs/adr/0020-<slug>.md` recording: the Skills→three-systems swap and removal of
      the skills content path, the `Project` schema extension, and — stated generally, not only for
      this feature — the rule that decorative gradients layer as low-opacity images inside a
      chapter's scrim and never replace the pinned photographic surface (ADR 0015). This closes the
      gap left when feature 007 introduced that technique without recording it. **Required by
      Principle VI in the same PR as this change** (see plan.md Constitution Check)
- [ ] T032 Add `docs/adr/0020-<slug>.md` to the index in `docs/adr/README.md` with its status
      (depends on T031)
- [ ] T033 [P] Extend `tests/integration/backdrop-coverage.test.tsx` to cover the new/reworked
      chapters: still no `bg-gradient-to-br`, no opaque chapter backgrounds, scrim count still
      matches, and `components/Common/Backdrop.tsx` still untouched
- [ ] T034 [P] Run `npm run lint` and `npx tsc --noEmit`; fix anything the deletions in T012/T013/
      T022 left dangling (unused imports, orphaned types)
- [ ] T035 Run the full suite (`npx jest`) and confirm every pre-existing test still passes
      alongside the new ones (depends on T015, T024, T033, T034)
- [ ] T036 Run `npm run build && npm run start`, then Lighthouse against the production build;
      confirm performance ≥90 (constitution floor, spec SC-005)
- [ ] T037 Run [quickstart.md](./quickstart.md) end-to-end — all automated steps plus the ten manual
      visual checks, especially step 10 (surface untouched) and step 9 (reduced motion)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup — **blocks all three stories** (they all mount
  `ChapterGradientOverlay`; US1 also needs the `Project` schema extension)
- **US1 (Phase 3)**, **US2 (Phase 4)**, **US3 (Phase 5)**: all depend only on Foundational, and are
  independent of each other — different components, different data, different page sections
- **Polish (Phase 6)**: depends on whichever stories shipped; T035/T037 need all of them

### Within Each Story

- The test task comes first and must fail before its implementation task
- Deletions come **after** the replacement is mounted (T011→T012, T021→T022), so the page is never
  broken between steps

### Parallel Opportunities

- **Across stories**: once Phase 2 lands, US1, US2, and US3 can be worked simultaneously by
  different people — they share only `app/page.tsx` (T011, T023, T030), which needs coordinating
- **Within Phase 2**: T003 and T005/T006 touch different files
- **Within US1**: T009 (`SystemCard`) is independent of T008 (data backfill)
- **Within US2**: T017 (`SVGPitch`) and T018 (`ChapterDetail`) are independent of each other
- **Within Polish**: T033 and T034 touch different files

---

## Parallel Example: after Foundational completes

```bash
# Three developers, three stories, no shared files except app/page.tsx:
Task: "US1 — ThreeSystems section + Skills removal"
Task: "US2 — CareerPitch navigator + timeline fallback"
Task: "US3 — PrincipleBand parallax section"
```

## Parallel Example: User Story 2 internals

```bash
Task: "Extend SVGPitch with route polyline in components/Career/SVGPitch.tsx"
Task: "Create ChapterDetail panel in components/Career/ChapterDetail.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup (T001–T002)
2. Phase 2: Foundational (T003–T006) — blocks everything
3. Phase 3: US1 (T007–T015)
4. **STOP and VALIDATE**: quickstart steps 1–3; the Skills section is replaced and no dead content
   path remains
5. Ship — this alone delivers the request's first named change

### Incremental Delivery

1. Setup + Foundational → shared overlay and schema ready
2. US1 → three systems replace Skills → validate → ship (MVP)
3. US2 → career pitch + timeline fallback → validate → ship
4. US3 → engineering principle band → validate → ship
5. Polish → ADR recorded, guardrails extended, performance confirmed

**Note on the ADR (T031)**: Principle VI requires it in the *same PR* as the change it justifies. If
US1 ships as its own PR, the ADR — at least the parts covering the Skills removal and schema
extension — ships with it, not deferred to a later PR.

---

## Notes

- `[P]` = different files, no dependency on incomplete work
- The three deletion tasks (T012, T013, T022) are the highest-risk steps; each is deliberately
  sequenced *after* its replacement is live, and T034/T035 exist to catch anything left dangling
- `#skills` anchor is preserved (T011) even though the label changes (T014) — existing external
  links and the footer both point at it
