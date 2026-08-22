# Phase 0 Research: E2E Coverage for Major Flows, Desktop & Mobile

The spec left no open clarifications, but five real implementation unknowns
remained, plus one factual premise in the spec that turned out not to match
the current code. Each is resolved below with a decision, rationale, and the
alternatives rejected. Infrastructure settled by 019-playwright-e2e-tests
(dual-target `PLAYWRIGHT_BASE_URL`, `webServer` reuse, draft-gated CI job,
Vercel protection bypass) is treated as fixed and is not re-litigated here.

## Decision 1: Viewports are two Playwright `projects` with explicit `viewport` sizes, not device profiles and not per-test `test.use()`

**Decision**: `playwright.config.ts` gains a `projects` array with exactly two
entries, both Chromium:

| Project name | `viewport` | Rationale for the number |
|---|---|---|
| `desktop` | `{ width: 1440, height: 900 }` | Comfortably `>= 1024px`, the site's own `lg` breakpoint (`components/Hero/useHeroScrollBlur.ts`'s `DESKTOP_LAYOUT = '(min-width: 1024px)'`) |
| `mobile` | `{ width: 390, height: 844 }` | Comfortably `< 1024px`; a common phone CSS size without being a named device emulation |

Both spread `devices['Desktop Chrome']` as their base and override only
`viewport`. Neither sets `isMobile`, `hasTouch`, a mobile user agent, or a
`deviceScaleFactor`.

**Rationale**: the spec's clarification is explicit — mobile vs. desktop is
"the site's own existing breakpoint (`<1024px` / `>=1024px`) ... not an
arbitrary device profile." Every responsive decision this site makes is a CSS
width media query (Tailwind's `sm:`/`lg:` utilities and the one
`matchMedia('(min-width: 1024px)')` in `useHeroScrollBlur.ts`); none of them
consults touch capability or the user agent. Emulating a Pixel or an iPhone
would therefore change variables the site does not read, while adding a
device name to keep in sync with a breakpoint it does not actually track.
Two `projects` also mean the viewport is a property of the *run*, visible in
the Playwright report as `[desktop] > ...` / `[mobile] > ...`, rather than
something a reader has to find inside a test body.

**Alternatives considered**:
- `devices['Pixel 7']` / `devices['iPhone 13']` for the mobile project —
  rejected: brings a mobile UA, `isMobile`, `hasTouch`, and a device pixel
  ratio along with the width. None of those is what the site branches on, and
  `isMobile` is Chromium-only, so the profile silently couples the suite to
  one engine for a reason unrelated to the thing being tested.
- Per-test `test.use({ viewport: ... })` inside each spec file — rejected: it
  makes running "the same flow at the other viewport" a copy-paste of the
  whole test body (see Decision 2), and it puts the viewport in the file
  rather than in the run, so the report cannot tell two viewports apart.
- A single project plus `page.setViewportSize()` mid-test — rejected outright
  by the spec's own edge case: "mobile tests launch directly at a mobile-sized
  viewport", mirroring how `tests/unit/components/HamburgerMenu.test.tsx`
  keeps "starts mobile" and "resizes into desktop" as separate concerns.
  Resizing mid-test would also trip `HamburgerMenu`'s `resize` listener, which
  closes the menu — a behavior worth testing deliberately one day, but not one
  to trigger accidentally inside every other test.

## Decision 2: Shared flow bodies are shared by *file placement*, not by a helper abstraction — one spec file per flow, run by both projects; mobile-only specs live in `tests/e2e/mobile/`

**Decision**: the directory layout encodes viewport scope, and the two
projects differ only in `testIgnore`:

```text
tests/e2e/
├── homepage.spec.ts              # existing, unchanged path — run by BOTH projects
├── locale-toggle.spec.ts         # NEW — run by BOTH projects
├── project-detail-modal.spec.ts  # NEW — run by BOTH projects
├── career-navigation.spec.ts     # NEW — run by BOTH projects
├── contact-links.spec.ts         # NEW — run by BOTH projects
├── hamburger-menu.spec.ts        # NEW — run by BOTH projects (amended 2026-08-22, see F6)
└── mobile/                       # NEW directory — run by the `mobile` project ONLY
    └── no-horizontal-overflow.spec.ts  # NEW
```

- `desktop` project: `testIgnore: /mobile\//`.
- `mobile` project: no ignore — it runs the shared specs *and* `mobile/`.

Each shared spec is written once and executed twice; no test body is
duplicated, and no cross-project helper module is introduced.

**Rationale**: this is the smallest mechanism that satisfies both FR-005
("every test added under FR-001–FR-004 MUST also run against a mobile-sized
viewport") and FR-012 (mobile-specific tests separated from the rest) —
Principle I. The directory is the separation, so the coverage document's two
tables map one-to-one onto two directories, which is what makes SC-004
("100% of e2e test files appear in exactly one table") checkable by listing
files rather than by reading them. The spec's edge case about a
viewport-mismatched test failing clearly is handled structurally: a test that
only makes sense on a phone physically cannot be picked up by the `desktop`
project.

Keeping `homepage.spec.ts` at its current path is deliberate — it is linked
by name from `docs/testing-pyramid.md` and `docs/adr/0028-playwright-e2e-testing.md`,
and moving it into a `flows/` subdirectory would break those links for no
behavioral gain.

**Alternatives considered**:
- Tag-based selection (`test('... @mobile')` plus `grep`/`grepInvert` per
  project) — rejected: the scope then lives in a string inside a title, is
  invisible in the file tree, and a typo silently drops a test from every
  project. The directory cannot be typo'd into nonexistence.
- A shared `runMajorFlows(page)` helper called from a `desktop.spec.ts` and a
  `mobile.spec.ts` — rejected: it collapses five independently-failing flows
  into one test per viewport, which the spec's third edge case forbids ("a
  single test must not silently assert two unrelated flows such that a failure
  is ambiguous about which one broke"), and it re-introduces exactly the
  indirection Principle II warns about in test code.
- Duplicating each spec into `tests/e2e/desktop/` and `tests/e2e/mobile/` —
  rejected: two copies of the same flow drift the moment one is fixed.

## Decision 3: Locators are role + accessible name, with locale-variant and content-variant strings read from the DOM rather than hard-coded

**Decision**: every new locator is `getByRole(...)` with an accessible name,
matching how the existing Jest suites already address these components. The
concrete per-flow strategy, grounded in the actual components:

| Flow | Locator(s) | Source in the code |
|---|---|---|
| Locale toggle | `getByRole('button', { name: /English/ })` — the toggle's `aria-label` is `"Switch from {current} to {target}"` in EN and `"Wechsel von {current} zu {target}"` in DE, but the endonyms `English`/`Deutsch` are locale-invariant and both appear in both | `components/Common/LocaleToggle.tsx`; the same "match on the endonyms, not the sentence" trick `tests/integration/locale-switch.test.tsx` already uses |
| Locale assertion | `expect(page.locator('html')).toHaveAttribute('lang', 'de')` plus one visible chrome string that differs by locale (e.g. the contact heading `Got a gnarly system?` → `Hast du ein kniffliges System?`) | `lib/i18n/ui.en.json` / `ui.de.json`, `components/Contact/ContactSection.tsx` |
| Project detail modal — open | `getByRole('link', { name: /built with claude/i })` (EN) — the hero credit pill carries `ui.hero.creditPillFull` as a **static** `aria-label` precisely so tests don't race the typing animation | `components/Hero/Hero.tsx:137`, `components/Hero/CreditPillText.tsx` (whole span is `aria-hidden`) |
| Project detail modal — assert | `getByRole('dialog')`, then the heading inside it | `components/Projects/ProjectDetailModal.tsx:182` (`role="dialog"`, `aria-modal`, `aria-labelledby`) |
| Project detail modal — close | `getByRole('button', { name: ui.projects.close })` (`Close` / `Schließen`), and/or `page.keyboard.press('Escape')` | `ProjectDetailModal.tsx:195` |
| Career chapter navigation | the company-chip `<ol>` in `CareerPitch.tsx:123-146` — `getByRole('button')` whose name contains a company name. **Take the last chip**, read its text, and assert `ChapterDetail`'s `<h3>` now shows that company | `components/Career/CareerPitch.tsx`, `components/Career/ChapterDetail.tsx:52` |
| Contact links | `getByRole('link', { name: /@/ })` with `toHaveAttribute('href', /^mailto:/)`; plus the `LinkedIn`/`GitHub` links' `href` | `components/Contact/ContactSection.tsx:55-79`, `public/data/en/social.json` |
| Hamburger menu | `getByRole('button', { name: /open menu/i })` → panel `getByRole('navigation', { name: /story sections/i })` and its links; close via the same toggle (its `aria-label` flips to `Close menu`) or `Escape` | `components/Navigation/HamburgerMenu.tsx:172-249` |

Two content-coupling rules follow from this and apply to every new spec:

1. **Never hard-code a company name, a project title, or an email address.**
   Read the expected value out of the control that was clicked (the career
   chip's own text, the modal trigger's own label) and assert the resulting
   region matches it. `public/data/en/*.json` is editable content (ADR 0003) —
   a test that fails when someone renames an employer is a false alarm, and
   the e2e layer is the layer that runs against a *real deployment* whose
   content may legitimately have moved on.
2. **Never assert an English sentence that a locale switch will change**,
   except inside the locale test itself, where changing is the point.

**Rationale**: role+name is what every existing unit and integration test in
this repo already uses, so an e2e test reads like its jsdom counterpart and
the two can be compared line by line. It is also the only strategy that
survives the accessibility contract these components deliberately maintain
(the static `aria-label` on the credit pill exists *because* of test
raciness — see its doc comment). No `data-testid` is added anywhere.

**Alternatives considered**:
- Adding `data-testid` attributes to the five components — rejected: it puts
  test scaffolding into production markup for flows that already expose a
  correct, stable accessible name, and it would be the first `data-testid` in
  the codebase.
- CSS/class selectors — rejected: these components are dense Tailwind class
  strings that change with every visual refresh (nine of the twenty features
  in `specs/` were visual). A class selector is a guaranteed future false
  failure.
- Hard-coding `prannoy.mulmi@gmail.com` and `Statista GmbH` — rejected per the
  content-coupling rule above.

## Decision 4: No CI structural change — one job, one command, both projects

**Decision**: `.github/workflows/ci.yml` is **not modified**. `pnpm run
test:e2e` (`playwright test`) runs every configured project by default, so the
existing `e2e` job picks up both viewports with no new step, no matrix, and no
second job. The GitHub check name stays `E2E Tests`, so the existing branch
protection rule on `main` (which requires `E2E Tests` by name — see
`docs/testing-pyramid.md` and ADR 0028) keeps working untouched.

**Rationale**: a matrix or a second job would double the "wait for Vercel
preview" step and the `pnpm install` + `npx playwright install` cost for zero
additional coverage, and it would introduce a *new* required check name that
someone has to remember to add to branch protection — the exact footgun ADR
0028 already had to be written about. One job, one command, two projects is
both cheaper and less to get wrong.

**Consequence to accept**: the `e2e` job's runtime roughly doubles in test
count (6 flows x 2 viewports + 1 mobile-only = 13 test executions, up from 1).
Playwright's default worker count (half the runner's cores) parallelises
across files, and every test hits the same already-built preview deployment,
so wall-clock growth is well under 2x the current job. No `workers`,
`fullyParallel`, or `retries` setting is introduced by this feature; if
flakiness appears against the real preview later, that is a separate decision
with its own evidence.

**Alternatives considered**:
- A `strategy.matrix.project: [desktop, mobile]` on the `e2e` job — rejected
  for the duplicated setup cost and the new required-check-name problem above.
- A separate `e2e-mobile` job — same objection, plus it splits one logical
  gate into two places that can disagree.

## Decision 5: Horizontal overflow is measured in the real browser, at several scroll positions, against `documentElement`

**Decision**: `tests/e2e/mobile/no-horizontal-overflow.spec.ts` asserts
`document.documentElement.scrollWidth <= document.documentElement.clientWidth`
(evaluated in-page), checked after landing and again after scrolling to a few
positions down the page — including the bottom, since the known historical
offender is the contact chapter's 640px decorative glow
(`specs/012-mobile-layout-fixes`).

**Rationale**: this is the single clearest example in this whole feature of
e2e catching something the layer below *structurally cannot*.
`tests/integration/mobile-overflow.test.tsx` says so in its own opening
comment: "jsdom has no layout engine, so scrollWidth/clientWidth/
getBoundingClientRect all return zeros regardless of CSS — geometry is
unobservable here", and it therefore falls back to grepping `app/page.tsx` for
the string `overflow-x-clip`. That integration test asserts the *fix is still
written down*; this e2e test asserts the *page does not actually scroll
sideways*. Both stay — they are not redundant, and the coverage document
should say so.

Scrolling matters because content below the fold is lazily mounted
(`ProjectGalleryLazy`, `CareerJourneyLazy` are `dynamic(..., { ssr: false })`),
so an overflowing element may not exist in the DOM at all on first paint.

**Alternatives considered**:
- Asserting on `document.body` instead of `documentElement` — rejected: the
  document's scrollport is the documentElement here; `body` can report a
  narrower width and miss the overflow entirely.
- A visual/screenshot comparison — rejected: introduces snapshot artifacts and
  a new class of maintenance (every visual feature would rebaseline them) to
  answer a question two integers already answer exactly.
- Only checking at scroll position 0 — rejected: the one bug this test exists
  to prevent lives in the *last* chapter.

## Finding 6 (spec premise correction): the hamburger menu is not mobile-only in the current code

**What the spec assumes** (User Story 2): "the persistent nav gives way to a
hamburger menu" below the desktop breakpoint.

**What the code does**: `components/Navigation/StoryProgressNav.tsx:113`
renders `<HamburgerMenu />` unconditionally in the nav bar's icon row at every
width — there is no `lg:hidden` on it and no desktop chapter list beside it.
`specs/010-hamburger-nav` moved the chapter list *into* the hamburger for all
viewports; the nav bar itself only responds to width in that the wordmark's
full name is `sr-only` below `sm`.

**Original decision (2026-08-22, SUPERSEDED — retained as the record of how
this was first resolved)**: keep the hamburger test where the unamended FR-006
and FR-012 put it — a mobile-only spec in `tests/e2e/mobile/`, listed in the
coverage document's mobile table — with the discrepancy recorded in a comment
and a footnote: the control exists at both widths, but the panel is a
`w-full max-w-xs` overlay whose behavior matters most on a phone. The reasoning
was that FR-006 named it as *the* mobile-only test and FR-012/SC-004 require
every file to sit in exactly one table, so the spec's letter should win and the
discrepancy should be footnoted rather than acted on. It was flagged as plan
Risk R1 and explicitly raised for user confirmation.

**Amendment (2026-08-22, user decision — this is the decision in force):
promote the hamburger test to both projects.** It moves to
`tests/e2e/hamburger-menu.spec.ts` (top level) and is listed in the coverage
document's viewport-agnostic table. **Rationale: coverage should match actual
component behavior, not a premise the code contradicts.** Letting the spec's
letter override an observed fact would have shipped a suite that leaves the
desktop hamburger — a control every desktop visitor sees and uses to navigate
the whole story — entirely unproven, and would have written the wrong premise
into the coverage document as a permanent footnote. FR-006 and FR-012 were
amended instead (spec Clarifications), which is the correct direction of
repair: fix the requirement, don't work around it.

**Why one test body is genuinely enough** (checked against the component, not
assumed): `HamburgerMenu.tsx:178` sets `aria-label={open ? ui.nav.closeMenu :
ui.nav.openMenu}` with no responsive branch; `StoryProgressNav.tsx:113` mounts
the toggle in an unconditional icon row, so its accessible name and position
are identical at 1440x900 and 390x844; the panel (`HamburgerMenu.tsx:216`) is a
portal-rendered `fixed inset-y-0 right-0` `<nav aria-label={ui.nav.storySections}>`
at both widths. The single width-dependent detail in the whole component is the
panel's max width (`max-w-xs` → `sm:max-w-sm`, 320px vs 384px), which no
assertion in this spec touches. Constraint that follows: the spec must **not**
assert the panel's width or that it covers the viewport — that is the one claim
true on a phone and false on a desktop.

**Consequences**: `tests/e2e/mobile/` now contains exactly one file
(`no-horizontal-overflow.spec.ts`); the coverage document's mobile table has
one row and its viewport-agnostic table has six; total executions go from 12 to
13; and the coverage document needs one footnote (D5's) instead of two — the
"mobile-scoped despite rendering everywhere" note is no longer true and must
not be written. FR-012/SC-004 remain satisfied: the file still sits in exactly
one table, just the other one.

## Decision 7: The coverage document is a new section inside `docs/testing-pyramid.md`, not a new file

**Decision**: FR-011/FR-012/FR-013 are satisfied by adding an "E2E coverage"
section to the existing `docs/testing-pyramid.md`, directly after its current
"E2E — Playwright, real browser, real (or real-enough) deployment" section and
before "Layer summary". It contains the two required tables. `README.md`'s
existing "Testing strategy" section already links to
`docs/testing-pyramid.md`, so no README change is required — though a single
clause naming the two-viewport split there is cheap and helps SC-003.

**Rationale**: the spec's own clarification settled this ("Extend it"), and
FR-013 restates it. The existing document already explains *what the e2e layer
is for*; what it lacks is *what the e2e layer currently covers*. Those belong
adjacent.

**Link form**: relative repository links (`../tests/e2e/locale-toggle.spec.ts`
from `docs/`) so they resolve both on github.com and in a local editor.
FR-014's "resolves to the actual test file's current path" is then checkable
by a plain existence check per link, which `quickstart.md` spells out.

## Decision 8: No new dependency, and no ADR required

**Decision**: nothing is added to `package.json`. Playwright's `projects` and
`viewport` are core config surface of the already-installed
`@playwright/test@^1.62.1`. Per constitution Principle VI, an ADR is required
for a decision that adds/removes a dependency, changes structure or URLs,
changes how content is stored/loaded/validated, or commits the design to a
metaphor — this feature does none of those. ADR 0028 already records the
Playwright decision itself and is not superseded or amended.

## Summary of resolved unknowns

| Unknown | Resolution |
|---|---|
| (a) How viewports are expressed | Two Chromium `projects`, `desktop` 1440x900 / `mobile` 390x844, explicit `viewport` only — no device profile (D1) |
| (b) How duplication is avoided | One spec per flow run by both projects; mobile-only specs isolated by directory + `testIgnore` (D2) |
| (c) Locator strategy | `getByRole` + accessible name throughout; locale- and content-variant strings read from the DOM, never hard-coded; no `data-testid` (D3) |
| (d) CI changes | None — `playwright test` runs both projects in the existing `e2e` job; check name and branch protection unchanged (D4) |
| Overflow measurement | `documentElement.scrollWidth <= clientWidth`, re-checked after scrolling (D5) |
| Hamburger's real viewport scope | Renders at all widths; test **runs under both projects** from `tests/e2e/hamburger-menu.spec.ts` — FR-006/FR-012 amended 2026-08-22 so coverage matches component behavior (F6) |
| Where the doc lives | New section inside `docs/testing-pyramid.md` (D7) |
| New dependencies / ADR | None; no ADR triggered (D8) |
