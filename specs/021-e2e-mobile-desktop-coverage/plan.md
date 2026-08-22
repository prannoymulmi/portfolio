# Implementation Plan: E2E Coverage for Major Flows, Desktop & Mobile

**Branch**: `feat/e2e-mobile-desktop-coverage` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-e2e-mobile-desktop-coverage/spec.md`

## Summary

Grow the e2e suite from one smoke test to six major-flow tests — hero load,
locale toggle, project detail modal, career chapter navigation, contact links,
hamburger menu — and run every one of them at both a desktop-sized and a
mobile-sized viewport, plus one mobile-only guard (no horizontal overflow).
Then catalogue the whole suite in the existing `docs/testing-pyramid.md` as two
tables, each row linking to its real test file.

Technical approach: two Playwright `projects` in the existing
`playwright.config.ts` — `desktop` (1440x900) and `mobile` (390x844), sitting
either side of the site's own `1024px` breakpoint — with viewport scope
expressed by *where a spec file lives*: top-level specs run under both
projects, `tests/e2e/mobile/` specs run under `mobile` only (the `desktop`
project carries `testIgnore: /mobile\//`). No test body is duplicated, no test
branches on viewport or target, no new dependency, and no CI change: `pnpm run
test:e2e` already runs every configured project, so the existing `E2E Tests`
job and its branch-protection check name are untouched.

## Technical Context

**Language/Version**: TypeScript strict, Next.js 16.3.0 App Router, React
19.2.8, Node 24.x (`package.json` `engines`, `.nvmrc`)

**Primary Dependencies**: none added. `@playwright/test@^1.62.1` is already a
devDependency (ADR 0028); `projects` and `viewport` are core config surface of
it. No production code is touched by this feature.

**Storage**: N/A — no application data model (see data-model.md; the entities
there are test-suite and documentation artifacts)

**Testing**: Jest + RTL for unit/integration (`tests/unit/`,
`tests/integration/`, unchanged); Playwright for e2e (`tests/e2e/`, extended
from 1 spec to 7)

**Target Platform**: headless Chromium, driven at either a local `next dev`
server or the PR's Vercel preview URL — selected by `PLAYWRIGHT_BASE_URL`
exactly as 019 established (`specs/019-playwright-e2e-tests/contracts/e2e-target-contract.md`)

**Project Type**: single Next.js web app (ADR 0012). This feature adds test
files, one config block, and one documentation section — no new app surface.

**Performance Goals**: none specified. Soft goal inherited from 019 — the e2e
CI job must not meaningfully slow PR feedback. Test executions go 1 → 13; all
thirteen hit the same already-built deployment and Playwright parallelises
across files, so wall-clock growth is expected well under 2x.

**Constraints**:
- Mobile/desktop is the site's own `<1024px` / `>=1024px` breakpoint
  (`components/Hero/useHeroScrollBlur.ts`'s `DESKTOP_LAYOUT`), not a device
  profile (spec Clarifications).
- Auto-waiting assertions only; no fixed sleeps (FR-008).
- Identical test code against both targets; no branching on
  `PLAYWRIGHT_BASE_URL` (FR-009).
- Each test asserts one flow, so a failure is unambiguous (spec Edge Case 3).
- Mobile tests launch at a mobile viewport; no mid-test resizing (spec Edge
  Case 5).
- No theme assertions of any kind (FR-010 + spec Assumptions).
- The coverage doc extends `docs/testing-pyramid.md` rather than competing
  with it (FR-013).

**Scale/Scope**: 1 modified config file (`playwright.config.ts`), 6 new spec
files (5 run by both projects + 1 mobile-only) plus 1 existing spec left in
place, 1 new test subdirectory, 1 new documentation section (+1 optional
README clause). 7 spec files, 13 test executions (6 shared x 2 projects + 1
mobile-only). Zero dependency changes, zero CI changes, zero production-code
changes, zero ADRs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.7.0.

| Principle | Status | Notes |
|---|---|---|
| I. KISS (NON-NEGOTIABLE) | PASS | Viewport scope is a directory name plus a one-line `testIgnore` (research D2) — no tag registry, no helper abstraction, no per-test viewport plumbing. One test file per flow, read top to bottom. |
| II. Test-First (NON-NEGOTIABLE) | PASS (obligation) | The deliverable *is* tests. They must read as plainly as the Jest suites they mirror: `getByRole` + accessible name, the same locators `tests/integration/*.test.tsx` already use (research D3). No `data-testid` added to production markup, no mocking (there is nothing to mock — real browser, real deployment). |
| III. Atomic Commits | PASS (obligation) | Naturally separable: config `projects` block; one commit per flow spec; the two mobile-only specs; the documentation section. Release-stage commits take the haiku form per the Principle III exception. |
| IV. Technology Stack (NON-NEGOTIABLE) | PASS, not touched | No dependency added or substituted; no structure/URL change; content still `public/data/<locale>/`; no styling, animation, icon, or deployment change. **Theming**: FR-010 is satisfied by *not adding* any theme test — no spec asserts on `prefers-color-scheme`, on the `.dark` class, or on the `?experiment=true` toggle, and none emulates a colour scheme. Light-by-default is what the suite gets by default and it is never toggled. **Localization**: the locale test drives the real hand-rolled `LocaleToggle`/`LocaleProvider` (ADR 0024) through the UI — it does not import a locale API or stub the registry the way the jsdom tests must. |
| V. Token Efficiency | PASS | N/A — no unusual AI-prompting concern. |
| VI. Recorded Decisions | PASS, no ADR triggered | None of Principle VI's four triggers fires: no dependency added/removed, no structural or URL change, no change to how content is stored/loaded/validated, no metaphor commitment. Playwright itself is already recorded in ADR 0028, which this feature neither supersedes nor amends (research D8). |

**Sub-gates**:
- Development Workflow, "CI runs type-check, lint, and tests on every PR;
  merge blocked on failure": PASS, unchanged — the `E2E Tests` job keeps its
  name and its required-check status; it simply runs more tests (research D4).
- 019's target-selection contract: PASS, inherited unmodified — `projects`
  sit *under* the existing `use.baseURL`/`webServer` logic and redefine
  neither (FR-009).
- Existing Jest suites: PASS, untouched and not superseded.
  `tests/integration/mobile-overflow.test.tsx` keeps asserting that the fix is
  still written into `app/page.tsx`; the new e2e test asserts the page does not
  actually scroll sideways. Different claims, both worth having (research D5).
- Accessibility constraints ("interactive SVG elements MUST have accessible
  `aria-label`/`role`"): PASS, and leaned on — the career pitch's chapter
  controls and the modal's dialog role are exactly what the new locators use,
  so this feature adds pressure to keep them correct rather than pressure to
  work around them.

No NON-NEGOTIABLE violation. Complexity Tracking is empty.

### Post-design re-evaluation (after Phase 1)

Re-checked against the same v1.7.0 after research.md, data-model.md,
contracts/viewport-project-contract.md, and quickstart.md were written.
**Result: unchanged — all PASS, no new violation, Complexity Tracking still
empty.** Three things the design surfaced that the pre-design pass could not:

1. **Principle I held under pressure.** The design considered a shared
   `runMajorFlows(page)` helper and a tag-based (`@mobile`) scoping scheme and
   rejected both (research D2). What shipped instead is a directory and a
   `testIgnore` regex — strictly less machinery than either alternative.
2. **Principle II gained a concrete rule the spec did not state**: no test may
   hard-code an employer name, project title, or email address; expected values
   are read from the control that was clicked (research D3). This keeps the e2e
   layer from turning editable content (ADR 0003) into a merge blocker, and it
   is now an invariant in data-model.md rather than a convention someone has to
   remember.
3. **One spec premise was found to be factually wrong and was corrected rather
   than worked around**: the hamburger menu renders at *every* width
   (`StoryProgressNav.tsx:113`), not only below the breakpoint as User Story 2
   originally assumed. Raised as R1, confirmed with the user, and resolved by
   amending FR-006/FR-012 (spec Clarifications, 2026-08-22): the hamburger
   spec runs under both projects and sits at the top level of `tests/e2e/`.
   **The amendment is constitution-neutral** — it moves one file up one
   directory and adds one test execution. No principle's evaluation changes:
   Principle I still gets a directory plus a one-line `testIgnore` (it gets
   *less* to explain, since the coverage document no longer needs the
   "mobile-scoped despite rendering everywhere" footnote); II, III, IV, V, and
   VI are untouched, and Complexity Tracking stays empty. No re-gate required.

## Project Structure

### Documentation (this feature)

```text
specs/021-e2e-mobile-desktop-coverage/
├── plan.md                                # This file (/speckit-plan output)
├── research.md                            # Phase 0 output
├── data-model.md                          # Phase 1 output
├── quickstart.md                          # Phase 1 output
├── contracts/
│   └── viewport-project-contract.md       # Phase 1 output
├── checklists/
│   └── requirements.md                    # /speckit-specify output
└── tasks.md                               # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

Single Next.js App Router project; this feature is additive test and
documentation work only.

```text
playwright.config.ts                        # MODIFIED: two `projects` (research D1/D2)

tests/
├── unit/                                   # UNCHANGED
├── integration/                            # UNCHANGED
└── e2e/
    ├── homepage.spec.ts                    # UNCHANGED (path deliberately preserved — linked from docs)
    ├── locale-toggle.spec.ts               # NEW  (FR-001) — both projects
    ├── project-detail-modal.spec.ts        # NEW  (FR-002) — both projects
    ├── career-navigation.spec.ts           # NEW  (FR-003) — both projects
    ├── contact-links.spec.ts               # NEW  (FR-004) — both projects
    ├── hamburger-menu.spec.ts              # NEW  (FR-006) — both projects (amended 2026-08-22, was mobile-only)
    └── mobile/                             # NEW directory — `mobile` project only
        └── no-horizontal-overflow.spec.ts  # NEW  (FR-007)

docs/
└── testing-pyramid.md                      # MODIFIED: new "E2E coverage" section, two tables (FR-011–FR-014)

README.md                                   # OPTIONAL one-clause edit: name the two-viewport split in the existing "Testing strategy" section

.github/workflows/ci.yml                    # UNCHANGED (research D4)
package.json                                # UNCHANGED (research D8)
```

**Structure Decision**: keep 019's layout and extend it in one dimension only —
a `mobile/` subdirectory under the existing `tests/e2e/`. Viewport scope is
therefore visible in the file tree, the coverage document's two tables are
literally the two directory listings (which is what makes SC-004 checkable
without reading test source), and a check that is meaningless above the
breakpoint cannot be executed at desktop width by accident. The directory now
holds exactly one file, and that is the correct outcome rather than a small
one: after the 2026-08-22 amendment, the only genuinely mobile-scoped test in
the suite is the horizontal-overflow guard — everything else the site renders,
it renders at both widths, so everything else is tested at both widths.
`homepage.spec.ts` stays exactly where it is so the links to it from
`docs/testing-pyramid.md` and ADR 0028 keep resolving.

## Implementation Steps

Ordered so each step is independently reviewable and, from step 3 onward,
independently valuable. `/speckit-tasks` will expand these into tasks.

1. **Add the two viewport projects to `playwright.config.ts`.** A `projects`
   array with `desktop` (1440x900, `testIgnore: /mobile\//`) and `mobile`
   (390x844), both spreading `devices['Desktop Chrome']` and overriding only
   `viewport`. Leave `use.baseURL`, the bypass-header block, and the
   conditional `webServer` untouched. Add a comment naming the 1024px
   breakpoint source (`components/Hero/useHeroScrollBlur.ts`) and pointing at
   `contracts/viewport-project-contract.md`. Verify with `pnpm run test:e2e`:
   the existing `homepage.spec.ts` now reports twice, once per project.
2. **Create `tests/e2e/mobile/`** — folded into step 8, which adds its only
   file, rather than committing an empty directory.
3. **`tests/e2e/locale-toggle.spec.ts`** (FR-001). Assert `html[lang="en"]` and
   an English chrome string; click the toggle located by `/English/` in its
   `aria-label`; assert `html[lang="de"]` and the German counterpart; click
   back; assert the English state returns.
4. **`tests/e2e/project-detail-modal.spec.ts`** (FR-002). Assert no `dialog`
   exists; click the hero credit pill (`getByRole('link', { name: /built with
   claude/i })` — a static `aria-label`, so no race with the typing
   animation); assert a `role="dialog"` with the expected heading; close via
   the `Close` button and assert the dialog is gone.
5. **`tests/e2e/career-navigation.spec.ts`** (FR-003). Take the *last* company
   chip in `CareerPitch`'s `<ol>`, read its text, click it, and assert
   `ChapterDetail`'s heading now shows that company — no hard-coded employer
   name.
6. **`tests/e2e/contact-links.spec.ts`** (FR-004). Assert the contact chapter's
   email link is visible with an `href` matching `/^mailto:/`, and that each
   social link carries an absolute `https:` href with `target="_blank"`.
7. **`tests/e2e/hamburger-menu.spec.ts`** (FR-006) — top level, so **both**
   projects run it (amended 2026-08-22; see spec Clarifications). Open via
   `getByRole('button', { name: /open menu/i })`; assert the
   `getByRole('navigation', { name: /story sections/i })` panel and its section
   links are visible; close via the same toggle (whose `aria-label` has flipped
   to `/close menu/i`) and assert the panel is gone.

   **One test body serves both widths — verified against the component, not
   assumed.** `HamburgerMenu.tsx:178` sets `aria-label={open ? ui.nav.closeMenu
   : ui.nav.openMenu}` with no responsive branch, and `StoryProgressNav.tsx:113`
   mounts the toggle in the unconditional icon row, so the trigger's accessible
   name and its position (right end of the nav bar) are identical at 1440x900
   and 390x844. The panel (`HamburgerMenu.tsx:216`) is portal-rendered
   `fixed inset-y-0 right-0` with `aria-label={ui.nav.storySections}` at both
   widths. The **only** width-dependent detail in the entire component is the
   panel's max width — `w-full max-w-xs … sm:max-w-sm`, i.e. 320px at the mobile
   viewport and 384px at the desktop one. No assertion in this spec touches
   width, so nothing branches and no `test.skip` is needed. Do **not** assert
   the panel's pixel width, and do not assert it covers the viewport — that is
   the one claim that is genuinely true on a phone and false on a desktop.
   Add a brief comment recording this (research F6, as amended) so the next
   reader does not "fix" it back into a mobile-only spec.
8. **`tests/e2e/mobile/no-horizontal-overflow.spec.ts`** (FR-007) — creates the
   `mobile/` directory; the `mobile` project's only exclusive spec. Compare
   `documentElement.scrollWidth` with `clientWidth` after load and after
   scrolling to several positions including the bottom, so lazily-mounted
   chapters are in the DOM when measured.
9. **Extend `docs/testing-pyramid.md`** (FR-011–FR-014) with the "E2E coverage"
   section: two tables (six rows viewport-agnostic, one row mobile-specific), relative links, and the
   footnote named in data-model.md. Optionally add the one-clause README note.
10. **Run the full quickstart verification** — including the link-resolution
    and table-completeness shell checks — plus `pnpm type-check`, `pnpm lint`,
    `pnpm test`, and `pnpm run test:e2e`.

## Risks & Open Items

| # | Item | Impact | Recommendation |
|---|---|---|---|
| ~~R1~~ | **RESOLVED 2026-08-22 — the hamburger menu is not mobile-only.** `StoryProgressNav.tsx:113` renders it at every width; User Story 2's original premise ("the persistent nav gives way to a hamburger menu") described a layout the site no longer has (`specs/010-hamburger-nav` moved the chapter list into the menu for all viewports). | Following FR-006 literally would have left the desktop hamburger with no e2e coverage. | **Decision (user, 2026-08-22): promote the test to both projects** — coverage should match actual component behavior. `hamburger-menu.spec.ts` lives at `tests/e2e/` top level and is listed in the coverage document's viewport-agnostic table. FR-006, FR-012, SC-001, SC-002, US2, and the Edge Cases were amended accordingly (spec Clarifications). `tests/e2e/mobile/` now holds only `no-horizontal-overflow.spec.ts`. Constitution-neutral — no re-gate. No open item remains. |
| R2 | **Content coupling.** Company names, project titles, and the email address live in editable JSON (ADR 0003) and can change without a code change. | A content edit could fail CI for the wrong reason. | Mitigated by design (research D3): read expected values from the DOM. This must be enforced in review, not just intended. |
| R3 | **Locale test and real German copy.** The locale spec asserts a visible string changes; `ui.de.json` exists and is populated, but any future key whose German copy equals its English copy would make the assertion vacuous. | A silently weak test. | Assert `html[lang]` (structural, always changes) *and* one prose string whose two locales genuinely differ — the contact heading is a good choice today. |
| R4 | **CI runtime.** 12 executions instead of 1, against a single preview deployment. | Slower PR feedback; possible new flakiness against real network conditions. | Accept for now; no `retries`/`workers` tuning in this feature. If flakiness appears, address it with evidence rather than pre-emptive retries, which would mask the real-browser failures this layer exists to surface. |
| R5 | **`no-horizontal-overflow` overlaps an integration test.** | A reader may think one replaces the other and delete the older one. | Explicitly footnoted in the coverage document — now its only footnote, since R1's resolution removed the need for the hamburger one (research D5): jsdom cannot measure geometry, so the integration test asserts the *fix is present* while the e2e test asserts the *symptom is absent*. |
| R6 | **Coverage-document drift.** Nothing mechanically enforces SC-004 once this PR merges. | The doc rots as tests are added. | Out of scope here; quickstart.md ships copy-pasteable shell checks. A future feature could turn the diff check into a Jest test over `tests/e2e/` — worth noting, not worth building now. |

## Complexity Tracking

*No entries — Constitution Check produced no violation, pre- or post-design.*
