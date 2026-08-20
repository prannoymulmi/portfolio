# Quickstart: Verify Playwright E2E Testing & Testing Pyramid Docs

Manual end-to-end verification once implementation lands. References
`spec.md` requirement IDs (FR-xxx, SC-xxx) rather than repeating them.

## Prerequisites

- `pnpm install` (pulls in the new `@playwright/test` devDependency)
- One-time browser binary install: `npx playwright install chromium`
- No dev server needs to be running beforehand — the local run starts one
  itself (US1)

## Local run (US1)

1. Confirm no dev server is already running (`lsof -ti:3000` returns
   nothing).
2. Run the documented e2e command (e.g. `pnpm run test:e2e`). Confirm: a dev
   server starts automatically, the smoke test runs in a real Chromium
   browser against it, the test passes, and the server is torn down when the
   run finishes. (FR-002, FR-003, SC-001)
3. Start `pnpm run dev` manually first, leave it running, then run the e2e
   command again. Confirm it reuses the already-running server instead of
   starting a second one on a different port. (FR-003)
4. Run `pnpm test` (the existing Jest command). Confirm it behaves exactly
   as before — same suite, same timing, no browser launched, no reference to
   the e2e suite. (FR-008)
5. Open the e2e spec file. Confirm it asserts against a single locale only
   (no language-toggle interaction) — per Clarifications, Session
   2026-08-20.

## CI / PR-preview run (US2)

1. Open a **draft** PR containing a trivial change. Confirm the `e2e` check
   does not run (shown as skipped, not missing) while the PR stays draft,
   even after pushing another commit to it. (FR-005a, Edge Case: draft
   pushes)
2. Mark the PR **ready for review**. Once Vercel's preview deployment for
   that commit finishes building, confirm the `e2e` CI check starts, runs
   against that PR's actual preview URL (not `localhost`, not production),
   and reports pass/fail as a normal PR check. (FR-005, FR-005a, SC-002)
3. Push a new commit to the now-ready PR. Confirm `e2e` runs again against
   the updated preview. (Acceptance Scenario, User Story 2)
4. Temporarily break the smoke test (e.g. assert on text that isn't there)
   and push. Confirm the `e2e` check fails and the PR's merge button is
   blocked, the same way a failing type-check/lint/unit-test check already
   blocks it. Revert the break afterward. (FR-006, SC-003)

## Documentation (US3)

1. Open `README.md`. Confirm a short (a few sentences) section names the
   three testing-pyramid layers and links to `docs/testing-pyramid.md`.
   (FR-009, SC-004)
2. Open `docs/testing-pyramid.md`. Confirm it explains unit (Jest, no
   browser), integration (Jest + jsdom, real `ContentProvider`), and e2e
   (Playwright, real browser against a running deployment) — each with a
   concrete existing example — and states what each layer catches that the
   others don't. (FR-010)
3. In the same document, confirm a Mermaid diagram renders showing GitHub
   (push / PR) → Vercel (preview deploy / production deploy), with the point
   where the e2e suite runs marked explicitly. (FR-011)
4. Open `docs/adr/README.md`. Confirm a new ADR entry exists for adding
   Playwright, linking to a full ADR under `docs/adr/` that records the
   decision, rationale, and consequences. (FR-012)

## Automated checks

```sh
pnpm type-check
pnpm lint
pnpm test              # unit + integration — unaffected by this feature
pnpm run test:e2e      # new — local target by default
pnpm run build
```

See `contracts/e2e-target-contract.md` for the `PLAYWRIGHT_BASE_URL` /
draft-PR-gate contract these checks and the CI job depend on.
