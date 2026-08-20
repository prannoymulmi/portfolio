---
description: "Task list for feature 019 — Playwright E2E Testing & Testing Pyramid Docs"
---

# Tasks: Playwright E2E Testing & Testing Pyramid Docs

**Input**: Design documents from `/specs/019-playwright-e2e-tests/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/,
quickstart.md

**Tests**: NOT optional. Constitution Principle II (NON-NEGOTIABLE) requires
tests written before or alongside every feature, and plan.md's Constitution
Check records that as an accepted obligation. This feature is unusual in that
its *deliverable itself* is a test suite (User Story 1) — the "write tests
first" obligation is satisfied by the e2e spec existing and passing before
the CI wiring (User Story 2) that depends on it.

**Organization**: Tasks are grouped by user story, in priority order. Each
phase leaves the tree in a working, shippable state — User Story 1 alone is
a real MVP (a working local e2e suite), even before CI or docs exist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (US1–US3)
- Exact file paths are given in every description; a task that only
  verifies behavior (no file changed) names the command or quickstart.md
  step instead, matching the precedent in `specs/015-pnpm-migration/tasks.md`

## Path Conventions

Single Next.js App Router project at the repository root (plan.md → Structure
Decision). New test code under `tests/e2e/`, alongside the existing
`tests/unit/` and `tests/integration/`; config at the repo root
(`playwright.config.ts`); CI in `.github/workflows/ci.yml`; docs under
`docs/`.

---

## Phase 1: Setup

**Purpose**: Get the new tooling installed and the repo ready to hold its
output, before any test or config code is written.

- [ ] T001 [P] Add `@playwright/test` as a devDependency (`pnpm add -D
      @playwright/test` from the repo root); confirm `pnpm-lock.yaml`
      updates accordingly.
- [ ] T002 Run `npx playwright install --with-deps chromium` locally — the
      one-time browser binary install needed before any e2e test can run on
      this machine. No repo file changes; CI installs its own copy in T012.
- [ ] T003 [P] Add Playwright's default output directories (`test-results/`,
      `playwright-report/`, `blob-report/`) to `.gitignore`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The dual-target contract (contracts/e2e-target-contract.md)
every later task depends on — the config that lets identical test code run
against `localhost` or an external URL.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Create `playwright.config.ts` at the repo root, per research.md
      Decision 1 and contracts/e2e-target-contract.md: `use.baseURL` reads
      `process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'`; a
      `webServer` block (`command: 'pnpm run dev'`,
      `url: 'http://localhost:3000'`, `reuseExistingServer: true`) is
      defined **only** when `PLAYWRIGHT_BASE_URL` is unset — when it's set,
      no local server is started at all. `testDir: './tests/e2e'`. Depends
      on T001.
- [ ] T005 Add `"test:e2e": "playwright test"` to `package.json`'s
      `scripts`. Confirm `jest.config.js`'s `testMatch` pattern does not
      match anything under `tests/e2e/` — run `pnpm test` and check the
      suite count is unaffected (FR-008). Depends on T001.

**Checkpoint**: Foundation ready — the dual-target mechanism exists, even
before any real test uses it.

---

## Phase 3: User Story 1 - Run e2e tests locally against localhost (Priority: P1) 🎯 MVP

**Goal**: A developer runs one command locally and gets a real, browser-driven
test against the site — dev server auto-started or reused as needed.

**Independent Test**: On a clean checkout with no dev server running, run the
documented e2e command and confirm it starts the dev server, runs a real
browser against it, and reports pass/fail (spec.md US1 Independent Test).

### Implementation for User Story 1

- [ ] T006 [US1] Create `tests/e2e/homepage.spec.ts`: navigate to `/`, wait
      for the hero's real, client-fetched content to render (not an
      immediate post-navigation assertion — this site fetches JSON content
      client-side per ADR 0003, spec.md Edge Cases), then assert the page
      title and a piece of hero content (e.g. the name or a role phrase) are
      visible. Single locale only — no language-toggle interaction (FR-001,
      FR-007, Clarifications Session 2026-08-20). Depends on T004.
- [ ] T007 [US1] Confirm no dev server is already running (`lsof -ti:3000`
      returns nothing), then run `pnpm run test:e2e`. Confirm: a local dev
      server starts automatically, the test executes in a real Chromium
      browser and passes, and the server is torn down when the run finishes
      (Acceptance Scenario 1, FR-003, SC-001; quickstart.md Local run #2).
      Depends on T006.
- [ ] T008 [US1] Start `pnpm run dev` manually and leave it running, then run
      `pnpm run test:e2e` again. Confirm the suite reuses the already-running
      server instead of starting a second one (Acceptance Scenario 2, FR-003;
      quickstart.md Local run #3). Depends on T006.
- [ ] T009 [US1] Run `pnpm test` (the existing Jest command) and confirm it
      behaves exactly as it did before this feature — same suite, same
      timing, no browser launched, no reference to the e2e suite (Acceptance
      Scenario 3, FR-008; quickstart.md Local run #4). Depends on T005.

**Checkpoint**: User Story 1 fully functional and testable independently —
a real, passing local e2e suite exists, with no CI or documentation work
required for it to be useful on its own.

---

## Phase 4: User Story 2 - E2E tests run automatically against the PR's Vercel preview (Priority: P2)

**Goal**: Once a PR is ready for review, CI runs the same suite against that
PR's real Vercel preview deployment and gates merge on the result.

**Independent Test**: Open a PR against a branch with the e2e suite present,
confirm a CI check appears that runs against the PR's own preview URL (not
localhost, not production), and that its result is visible on the PR before
merge (spec.md US2 Independent Test).

### Implementation for User Story 2

- [ ] T010 [US2] Add a new `e2e` job to `.github/workflows/ci.yml`:
      `needs: lint-and-type-check` (fail fast before waiting on a preview);
      `pull_request` trigger `types: [opened, synchronize, reopened,
      ready_for_review]`; job-level `if: github.event.pull_request.draft ==
      false` (research Decision 3, FR-005a).
- [ ] T011 [US2] Within the `e2e` job, add a step using an established
      GitHub Action to wait for the PR's Vercel preview deployment and
      capture its URL (research Decision 2) — this **waits for** the
      deployment Vercel's own Git integration already creates automatically;
      it must not trigger a second deployment via the Vercel CLI or API.
      Depends on T010.
- [ ] T012 [US2] Add the remaining steps to the `e2e` job: checkout,
      `pnpm/action-setup@v4` + `actions/setup-node@v4` (matching the existing
      jobs' pattern in this file), `pnpm install --frozen-lockfile`,
      `npx playwright install --with-deps chromium`, then
      `pnpm run test:e2e` with `PLAYWRIGHT_BASE_URL` set to the URL captured
      in T011. Depends on T011, T006.
- [ ] T013 [US2] Push a commit to PR #29 while it remains a draft; confirm
      the `e2e` check does not run (shown as skipped, not missing) on that
      push (Acceptance Scenario 1, FR-005a; spec.md Edge Cases: draft
      pushes). Depends on T012.
- [ ] T014 [US2] Mark PR #29 ready for review. Once Vercel's preview
      deployment for that commit finishes building, confirm the `e2e` check
      starts, runs against that specific preview URL, and reports pass
      (Acceptance Scenario 2, SC-002; quickstart.md CI run #2). Depends on
      T013.
- [ ] T015 [US2] Push one more commit to the now-ready-for-review PR #29 and
      confirm `e2e` runs again against the updated preview (Acceptance
      Scenario 3; quickstart.md CI run #3). Depends on T014.
- [ ] T016 [US2] Temporarily edit `tests/e2e/homepage.spec.ts` to assert
      something false, push, and confirm the `e2e` check fails and GitHub's
      merge button is blocked — matching how a failing type-check/lint/unit
      test already blocks merge. Revert the change and push again to confirm
      it returns to green (Acceptance Scenario 5, FR-006, SC-003;
      quickstart.md CI run #4). Depends on T014.

**Checkpoint**: User Stories 1 and 2 both work independently — local and CI
e2e runs both function end-to-end, merge is genuinely gated.

---

## Phase 5: User Story 3 - Understand the test strategy at a glance (Priority: P3)

**Goal**: `README.md` points to a detailed testing-pyramid doc with a
deployment diagram; the Playwright dependency decision is recorded as an ADR.

**Independent Test**: Open `README.md`, follow the testing-strategy link,
and confirm the destination document explains all three test layers and
includes a deployment diagram, without needing to read any test source code
(spec.md US3 Independent Test).

### Implementation for User Story 3

- [ ] T017 [P] [US3] Write `docs/testing-pyramid.md`: explain the unit layer
      (Jest, no browser/DOM) using `tests/unit/education/grade.test.ts` as
      a concrete existing example; the integration layer (Jest + jsdom, real
      `ContentProvider`, multiple components) using
      `tests/integration/content-sources.test.ts` as a concrete example;
      and the e2e layer (Playwright, real browser against a running
      deployment) using `tests/e2e/homepage.spec.ts` as the example — state
      what each layer catches that the others don't (FR-010). Depends on
      T006.
- [ ] T018 [US3] Add a Mermaid flowchart to `docs/testing-pyramid.md`
      showing GitHub (push / pull request) → Vercel (preview deploy /
      production deploy), with the point where the `e2e` CI job runs marked
      explicitly (FR-011, research Decision 4). Depends on T017 (same
      file), T010 (needs the real job's trigger/gating to describe
      accurately).
- [ ] T019 [P] [US3] Add a short (a few sentences) testing-strategy section
      to `README.md`, naming the three pyramid layers and linking to
      `docs/testing-pyramid.md` (FR-009).
- [ ] T020 [US3] Write `docs/adr/0028-playwright-e2e-testing.md` recording
      the decision to add Playwright plus the CI Vercel-preview-URL
      retrieval mechanism, following the existing ADR format (Status/Date,
      Context, Decision, Consequences, Alternatives rejected) — draw on
      research.md Decisions 1–3 for content. Confirm 0028 is still the next
      free number before writing (FR-012, Constitution Principle VI).
      Depends on T004, T011.
- [ ] T021 [US3] Add ADR 0028's row to the index table in
      `docs/adr/README.md`, in the same commit as T020 (Principle VI's
      same-PR rule). Depends on T020.

**Checkpoint**: All three user stories independently functional — the
feature is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm nothing else broke, and do a full run-through before
requesting review.

- [ ] T022 [P] Run `pnpm run type-check`, `pnpm run lint`, `pnpm test`, and
      `pnpm run build`; confirm all four pass with the new files present —
      regression check against the existing suite (57 suites / 448 tests as
      of this feature's branch point).
- [ ] T023 Run through `specs/019-playwright-e2e-tests/quickstart.md`
      end-to-end as a final validation pass before marking the PR ready for
      review. Depends on T022, and on every task quickstart.md's steps
      reference (T007–T009, T013–T016, T017–T021).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T001) — BLOCKS all user
  stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. No dependency on
  other stories — this is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational directly (T010) and
  on User Story 1's spec file existing to actually run in CI (T006, via
  T012). Cannot be meaningfully verified before US1's T006 exists.
- **User Story 3 (Phase 5)**: Depends on Foundational (T004) and on both
  earlier stories for accurate documentation content — T017/T020 need the
  real e2e spec (T006) and the real CI job (T010, T011) to describe
  truthfully, not a placeholder.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each User Story

- User Story 1: config → spec file → the three verification runs (T007,
  T008 can run in either order relative to each other once T006 exists;
  T009 only needs T005).
- User Story 2: CI job skeleton → preview-URL step → full job → the four
  verification pushes, strictly in order (each depends on the PR's current
  draft/ready state left by the previous one).
- User Story 3: the two doc files can be drafted in parallel (T017/T019),
  but the diagram (T018) and the ADR (T020) each need real, finished
  behavior from US1/US2 to describe accurately rather than guessing ahead
  of implementation.

### Parallel Opportunities

- T001 and T003 (Setup) — different files, no dependency between them.
- T017 and T019 (US3) — different files (`docs/testing-pyramid.md` vs
  `README.md`).
- T022's four commands (Polish) can run concurrently in separate terminals,
  though in practice running them sequentially is simpler to read output
  from.

---

## Parallel Example: Setup

```bash
# Launch together — different files, no dependency:
Task: "Add @playwright/test as a devDependency"
Task: "Add Playwright output directories to .gitignore"
```

## Parallel Example: User Story 3

```bash
# Launch together — different files:
Task: "Write docs/testing-pyramid.md (unit/integration/e2e explanation)"
Task: "Add a short testing-strategy section to README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: a developer can run `pnpm run test:e2e` locally
   and see a real browser test pass. This alone is a legitimate, shippable
   increment — CI wiring and docs add value on top of it, they aren't
   required for it to be useful.

### Incremental Delivery

1. Setup + Foundational → dual-target config exists.
2. User Story 1 → local e2e works → demonstrable on its own.
3. User Story 2 → CI wiring works → PRs get real preview-deployment
   coverage before merge.
4. User Story 3 → documentation → the whole thing is discoverable and
   explained, not just functional.
5. Polish → full regression pass, quickstart.md walkthrough, ready for
   review.

---

## Notes

- [P] tasks = different files, no dependencies between them.
- [Story] label maps each task to its user story for traceability back to
  spec.md.
- This feature adds zero production runtime code — every task touches
  test/config/CI/documentation files only (plan.md Technical Context).
- Verify T007/T008/T013–T016 by direct observation (terminal output, GitHub
  PR checks UI), not by writing a meta-test that tests the test runner.
- Commit after each task or logical group, per Constitution Principle III —
  a commit spanning Setup + Foundational (T001–T005, 5 files) is one unit of
  work by nature (project initialization); the CI workflow edit (T010–T012)
  is a second, separable commit even though it's also several steps within
  one file.
