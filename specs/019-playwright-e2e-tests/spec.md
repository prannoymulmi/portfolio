# Feature Specification: Playwright E2E Testing & Testing Pyramid Docs

**Feature Branch**: `feat/playwright-e2e-tests`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "I now want to create a playwright test as e2e test but I want to have local test which tests against localhost and also when I make a PR it takes the URL from vercel and tests against it I want to also make a documentation of the test Pyramid make a short note in the main Readme and in detail testing pyramind with unit integ and e2e with playwright. Also make a deployment diagram with github with preview and prod ans show e2e is done"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run e2e tests locally against localhost (Priority: P1)

A developer (the site owner or a future contributor) runs the Playwright suite on
their own machine, against a real running instance of the site — not the jsdom
environment the existing Jest suites use — to verify a full, browser-rendered user
flow works before pushing. The suite targets `localhost` by default and starts the
dev server itself if one isn't already running.

**Why this priority**: Nothing else in this feature is useful if the tests can't
be written and run at all. This is the foundation every other story builds on —
CI targeting is the same test code pointed at a different URL.

**Independent Test**: On a clean checkout with no dev server running, run the
documented e2e command and confirm it starts the dev server, runs a real browser
against it, and reports pass/fail.

**Acceptance Scenarios**:

1. **Given** no dev server is running, **When** a developer runs the documented
   e2e command, **Then** a local dev server starts automatically, at least one
   test executes in a real browser against it, and the server is torn down when
   the run finishes.
2. **Given** a dev server is already running on the expected port, **When** a
   developer runs the documented e2e command, **Then** the suite reuses that
   server instead of starting a second one.
3. **Given** the e2e suite exists, **When** a developer runs the existing `pnpm
   test` (Jest) command, **Then** it completes exactly as it does today — the
   e2e suite is a separate command and does not run as part of it.

---

### User Story 2 - E2E tests run automatically against the PR's Vercel preview (Priority: P2)

When a pull request is opened or updated, CI runs the same e2e suite — unmodified
— against that PR's actual Vercel preview deployment, once the preview is ready.
This is the closest check to what a real visitor will see once the change ships,
available before merge rather than after.

**Why this priority**: This is the feature's other half explicitly requested —
local-only e2e testing would catch nothing environment-specific (build output,
env vars, CDN caching) that only shows up on a real deployment. It depends on
Story 1's suite existing first.

**Independent Test**: Open a PR against a branch with the e2e suite present,
confirm a CI check appears that runs against the PR's own preview URL (not
localhost, not production), and that its result is visible on the PR before
merge.

**Acceptance Scenarios**:

1. **Given** a PR is opened, **When** Vercel finishes building that PR's preview
   deployment, **Then** the e2e CI job runs the same test suite against that
   specific preview URL.
2. **Given** the e2e job is running for a PR, **When** it finishes, **Then** its
   pass/fail result is visible on the PR as a check, the same way the existing
   type-check/lint/test check already is.
3. **Given** an e2e test fails against a PR's preview, **When** someone attempts
   to merge, **Then** the merge is blocked, matching how a failing type-check,
   lint, or unit test already blocks merge today.

---

### User Story 3 - Understand the test strategy at a glance (Priority: P3)

A developer or future maintainer reading `README.md` finds a short pointer to the
project's testing strategy. Following it, they reach a detailed document
explaining the testing pyramid — unit, integration, and e2e — what each layer is,
what it catches that the others don't, and a diagram of the GitHub → Vercel
deployment pipeline showing where in that pipeline the e2e suite actually runs.

**Why this priority**: Valuable for onboarding and for the site owner's own
future reference, but the tests working (Stories 1–2) matter more than them
being documented. Lowest priority, still required.

**Independent Test**: Open `README.md`, follow the testing-strategy link, and
confirm the destination document explains all three test layers and includes a
deployment diagram, without needing to read any test source code to understand
either.

**Acceptance Scenarios**:

1. **Given** `README.md`, **When** a reader looks for how the project is tested,
   **Then** they find a short (a few sentences) note naming the three layers and
   a link to the detailed document.
2. **Given** the detailed testing-pyramid document, **When** a reader opens it,
   **Then** it explains what unit, integration, and e2e tests are in this
   project, gives a concrete example of each from the existing test suite, and
   states what each layer is for.
3. **Given** the detailed testing-pyramid document, **When** a reader looks for
   how e2e fits into deployment, **Then** they find a diagram showing GitHub (push
   / pull request) → Vercel (preview deploy / production deploy) with the point
   in that flow where the e2e suite runs marked explicitly.

### Edge Cases

- What happens if a PR's Vercel preview deployment is still building when the
  e2e CI job would normally start? The job MUST wait for the preview to finish
  building rather than testing a URL that isn't ready yet or failing immediately
  because nothing answered.
- What happens on a PR from a fork, where Vercel may not create a preview at all
  due to permissions? The e2e job MUST report this clearly (e.g. skipped, not
  silently green) rather than hard-failing the PR for a reason unrelated to the
  code change itself.
- What happens if an e2e test asserts on content that loads asynchronously (this
  site fetches its JSON content client-side, per ADR 0003)? Tests MUST wait for
  the real content to appear the way an actual visitor's browser would, not
  assume it is present immediately after navigation.
- What happens when the e2e suite runs locally but no `.env` / preview URL is
  configured? It MUST fall back to `localhost` with no additional setup required
  — the local path must work out of the box.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST have a Playwright end-to-end test suite, living
  separately from the existing Jest unit and integration suites, that drives a
  real browser against a running instance of the site rather than a jsdom
  environment.
- **FR-002**: The e2e suite MUST be runnable locally via a single documented
  command, targeting the local dev server by default.
- **FR-003**: When run locally with no dev server already listening, the e2e
  command MUST start one automatically and wait for it to be ready before tests
  run, and MUST reuse an already-running server instead of starting a second one.
- **FR-004**: The base URL the e2e suite targets MUST be overridable (e.g. via an
  environment variable), so the identical test code can run against `localhost`,
  a Vercel preview URL, or another deployed URL without modification.
- **FR-005**: CI MUST run the e2e suite against the actual Vercel preview
  deployment URL for a pull request, automatically, once that preview build is
  ready — not against a separately-started local server.
- **FR-006**: The e2e CI job's result MUST gate the pull request the same way the
  existing type-check/lint/test CI job does — a failing e2e run blocks merge.
- **FR-007**: At least one real, passing e2e test scenario MUST exist (not empty
  scaffolding), and MUST pass against both a local dev server and a deployed
  Vercel URL, proving the dual-target setup actually works end-to-end.
- **FR-008**: The e2e suite MUST NOT run as part of the existing `pnpm test`
  (Jest) command — it is invoked separately, so the fast unit/integration suite
  developers run constantly keeps its current speed and does not require a
  browser or a running server.
- **FR-009**: `README.md` MUST gain a short section (a few sentences) describing
  the project's testing strategy as a pyramid of three layers, linking to a
  detailed document rather than explaining the layers in full there.
- **FR-010**: A new detailed testing-pyramid document MUST exist under `docs/`
  explaining all three layers — unit (Jest, no browser or DOM), integration
  (Jest + jsdom, multiple components and the real `ContentProvider`), and e2e
  (Playwright, real browser against a running deployment) — what each catches
  that the others don't, and a concrete existing example of each.
- **FR-011**: The detailed testing-pyramid document MUST include a diagram of the
  GitHub → Vercel deployment pipeline (push/PR triggers a preview deploy; merge
  to `main` triggers a production deploy) with the e2e suite's position in that
  flow shown explicitly.
- **FR-012**: Adding Playwright as a new project dependency MUST be recorded as
  an ADR in `docs/adr/`, per the constitution's Principle VI, and the ADR index
  in `docs/adr/README.md` updated to list it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer goes from a clean checkout to a passing local e2e run
  using one documented command, with no manual step to start a server first.
- **SC-002**: Opening or updating a pull request produces an e2e test result
  against that PR's own preview deployment with zero manual steps, visible on
  the PR before merge.
- **SC-003**: A pull request with a failing e2e test cannot be merged, matching
  the existing block-on-failure behavior of type-check, lint, and unit tests.
- **SC-004**: A reader can go from `README.md` to a full explanation of all three
  test layers, plus the deployment diagram showing where e2e runs, within one
  link-click and without reading test source code.
- **SC-005**: A new contributor can discover how to run the e2e suite the same
  way they'd discover any other project command — one documented script, no
  tribal knowledge required.

## Assumptions

- **Scope of automated e2e runs**: this feature covers running e2e tests locally
  and against a PR's Vercel preview deployment. It does not add an automated e2e
  run against the production deployment after a merge to `main` — the
  documentation's deployment diagram shows production as part of the pipeline
  for completeness, but no new automated test targets it. This can be added
  later without restructuring what this feature builds.
- **Initial test coverage**: this feature adds the dual-target (local/preview)
  infrastructure and at least one real, working smoke-test scenario (e.g. the
  homepage loads and its primary content renders) as a working example other
  tests can follow. Comprehensive page-by-page e2e coverage of the whole site is
  a separate, future effort, not this feature's scope.
- **Browser coverage**: the initial suite targets one browser engine (Chromium),
  consistent with how most projects start an e2e suite. Playwright supports
  adding Firefox/WebKit later without restructuring existing tests; that
  expansion is out of scope here.
- **CI gating**: the e2e job blocks PR merge on failure, matching the project's
  existing documented CI norm ("merge blocked on failure") for type-check, lint,
  and unit tests — no new "informational only, non-blocking" check category is
  introduced.
- **Fork PRs**: exact handling when a fork PR has no accessible Vercel preview
  (a permissions case Vercel's own GitHub integration governs, not this
  project's code) is left to planning/implementation; the requirement here is
  only that the e2e job doesn't silently mislabel that case as a normal pass or
  an unrelated code failure.
- **Testing pyramid mapping onto existing tests**: `tests/unit/` (Jest, no DOM)
  is the unit layer, `tests/integration/` (Jest + jsdom, real `ContentProvider`,
  multi-component) is the integration layer, and the new Playwright suite is the
  e2e layer. No existing test is moved, renamed, or recategorized — this feature
  documents the three layers together and adds the third.
- **Directory and command naming**: the e2e suite lives in its own directory
  (parallel to the existing `tests/unit/` and `tests/integration/` convention)
  and is run via its own `package.json` script, consistent with how every other
  test command in this project is already discoverable. Exact naming is a
  planning-phase decision.
