# Implementation Plan: Playwright E2E Testing & Testing Pyramid Docs

**Branch**: `feat/playwright-e2e-tests` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-playwright-e2e-tests/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a Playwright end-to-end test suite that runs unmodified against either a
local dev server (default, auto-started/reused) or an external deployed URL,
selected by one environment variable. Wire CI to run it automatically against
a PR's own Vercel preview deployment — but only once the PR is marked ready
for review, not on draft pushes — gating merge on failure the same way the
existing type-check/lint/unit-test job already does. Document the resulting
three-layer testing pyramid (unit/integration/e2e) with a short `README.md`
pointer and a detailed `docs/testing-pyramid.md` that includes a Mermaid
diagram of the GitHub → Vercel pipeline showing where e2e runs in it.

Technical approach: `@playwright/test` as a new devDependency (no production
code change); `playwright.config.ts` reads `PLAYWRIGHT_BASE_URL`, defaulting
to `localhost:3000` with an auto-managed `webServer`, or driving straight at
an externally-supplied URL with no local server when the variable is set. A
new `e2e` CI job waits for the Vercel preview via an established GitHub
Action (not a hand-rolled poller, not a second Vercel deployment), gated by
`github.event.pull_request.draft == false`. One new ADR records the decision.

## Technical Context

**Language/Version**: TypeScript strict, Next.js 16.3.0 App Router, Node 22
(matches existing CI matrix)

**Primary Dependencies**: `@playwright/test` (**new devDependency** — no
other new runtime dependency; no production code touched). Existing stack
(Zod, Framer Motion, GSAP, Tailwind v4, `next-themes`) untouched.

**Storage**: N/A — no data model (see data-model.md)

**Testing**: Jest + RTL for unit/integration (`tests/unit/`,
`tests/integration/`, unchanged); **Playwright for e2e** (new, `tests/e2e/`)

**Target Platform**: CI on GitHub Actions `ubuntu-latest` (existing runner);
e2e browser is headless Chromium (research.md, Assumptions: Chromium only for
now); target site is Next.js on Vercel, unchanged

**Project Type**: Single Next.js web app (ADR 0012) — this feature adds
test/CI/documentation tooling only, no new app surface

**Performance Goals**: no hard target from the spec; soft goal that the e2e
CI job completes quickly enough to not meaningfully slow the existing PR
feedback loop (a single smoke test against one browser, not a large suite)

**Constraints**: e2e suite MUST NOT run inside `pnpm test` (FR-008); e2e CI
job MUST NOT run while a PR is a draft (FR-005a); CI MUST read the *existing*
automatic Vercel preview deployment, not trigger a second one; identical test
code MUST run against both targets (FR-004)

**Scale/Scope**: 1 new devDependency, 1 new config file
(`playwright.config.ts`), 1 new test directory with 1 initial smoke-test spec
(single locale, per Clarifications), 1 new CI job, 1 new `package.json`
script, 1 new ADR + index update, 2 documentation changes (`README.md` short
note, new `docs/testing-pyramid.md` with a Mermaid diagram)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.6.0.

| Principle | Status | Notes |
|---|---|---|
| I. KISS (NON-NEGOTIABLE) | PASS | One env var for dual-target selection, not a config-per-environment system (research Decision 1); an established GitHub Action for the Vercel-preview-URL wait, not a hand-rolled poller (research Decision 2). |
| II. Test-First (NON-NEGOTIABLE) | PASS (obligation) | This feature's deliverable *is* a test suite. The new e2e spec must stay as plain and readable as the existing Jest suites — no obscure setup, no over-mocking (there's little to mock — it's a real browser against a real deployment). |
| III. Atomic Commits | PASS (obligation) | See task ordering in tasks.md (next command) — config, CI workflow, docs, and ADR are separable units. |
| IV. Technology Stack (NON-NEGOTIABLE) | PASS, not touched | Principle IV has no "Testing" entry today (Jest itself isn't named there either), so adding Playwright doesn't substitute or extend a named stack bullet. No constitution amendment needed. |
| V. Token Efficiency | PASS | N/A — no unusual AI-prompting concern in this feature. |
| VI. Recorded Decisions | ACTION REQUIRED | New dependency (`@playwright/test`) plus the CI-retrieval mechanism → **ADR 0028** required, landing in the same PR as the implementation, with a row added to `docs/adr/README.md` in the same commit. Next free number confirmed: 0027 is the highest existing. |

**Sub-gates**:
- No CSS-in-JS, no new UI dependency, no theme/locale/icon-set change: PASS —
  this feature touches zero application runtime code.
- `tests/integration/content-sources.test.ts` and other existing test
  infrastructure: PASS, untouched — e2e is fully additive and separate.
- Development Workflow ("CI runs type-check, lint, and tests on every PR;
  merge blocked on failure"): PASS, extended rather than replaced — `e2e`
  joins `lint-and-type-check`/`test`/`build` as a fourth gate, scoped to
  non-draft PRs per FR-005a.
- Development Workflow ("Vercel preview deploy on every PR; production
  deploy on merge to main"): PASS, unchanged — this feature reads that
  existing pipeline, it doesn't add a second one.

No unjustified NON-NEGOTIABLE violation. No ERROR. Complexity Tracking is
empty.

## Project Structure

### Documentation (this feature)

```text
specs/019-playwright-e2e-tests/
├── plan.md                          # This file (/speckit-plan command output)
├── research.md                      # Phase 0 output (/speckit-plan command)
├── data-model.md                    # Phase 1 output (/speckit-plan command)
├── quickstart.md                    # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── e2e-target-contract.md       # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md              # /speckit-specify output, re-validated by /speckit-clarify
└── tasks.md                         # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Single Next.js App Router project (matches the existing repository layout;
no new top-level project is introduced — this feature is additive
test/CI/documentation tooling only).

```text
playwright.config.ts                 # NEW: dual-target config (research Decision 1)

tests/
├── unit/                            # UNCHANGED
├── integration/                     # UNCHANGED
└── e2e/                             # NEW
    └── homepage.spec.ts             # NEW: single-locale smoke test (Clarifications, 2026-08-20)

.github/workflows/
└── ci.yml                           # MODIFIED: new `e2e` job, draft-PR gated (research Decision 3)

package.json                         # MODIFIED: new "test:e2e" script; new devDependency @playwright/test

docs/
├── testing-pyramid.md               # NEW: unit/integration/e2e explained + Mermaid deployment diagram
└── adr/
    ├── 0028-<slug>.md                # NEW: Playwright + CI-retrieval decision
    └── README.md                    # MODIFIED: index row for ADR 0028

README.md                            # MODIFIED: short testing-strategy note + link to docs/testing-pyramid.md
```

**Structure Decision**: everything lives inside the existing single-project
layout. `tests/e2e/` sits parallel to the established `tests/unit/` /
`tests/integration/` split (Assumptions, spec.md), and `playwright.config.ts`
lives at the repo root — Playwright's default discovery location, mirroring
how `jest.config.js` already sits at the root for the existing suites.

## Complexity Tracking

*No entries — Constitution Check produced no unjustified violation.*
