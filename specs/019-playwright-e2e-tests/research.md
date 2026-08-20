# Phase 0 Research: Playwright E2E Testing & Testing Pyramid Docs

Four real technical unknowns existed after the spec was clarified. Each is
resolved below with a decision, rationale, and the alternatives rejected.

## Decision 1: Dual-target base URL via one environment variable, not a config-per-environment system

**Decision**: `playwright.config.ts` reads `process.env.PLAYWRIGHT_BASE_URL`.
When set (CI, against a Vercel preview), it becomes `use.baseURL` directly and
no `webServer` block is defined — Playwright drives the browser straight at
that already-running remote URL. When unset (local dev), `use.baseURL`
defaults to `http://localhost:3000` and a `webServer` block is defined:
`command: 'pnpm run dev'`, `url: 'http://localhost:3000'`,
`reuseExistingServer: true`. Playwright's own `webServer` runner checks the
URL before starting a new process, so an already-running `pnpm run dev`
server is detected and reused rather than double-started (FR-003); if none
is running, Playwright starts one, waits for it to respond, and tears it
down when the run finishes.

**Rationale**: One env var is the entire "dual-target" mechanism — no
separate config files, no CLI flags to remember, no branching test code.
The same `*.spec.ts` files run unmodified either way (FR-004), satisfying
Principle I (KISS): the simplest thing that actually works.

**Alternatives considered**:
- Separate `playwright.local.config.ts` / `playwright.ci.config.ts` files —
  rejected: two configs drift the moment one is edited and the other isn't;
  Playwright's `--config` flag exists for real per-environment *test
  selection* differences, not for a single URL value.
- A CLI flag (`playwright test --base-url=...`) — rejected: not a real
  Playwright CLI option; would require a wrapper script to translate a flag
  into the env var Playwright actually reads, which is more moving parts for
  no benefit over setting the env var directly.

## Decision 2: Retrieve the PR's Vercel preview URL via a dedicated GitHub Action, not a hand-rolled polling script

**Decision**: The CI `e2e` job uses an established GitHub Action
(`patrickedqvist/wait-for-vercel-preview`, or an equivalent well-maintained
action serving the same purpose) that polls the GitHub Deployments API for
the `deployment_status` event Vercel's own GitHub App posts against the PR's
head commit, and outputs the preview's `target_url` once it's ready
(`environment_url`/similar output). That URL is passed into the Playwright
run as `PLAYWRIGHT_BASE_URL`.

Crucially, this **waits for** the deployment Vercel's existing Git
integration already creates automatically (per the constitution's Deployment
entry — "GitHub → Vercel automatic preview + production deploys on push") —
it does not trigger a second, separate deployment via the Vercel CLI or API.

**Rationale**: Vercel's preview-deploy-on-PR is already fully automatic and
unrelated to this repo's own GitHub Actions workflow; CI's only job is to
*notice* when that deployment is ready and *read* its URL. A dedicated,
widely-used action for exactly that GitHub-Deployments-API polling pattern
is simpler and more battle-tested (handles timeouts, retries, and the
deployment-status edge cases already) than a bespoke polling script this
project would then own and debug. Matches Principle I (KISS).

**Alternatives considered**:
- Hand-rolled polling script (`gh api` loop against
  `/repos/{owner}/{repo}/deployments`) — rejected: reinvents what the
  established action already does correctly, adds maintenance surface for a
  problem that isn't specific to this project.
- Deploy directly from GitHub Actions via the Vercel CLI
  (`vercel deploy --prebuilt`) — rejected: creates a second, redundant
  deployment alongside the one Vercel's native Git integration already
  makes, doubling build time and deviating from the constitution's
  documented "GitHub → Vercel" flow for no benefit.
- Manually copy the preview URL from the PR each run — rejected: not
  automatable, fails SC-002's "zero manual steps" requirement outright.

## Decision 3: E2E job gated on PR draft status via a workflow-level `if` condition

**Decision**: The `pull_request` trigger's `types` list includes
`ready_for_review` alongside the existing implicit defaults
(`opened`, `synchronize`, `reopened`), so GitHub actually fires the
workflow on that transition. The `e2e` job itself carries
`if: github.event.pull_request.draft == false` (or equivalent), so any run
associated with a still-draft PR is skipped — visibly, as GitHub's normal
"skipped" job state, not silently absent — while a run on a non-draft PR (or
one just transitioned out of draft) proceeds (FR-005a).

**Rationale**: This is a single boolean expression read directly off event
payload data GitHub already provides — no external state, no separate
tracking of "has this PR been marked ready before." Satisfies the edge case
of a PR going draft → ready without ever having run e2e: the same
`ready_for_review`-triggered run covers it.

**Alternatives considered**:
- A separate, manually-triggered `workflow_dispatch` for e2e — rejected:
  reintroduces the "zero manual steps" gap SC-002 exists to close.
- Checking draft status inside the job's first step (and exiting early
  instead of using a job-level `if`) — rejected: still spends a runner and a
  wait-for-preview cycle before bailing, and GitHub's UI shows a "skipped"
  job for an `if`-gated job but a spurious "failed-then-passed-anyway" for a
  step that exits 0 early — the job-level `if` reads more honestly on the PR
  checks list.

## Decision 4: Deployment diagram as Mermaid, embedded in the docs file

**Decision**: The GitHub → Vercel pipeline diagram (FR-011) is a Mermaid
flowchart in a fenced ` ```mermaid ` code block inside the new
`docs/testing-pyramid.md`.

**Rationale**: GitHub renders Mermaid natively in both `.md` files viewed on
github.com and PR descriptions — no external tool, no image asset to keep in
sync with the pipeline it depicts, no dependency. Nothing else in this
project's toolchain needs to change to support it.

**Alternatives considered**:
- A hand-drawn image (PNG/SVG) — rejected: another binary asset to
  regenerate by hand whenever the pipeline changes, and this project already
  avoids binary content wherever a text format works instead (ADR 0001's
  broader preference for editable, diffable content).
- ASCII art — rejected: harder to read, doesn't render as an actual diagram,
  and Mermaid support already exists at zero cost.

## Summary of resulting technical context

| Area | Resolution |
|---|---|
| New runtime dependency | None — `@playwright/test` is a devDependency only; no production code changes |
| New CI-only dependency | One GitHub Action for Vercel-preview-URL retrieval (workflow YAML reference, not an npm package) |
| Base URL mechanism | `PLAYWRIGHT_BASE_URL` env var, default `localhost:3000` |
| Local server lifecycle | Playwright `webServer` (auto-start + reuse), local runs only |
| CI trigger | `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`), job gated by `draft == false` |
| Diagram format | Mermaid, embedded in `docs/testing-pyramid.md` |
| ADR | One new ADR bundling the Playwright + CI-retrieval decision (next number after the highest existing ADR at implementation time) |
