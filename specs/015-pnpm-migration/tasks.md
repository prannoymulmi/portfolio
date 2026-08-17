---

description: "Task list for pnpm Migration"
---

# Tasks: pnpm Migration

**Input**: Design documents from `/specs/015-pnpm-migration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested for this feature. The existing 252-test Jest suite is the
regression check (Constitution Check, plan.md); no new test files are added —
verification tasks below run that suite and the other existing scripts through
pnpm instead of npm.

**Organization**: Tasks are grouped by user story (spec.md) to enable independent
verification of each.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in each task description

## Path Conventions

Repository root — this feature touches only config, docs, and governance files at
the root and in `docs/adr/`, `.github/workflows/`, and `.specify/memory/`. No
`src/`/`app/`/`components/` changes (plan.md Structure Decision).

---

## Phase 1: Setup

**Purpose**: Get pnpm itself, pinned to a known version, producing a lockfile from
the existing (unchanged) dependency set.

- [X] T001 Add `"packageManager": "pnpm@11.22.0"` to `package.json` (research.md #2)
- [X] T002 Run `corepack use pnpm@11.22.0` (or `corepack enable` then `pnpm install`)
      against the repo root to generate `pnpm-lock.yaml` from the existing
      `package.json` — no dependency versions change

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish pnpm's lockfile as the single source of truth before any
story-specific verification or doc/CI/ADR work builds on it.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Verify `pnpm install` at repo root completes successfully with no added
      flags (a peer-dependency warning for `@testing-library/react` vs. React 19
      is expected on stdout and is not a failure — research.md #1)
- [X] T004 Delete `package-lock.json` from the repo root now that `pnpm-lock.yaml`
      is verified working (FR-002) — exactly one lockfile must exist from this
      point on (data-model.md invariant)

**Checkpoint**: `pnpm-lock.yaml` is the sole, verified lockfile. Every story below
builds on it.

---

## Phase 3: User Story 1 - Install dependencies the new way (Priority: P1) 🎯 MVP

**Goal**: Every existing workflow — local scripts, CI, production deploy — installs
and runs identically under pnpm, with zero undocumented flags.

**Independent Test**: On a clean checkout with no `node_modules`, run the pnpm
install command and each existing `package.json` script; separately, confirm CI and
the next Vercel deploy both succeed using the pnpm install path (quickstart.md
steps 1, 2, 4, 5).

- [X] T005 [US1] Run `pnpm run dev`, `pnpm run build`, `pnpm start`,
      `pnpm run type-check`, `pnpm run lint`, `pnpm test`, `pnpm run validate:json`
      locally and confirm each behaves identically to its npm-invoked equivalent
      (FR-006; quickstart.md step 2)
- [X] T006 [P] [US1] Update `.github/workflows/ci.yml`: add a `pnpm/action-setup@v4`
      step (no `version:` input — reads the pin from `package.json`), change
      `actions/setup-node@v4`'s `cache: npm` to `cache: pnpm`, replace
      `npm ci --legacy-peer-deps` with `pnpm install --frozen-lockfile`, and replace
      any remaining `npm run <script>` steps with `pnpm run <script>` (FR-004;
      research.md #3)
- [X] T007 [P] [US1] Update `vercel.json`'s `installCommand` from
      `"npm install --legacy-peer-deps"` to `"pnpm install"` (FR-010; research.md #4)
- [X] T008 [US1] Push and confirm the GitHub Actions CI run passes end-to-end
      (install, type-check, lint, test) using the updated workflow (depends on
      T006; SC-004; quickstart.md step 4)
- [ ] T009 [US1] Confirm the next Vercel production deploy builds successfully
      using the updated `installCommand` (depends on T007; SC-004; quickstart.md
      step 5) — **blocked**: GitHub's Deployments API shows no Vercel record for
      any commit past 0740f26 (14:58, well before this feature's pushes), and no
      commit status/check-run for the Vercel integration exists on the latest
      commit either — consistent with the GitHub↔Vercel integration issue the
      site owner already flagged ("github PR is broken"). Cannot verify from
      here; needs a manual check of the Vercel dashboard.

**Checkpoint**: pnpm is the install path everywhere — local, CI, and production —
and every existing script/pipeline behaves the same as it did under npm.

---

## Phase 4: User Story 2 - Read accurate setup docs (Priority: P2)

**Goal**: No documentation file still tells a reader to run an `npm` command.

**Independent Test**: Grep `README.md` and `CONTRIBUTING.md` for `npm install` /
`npm run` / `npm test` / `npm start` and confirm no matches remain (quickstart.md
step 3).

- [X] T010 [P] [US2] Update `README.md`'s Quick Start command table and install
      instructions to their pnpm equivalents (FR-003)
- [X] T011 [P] [US2] Update `README.md`'s Deployment section's install-command
      mention so it matches `vercel.json`'s new pnpm command (FR-010)
- [X] T012 [P] [US2] Update `CONTRIBUTING.md`'s setup steps and pre-push checklist
      commands to their pnpm equivalents (FR-003)
- [X] T013 [US2] Grep `README.md` and `CONTRIBUTING.md` for any remaining
      `npm install` / `npm run` / `npm test` / `npm start` references and confirm
      none remain (depends on T010–T012; SC-003; quickstart.md step 3)

**Checkpoint**: User Stories 1 AND 2 both work independently — tooling and docs
agree with each other.

---

## Phase 5: User Story 3 - Understand why the switch happened (Priority: P3)

**Goal**: A recorded decision explains why the project moved from npm to pnpm,
reachable from the ADR index.

**Independent Test**: Open `docs/adr/README.md`, find the new ADR listed, open it,
and confirm it states the decision, rationale, and consequences (quickstart.md
step 7).

- [X] T014 [US3] Write a new ADR at `docs/adr/0022-migrate-to-pnpm.md` documenting
      the decision, rationale (disk-space efficiency via pnpm's shared
      content-addressable store, adopting current tooling), and consequences
      (lockfile change, CI change, contributor workflow change, production install
      change), following the Status/Date/header + Context + Decision +
      Consequences format of `docs/adr/0021-technical-playbook-chapter-removed.md`
      (FR-007)
- [X] T015 [US3] Add an index row for ADR 0022 to `docs/adr/README.md` (depends on
      T014; FR-008)
- [X] T016 [US3] Amend `.specify/memory/constitution.md`'s Principle IV Deployment
      bullet — replace the `--legacy-peer-deps`/npm sentence with the pnpm
      equivalent — bump the document version (MINOR, per the Governance
      semantic-versioning rule for a Principle IV substitution), and add a
      `SYNC IMPACT REPORT` entry at the top of the file following the existing
      amendment-history pattern; lands together with T014's ADR per Governance's
      "ADR + amendment together" rule (plan.md Complexity Tracking)

**Checkpoint**: All three user stories are independently functional; the decision
is fully recorded and governance-compliant.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final checks that span every story above.

- [X] T017 [P] Compare `node_modules` size: `du -sh node_modules` after this
      feature's `pnpm install`, versus the same measurement from a scratch npm
      install at the pre-migration commit; confirm pnpm's is smaller (SC-002 —
      qualitative check per Clarifications; quickstart.md step 6)
- [X] T018 Run through `specs/015-pnpm-migration/quickstart.md` end-to-end as a
      final sign-off before handing off to the release step

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend only on Foundational completion; US1,
  US2, and US3 have no dependencies on each other and can proceed in parallel
- **Polish (Phase 6)**: Depends on US1 (T017 needs a working pnpm install; T018
  validates the whole feature, so realistically runs after US1–US3)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependency on US2/US3
- **User Story 2 (P2)**: Can start after Foundational — no dependency on US1/US3
  (docs describe the target state, not a state that depends on CI/Vercel already
  having run)
- **User Story 3 (P3)**: Can start after Foundational — no dependency on US1/US2,
  though the ADR reads more naturally written once US1's decisions are final

### Within Each User Story

- T006/T007 (CI, Vercel config) before T008/T009 (verifying those pipelines pass)
- T010–T012 (doc edits) before T013 (grep verification)
- T014 (ADR) before T015 (index) and alongside T016 (amendment)

### Parallel Opportunities

- T006 and T007 (different files: CI workflow vs. `vercel.json`)
- T010, T011, T012 (different files: README vs. CONTRIBUTING, and README's two
  sections are adjacent edits but independent of CONTRIBUTING)
- Once Foundational (Phase 2) completes, US1, US2, and US3 can be worked
  simultaneously since they touch disjoint files (CI/Vercel vs. docs vs.
  ADR/constitution)
- T017 (disk-space check) can run alongside doc/ADR work — it only needs T003's
  verified install

---

## Parallel Example: User Story 1

```bash
# Launch T006 and T007 together — disjoint files:
Task: "Update .github/workflows/ci.yml to install via pnpm"
Task: "Update vercel.json's installCommand to pnpm install"
```

## Parallel Example: User Story 2

```bash
# Launch T010, T011, T012 together — disjoint files:
Task: "Update README.md Quick Start commands to pnpm"
Task: "Update README.md Deployment section's install-command mention"
Task: "Update CONTRIBUTING.md setup/pre-push commands to pnpm"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T004) — CRITICAL, blocks everything
3. Complete Phase 3: User Story 1 (T005–T009)
4. **STOP and VALIDATE**: pnpm installs and runs everything identically, locally,
   in CI, and in production
5. This alone is a shippable state — npm is fully replaced and working

### Incremental Delivery

1. Setup + Foundational → pnpm-lock.yaml is the source of truth
2. Add User Story 1 → validate independently → the migration itself is done
3. Add User Story 2 → validate independently → docs stop lying to new
   contributors
4. Add User Story 3 → validate independently → the decision is on the record
5. Polish → disk-space evidence for the original motivation, final quickstart
   sign-off

### Solo Execution Note

This feature is small enough (one repo, no team split) that US1/US2/US3 are more
useful as a *checklist ordering* than a parallel-team split — but each is still
independently verifiable if worked out of order, per their Independent Test
sections above.

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps each task to its user story for traceability back to spec.md
- No new tests are added — the existing 252-test suite (run via T005/`pnpm test`)
  is the regression check for this migration
- Commit after each task or logical group, split by concern (Constitution
  Principle III: Atomic Commits) — e.g., lockfile swap as one commit, CI as
  another, docs as another, ADR+amendment together as one (Governance's own
  pairing rule)
- This feature is implemented directly on `main`, no PR (spec Assumptions) — the
  `release` agent still owns every `git add`/`commit` per CLAUDE.md; these tasks
  describe file edits and verification, not who runs the git commands
