# Tasks: Pin Node Version to LTS

**Input**: Design documents from `/specs/020-pin-node-lts/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in the spec. This feature has no application code —
verification is the manual/CI-log-based scenarios in quickstart.md, folded
into validation tasks below rather than a separate automated test suite.

**Organization**: Tasks are grouped by user story (spec.md) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

Single project, repository root — no `src/`/`backend/`/`frontend/` split
applies to this feature (plan.md Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the two git-tracked version declarations every later
task depends on (research.md Decisions 1, 3, 4).

- [X] T001 Create `.nvmrc` at the repository root containing a single line,
  `24` (major version only, per research.md Decision 4)
- [X] T002 [P] Add `"engines": { "node": "24.x" }` to `package.json`
  (top-level, alongside the existing `packageManager` field), per
  research.md Decision 3

**Checkpoint**: Both version declarations exist — every user story below can
now proceed.

*No separate Foundational phase — T001/T002 are the only shared prerequisite
and are small enough to belong in Setup.*

---

## Phase 2: User Story 1 - Consistent local Node version (Priority: P1) 🎯 MVP

**Goal**: A contributor's `nvm use` picks up Node 24 automatically from
`.nvmrc`, with no other lookup.

**Independent Test**: Run `nvm use` in the repository root; confirm it
switches to Node 24 with no additional flags (quickstart.md step 1).

- [X] T003 [US1] Run `nvm use` in the repository root and confirm `node -v`
  reports `v24.x.x` (quickstart.md step 1) — depends on T001

**Checkpoint**: User Story 1 is independently complete and testable — this
alone is the MVP slice (local dev version consistency, no CI/Vercel changes
required to demonstrate it).

---

## Phase 3: User Story 2 - CI builds on the same version as local dev (Priority: P1)

**Goal**: Every CI job resolves its Node version from `.nvmrc`, not a
hardcoded matrix entry.

**Independent Test**: Change `.nvmrc` to a different valid version, push,
and confirm all four jobs pick it up with no workflow-file edit
(quickstart.md step 2).

- [X] T004 [US2] In `.github/workflows/ci.yml`, remove the
  `strategy: matrix: node-version: [22]` block and the
  `node-version: ${{ matrix.node-version }}` line from all four jobs
  (lint-and-type-check, test, build, e2e), replacing each with
  `node-version-file: '.nvmrc'` on the corresponding `actions/setup-node@v4`
  step — depends on T001
- [ ] T005 [US2] Push the branch and confirm, via `gh run view --log`, that
  all four CI jobs log Node 24.x (quickstart.md step 2) — depends on T004

**Checkpoint**: User Stories 1 AND 2 both work independently — CI now mirrors
local dev with zero hardcoded version literals in the workflow file.

---

## Phase 4: User Story 3 - Single source of truth for the pinned version (Priority: P2)

**Goal**: The README points at `.nvmrc` instead of restating the version
number as independent text.

**Independent Test**: Search the repo for the Node version outside
`.nvmrc`/`package.json`; confirm nothing else hardcodes it (quickstart.md
step 4).

- [X] T006 [US3] In `README.md`, replace the `# Requires Node 22.x (matches
  CI).` quickstart comment with a line pointing to `.nvmrc` as the source of
  the required version, rather than restating a version number — depends on
  T001
- [X] T007 [US3] Run `grep -rn "Node 2[0-9]" README.md
  .github/workflows/ci.yml` and confirm no match remains (quickstart.md
  step 4) — depends on T004, T006

**Checkpoint**: All three original user stories are independently complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Vercel production parity (FR-007) and the recorded decision
(FR-006) — neither maps to a single user story above, both are required by
the spec.

- [ ] T008 [P] After the branch's PR has a Vercel preview deployment, confirm
  its build log reports Node 24.x (quickstart.md step 3) — depends on T002
- [X] T009 Write `docs/adr/0029-pin-node-24.md` documenting the decision to
  pin Node 24 and the rejection of Node 26 (Vercel's Functions runtime tops
  out at 24.x — research.md Decisions 1 and 3; follow the format of ADR 0022)
  — depends on T001, T002
- [X] T010 Add ADR 0029's row to the index in `docs/adr/README.md` — depends
  on T009
- [ ] T011 Run the full `quickstart.md` validation end-to-end, including its
  rollback check (bump `.nvmrc` to 22 on a scratch branch, confirm all four
  CI jobs follow with no other file edited) — depends on T003, T005, T007,
  T008

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **User Stories (Phases 2–4)**: Each depends only on Setup (T001; T002 only
  matters for Phase 5). They do not depend on each other — US1, US2, and US3
  can proceed in parallel once T001 lands.
- **Polish (Phase 5)**: T008 depends on T002 and a pushed PR; T009–T010 depend
  on T001/T002/T009; T011 depends on every prior validation task.

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on T001. No dependency on US2/US3.
- **User Story 2 (P1)**: Depends only on T001. No dependency on US1/US3.
- **User Story 3 (P2)**: Depends on T001 directly, and on T004 for its own
  verification step (T007 greps the CI file US2 edits) — but its
  *implementation* task (T006) only needs T001.

### Parallel Opportunities

- T001 and T002 (different files) can run in parallel.
- Once T001 lands, US1 (T003), US2 (T004–T005), and US3 (T006) can proceed
  in parallel — different files, no cross-story dependency.
- T008 can run in parallel with Phases 2–4 once T002 and a push have
  happened.

---

## Parallel Example: Setup

```bash
Task: "Create .nvmrc at the repository root containing a single line, 24"
Task: "Add \"engines\": { \"node\": \"24.x\" } to package.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: User Story 1 (T003)
3. **STOP and VALIDATE**: `nvm use` resolves Node 24 locally
4. This alone is shippable — local dev consistency, independent of CI/Vercel

### Incremental Delivery

1. Setup → User Story 1 (MVP: local pin works)
2. Add User Story 2 → CI mirrors the pin, no drift into `main`
3. Add User Story 3 → docs stop duplicating the version number
4. Polish → Vercel parity confirmed, ADR recorded, full quickstart run

---

## Notes

- [P] tasks touch different files — T004's four job edits are one task, not
  four, because they land in the same file (`.github/workflows/ci.yml`) and
  splitting them would risk conflicting edits for no benefit.
- Commit as one unit per the constitution's "genuinely one unit of work"
  exception (plan.md Constitution Check, Principle III) — this feature's
  ~5 files are a single cohesive version pin, not separable work.
- Verify each checkpoint before moving to the next phase.
