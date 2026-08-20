# Phase 1 Data Model: Playwright E2E Testing & Testing Pyramid Docs

This feature has no runtime data model — it adds a test suite, a CI job, and
documentation, none of which introduce application data. What follows is the
inventory of on-disk **configuration and documentation artifacts** the
feature spec's requirements map onto, standing in for the usual
entity/field list.

## E2E test suite (`tests/e2e/`)

- **Lifecycle**: parallel to the existing `tests/unit/` and
  `tests/integration/` directories (Assumptions, spec.md). Contains one
  initial spec file (a single-locale homepage smoke test — Clarifications,
  Session 2026-08-20) that other e2e tests can pattern-match against later.
- **Invariant**: never imported or run by the Jest config (`jest.config.js`'s
  `testMatch`) or the `pnpm test` script — FR-008 requires it stay a fully
  separate command.

## Playwright configuration (`playwright.config.ts`)

- **New file**, repo root (Playwright's default discovery location).
- **Fields that matter to this feature**: `use.baseURL` (env-driven, research
  Decision 1), conditional `webServer` block (present only for the local/no-
  override case).

## CI workflow (`.github/workflows/ci.yml`)

- **New job**: `e2e`, alongside the existing `lint-and-type-check`, `test`,
  and `build` jobs. `needs: lint-and-type-check` (fail fast on a trivial
  error before spending time waiting on a preview deployment), independent
  of `test`/`build` otherwise since it targets a live external URL rather
  than a local build artifact.
- **Trigger condition**: `pull_request` event, `types` including
  `ready_for_review`; job-level `if: github.event.pull_request.draft ==
  false` (research Decision 3, FR-005a).
- **New step**: wait for the Vercel preview deployment and capture its URL
  (research Decision 2), then run `pnpm run test:e2e` with
  `PLAYWRIGHT_BASE_URL` set to that URL.

## Package manifest (`package.json`)

- **New script**: `"test:e2e": "playwright test"` (FR-002, FR-008).
- **New devDependency**: `@playwright/test`.

## Documentation artifacts

| File | What changes |
|---|---|
| `README.md` | New short section (a few sentences) naming the testing pyramid's three layers, linking to the detailed doc (FR-009) |
| `docs/testing-pyramid.md` | New file: unit/integration/e2e explained with a concrete existing example of each, plus the Mermaid deployment diagram (FR-010, FR-011) |
| `docs/adr/0028-<slug>.md` | New ADR recording the Playwright + CI-retrieval decision (FR-012) |
| `docs/adr/README.md` | One new index row for ADR 0028 |

No artifact here has a state machine, relationships to another entity, or
validation rules beyond "the e2e suite must not appear in Jest's `testMatch`"
— this is test/CI/documentation tooling, not a data feature.
