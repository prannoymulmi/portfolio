# Tasks: E2E Coverage for Major Flows, Desktop & Mobile

**Input**: Design documents from `/specs/021-e2e-mobile-desktop-coverage/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/viewport-project-contract.md, quickstart.md

**Tests**: This feature's deliverable *is* tests. Every task in US1 and US2 authors a Playwright spec; there is no separate "write tests first" phase, because there is no production code to write them against — the application is already built and unchanged by this feature.

**Organization**: Grouped by user story so each can be implemented, run, and shipped independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different file, no dependency on an incomplete task in the same phase
- **[Story]**: US1 (desktop major flows), US2 (mobile major flows + mobile-only guard), US3 (documentation)
- Every task names an exact file path

## Path Conventions

Single Next.js App Router project (ADR 0012). All paths are repository-root-relative, per plan.md's Project Structure section. This feature touches only `playwright.config.ts`, `tests/e2e/`, `docs/testing-pyramid.md`, and optionally `README.md`. No production component, no dependency, no CI file.

**Amendment in force (2026-08-22)**: `hamburger-menu.spec.ts` lives at `tests/e2e/` top level and runs under **both** projects — not under `tests/e2e/mobile/`. See spec.md Clarifications and research.md Finding 6.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Give the suite its two viewports. Nothing else in this feature can be verified until a spec can run at a chosen width.

- [X] T001 Add a `projects` array to `playwright.config.ts` with exactly two Chromium entries — `desktop` (`viewport: { width: 1440, height: 900 }`, `testIgnore: /mobile\//`) and `mobile` (`viewport: { width: 390, height: 844 }`, no ignore) — both spreading `devices['Desktop Chrome']` and overriding only `viewport`; set neither `isMobile`, `hasTouch`, `userAgent`, nor `deviceScaleFactor`, and leave `testDir`, `use.baseURL`, the `VERCEL_AUTOMATION_BYPASS_SECRET` header block, and the conditional `webServer` block untouched (research D1/D2, data-model.md "Viewport project")
- [X] T002 Add a comment above the `projects` array in `playwright.config.ts` naming the `1024px` breakpoint source (`components/Hero/useHeroScrollBlur.ts`'s `DESKTOP_LAYOUT`) and pointing at `specs/021-e2e-mobile-desktop-coverage/contracts/viewport-project-contract.md`, then verify with `pnpm run test:e2e` that the existing `tests/e2e/homepage.spec.ts` now reports twice, once as `[desktop]` and once as `[mobile]`

**Checkpoint**: two viewport projects exist and the pre-existing spec runs under both. Every subsequent spec file inherits its scope from where it is placed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None. This feature's only cross-story prerequisite is the `projects` array, which is Phase 1.

**No tasks.** `tests/e2e/mobile/` is created by the single task that adds its only file (T010) rather than committed empty. There is no shared helper module, no fixture, and no page object by design (research D2 — a `runMajorFlows(page)` helper was considered and rejected).

**Checkpoint**: proceed directly from Phase 1 to any user story.

---

## Phase 3: User Story 1 - Major site flows are proven end-to-end on desktop (Priority: P1) 🎯 MVP

**Goal**: Take the e2e suite from one smoke test to five, covering locale toggle, project detail modal, career navigation, and contact links. Written once at `tests/e2e/` top level, so they run at both widths from the moment they exist (FR-005/FR-009) — US1 is where their *desktop* pass/fail is claimed.

**Independent Test**: `pnpm run test:e2e --project=desktop` runs five specs and passes, each named for the flow it covers.

**Constraints binding every task in this phase** (research D3, data-model.md "E2E test case"): locate by `getByRole` + accessible name only — no `data-testid`, no CSS/class selectors; auto-waiting assertions only — no `page.waitForTimeout` (FR-008); never hard-code a company name, project title, or email address, read the expected value from the control that was clicked (R2); never read `process.env`, `PLAYWRIGHT_BASE_URL`, or `test.info().project.name` (FR-009); never call `page.setViewportSize()`; assert one flow per test so a failure is unambiguous (spec Edge Case 3); assert nothing about theme, `prefers-color-scheme`, the `.dark` class, or `?experiment=true` (FR-010).

- [X] T003 [P] [US1] Create `tests/e2e/locale-toggle.spec.ts` (FR-001): assert `html[lang="en"]` and one visible English chrome string, click `getByRole('button', { name: /English/ })` (the endonym is locale-invariant — same trick `tests/integration/locale-switch.test.tsx` uses), assert `html[lang="de"]` and the German counterpart, click back, assert the English state returns; pick a string whose two locales genuinely differ, e.g. the contact heading `Got a gnarly system?` / `Hast du ein kniffliges System?` (R3)
- [X] T004 [P] [US1] Create `tests/e2e/project-detail-modal.spec.ts` (FR-002): assert no `dialog` exists, click `getByRole('link', { name: /built with claude/i })` (the hero credit pill's static `aria-label` in `components/Hero/Hero.tsx:137`, deliberately static so it does not race the typing animation), assert a `getByRole('dialog')` with the expected heading, close via the `Close` button (`components/Projects/ProjectDetailModal.tsx:195`) and assert the dialog is gone
- [X] T005 [P] [US1] Create `tests/e2e/career-navigation.spec.ts` (FR-003): take the **last** company chip in `CareerPitch`'s `<ol>` (`components/Career/CareerPitch.tsx:123-146`), read its text into a variable, click it, and assert `ChapterDetail`'s heading (`components/Career/ChapterDetail.tsx:52`) now shows that same text — no hard-coded employer name
- [X] T006 [P] [US1] Create `tests/e2e/contact-links.spec.ts` (FR-004): assert the contact chapter's email link is visible with an `href` matching `/^mailto:/`, and that each social link carries an absolute `https:` href with `target="_blank"` (`components/Contact/ContactSection.tsx:55-79`) — assert the shape of the href, not the address itself
- [X] T007 [US1] Run `pnpm run test:e2e --project=desktop` and confirm five specs pass with a `[desktop]` prefix, then deliberately break one assertion (e.g. the `mailto:` prefix in `tests/e2e/contact-links.spec.ts`), re-run, confirm exactly one test fails and its name identifies the flow, and revert (quickstart.md "Desktop coverage" steps 1-2 and 5, spec Edge Case 3)

**Checkpoint**: US1 is shippable on its own — four new flows proven in a real browser, at both viewports incidentally, with the desktop claim verified. This is the MVP.

---

## Phase 4: User Story 2 - The same major flows are proven on a mobile-sized viewport (Priority: P2)

**Goal**: Claim the mobile pass/fail for US1's flows, add the hamburger-menu spec (shared, but US2 is what cares that it holds at 390px), and add the one genuinely mobile-only guard.

**Independent Test**: `pnpm run test:e2e --project=mobile` runs seven specs and passes.

- [X] T008 [US2] Create `tests/e2e/hamburger-menu.spec.ts` — **at the top level, NOT under `tests/e2e/mobile/`**, so both projects run it (FR-006 as amended 2026-08-22): open via `getByRole('button', { name: /open menu/i })`, assert `getByRole('navigation', { name: /story sections/i })` and its section links are visible, close via the same toggle (whose `aria-label` flips to `/close menu/i` — `components/Navigation/HamburgerMenu.tsx:178`) and assert the panel is gone
- [X] T009 [US2] Add a comment at the top of `tests/e2e/hamburger-menu.spec.ts` recording why it is shared and what it must not assert: `components/Navigation/StoryProgressNav.tsx:113` mounts the toggle unconditionally, and its accessible name, role, and nav-bar position are identical at 1440x900 and 390x844; the panel (`HamburgerMenu.tsx:216`) is a portal-rendered `fixed inset-y-0 right-0` nav at both widths; the only width-dependent detail is the panel's max width (`max-w-xs` 320px vs `sm:max-w-sm` 384px), so the spec must **not** assert panel width or viewport coverage, and must not call `page.setViewportSize()` (the component closes its own panel on `resize`) — cite research F6 so a future reader does not move the file back under `mobile/`
- [X] T010 [P] [US2] Create `tests/e2e/mobile/no-horizontal-overflow.spec.ts` (FR-007), creating the `tests/e2e/mobile/` directory in the same task: assert in-page that `document.documentElement.scrollWidth <= document.documentElement.clientWidth` after load and again after scrolling to several positions **including the bottom**, so the lazily-mounted `ProjectGalleryLazy` / `CareerJourneyLazy` chapters and the contact chapter's 640px decorative glow are in the DOM when measured (research D5); measure `documentElement`, never `body`
- [X] T011 [US2] Run `pnpm run test:e2e --project=mobile` and confirm seven specs pass with a `[mobile]` prefix; run `pnpm run test:e2e tests/e2e/hamburger-menu.spec.ts` and confirm it passes twice, once per project; confirm `pnpm run test:e2e --project=desktop --list | grep -c mobile/` returns `0` and `ls tests/e2e/mobile/*.spec.ts` lists exactly one file (quickstart.md "Mobile coverage" steps 1, 3, 5)

**Checkpoint**: both viewports fully covered — 7 spec files, 13 executions (6 shared x 2 + 1 mobile-only).

---

## Phase 5: User Story 3 - A reader can see what's e2e-tested without reading test source (Priority: P3)

**Goal**: Catalogue the suite in the existing testing-strategy document — two tables, one row per spec file, every row linking to the real file.

**Independent Test**: open `docs/testing-pyramid.md` and confirm every file under `tests/e2e/` appears in exactly one table with a working link.

- [X] T012 [US3] Add an "E2E coverage" section to `docs/testing-pyramid.md`, positioned between the existing "E2E — Playwright, real browser, real (or real-enough) deployment" section and "Layer summary" (FR-013, research D7), containing the first table — viewport-agnostic tests run by both projects, **six rows**: `homepage.spec.ts`, `locale-toggle.spec.ts`, `project-detail-modal.spec.ts`, `career-navigation.spec.ts`, `contact-links.spec.ts`, `hamburger-menu.spec.ts` — each row giving the flow name, what it verifies, the viewport(s) it runs under, and a repository-relative link of the form `../tests/e2e/<file>.spec.ts` (FR-011, FR-012, FR-014)
- [X] T013 [US3] Add the second table to the same "E2E coverage" section of `docs/testing-pyramid.md` — mobile-specific tests, **one row**: `../tests/e2e/mobile/no-horizontal-overflow.spec.ts` — plus the single required footnote explaining that it does not replace `tests/integration/mobile-overflow.test.tsx` (jsdom has no layout engine, so the integration test asserts the *fix is present* while the e2e test asserts the *symptom is absent* — research D5); do **not** add a footnote claiming the hamburger test is mobile-scoped, and state in a line under the table that the hamburger menu sits in the first table because it renders at every width (data-model.md "E2E coverage document")
- [X] T014 [P] [US3] Optionally add one clause to the existing "Testing strategy" section of `README.md` naming the two-viewport split (`desktop` 1440x900 / `mobile` 390x844) and linking to `docs/testing-pyramid.md`; the link already exists, so this is a wording addition only (research D7, helps SC-003)

**Checkpoint**: all three stories complete; the suite is discoverable without reading test source.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the whole feature against quickstart.md, including the constraints no single spec's own test run can check.

- [X] T015 [P] Run the four automated checks from quickstart.md "Automated checks" — `pnpm type-check`, `pnpm lint`, `pnpm test` (unit + integration must be entirely unaffected by this feature), and `pnpm run test:e2e` (13 executions across both projects, all passing)
- [X] T016 [P] Run the three grep guards over `tests/e2e/` and confirm each returns nothing: `grep -rn "waitForTimeout" tests/e2e/` (FR-008), `grep -rn "process.env\|project.name" tests/e2e/` (FR-009), `grep -rn "setViewportSize" tests/e2e/` (spec Edge Case 5)
- [X] T017 Verify SC-004 in both directions from the repository root — every spec file appears in exactly one table and every link resolves: run the link-existence loop and the `diff` between `find tests/e2e -name '*.spec.ts'` and the links extracted from `docs/testing-pyramid.md` exactly as quickstart.md "Coverage document" steps 4-5 spell out; the diff must be empty and the in-doc list must contain no duplicates (FR-014, SC-004)
- [X] T018 Confirm `.github/workflows/ci.yml`, `package.json`, `docs/adr/`, and every file under `tests/unit/` and `tests/integration/` are absent from `git diff --stat` — this feature changes none of them (research D4/D8, data-model.md "Artifacts explicitly not changed")

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately. T002 depends on T001 (same file, and the verification needs the array to exist).
- **Foundational (Phase 2)**: empty. No blocking work beyond Phase 1.
- **US1 (Phase 3)**: depends on Phase 1 only.
- **US2 (Phase 4)**: depends on Phase 1 only — independently implementable without US1. T011's "seven specs pass" count assumes US1 is done; if US2 is built first, expect three.
- **US3 (Phase 5)**: depends on Phase 1 for the project names it documents, and on US1 + US2 for the spec files its tables link to. T017 in Polish cannot pass until every spec file exists.
- **Polish (Phase 6)**: depends on all desired stories being complete.

### User Story Dependencies

- **US1 (P1)**: no dependency on another story. Fully shippable alone.
- **US2 (P2)**: no hard dependency on US1 — its specs are new files. Sequenced second because it re-runs US1's flows at a second width rather than introducing new flows, so US1 should exist first for the story to mean what it says.
- **US3 (P3)**: soft dependency on US1 and US2 — a table cannot link to a file that does not exist. Its structure can be drafted early; its rows cannot be final until the specs land.

### Within Each User Story

- US1: T003-T006 are four independent new files, then T007 verifies them together.
- US2: T008 → T009 (same file, comment goes on the spec T008 creates); T010 is independent; T011 verifies all three.
- US3: T012 → T013 (same file, second table follows the first); T014 is a different file.

### File-Conflict Map

| File | Tasks touching it |
|---|---|
| `playwright.config.ts` | T001, T002 — sequential |
| `tests/e2e/hamburger-menu.spec.ts` | T008, T009 — sequential |
| `docs/testing-pyramid.md` | T012, T013 — sequential |
| Every other task | its own file, or read-only verification |

### Parallel Opportunities

- T003, T004, T005, T006 — four separate new spec files, no shared state.
- T008 (or T009) and T010 — different files.
- T014 and T012/T013 — `README.md` versus `docs/testing-pyramid.md`.
- T015 and T016 — both read-only.
- Across stories: once T002 is done, US1 and US2's authoring tasks can proceed simultaneously if two people are available.

---

## Parallel Example: User Story 1

```bash
# All four flow specs are independent new files — launch together:
Task: "Create tests/e2e/locale-toggle.spec.ts (FR-001)"
Task: "Create tests/e2e/project-detail-modal.spec.ts (FR-002)"
Task: "Create tests/e2e/career-navigation.spec.ts (FR-003)"
Task: "Create tests/e2e/contact-links.spec.ts (FR-004)"

# Then, sequentially:
Task: "Run pnpm run test:e2e --project=desktop and verify unambiguous failure attribution"
```

## Parallel Example: User Story 2

```bash
# Two independent new files (T009's comment must follow T008 in the same file):
Task: "Create tests/e2e/hamburger-menu.spec.ts (top level, both projects)"
Task: "Create tests/e2e/mobile/no-horizontal-overflow.spec.ts"
```

## Parallel Example: User Story 3 and Polish

```bash
# Different files:
Task: "Add the E2E coverage section and first table to docs/testing-pyramid.md"
Task: "Add the two-viewport clause to README.md's Testing strategy section"

# Both read-only:
Task: "Run pnpm type-check, lint, test, test:e2e"
Task: "Run the three grep guards over tests/e2e/"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (T001-T002) — the two viewport projects.
2. Skip Phase 2 — it is empty.
3. Complete Phase 3 (T003-T007) — the four flow specs.
4. **STOP and VALIDATE**: `pnpm run test:e2e --project=desktop` passes with five specs; break one assertion and confirm exactly one test fails by name.
5. Ship. The suite has gone from one smoke test to five real flow tests, and because the specs sit at the top level they are already running at the mobile viewport too — US2 becomes a claim to verify rather than work to redo.

**Why US1 is the right MVP**: it is the literal ask ("make sure the major functionalities are working"). Without it, nothing else in this feature has anything to catalogue or any second viewport to re-run.

### Incremental Delivery

1. Phase 1 → both projects exist; `homepage.spec.ts` reports twice.
2. + US1 → four flows proven; **MVP, shippable**.
3. + US2 → hamburger menu proven at both widths, overflow guarded on mobile; 7 files, 13 executions.
4. + US3 → the suite is documented and discoverable.
5. + Polish → quickstart verified end to end, SC-004 mechanically confirmed.

Each step is a coherent PR. Nothing in a later step invalidates an earlier one, and no step touches production code.

### Parallel Team Strategy

1. One person completes Phase 1 (T001-T002) — everything else depends on it and it is a single small file.
2. Then: Developer A takes US1 (T003-T007), Developer B takes US2 (T008-T011). No file overlap.
3. US3 (T012-T014) starts once both are merged, since its tables link to their files.
4. Polish last, by whoever merges.

---

## Notes

- 18 tasks: Setup 2, Foundational 0, US1 5, US2 4, US3 3, Polish 4.
- 7 e2e spec files after this feature (1 existing + 6 new), 13 executions.
- `[P]` = different file, no dependency on an incomplete task in the same phase.
- No production component, no dependency, no CI file, and no ADR is touched — verified by T018.
- **The hamburger-menu spec belongs at `tests/e2e/`, not `tests/e2e/mobile/`.** This reverses the original plan and is the point of the 2026-08-22 amendment; T009 exists specifically to stop it drifting back.
- Commit after each task or logical group; release-stage commits take the haiku form per constitution Principle III.
