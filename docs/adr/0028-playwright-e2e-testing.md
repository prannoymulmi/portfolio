# ADR 0028: Playwright e2e testing against real Vercel previews, with a genuinely enforced merge gate

- **Status**: Accepted
- **Date**: 2026-08-20

## Context

This project had two test layers before this feature: unit (Jest) and
integration (Jest + jsdom) — see `docs/testing-pyramid.md`. Neither runs in a
real browser, and neither runs against a real deployment. A build could pass
every unit and integration test and still fail to actually render once
deployed — a bad build artifact, a client-side fetch that 404s against real
routing, a real-browser rendering issue jsdom can't reproduce. Nothing in the
existing suite could catch that class of bug before it reached production.

Separately, and only discovered while implementing this feature rather than
anticipated during planning, two things turned out not to be true that had
been assumed true:

1. This Vercel project has Deployment Protection enabled on preview
   deployments. Every unauthenticated request to a preview URL — including
   both the GitHub Action polling for the preview's readiness and
   Playwright's own requests once it started driving a browser against
   that URL — received a 401. The e2e suite could not reach the thing it was
   meant to test.
2. `main` had no branch protection rule at all. "A failing check blocks
   merge" had only ever been a social convention, for every existing check
   (lint, type-check, unit tests, build), not something GitHub actually
   enforced. This was confirmed live: a deliberately-broken e2e test showed
   `mergeStateStatus: "UNSTABLE"` with `mergeable: true` and the check
   showing red — GitHub was willing to let the PR merge anyway.

Both of these are part of the same decision, not separate follow-ups: adding
Playwright e2e tests against Vercel previews is meaningless if CI can't
actually reach the preview it's supposed to test, and a merge gate that
GitHub doesn't enforce isn't a gate.

## Decision

**Add a Playwright e2e suite (`tests/e2e/`) as a third test layer**, run via
`pnpm run test:e2e`, configured through `playwright.config.ts` with a single
dual-target mechanism (research.md Decision 1): `PLAYWRIGHT_BASE_URL`, when
set, becomes `use.baseURL` directly with no `webServer` block defined —
Playwright drives a browser straight at that already-running remote URL. When
unset, `use.baseURL` defaults to `http://localhost:3000` and a `webServer`
block starts (and reuses, `reuseExistingServer: true`) a local `pnpm run dev`
server. The same spec files run unmodified either way.

**Retrieve the PR's real Vercel preview URL in CI via a dedicated GitHub
Action** (`patrickedqvist/wait-for-vercel-preview`, pinned to `v1.3.3`)
rather than a hand-rolled polling script or a second, redundant deployment
triggered from CI itself (research.md Decision 2). This action polls the
GitHub Deployments API for the `deployment_status` event Vercel's own GitHub
App already posts against the PR's head commit — it waits for the
deployment Vercel's Git integration creates automatically, it does not
trigger a new one.

**Gate the `e2e` CI job on the PR's draft status**, not a separate manual
trigger (research.md Decision 3): the `pull_request` trigger's `types` list
includes `ready_for_review` alongside GitHub's implicit defaults, and the
`e2e` job itself carries `if: github.event.pull_request.draft == false`. A
run against a still-draft PR shows as skipped on the checks list, not
silently absent.

**Bypass Vercel's Deployment Protection using a dedicated automation
secret**, discovered necessary only once CI actually tried to reach a real
preview URL and got 401s back. `VERCEL_AUTOMATION_BYPASS_SECRET` — Vercel's
"Protection Bypass for Automation" secret, generated in the project's
Deployment Protection settings — is stored as a GitHub Actions repo secret
and used in two places:

- Passed to the `wait-for-vercel-preview` action's
  `vercel_protection_bypass_header` input, so the action's own polling
  requests aren't blocked either.
- Passed to the `e2e` job's `pnpm run test:e2e` step as an environment
  variable, which `playwright.config.ts` reads and — only when present —
  attaches as the `x-vercel-protection-bypass` (plus
  `x-vercel-set-bypass-cookie: true`) header on every request Playwright
  itself makes.

This secret is only ever set in CI. A local run never has
`VERCEL_AUTOMATION_BYPASS_SECRET` in its environment, so the header is
conditionally omitted entirely rather than sent empty — there is nothing to
bypass locally, and no secret to leak into a local shell's history.

**Add branch protection on `main` requiring all four CI checks** — `Lint and
Type Check (22)`, `Unit Tests (22)`, `Build (22)`, and `E2E Tests (22)` — to
pass before a PR can merge. This was not scoped as a functional requirement
of this feature, but was necessary for the feature's own success criteria
(a failing e2e run actually blocking merge) to be true rather than
aspirational — confirmed with the site owner before applying. Re-checked
live afterward with the same deliberately-broken e2e test: `mergeStateStatus`
changed from `"UNSTABLE"` to `"BLOCKED"` with the same red `e2e` check.

**Diagram the pipeline as Mermaid** (research.md Decision 4), embedded
directly in `docs/testing-pyramid.md` rather than as a binary image asset —
GitHub renders Mermaid natively in both rendered `.md` files and PR
descriptions, and this project already avoids binary content wherever a text
format works instead (ADR 0001's broader preference).

## Consequences

**Positive**

- A real class of bug — passes every unit/integration test, fails in an
  actual browser against an actual deployment — is now caught before merge,
  not after.
- The same spec files run identically locally and in CI; there is no
  separate CI-only test code to drift from what a developer runs on their
  own machine.
- Merge protection is no longer a social convention for *any* of the four
  checks, not just the new one — this feature incidentally fixed a
  pre-existing gap that predated it.
- The automation-bypass secret is scoped narrowly (CI only, this specific
  header) and does not weaken Deployment Protection for anyone else hitting
  a preview URL.

**Negative**

- **A new secret to manage**: `VERCEL_AUTOMATION_BYPASS_SECRET` must be kept
  in sync between Vercel's dashboard and the GitHub repo secret if it's ever
  rotated; nothing currently automates that.
- **E2E is the slowest and least reliable of the three layers** by nature —
  it depends on a real deployment finishing (`max_timeout: 600` seconds for
  the wait step) and on a real network round-trip, so it is more exposed to
  transient infrastructure flakiness (a slow Vercel build, a network blip)
  than the unit or integration layers, which have no such external
  dependency.
- **Branch protection now genuinely blocks merge on any of the four checks
  failing**, including pre-existing ones (lint, type-check, unit, build) that
  were previously only socially enforced — a legitimate but previously-absent
  constraint that could, in principle, block an urgent merge if any of the
  four is red for a reason unrelated to the change being merged.
- **Single-locale coverage only** (FR-001/FR-007): the e2e suite does not
  exercise the language toggle or the German locale; a real-browser
  regression specific to German content or the toggle itself would not be
  caught by this suite as it stands today.

## Alternatives rejected

- **Separate `playwright.local.config.ts` / `playwright.ci.config.ts`
  files** instead of one env-var-driven config — rejected: two configs drift
  the moment one is edited and the other isn't; a single `PLAYWRIGHT_BASE_URL`
  read is the entire "dual-target" mechanism needed.
- **A hand-rolled polling script** (`gh api` loop against the deployments
  endpoint) instead of the `wait-for-vercel-preview` action — rejected:
  reinvents a solved, battle-tested problem this project would then own and
  debug itself.
- **Deploying directly from GitHub Actions via the Vercel CLI**
  (`vercel deploy --prebuilt`) instead of waiting for the Git integration's
  automatic deployment — rejected: creates a second, redundant deployment
  alongside the one Vercel already makes, doubling build time for no
  benefit and deviating from the constitution's documented
  GitHub → Vercel flow.
- **A separate `workflow_dispatch`-triggered e2e run** instead of gating on
  draft status via a job-level `if` — rejected: reintroduces a manual step
  the automatic, event-driven gate exists specifically to avoid.
- **Disabling Vercel Deployment Protection on previews entirely**, once the
  401s were diagnosed, instead of adding a scoped automation-bypass secret —
  rejected: would remove protection for every preview URL, not just CI's
  requests, trading a narrow CI-only fix for a broader, unrelated exposure.
- **Leaving branch protection as a social convention** once the gap was
  found, on the grounds that it was out of this feature's original scope —
  rejected after confirming with the site owner: a merge gate that GitHub
  doesn't enforce isn't a gate, and the whole point of adding e2e tests to
  CI was for a failing one to actually stop a merge.
- **A hand-drawn image (PNG/SVG) for the pipeline diagram** instead of
  Mermaid — rejected: another binary asset to regenerate by hand whenever
  the pipeline changes, when Mermaid renders natively on GitHub at zero
  added cost.
