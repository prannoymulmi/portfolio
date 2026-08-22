# Phase 1 Data Model: E2E Coverage for Major Flows, Desktop & Mobile

This feature adds no application data — no new JSON content, no schema, no
provider. What it does add is a small set of *test-suite* entities that the
spec names in its Key Entities section. They are expanded below with concrete
attributes, because the coverage document (US3) is literally a rendering of
this model, and the config change (D1/D2 in research.md) is the mechanism that
gives two of these entities their values.

## Entity: Viewport project

A Playwright project in `playwright.config.ts`. Exactly two exist after this
feature.

| Attribute | Type | `desktop` | `mobile` |
|---|---|---|---|
| `name` | string, unique, stable | `desktop` | `mobile` |
| `viewport.width` | px | `1440` | `390` |
| `viewport.height` | px | `900` | `844` |
| Base descriptor | Playwright `devices` entry | `Desktop Chrome` | `Desktop Chrome` |
| Runs files matching | glob | `tests/e2e/*.spec.ts` (via `testIgnore: /mobile\//`) | `tests/e2e/**/*.spec.ts` (no ignore) |
| Breakpoint side | derived | `>= 1024px` (desktop layout) | `< 1024px` (mobile layout) |

**Invariants**
- Exactly one project sits on each side of the site's own `1024px` breakpoint
  (`components/Hero/useHeroScrollBlur.ts`'s `DESKTOP_LAYOUT`). A width change
  that crosses that line invalidates the whole model and must be a deliberate
  edit here first.
- Neither project sets `isMobile`, `hasTouch`, `userAgent`, or
  `deviceScaleFactor` — the site branches on CSS width only (research D1).
- Both inherit the existing `use.baseURL` and `extraHTTPHeaders` from the
  top-level `use` block; neither redefines target selection. The
  `PLAYWRIGHT_BASE_URL` contract from 019 is untouched (FR-009).
- Project names are a published interface — see
  `contracts/viewport-project-contract.md`.

## Entity: E2E test case

One Playwright `test()` verifying one user-visible outcome.

| Attribute | Meaning | Allowed values / rule |
|---|---|---|
| `flow` | The major functionality it covers | one of: hero load, locale toggle, project detail modal, career chapter navigation, contact links, hamburger menu, horizontal overflow |
| `scope` | Which viewport projects execute it | `both` (file at `tests/e2e/`) or `mobile-only` (file at `tests/e2e/mobile/`) |
| `file` | Current repository path | `tests/e2e/**/*.spec.ts`; one flow per file |
| `waiting` | How it synchronises with client-fetched content | auto-waiting assertion (`toBeVisible`, `toHaveText`, `toHaveAttribute`, …) only — no `page.waitForTimeout` (FR-008) |
| `target coupling` | Whether it knows which URL it runs against | none — must pass unmodified against localhost and the Vercel preview (FR-009) |
| `content coupling` | Whether it hard-codes authored content | none — company names, project titles, and the email address are read from the DOM, not literal (research D3) |

**Invariants**
- One flow per test; a failure names its flow unambiguously (spec Edge Case 3).
- A test that only makes sense at one viewport lives in that viewport's
  directory, so a viewport mismatch is impossible rather than merely unlikely
  (spec Edge Case 2). Conversely, a test whose UI is identical at both widths
  lives at the top level — `mobile-only` is a claim about the *check*, not a
  convenience for the author (research F6).
- No test asserts theme behavior, `prefers-color-scheme`, or the
  `?experiment=true` toggle — FR-010 is satisfied vacuously and deliberately
  (spec Assumptions).

## Instances: the suite after this feature

Seven files, thirteen executions (six run twice, one run once).

### Run by both projects (`tests/e2e/`)

| File | Flow | Asserts | Executions |
|---|---|---|---|
| `homepage.spec.ts` *(existing, unchanged)* | Hero content load | Page title; the `<h1>` wordmark carries the client-fetched name | 2 |
| `locale-toggle.spec.ts` *(new)* | Locale EN ↔ DE | `<html lang>` flips to `de` and a visible chrome string changes; toggling back restores `en` and the English string (FR-001) | 2 |
| `project-detail-modal.spec.ts` *(new)* | Project detail modal | Hero credit pill opens a `role="dialog"` whose heading matches the targeted project; the close control dismisses it (FR-002) | 2 |
| `career-navigation.spec.ts` *(new)* | Career chapter navigation | Clicking the last company chip advances `ChapterDetail`'s heading to that chip's company (FR-003) | 2 |
| `contact-links.spec.ts` *(new)* | Contact links | The contact chapter's email link is visible and its `href` starts `mailto:`; the social links carry absolute `https:` hrefs (FR-004) | 2 |
| `hamburger-menu.spec.ts` *(new)* | Hamburger menu | The toggle opens the `Story sections` navigation panel and its section links become visible; re-activating the toggle (or `Escape`) closes it (FR-006). Runs at both widths because the control renders at both — `StoryProgressNav.tsx:113`, amended 2026-08-22 (research F6) | 2 |

### Run by the `mobile` project only (`tests/e2e/mobile/`)

One file. After the 2026-08-22 amendment (research F6) this directory holds
only the check that is *meaningless* above the breakpoint — every flow the site
actually renders at both widths is tested at both widths.

| File | Flow | Asserts | Executions |
|---|---|---|---|
| `no-horizontal-overflow.spec.ts` *(new)* | Horizontal overflow | `documentElement.scrollWidth <= clientWidth` on load and after scrolling through the page, contact chapter included (FR-007) | 1 |

## Entity: E2E coverage document

Not a file of its own — a **section** inside the existing
`docs/testing-pyramid.md` (FR-013, research D7).

| Attribute | Value |
|---|---|
| Location | `docs/testing-pyramid.md`, new section between the existing "E2E — Playwright…" section and "Layer summary" |
| Table 1 | Viewport-agnostic e2e tests, run by both projects — the six files above (FR-012) |
| Table 2 | Mobile-specific e2e tests — the one file above (FR-012) |
| Row shape | flow name · what it verifies · viewport(s) it runs under · relative link to the test file |
| Link form | repository-relative from `docs/` (e.g. `../tests/e2e/locale-toggle.spec.ts`) so it resolves on github.com and locally (FR-014) |
| Completeness rule | every file under `tests/e2e/` appears in exactly one table — none missing, none duplicated (SC-004) |
| Footnotes | One: why `no-horizontal-overflow.spec.ts` does not replace `tests/integration/mobile-overflow.test.tsx` — jsdom has no layout engine, so the integration test asserts the *fix is present* while the e2e test asserts the *symptom is absent* (research D5). **Do not** add a footnote claiming the hamburger test is mobile-scoped; it is not, as of the 2026-08-22 amendment (research F6). |

## Configuration artifact: `playwright.config.ts`

| Change | Detail |
|---|---|
| Added | `projects: [...]` — the two entries in the first table above |
| Unchanged | `testDir`, `use.baseURL`, the `VERCEL_AUTOMATION_BYPASS_SECRET` header block, the conditional `webServer` block |
| Not added | `workers`, `fullyParallel`, `retries`, `reporter`, a second browser engine |

## Artifacts explicitly not changed

| File | Why it stays as-is |
|---|---|
| `.github/workflows/ci.yml` | `playwright test` runs every project; the `E2E Tests` job and its required-check name are unaffected (research D4) |
| `package.json` | `test:e2e` already runs the whole suite; no new dependency (research D8) |
| `tests/integration/mobile-overflow.test.tsx` and every other Jest test | Additive feature — the jsdom layer keeps the assertions it can make, and keeps them for the reason its own comments give |
| `docs/adr/` | No ADR trigger under Principle VI; ADR 0028 stands unamended (research D8) |
