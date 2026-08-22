# Feature Specification: E2E Coverage for Major Flows, Desktop & Mobile

**Feature Branch**: `feat/e2e-mobile-desktop-coverage`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "I want to extend the end to end test and make sure the major functionalities are working and it works in mobile and in desktop look at the integ and unit test to create the major e2e test. Make a Md file for e2e test what is being tested. If mobile specific test are there then make it in another table there or something but make the md file also easily readyble and link it to the test in the project as well."

## Clarifications

### Session 2026-08-22

- Q: Which flows count as "major functionality" for this feature's e2e scope? → A: Hero content load, locale (EN/DE) toggle, project detail modal open/close, career/story chapter navigation, and the contact section's links — the flows already proven at the integration level in `tests/integration/`.
- Q: What counts as "mobile" versus "desktop" for viewport-scoped tests? → A: Reuse the site's own existing breakpoint (`<1024px` = mobile, `>=1024px` = desktop), the same line `tests/integration/hero-scroll-blur.test.tsx` already draws — not an arbitrary device profile.
- Q: Does the new documentation replace or extend the existing testing-pyramid document from 019-playwright-e2e-tests? → A: Extend it — add/refresh the e2e section and its test-by-test breakdown there rather than starting a second, competing doc.
- Q: Should the hamburger-menu test be mobile-only, given the control actually renders at every viewport width? → A: (amendment, 2026-08-22) No — promote it to run on both projects. `components/Navigation/StoryProgressNav.tsx:113` renders `<HamburgerMenu />` unconditionally and its accessible names, roles, and panel position are identical at both widths, so coverage should match actual component behavior rather than an assumed mobile-only layout. Supersedes the original FR-006 wording; the horizontal-overflow guard (FR-007) remains the only genuinely mobile-only test.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Major site flows are proven end-to-end on desktop (Priority: P1)

Today the e2e suite has exactly one test: it confirms the homepage's hero
content loads. Everything else that matters to a real visitor — switching
language, opening a project's detail view, moving through the career story,
finding a way to make contact — is only checked by jsdom-based integration
tests, which never render a real browser and never catch a real rendering,
routing, or interaction bug end-to-end. A developer needs the e2e suite
extended to drive these flows in a real desktop-sized browser, the same way
the existing homepage test does, so a genuine regression in any of them is
caught before merge, not after a visitor reports it.

**Why this priority**: This is the actual ask — "make sure the major
functionalities are working." Without it, the e2e suite stays a single smoke
test regardless of anything else this feature adds.

**Independent Test**: Run the e2e suite against a desktop viewport and confirm
it exercises the locale toggle, the project detail modal, career-chapter
navigation, and the contact section, in addition to the existing hero check —
each with a real pass/fail result.

**Acceptance Scenarios**:

1. **Given** the site loaded in a desktop-sized browser, **When** the locale
   toggle is used, **Then** the e2e suite confirms the chrome (nav, hero
   copy) switches language and confirms switching back returns to English.
2. **Given** the site loaded in a desktop-sized browser, **When** the hero
   credit pill (or equivalent entry point) is activated, **Then** the e2e
   suite confirms the targeted project's detail modal opens, and confirms it
   can be closed again.
3. **Given** the site loaded in a desktop-sized browser, **When** a career
   chapter is selected, **Then** the e2e suite confirms the story advances to
   that chapter's content.
4. **Given** the site loaded in a desktop-sized browser, **When** the contact
   section is reached, **Then** the e2e suite confirms its contact links
   (e.g. email) are present and correctly targeted.
5. **Given** any of these new tests, **When** it runs, **Then** it waits for
   the real client-fetched content the way the existing hero test does,
   rather than asserting before the relevant JSON has loaded.

---

### User Story 2 - The same major flows are proven on a mobile-sized viewport (Priority: P2)

The site's layout changes materially below the desktop breakpoint — sections
reflow, the wordmark's full name collapses to `sr-only`, the hamburger panel
narrows, and mobile-only overflow rules apply (per `tests/integration/
mobile-overflow.test.tsx`). The hamburger menu itself is *not* mobile-only:
`components/Navigation/StoryProgressNav.tsx:113` renders it at every width, so
it must be proven at both — but a phone is where its full-width overlay
matters most, and where an overflow regression actually hurts a visitor. A
developer needs the same major flows, including the hamburger menu,
re-verified under a mobile-sized viewport, plus the guard that only makes
sense there (no horizontal overflow), so a mobile-only regression is caught
with the same confidence as a desktop one.

**Why this priority**: The user explicitly asked for both desktop and mobile
coverage. It's second because it re-runs Story 1's flows under a second
viewport rather than introducing new ones — Story 1 has to exist first.

**Independent Test**: Run the e2e suite against a mobile-sized viewport and
confirm it exercises the same major flows as Story 1, plus opening and closing
the hamburger menu (which also runs on desktop) and the mobile-only
horizontal-overflow guard, each with a real pass/fail result.

**Acceptance Scenarios**:

1. **Given** the site loaded in a mobile-sized viewport, **When** the
   hamburger menu is opened, **Then** the e2e suite confirms its navigation
   options become visible, and confirms it can be closed again — the same
   single test also running, unmodified, at the desktop viewport, since the
   control renders at both.
2. **Given** the site loaded in a mobile-sized viewport, **When** the locale
   toggle, project detail modal, career-chapter navigation, and contact
   section are each exercised, **Then** the e2e suite confirms the same
   outcomes Story 1 confirms on desktop.
3. **Given** the site loaded in a mobile-sized viewport, **When** the page is
   scrolled through, **Then** the e2e suite confirms no horizontal overflow is
   introduced (consistent with `tests/integration/mobile-overflow.test.tsx`'s
   intent, now checked in a real browser).

---

### User Story 3 - A reader can see what's e2e-tested without reading test source (Priority: P3)

A developer or future maintainer wants to know, at a glance, what the e2e
suite actually covers — which flows, on which viewport — without opening every
`*.spec.ts` file. They need a single, easy-to-read Markdown reference listing
each e2e test, what it checks, and a link to the real test file, with
mobile-only tests broken out into their own table so viewport-specific
coverage isn't mixed in with the general one.

**Why this priority**: Valuable for onboarding and upkeep, but the tests
existing and passing (Stories 1–2) matter more than them being catalogued.
Lowest priority, still required by the request.

**Independent Test**: Open the documentation and confirm every e2e test file
in the project appears in exactly one of the two tables, each row names what
the test checks, and each row links to the actual spec file in the repo.

**Acceptance Scenarios**:

1. **Given** the e2e documentation, **When** a reader opens it, **Then** they
   find one table for viewport-agnostic / desktop-scoped e2e tests and a
   separate table for mobile-specific e2e tests.
2. **Given** a row in either table, **When** a reader follows its link,
   **Then** it resolves to the actual test file in the project (not a
   paraphrase or a copy of the code).
3. **Given** a new e2e test is added to the suite in the future, **When** a
   reader compares the suite to the doc, **Then** the doc's structure (two
   tables, one row per test, description + link per row) makes it obvious
   where the new row belongs, keeping the doc easy to keep current.
4. **Given** the existing testing-pyramid document from 019-playwright-e2e-tests,
   **When** this feature's documentation is added, **Then** it extends that
   document's e2e section rather than creating a second, competing
   testing-strategy document.

### Edge Cases

- What happens when a flow being tested (e.g. the project detail modal) relies
  on content that loads asynchronously? The new tests MUST wait for the real
  content the way the existing homepage test does (`toBeVisible()` / auto-
  waiting assertions), never a fixed sleep.
- What happens when a test written for one viewport is run at the other by
  mistake — e.g. a guard that can only be meaningfully measured below the
  breakpoint runs at desktop width and passes vacuously? The suite MUST scope
  each test to the viewport(s) it is written for, so a viewport mismatch fails
  clearly rather than passing on the wrong UI or failing for the wrong reason.
  A test whose UI is genuinely identical at both widths (the hamburger menu)
  is scoped to both rather than arbitrarily to one.
- What happens if a locale-toggle e2e test and a project-detail-modal e2e test
  both need to run in the same file? Each flow MUST remain independently
  understandable and independently passable/failable — a single test must not
  silently assert two unrelated flows such that a failure is ambiguous about
  which one broke.
- What happens when the documentation is written before or after a test is
  renamed or moved? The doc's links MUST point at the test's current path;
  a broken link is a defect in the doc, not an acceptable drift.
- What happens on the hamburger menu test if the viewport is resized mid-test
  rather than launched at a fixed size from the start? Out of scope for this
  feature — every test launches directly at its project's viewport and never
  resizes, matching how `tests/unit/components/HamburgerMenu.test.tsx` already
  separates "starts mobile" from "resizes into desktop" as distinct concerns.
  (This matters more than usual here: the component closes its own panel on a
  `resize` event, so a mid-test resize would silently invalidate the test.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The e2e suite MUST include a test verifying the locale toggle
  (EN ↔ DE) updates the site's visible chrome and content, and that toggling
  back returns it to English.
- **FR-002**: The e2e suite MUST include a test verifying a project's detail
  modal opens from its entry point (the hero credit pill or equivalent) and
  can be closed again.
- **FR-003**: The e2e suite MUST include a test verifying career/story chapter
  navigation advances the visible story content to the selected chapter.
- **FR-004**: The e2e suite MUST include a test verifying the contact
  section's contact links (e.g. email) are present and correctly targeted.
- **FR-005**: Every test added under FR-001–FR-004 MUST also run against a
  mobile-sized viewport (`<1024px`, matching the site's existing desktop
  breakpoint), confirming the same underlying outcome where the flow exists
  on mobile.
- **FR-006**: The e2e suite MUST include a test verifying the hamburger menu
  opens (revealing navigation) and closes, and that test MUST run against
  **both** the desktop-sized and the mobile-sized viewport — the control
  renders at every width (`components/Navigation/StoryProgressNav.tsx:113`),
  so coverage follows the component's actual behavior rather than an assumed
  mobile-only layout. *(Amended 2026-08-22; see Clarifications.)*
- **FR-007**: The e2e suite MUST include a mobile-only test verifying no
  horizontal overflow occurs on a mobile-sized viewport while scrolling
  through the page.
- **FR-008**: All new e2e tests MUST wait for real, client-fetched content
  before asserting against it (auto-waiting assertions), consistent with the
  existing homepage e2e test's approach — no fixed-duration waits.
- **FR-009**: All new e2e tests MUST run against both the local target and the
  CI preview-URL target without any test code branching on which one is
  active, consistent with the existing target-selection contract
  (`specs/019-playwright-e2e-tests/contracts/e2e-target-contract.md`).
- **FR-010**: Any theme-toggle e2e coverage added under this feature MUST only
  exercise the toggle when the `?experiment=true` flag is present, and MUST
  confirm the theme defaults to light when the flag is absent — it MUST NOT
  assert on `prefers-color-scheme` behavior (constitution Principle IV,
  Theming).
- **FR-011**: A Markdown document MUST exist that lists every e2e test in the
  project, what it verifies, and a link to its test file.
- **FR-012**: The document MUST separate mobile-specific e2e tests — those
  that only make sense, or are only worth measuring, below the mobile
  breakpoint (the horizontal-overflow guard of FR-007) — from the
  viewport-agnostic tests that run at both widths (FR-001–FR-004 and FR-006),
  in two distinct tables. *(Amended 2026-08-22: the hamburger-menu test moved
  to the viewport-agnostic table; see Clarifications.)*
- **FR-013**: The document MUST extend the existing testing-strategy
  documentation produced by 019-playwright-e2e-tests rather than introduce a
  second, separate testing-strategy document.
- **FR-014**: Each table row's link MUST resolve to the actual test file's
  current path in the repository.

### Key Entities

- **E2E test case**: A single Playwright test verifying one user-visible
  outcome; attributes include the flow it covers, the viewport(s) it runs
  under, and the file/line it lives at.
- **E2E coverage document**: The Markdown reference cataloguing e2e test
  cases into a general table and a mobile-specific table, each row
  describing intent and linking to its source file.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The e2e suite covers six major flows at both viewports (hero,
  locale toggle, project detail modal, career-chapter navigation, contact
  links, hamburger menu), up from one flow at one viewport today.
- **SC-002**: Every major flow that exists at both widths — including the
  hamburger menu — is verified at both a desktop-sized and a mobile-sized
  viewport, so a viewport-specific regression is caught regardless of which
  viewport it appears on. Only a check that is meaningless above the
  breakpoint (the horizontal-overflow guard) is scoped to one viewport.
- **SC-003**: A reader unfamiliar with the codebase can determine what the
  e2e suite tests, and reach the exact test file behind any given check, in
  under a minute by reading the coverage document alone.
- **SC-004**: 100% of e2e test files in the project appear in exactly one
  table (general or mobile-specific) in the coverage document — none missing,
  none duplicated.

## Assumptions

- The existing single e2e test (`tests/e2e/homepage.spec.ts`) and its target-
  selection setup (`playwright.config.ts`, local vs. CI preview URL) stay as
  built by 019-playwright-e2e-tests; this feature adds to that suite rather
  than replacing its infrastructure.
- "Major functionalities" is scoped to the flows already proven at the
  integration-test level today (locale switching, project detail modal,
  career/story navigation, contact section) — see Clarifications. Flows with
  no existing integration-test analogue are out of scope unless a future
  spec adds them.
- Achieving mobile viewport coverage may require adding a mobile browser
  project/device profile to `playwright.config.ts` (implementation detail for
  the planning phase) — the spec only requires that mobile-sized viewport
  behavior is verified, not a specific Playwright configuration mechanism.
- Which viewport(s) a test runs under follows the component's real behavior,
  not an assumption about it. A control that renders at every width is tested
  at every width (FR-006); only a check that cannot be meaningfully made above
  the breakpoint is mobile-scoped (FR-007). Where the spec's original premise
  and the code disagreed, the code won — see Clarifications, 2026-08-22.
- The theme toggle (`?experiment=true`) is not one of the five major flows
  in scope (FR-001–FR-004); FR-010 exists only to constrain any theme-related
  test that might be added, per the constitution gate, not to require one.
- "Mobile" and "desktop" follow the site's own existing `<1024px` /
  `>=1024px` breakpoint rather than a specific device emulation profile —
  see Clarifications.
