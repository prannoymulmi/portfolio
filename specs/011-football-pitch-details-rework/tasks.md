---
description: "Task list for the Football Pitch Interaction Rework"
---

# Tasks: Football Pitch Interaction Rework

**Input**: Design documents from `/specs/011-football-pitch-details-rework/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md.
No `contracts/` — this feature exposes no API or serialized payload (plan.md
§Project Structure).

**Tests**: REQUIRED, not optional. Constitution v1.4.0 Principle II
(Test-First) is NON-NEGOTIABLE: "Tests MUST be written before or alongside
every feature. No feature is considered complete without passing tests." Every
story phase below therefore opens with its tests.

**Organization**: Tasks are grouped by user story so each story can be
implemented, tested, and demoed on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Every task names an exact file path

## Path Conventions

Single Next.js app at the repository root (plan.md §Structure Decision):

- Components: `components/Career/`, read-only reference `components/Work/SystemCard.tsx`
- Shared helpers: `lib/utils/animations.ts` (consumed, not modified)
- Tests: `tests/unit/` — Jest + Testing Library, run with `npm test`
  (`jest.config.js`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the working tree and the automated gates are green before
any change lands, so later failures are attributable to this feature.

- [x] T001 Confirm the branch is `feat/football-pitch-rework` and dependencies are installed with `npm install --legacy-peer-deps` per ADR 0007, as stated in specs/011-football-pitch-details-rework/quickstart.md
- [x] T002 Establish the pre-change baseline by running `npm run type-check`, `npm run lint`, and `npm test` from the repository root and recording that all three pass
- [x] T003 [P] Capture the SC-003 height baseline: with `npm run dev` running, measure the rendered height of the current `ChapterDetail` panel for the AViV chapter at a fixed viewport width and record the number in specs/011-football-pitch-details-rework/quickstart.md item 3.3

**Checkpoint**: Gates green, baseline height recorded — implementation may begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared derivations in `components/Career/chapters.ts`
(`displayName`, `abbreviation`, `builtSummary`, partitioned `achievements`,
`DEFAULT_TECH` fallback). US2 and US3 both read these fields, so they are
built once, first, and unit-tested directly per research R3.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Write the failing table-driven unit test for `toDisplayName` in tests/unit/career/chapters.test.ts, covering all five shipped companies from data-model.md §2 (`Clansweb.de`, `Lustita Limited`, `Novomind AG`, `Otto GmbH & Co KG`, `AViV GmbH (Formerly Immowelt GmbH) ` with its trailing space) plus the empty-result fallback invariant
- [x] T005 [P] Write the failing table-driven unit test for `toAbbreviation` in tests/unit/career/chapters.test.ts asserting `CLAN`, `LUST`, `NOVO`, `OTTO`, `AVIV` and the 1–4-character uppercase invariant from data-model.md §1
- [x] T006 Write the failing unit test for `toChapters` field derivation in tests/unit/career/chapters.test.ts asserting `builtSummary === workDescription[0]`, `achievements === workDescription.slice(1)`, `tech` falling back to `DEFAULT_TECH` when `technologies` is absent or empty, and `tech` preserving `technologies` when present (data-model.md §1, §3)
- [x] T007 Implement `toDisplayName(company: string): string` as an exported pure function in components/Career/chapters.ts following the four derivation steps in data-model.md §2 (strip parentheticals, repeatedly strip trailing legal-form tokens, collapse whitespace and trim, fall back to `company.trim()`)
- [x] T008 Implement `toAbbreviation(displayName: string): string` as an exported pure function in components/Career/chapters.ts (`split(/\s+/)[0].slice(0, 4).toUpperCase()`)
- [x] T009 Add the module-level `DEFAULT_TECH` constant `['AWS', 'Java', 'Terraform', 'TypeScript']` to components/Career/chapters.ts with a comment naming FR-012 and clarification 2 as its reason (data-model.md §3)
- [x] T010 Extend the `CareerChapter` interface in components/Career/chapters.ts with `displayName: string`, `abbreviation: string`, and `builtSummary: string`, keeping `company` as the unshortened value
- [x] T011 Wire the derivations into `toChapters` in components/Career/chapters.ts: set `displayName`/`abbreviation` from T007/T008, `builtSummary` from `workDescription[0]`, `achievements` from `workDescription.slice(1)`, and `tech` from `technologies` or `DEFAULT_TECH`
- [x] T012 Run `npm test -- chapters` and confirm T004–T006 now pass

**Checkpoint**: Derivations exist and are proven by unit tests — US1–US4 can proceed.

---

## Phase 3: User Story 1 - Selecting a chapter feels smooth, not like a UI state toggle (Priority: P1) 🎯 MVP

**Goal**: The browser-default focus outline stops appearing on click; a single
small ball travels from the previously active player to the new one and
settles; the travel is skipped under `prefers-reduced-motion`; a mid-flight
selection retargets the same ball rather than queuing a second.

**Independent Test**: Click through several players in sequence — exactly one
travelling ball moves between them, no browser-default outline appears, and the
panel updates without waiting for the ball.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [US1] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting exactly one ball marker element (queried by a `data-testid="pitch-ball"`) is rendered on the pitch, both at mount and after selecting a different chapter (FR-002, SC-002)
- [x] T014 [US1] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting the ball marker is decorative — it carries no `role`, is absent from the accessible tree, and is `pointer-events-none` (data-model.md §4)
- [x] T015 [US1] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting the detail panel switches to the newly selected chapter synchronously on click, without waiting on any animation (Acceptance Scenario 1.1)
- [x] T016 [US1] Add a failing test to tests/unit/components/CareerPitch.test.tsx that mocks `prefersReducedMotion` from `@/lib/utils/animations` to return `true` and asserts the ball is still rendered at the active coordinates but with a zero-duration transition (FR-003)
- [x] T017 [US1] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting each player `<g>` still exposes `role="button"`, `tabIndex={0}`, and its chapter/company/role `aria-label`, and is selectable by both Enter and Space after the focus rework (FR-010, edge case)

### Implementation for User Story 1

- [x] T018 [US1] Read `prefersReducedMotion()` once in components/Career/CareerPitch.tsx via a lazy `useState` initializer guarded for SSR, matching the pattern already used in components/Navigation/StoryProgressNav.tsx and components/Navigation/HamburgerMenu.tsx (research R2)
- [x] T019 [US1] Render one `motion.circle` ball marker from `framer-motion` inside the `SVGPitch` children in components/Career/CareerPitch.tsx — placed after the route polyline and before the player group, `animate={{ cx: active.x, cy: toPitchY(active.y) }}`, `r` around 1.4 so it is visibly smaller than a player dot, `data-testid="pitch-ball"`, `pointer-events-none`, no `role` (research R1, FR-002, FR-004)
- [x] T020 [US1] Set the ball's transition in components/Career/CareerPitch.tsx to a single ~0.5s ease-out tween, dropping to `{ duration: 0 }` when the reduced-motion flag from T018 is true (FR-003, plan.md §Performance Goals)
- [x] T021 [US1] Apply `focus:outline-none focus-visible:outline-none` to each player `<g>` in components/Career/CareerPitch.tsx to remove the click-induced browser default ring, with a comment recording that `focus:` (not only `focus-visible:`) is what FR-001 requires (research R4 part 1)
- [x] T022 [US1] Draw the keyboard focus indicator inside the SVG in components/Career/CareerPitch.tsx — an unfilled stroked `<circle>` at a radius outside both dot and halo, tracked with `onFocus`/`onBlur` plus `event.currentTarget.matches(':focus-visible')` so it appears for keyboard focus only and stays visually distinct from the orange halo (research R4 part 2, FR-001)
- [x] T023 [US1] Run `npm test -- CareerPitch` and confirm T013–T017 pass with the pre-existing CareerPitch assertions still green

**Checkpoint**: US1 is independently demoable — selection reads as a pass, not a toggle.

---

## Phase 4: User Story 2 - The pitch identifies who each player is, at a glance (Priority: P1)

**Goal**: Every player shows its order number, the derived abbreviation beneath
the number, and the shortened company display name on the field, with no
overlap at any pitch size.

**Independent Test**: Load the pitch without clicking — every player shows
number, abbreviation, and company name.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T024 [P] [US2] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting that with no interaction, every chapter renders its order number, its abbreviation, and its shortened display name as SVG text on the pitch (FR-005, SC-001)
- [x] T025 [P] [US2] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting the on-pitch label uses the shortened `displayName` (e.g. `Otto`, `AViV`) while the pill list and the detail panel heading keep the full `company` string (spec Key Entities, clarification 4)
- [x] T026 [P] [US2] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting the number, abbreviation, and name labels are `pointer-events-none` and not separately focusable, so they cannot intercept a click on the player `<g>` (FR-010, quickstart K.4)

### Implementation for User Story 2

- [x] T027 [US2] Render the abbreviation as an SVG `<text>` directly beneath the order number inside each player group in components/Career/CareerPitch.tsx — centred on the player's x, `textAnchor="middle"`, offset roughly 3.4 units below centre, small font size, `pointer-events-none select-none` (research R6, FR-005)
- [x] T028 [US2] Render the shortened company `displayName` as an SVG `<text>` below the abbreviation in components/Career/CareerPitch.tsx — centred on the player's x, offset roughly 6.5 units below centre, ~2.2 font units, `pointer-events-none select-none` (research R6, FR-005)
- [x] T029 [US2] Give the new abbreviation and name labels active/played/unplayed fill treatments in components/Career/CareerPitch.tsx consistent with the existing number's contrast reasoning, keeping literal hex values with the existing comment about SVG presentation attributes not resolving CSS custom properties
- [x] T030 [US2] Verify by inspection against the `FORMATION` coordinates in components/Career/chapters.ts that no label can collide at any pitch size, and record the ≥6-unit-x / ≥20-unit-y spacing argument as a comment in components/Career/CareerPitch.tsx (FR-006, research R6)
- [x] T031 [US2] Run `npm test -- CareerPitch` and confirm T024–T026 pass

**Checkpoint**: US1 AND US2 both work — the pitch is legible and selection is smooth.

---

## Phase 5: User Story 3 - The chapter detail panel matches the showcase's compact style (Priority: P2)

**Goal**: `ChapterDetail` adopts the `SystemCard` section pattern — "What I
built" summary, achievements list, technology tags — at tighter vertical
rhythm, with the `DEFAULT_TECH` fallback visible and nothing truncated.

**Independent Test**: Compare the reworked panel against a Work showcase card —
matching section structure, visibly tighter rhythm, every achievement and tag
still present.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T032 [P] [US3] Create tests/unit/components/ChapterDetail.test.tsx with a failing test asserting the panel renders a "What I built" summary section, an achievements list, and a technologies list for a chapter fixture (FR-008, Acceptance Scenario 3.1)
- [x] T033 [P] [US3] Add a failing test to tests/unit/components/ChapterDetail.test.tsx asserting that for a six-entry `workDescription` fixture, the summary plus the achievement bullets account for all six lines with none duplicated and none missing (FR-009, quickstart 3.2)
- [x] T034 [P] [US3] Add a failing test to tests/unit/components/ChapterDetail.test.tsx asserting a chapter with no recorded technologies renders exactly the four `DEFAULT_TECH` tags rather than an empty section (FR-012, Acceptance Scenario 3.3)
- [x] T035 [P] [US3] Add a failing test to tests/unit/components/ChapterDetail.test.tsx asserting the panel heading shows the full `company` name, not the shortened on-pitch `displayName` (quickstart 3.5)
- [x] T036 [US3] Update the fixtures and assertions in tests/unit/components/CareerPitch.test.tsx that assume `achievements` is the whole `workDescription` array, since `workDescription[0]` now becomes `builtSummary` (data-model.md §1) — checked: no fixture relied on that assumption, all 16 CareerPitch tests already passed unchanged
- [x] T037 [US3] Restructure components/Career/ChapterDetail.tsx to the section mapping in data-model.md §6 — `years` in the mono rail position, full `company` as the heading, primary-tinted `role`, `builtSummary` as body copy under a "What I built" label, achievements bulleted list, `tech` tags — using components/Work/SystemCard.tsx as the read-only structural reference
- [x] T038 [US3] Render the technologies as `label-mono rounded-full border border-border px-3 py-1 text-xs` pills in components/Career/ChapterDetail.tsx, matching the showcase tag pattern in components/Work/SystemCard.tsx, and give the list an `aria-label` naming the chapter (FR-008)
- [x] T039 [US3] Tighten the vertical rhythm in components/Career/ChapterDetail.tsx from the current `p-7` / `mt-6` / `mt-4` scale toward the showcase's tighter steps, without truncating or hiding any achievement or tag (FR-009, SC-003)
- [x] T040 [US3] Re-measure the AViV panel height against the T003 baseline at the same viewport width and confirm the reworked panel is the same height or shorter (SC-003, quickstart 3.3) — 487px vs 518px baseline; first attempt (589.5px) failed and was corrected, see quickstart.md
- [x] T041 [US3] Run `npm test -- ChapterDetail CareerPitch` and confirm T032–T036 pass

**Checkpoint**: US1, US2 AND US3 all work independently — panel now reads as one design system with the showcase.

---

## Phase 6: User Story 4 - A short tip explains how to use the pitch (Priority: P3)

**Goal**: One short static line below the pitch tells a first-time visitor that
players are clickable and how to step between chapters.

**Independent Test**: Load the section — one short line of tip text sits below
the pitch, distinct from the panel and the controls.

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T042 [US4] Add a failing test to tests/unit/components/CareerPitch.test.tsx asserting a single tip line is rendered below the pitch without any interaction, and that it mentions players being clickable (FR-007, SC-004)

### Implementation for User Story 4

- [x] T043 [US4] Render the static one-line tip as a literal string below the pitch container in components/Career/CareerPitch.tsx, styled distinctly from the panel and the controls and using the `text-on-photo` token for contrast over the photographic surface (FR-007, data-model.md §5)
- [x] T044 [US4] Run `npm test -- CareerPitch` and confirm T042 passes

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T045 [P] Verify accessibility across the reworked pitch: every player `<g>` keeps `role="button"`, `tabIndex={0}`, `aria-pressed`, and its `aria-label`; the ball and all text labels stay out of the accessible tree; Tab/Enter/Space parity holds — checked in components/Career/CareerPitch.tsx and confirmed in the browser (FR-010, Principle IV SVG-accessibility constraint)
- [x] T046 [P] Confirm no new dependency, no canvas, no JSON or Zod schema change, no hand-written `.dark` selector, and no `any` type were introduced across components/Career/chapters.ts, components/Career/CareerPitch.tsx, and components/Career/ChapterDetail.tsx (Constitution Principle IV, plan.md Constitution Check)
- [x] T047 [P] Check dark mode with `?experiment=true` and confirm the new labels, focus ring, ball, and restructured panel remain legible (quickstart R.4, ADR 0019)
- [x] T048 Regression-check the unaffected surfaces in components/Career/CareerPitch.tsx: prev/next, the "Chapter N / 5" readout, "Play in order" stopping at the newest chapter, the retained pill list, and the dashed route plus solid pass line (quickstart R.1–R.3)
- [x] T049 Run the full manual pass in specs/011-football-pitch-details-rework/quickstart.md — US1 items 1.1–1.5, keyboard K.1–K.4, US2 2.1–2.4, US3 3.1–3.5, US4 4.1, regressions R.1–R.4 — ticking each box
- [x] T050 Run `npm run type-check`, `npm run lint`, and `npm test` from the repository root and confirm all three pass before handing off to the release agent

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. **BLOCKS US2 and US3
  entirely**, and blocks US1's tests only insofar as they share the
  `CareerPitch.test.tsx` file.
- **US1 (Phase 3, P1)**: Depends on Phase 2 completing (shared file).
- **US2 (Phase 4, P1)**: Depends on Phase 2 — consumes `displayName` and
  `abbreviation` (T007, T008, T011).
- **US3 (Phase 5, P2)**: Depends on Phase 2 — consumes `builtSummary`,
  partitioned `achievements`, and `DEFAULT_TECH` (T009, T011). Spec states US3
  should land after US1–US2 so the panel is not restyled twice.
- **US4 (Phase 6, P3)**: Depends on Phase 2 only in practice; functionally
  independent of US1–US3.
- **Polish (Phase 7)**: Depends on every story phase the release is shipping.

### Task-Level Dependencies

- T004–T006 (tests) precede T007–T011 (implementation) — Principle II.
- T007 → T008 (abbreviation is defined in terms of the display name, FR-013).
- T007, T008, T009 → T010 → T011 → T012.
- T013–T017 precede T018–T023; T018 → T020; T019 → T020; T021 → T022.
- T024–T026 precede T027–T031; T027 → T028 (label stacking order).
- T032–T036 precede T037–T041; T037 → T038 → T039 → T040.
- T042 precedes T043 → T044.
- T003 → T040 (the height comparison needs the baseline).
- T045–T049 depend on all shipped story phases; T050 runs last.

### Within Each User Story

- Tests are written first and MUST fail before implementation begins.
- Derivations (Phase 2) before any component that reads them.
- Component structure before styling refinement (T037 before T039).
- Story complete and checkpointed before moving to the next priority.

### Parallel Opportunities

- T003 runs in parallel with T001–T002 once the dev server is up.
- T004 and T005 are independent derivation tests and can be written in
  parallel; T006 touches the same file and follows them.
- T024, T025, T026 (US2 tests) are parallel with each other.
- T032, T033, T034, T035 (US3 tests) are parallel — new file, independent cases.
- T045, T046, T047 in Polish are parallel — different verification surfaces.
- **Cross-story caution**: US1, US2, and US4 all edit
  `components/Career/CareerPitch.tsx` and
  `tests/unit/components/CareerPitch.test.tsx`. They are logically independent
  but NOT file-independent, so they are not marked `[P]` across stories — run
  those phases sequentially, or accept merge conflicts. US3 is the one story
  that can genuinely run in parallel with the others, since it owns
  `ChapterDetail.tsx` and its own test file (T036 is the single exception, and
  it belongs to US3's phase deliberately).

---

## Parallel Example: Phase 2 Foundational

```bash
# Two independent derivation tests, written together:
Task: "Failing table-driven unit test for toDisplayName in tests/unit/career/chapters.test.ts"
Task: "Failing table-driven unit test for toAbbreviation in tests/unit/career/chapters.test.ts"
```

## Parallel Example: User Story 3

```bash
# All four ChapterDetail test cases together — one new file, independent assertions:
Task: "Showcase section pattern test in tests/unit/components/ChapterDetail.test.tsx"
Task: "No-lines-lost partition test in tests/unit/components/ChapterDetail.test.tsx"
Task: "DEFAULT_TECH fallback test in tests/unit/components/ChapterDetail.test.tsx"
Task: "Full company name in heading test in tests/unit/components/ChapterDetail.test.tsx"
```

---

## Implementation Strategy

### MVP First (Phases 1–4)

The MVP is **Phase 1 + Phase 2 + US1 + US2** — the two P1 stories. Together
they answer the original complaint (selection reads as a pass, not a state
toggle) and make the pitch legible without a click, which is what the feature
exists for. US3 and US4 are refinements on top of a shippable pitch.

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (BLOCKS everything).
3. Complete Phase 3: US1 → validate independently.
4. Complete Phase 4: US2 → validate independently.
5. **STOP and VALIDATE**: run quickstart US1 + US2 + keyboard sections.
6. Ship or demo.

### Incremental Delivery

1. Setup + Foundational → derivations proven by unit tests.
2. + US1 → smooth selection, deliberate focus. Demo.
3. + US2 → identifiable players. Demo. **MVP complete.**
4. + US3 → compact showcase-style panel. Demo.
5. + US4 → tip line. Demo.
6. Polish → a11y, dark mode, full quickstart, gates.

### Commit Strategy (Principle III)

Four separable units of work, each inside the five-file guidance:

- Phase 2 → `feat(career): derive display name, abbreviation and summary — …`
- US1 → `feat(pitch): pass the ball between chapters — …`
- US2 → `feat(pitch): name every player on the field — …`
- US3 → `refactor(career): restyle the chapter panel to the showcase — …`
- US4 → `feat(pitch): add the how-to-use tip — …`

Only the `release` agent runs `git add`/`git commit`/`git push`.

---

## Notes

- `[P]` = different files, no dependencies. Note the cross-story caution above:
  three of the four stories share `CareerPitch.tsx`.
- Tests are mandatory here (Principle II), not the template's optional case.
- Verify every test fails before implementing the task it covers.
- No ADR is triggered by this feature (plan.md Constitution Check VI).
- `tests/unit/career/` is a new directory; `tests/unit/components/` already
  exists and holds `CareerPitch.test.tsx`.
