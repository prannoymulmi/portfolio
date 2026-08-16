---

description: "Task list for Modernize Education & Certification Grade Display"
---

# Tasks: Modernize Education & Certification Grade Display

**Input**: Design documents from `/specs/013-education-cert-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (no contracts/ — internal UI change, no external interface)

**Tests**: Included and required — Principle II (Test-First, NON-NEGOTIABLE) makes tests mandatory for this feature, not optional.

**Organization**: Tasks are grouped by user story (spec.md priorities P1–P3) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and relative to the repository root.

---

## Phase 1: Setup

**Purpose**: Confirm a clean baseline before touching anything — no project initialization needed, the stack and tooling already exist.

- [X] T001 Run `npm test` and `npm run lint` from the repository root and confirm both currently pass, so any later failure is attributable to this feature's changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The grade-band mapping both graded entries' badges depend on (research.md R1–R4, data-model.md's `gradeBadgeLabel` contract). Blocks all user story work, since US1's acceptance scenario for the numeric grade needs it and the same component edit downstream serves US2/US3.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Write table-driven unit tests in `tests/unit/education/grade.test.ts` for a not-yet-created `gradeBadgeLabel` export from `components/Education/grade.ts`, covering the full data-model.md contract table: `"Distinction"` → `"Distinction"`, `"1.9 Grade"` → `"Good"` (the live data value, research R4), `"1.9"` → `"Good"`, `"1,9"` → `"Good"`, boundaries `"1.5"` → `"Very Good"`, `"2.5"` → `"Good"`, `"2.6"` → `"Satisfactory"`, `"4.0"` → `"Sufficient"`, out-of-scale `"5.0"` → `"5.0"`, `"   "` → `null`, `undefined` → `null`. Run the suite and confirm it fails (module doesn't exist yet) — Principle II.
- [X] T003 Implement `gradeBadgeLabel(value?: string): string | null` in `components/Education/grade.ts` to satisfy T002: leading-numeric-token detection tolerant of trailing text and comma decimals (research R2), an ascending upper-bound band chain 1.0–1.5 "Very Good" / 1.6–2.5 "Good" / 2.6–3.5 "Satisfactory" / 3.6–4.0 "Sufficient" (research R3), trimmed original returned for non-numeric or out-of-scale input, `null` for empty/whitespace/undefined. Add short `WHY` comments (not `WHAT`) on the band-chain shape and the leading-token detection rule, per plan.md's Constitution Check note. (Depends on T002.)

**Checkpoint**: `npm test -- grade` passes. Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Grade/classification reads as an achievement, not stray text (Priority: P1) 🎯 MVP

**Goal**: Both graded entries ("Distinction", "1.9 Grade") render as a distinct badge instead of a plain paragraph, with the numeric grade shown as its English label.

**Independent Test**: View the Education & Certifications section and confirm the University of Essex row shows a "Distinction" badge and the HAW Hamburg row shows a "Good" badge — neither as plain paragraph text.

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation (Principle II).

- [X] T004 [P] [US1] Write component tests in `tests/unit/components/EducationSection.test.tsx` (new file) asserting: the entry with `cardDetailedText: "Distinction"` renders a badge element containing "Distinction" (not inside a `<p>` of body-copy classes), and the entry with `cardDetailedText: "1.9 Grade"` renders a badge containing "Good", not "1.9" or "1.9 Grade". Run and confirm both assertions fail against the current component.

### Implementation for User Story 1

- [X] T005 [US1] Edit `components/Education/EducationSection.tsx`: replace the `cardDetailedText` paragraph block (the `<p className="text-on-photo mt-4 max-w-xl text-sm leading-relaxed">` guarded by `item.cardDetailedText &&`) with a badge `<span>` whose content is `gradeBadgeLabel(item.cardDetailedText)` from `components/Education/grade.ts`, guarded on a non-null return. Style the span with the same border/radius/padding/text-tone classes already used by the row's "Learn more" anchor (`rounded-full border border-border px-4 py-1.5 text-xs font-medium text-on-photo`), per FR-002. No `whitespace-nowrap` — allow the badge to wrap on a long future value (research R7, FR-007). (Depends on T003, T004.)
- [X] T006 [US1] Run `npm test -- grade EducationSection` and confirm all Phase 2 and Phase 3 tests pass; run `npm run lint` and correct Tailwind class ordering via `prettier-plugin-tailwindcss` if flagged. (Depends on T005.)

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the MVP.

---

## Phase 4: User Story 2 - Consistent, modern treatment across all entries (Priority: P2)

**Goal**: The two AWS certification rows (no `cardDetailedText`) render with no empty badge or broken spacing, and all four rows read as one visually consistent set.

**Independent Test**: Compare all four rendered entries side by side; confirm no stray badge-shaped gap on the AWS rows and consistent spacing/typography across all four.

### Tests for User Story 2 ⚠️

- [X] T007 [US2] Extend `tests/unit/components/EducationSection.test.tsx` with cases asserting the two AWS certification entries (`cardDetailedText` absent) render with no badge element present, per FR-004. Confirm this already passes once T005 lands (the existing `item.cardDetailedText &&` / `gradeBadgeLabel` non-null guard should cover it) — if it fails, that's a regression to fix in `EducationSection.tsx`, not a new component to build. (Depends on T005.)

### Manual Verification for User Story 2

- [ ] T008 [US2] Follow quickstart.md's "Visual checklist — default (light) theme" section in a running `npm run dev` session: confirm no gap/broken alignment on the AWS rows, and that all four rows share consistent heading weight and spacing rhythm (SC-005). (Depends on T005.)

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Legible on the photographic background in both themes (Priority: P3)

**Goal**: The badge is legible against the pinned photograph in both the default theme and the `?experiment=true` theme, using only existing `dark:` utilities.

**Independent Test**: Render the section in both themes and confirm the badge's text is legible against the photo surface in each.

### Manual Verification for User Story 3

- [ ] T009 [US3] Follow quickstart.md's "Visual checklist — experimental dark theme" section: load `?experiment=true#education`, toggle dark, and confirm the badge stays legible against the darker composite (FR-003, SC-002). (Depends on T005.)
- [X] T010 [P] [US3] Run `grep -rn "\.dark" app/globals.css components/Education/` and confirm no new hand-written `.dark` selector was introduced by T005 (constitution, ADR 0011). (Depends on T005.)

**Checkpoint**: All three user stories are independently functional and verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final checks spanning all three stories.

- [ ] T011 [P] Follow quickstart.md's "Visual checklist — mobile" and "Regression checks" sections in full: confirm no horizontal scroll at 375×667, and `git diff --stat` shows no change to `public/data/education.json` or `lib/utils/validation.ts` (FR-005). Regression half (git diff --stat) confirmed clean; mobile-viewport half still needs a running `npm run dev` + browser check.
- [ ] T012 Run `npm run build && npm start`, audit production Lighthouse performance, and confirm it remains ≥ 90 (SC-004).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all user stories (T005 needs `gradeBadgeLabel` from T003).
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on T005 (US1's component edit) — the same edit that renders the badge also determines whether "no badge" holds for ungraded entries. Not a new implementation task, only new tests/verification.
- **User Story 3 (Phase 5)**: Depends on T005, same reasoning as US2 — this story verifies a property of the one component edit, it does not add new markup.
- **Polish (Phase 6)**: Depends on Phases 3–5 being complete.

### Within Each Phase

- Tests are written and confirmed failing before the implementation task that makes them pass (T002 before T003; T004 before T005).
- T003 (implementation) depends on T002 (its test).
- T005 (implementation) depends on both T003 (the module it imports) and T004 (its test).

### Parallel Opportunities

- T002 has no prior dependency in Phase 2 and can start immediately after T001.
- T004 can be written in parallel with T002/T003 (different file, no shared dependency) but T005 needs both done first.
- T009 and T010 in Phase 5 touch different files/commands and can run in parallel.
- T011 and T012 in Phase 6 are independent checks and can run in parallel.

---

## Parallel Example: Phase 2 + User Story 1 tests

```bash
# These two can be written/run in parallel — different files, no shared dependency yet:
Task: "Write table-driven unit tests in tests/unit/education/grade.test.ts"
Task: "Write component tests in tests/unit/components/EducationSection.test.tsx"

# Both then block on the same implementation task:
Task: "Implement gradeBadgeLabel in components/Education/grade.ts"
Task: "Edit components/Education/EducationSection.tsx to render the badge"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (`grade.ts` + its tests).
3. Complete Phase 3: User Story 1 — badge rendering with the mapped "Good" label.
4. **STOP and VALIDATE**: run `npm test -- grade EducationSection`, then the quickstart.md light-theme checklist for the two graded rows.
5. This alone resolves the exact complaint the feature was opened for ("Distinction" and "1.9 Grade" looking off).

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → test independently → this is the MVP and the whole visible fix for the two graded rows.
3. User Story 2 → confirms the fix doesn't regress the two ungraded (AWS) rows and reads as one consistent section.
4. User Story 3 → confirms the fix holds up in the experimental dark theme, without touching implementation again.
5. Polish → mobile layout, data-file regression guard, and the Lighthouse floor.

### Single-Developer Note

Because US2 and US3 verify properties of the same T005 edit rather than adding new code, there is no meaningful parallel-team split here — this is a small enough feature that Phases 3–5 are naturally sequential for one implementer, and only the test-writing tasks within each phase parallelize.

---

## Notes

- [P] tasks touch different files with no unmet dependency.
- [Story] labels map each task to its user story for traceability; Setup, Foundational, and Polish carry none by design.
- Two atomic commits fit this feature naturally (Principle III): (1) `grade.ts` + `grade.test.ts`, (2) the `EducationSection.tsx` edit + `EducationSection.test.tsx`.
- No task touches `public/data/education.json`, `app/data/education.json`, or `lib/utils/validation.ts` — FR-005 forbids it, and T011 checks it stayed that way.
