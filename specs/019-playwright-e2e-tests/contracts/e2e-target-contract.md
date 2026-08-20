# Contract: e2e target selection

The interface between the Playwright test suite and whatever invokes it —
a developer's shell, or CI — so both target the intended URL without the
test code itself changing.

## `PLAYWRIGHT_BASE_URL` (environment variable)

| | |
|---|---|
| **Set by** | CI, to the PR's live Vercel preview URL (research.md Decision 2) |
| **Unset case** | Local developer runs, and any run where the caller doesn't override it |
| **Default when unset** | `http://localhost:3000` |
| **Consumer** | `playwright.config.ts` — becomes `use.baseURL` |
| **Effect on `webServer`** | Present (auto-start/reuse `pnpm run dev`) only when this variable is **unset**. When set, no local server is started — Playwright drives the browser directly at the external URL. |

**Guarantee**: no `*.spec.ts` file reads this variable, references a
locale-specific host, or otherwise branches on which target it's running
against. Test code is identical in both cases; only this one variable
differs, per FR-004.

## CI job gate: `github.event.pull_request.draft`

| | |
|---|---|
| **Read by** | The `e2e` job's `if:` condition in `.github/workflows/ci.yml` |
| **`true` (draft)** | Job does not run — shown as skipped, not silently absent |
| **`false` (ready for review)** | Job runs, per the trigger `types` list (research.md Decision 3) |

**Guarantee**: a PR cannot reach "ready for review" and stay there through a
merge attempt without an e2e result existing for its current commit — the
`ready_for_review` transition itself is a trigger type, so the first
non-draft state always produces a run (spec.md Edge Case: draft → ready
transition).
