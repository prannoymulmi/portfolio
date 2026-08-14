---

description: "Task list for Mobile Layout Fixes"
---

# Tasks: Mobile Layout Fixes

**Input**: Design documents from `/specs/012-mobile-layout-fixes/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Included and NOT optional here. Constitution Principle II is
non-negotiable ("no feature is considered complete without passing tests"),
and spec SC-006 names the tests this feature owes. The split between what is
automated and what is manually verified was settled in the clarify session
and is recorded in research R4 — geometry is manual (SC-007), structure is
automated (SC-006).

**Organization**: Grouped by user story so each can be implemented, tested
and shipped on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no ordering dependency
- **[Story]**: US1 (overflow, P1), US2 (navbar, P2), US3 (career date, P3)
- Every task names its exact file path

## Path Conventions

Single Next.js app at the repository root: `app/` for routing and global
styles, `components/<Chapter>/` for components, `tests/unit/` and
`tests/integration/` for tests. Paths below are relative to the repo root.

---

## Phase 1: Setup

**Purpose**: Confirm the working environment. There is nothing to install —
this feature adds no dependency (plan.md, Constitution Check, Principle IV).

- [X] T001 Confirm a clean baseline: run `npm test`, `npm run lint` and `npm run type-check` at the repository root and record that all three pass before any change. A failure here is pre-existing and must be reported, not fixed inside this feature. **Note**: `npm test`/`type-check` initially failed on a pre-existing, unrelated environment gap — `next-themes`, `rough-notation` and `react-icons` were declared in `package.json` but not present in `node_modules`, and a stale `.next` cache held type references to a removed route structure. Completed the install (`npm install --legacy-peer-deps`, no `package.json`/`package-lock.json` change — see `git status`) and removed the stale `.next` cache. Baseline after that: 30/30 test suites, 206/206 tests, lint clean, type-check clean.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Establish which sections actually overflow. This gates the scope
of US1 — whether its fix touches one file or four — so it must complete
before US1 implementation begins.

**⚠️ CRITICAL**: Do not apply any containment utility before T002 is done.
Research R1 confirmed one cause by reading the code and listed three
suspects that are expected to be clean; patching them unmeasured would add
clipping contexts nobody needs and could silently cut a future design (R1,
"Alternatives considered").

- [ ] T002 **NOT PERFORMED as specified — needs a human with a real browser.** This coding agent has no browser-automation tool available (no Playwright/Puppeteer in `node_modules`, and installing one is a new dependency this feature explicitly rules out), so `document.documentElement.scrollWidth - document.documentElement.clientWidth` could not actually be measured. See the "Manual SC-007 checklist" in the handoff report for the exact steps to run this yourself.
- [X] T003 (partial — source-level only) Re-read the four predicted-clean suspects directly: `components/Hero/HeroPortrait.tsx:76` — `lg:w-[52vw]`/`lg:h-[90vh]` are both gated behind the `lg:` breakpoint, so out of the mobile range by construction; `components/Hero/HeroGradientLayers.tsx:18` and `components/Common/ChapterGradientOverlay.tsx:42` — both already `absolute inset-0 overflow-hidden`; `components/Career/CareerPitch.tsx:147` — already `overflow-hidden` on the pitch container. All four read as "clean" from source, consistent with research R1's predictions. **This confirms the code carries the properties research predicted, not that the rendered page has zero overflow at these elements — that half still needs T002's real-browser measurement.**

**Checkpoint**: The exact set of sections needing containment is known. US1 can begin.

---

## Phase 3: User Story 1 — The page ends where the screen ends on a phone (Priority: P1) 🎯 MVP

**Goal**: No horizontal scroll at any viewport width from 320px to 768px, in
either theme, with no readable content clipped and no decorative layer
shrunk.

**Independent Test**: At each width in the SC-001 matrix,
`document.documentElement.scrollWidth - document.documentElement.clientWidth`
returns 0, and a sideways swipe moves the page 0px — including while the
hamburger menu is opened, used and closed.

### Tests for User Story 1

> Write these first. T004 must FAIL before T006 lands, and T005 must PASS
> before and after (it guards against a fix nobody should make).

- [X] T004 [US1] Create `tests/integration/mobile-overflow.test.tsx` asserting that every chapter section in `app/page.tsx` which hosts a decorative element wider than its container carries a horizontal containment utility. Read the page source with `fs.readFileSync` and assert on class names rather than rendered layout — model the file's structure and its explanatory comments on `tests/integration/backdrop-coverage.test.tsx`, which uses this technique for the same reason (jsdom has no layout engine; research R4). Confirmed to FAIL before T006 landed.
- [X] T005 [US1] In the same `tests/integration/mobile-overflow.test.tsx`, add a regression guard asserting that no global horizontal-overflow guard has been introduced: neither `app/globals.css` nor `app/layout.tsx` may apply `overflow-x: hidden` / `overflow-x-hidden` / `overflow-hidden` to `html` or `body`. Comment the test with *why* — research R2 rejected the global guard because it satisfies FR-001 while leaving FR-002 violated in place, and because `overflow-x: hidden` propagated to the viewport is a known way to break `position: sticky` and smooth scrolling on iOS Safari (FR-004). This encodes a rejected alternative the way `backdrop-coverage.test.tsx:14` encodes the rejected parallax. Confirmed to PASS both before and after T006.

### Implementation for User Story 1

- [X] T006 [US1] Add `overflow-x-clip` to the `#contact` chapter section in `app/page.tsx` (the `<section id="contact" ...>` element, currently `chapter-scrim px-4 py-16 sm:px-6 lg:px-8`), plus any additional sections T003 identified as overflowing. Apply it to the full-width `<section>`, never to the inner `mx-auto max-w-4xl` wrapper or to `ContactSection.tsx`'s own `relative isolate` div — clipping inside the content column would cut the blurred glow at the column edge and produce a hard vertical line (research R2, "Where to apply it"). Use `overflow-x-clip`, not `overflow-hidden`: `hidden` on one axis forces the other to `auto`, creating a nested scroll container that can trap sticky descendants (FR-004). T003 found no additional overflowing section, so `#contact` is the only one touched.
- [X] T007 [US1] Add a short comment above the changed section in `app/page.tsx` naming what the utility is for and why `clip` rather than `hidden`, following the codebase's convention of comments carrying the reasoning (see the existing comments throughout `app/page.tsx` and `components/Navigation/StoryProgressNav.tsx`). Reference `specs/012-mobile-layout-fixes` so the constraint survives a future reader who would otherwise simplify it away.
- [ ] T008 [US1] **NOT PERFORMED — needs a human with a real browser.** No visual/geometry regression check possible without a browser. See handoff checklist.
- [ ] T009 [US1] **NOT PERFORMED — needs a human with a real browser.** See handoff checklist (SC-001/SC-002 matrix).
- [ ] T010 [US1] **NOT PERFORMED — needs a human with a real browser.** See handoff checklist (menu-transit check).

**Checkpoint**: US1 is complete and independently shippable. The worst symptom is gone, and US2 is likely resolved as a side effect — which T011 now checks.

---

## Phase 4: User Story 2 — The navigation bar stays with the page it belongs to (Priority: P2)

**Goal**: The bar stays pinned, fully visible and horizontally aligned with
the content for the whole length of the page.

**Independent Test**: Scroll from the very top to the footer at 375px; at
every chapter boundary the bar is pinned, fully visible, its gutters
unchanged, and its progress hairline advancing to full at the bottom.

**⚠️ This phase is deliberately verification-first.** Research R3 predicts
that US2 has no cause of its own: `StoryProgressNav.tsx:71` is
`sticky top-3 ... mx-3`, and `position: sticky` with only a `top` offset is
vertical-only, so the bar scrolls sideways with the document like anything
else. Remove the document's excess width and there is no longer any way to
observe the symptom. No fix task is written for a bug that may not exist
independently of US1 — T012 exists only as a conditional branch.

- [ ] T011 [US2] **NOT PERFORMED — needs a human with a real browser.** See handoff checklist (Scroll-behaviour checks). This coding agent inspected the code path once more (`StoryProgressNav.tsx:71` is `sticky top-3 ... mx-3`, no ancestor `transform`/`filter`/`contain` found in `app/layout.tsx`'s `body`/`ThemeProvider`/`ErrorBoundary`/`ContentProvider` chain), which is consistent with research R3's prediction that no code change is needed — but this is not a substitute for the real-browser check.
- [ ] T012 [US2] CONDITIONAL — only if a human's T011 still reproduces the symptom. Not applicable at this time (T011 not run in a real browser). Left open for the human handoff.

**Checkpoint**: US1 and US2 both verified. The page behaves on a phone.

---

## Phase 5: User Story 3 — The career chapter opens with its date (Priority: P3)

**Goal**: The date range renders above the "What I built" summary in every
career chapter panel, at every viewport width, with exactly one date line.

**Independent Test**: Select each chapter in turn in the interactive pitch
view; each shows its date above the summary, none shows a date at the foot,
none shows two.

**Fully independent of US1 and US2** — different files, no shared state. Can
be built in parallel with Phase 3 or 4 by a second implementer.

### Tests for User Story 3

> Write these first; both must FAIL before T015.

- [X] T013 [P] [US3] Extend `tests/unit/components/ChapterDetail.test.tsx` with a test asserting the date (`baseChapter.years`, `'11/2020 – 03/2025'`) renders before the "What I built" label in document order. Assert readably — compare the two strings' positions within the rendered container's text content, so the test reads as "the date is read before the summary" rather than as bit-mask arithmetic; `Node.compareDocumentPosition` is the fallback only if the text-index form proves ambiguous (research R5). Confirmed to FAIL before T015 landed.
- [X] T014 [P] [US3] Add a second test to `tests/unit/components/ChapterDetail.test.tsx` covering FR-012: with `builtSummary` set to an empty string via spread-override of the existing `baseChapter` fixture (the same technique the existing empty-`tech` test at line 55 uses), the date still renders ahead of the remaining sections rather than falling to the foot. Confirmed to FAIL before T015 landed.

### Implementation for User Story 3

- [X] T015 [US3] In `components/Career/ChapterDetail.tsx`, move the date paragraph — currently the last element in the panel, the `<p className="text-on-photo font-mono-ui mt-3 flex items-center gap-1.5 text-xs opacity-70">` containing the `📅` span and `{years}` — to sit immediately after the role line (`<p className="mt-1 text-sm font-medium text-primary">{role}</p>`) and before the `builtSummary` block. Carry the markup and class list over verbatim, including the `aria-hidden` on the emoji, so the visual treatment and accessible name are unchanged (FR-011). The existing `mt-3` already matches the sibling sections it now joins.
- [X] T016 [US3] Rewrite the two comments in `components/Career/ChapterDetail.tsx` that document the OLD placement, so the file stops contradicting itself: the file docblock's closing sentence ("The date moved out of the header into its own line at the foot of the panel, alongside its own mark") and the inline comment above the date node ("Date moved down here, out of the header — the header now reads as 'what chapter, what position', and the date reads as a footer fact..."). Both were written by spec 011 and are the record of a decision this feature reverses. State the new placement and its reason — the visitor should know *when* before reading *what* — and reference `specs/012-mobile-layout-fixes`. Do not delete them silently; the trail is the point (research R6).
- [X] T017 [US3] Confirm the untouched neighbour: `components/Career/TimelineView.tsx` is unchanged and its plain-list view still shows dates in the left rail, per the spec's Edge Cases and Assumptions (it already presents the date ahead of the description and is explicitly out of scope). Confirmed via `git status` — no diff to this file.

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T018 Run the full suite at the repository root: `npm test`, `npm run lint`, `npm run type-check`. All green. Compare against the T001 baseline — any newly failing pre-existing test is a regression from this feature. Result: 31/31 test suites, 211/211 tests (was 30/30, 206/206 — the +1 suite/+5 tests are this feature's new tests), lint clean, type-check clean.
- [ ] T019 **NOT PERFORMED — needs a human with a real browser.** See handoff checklist.
- [ ] T020 **NOT PERFORMED** (depends on T019). The checklist to run and paste is in the handoff report.
- [X] T021 (partial) `npm run build` succeeds (Turbopack production build, static prerender of `/`). Actual Lighthouse score was **not measured** — no browser/Lighthouse tool available to this agent. Needs a human to run Lighthouse against the production build.
- [X] T022 [P] Ran `npx prettier --write` on every touched file (`app/page.tsx`, `components/Career/ChapterDetail.tsx`, `tests/integration/mobile-overflow.test.tsx`, `tests/unit/components/ChapterDetail.test.tsx`); two files had formatting corrections applied, then the full suite was re-verified green.
- [X] T023 Confirmed: `tests/e2e/` is still empty, `package.json`/`package-lock.json` are unchanged (`git status` shows no diff to either), and no ADR or constitution amendment was made.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Phase 1. **Blocks US1 only.** US3 does not need it — the career date move is unrelated to overflow measurement.
- **US1 (Phase 3)**: depends on Phase 2 (T002/T003 determine which files T006 touches).
- **US2 (Phase 4)**: depends on US1 being **landed and verified**, not merely started. T011 is a check on the world after T006; running it before is meaningless.
- **US3 (Phase 5)**: depends on Phase 1 only. Independent of US1 and US2.
- **Polish (Phase 6)**: depends on all attempted stories.

### User Story Dependencies

- **US1 (P1)**: independent of other stories. Delivers the MVP.
- **US2 (P2)**: **genuinely depends on US1** — this is the one real cross-story dependency in the feature, and it is a dependency of verification, not of code. US2 is expected to require no code at all.
- **US3 (P3)**: fully independent. Different files (`components/Career/`, `tests/unit/components/`) from US1 (`app/page.tsx`, `tests/integration/`). Can start at any time.

### Within Each User Story

- Tests before implementation: T004/T005 before T006; T013/T014 before T015.
- T004 must fail before T006 and pass after. T005 must pass throughout — it guards a fix nobody should make, so it is green from the start and only ever fails if someone reaches for the global guard.
- Comments (T007, T016) land in the same commit as the code they explain, not as a follow-up.

### Parallel Opportunities

- **T013 and T014** are both in `tests/unit/components/ChapterDetail.test.tsx` but are independent additions to the same file — marked [P] because they can be written by the same implementer in either order, though they must not be committed by two people simultaneously.
- **Phase 5 (US3) runs fully in parallel with Phases 2–4 (US1/US2)** — no shared file, no shared state. This is the feature's main parallelism.
- **T022** is independent of the other polish tasks.
- T004/T005 (new test file) can be written while T002/T003 measurement is still running — they assert on structure the measurement does not change.

---

## Parallel Example: two implementers

```bash
# Implementer A — the overflow track (Phases 2 → 3 → 4)
Task: "T002 Measure real overflow at 320/375/768px in both themes"
Task: "T004 Create tests/integration/mobile-overflow.test.tsx containment assertion"
Task: "T006 Add overflow-x-clip to the #contact section in app/page.tsx"

# Implementer B — the career date track (Phase 5), at the same time
Task: "T013 Assert date renders before 'What I built' in tests/unit/components/ChapterDetail.test.tsx"
Task: "T015 Move the date paragraph above builtSummary in components/Career/ChapterDetail.tsx"
Task: "T016 Rewrite the two stale comments documenting the old placement"
```

The two tracks touch no common file, so they merge cleanly. Principle III
(atomic commits) is satisfied naturally: three commits — containment, date
move, and any conditional navbar fix — each a single unit of work.

---

## Implementation Strategy

### MVP: User Story 1 alone

US1 is the whole MVP. It fixes the symptom every mobile visitor meets on
every chapter, and research R3 predicts it resolves US2 for free — so the
MVP is expected to deliver two of the three stories. Sequence:

1. Phase 1 (T001) — baseline.
2. Phase 2 (T002–T003) — measure before patching.
3. Phase 3 (T004–T010) — contain, test, verify.
4. **STOP and VALIDATE** — run the SC-001 matrix. If it is 0 across the
   board, the feature's primary purpose is met.
5. Run T011. If the navbar checks pass, US2 is done with no code written.

### Incremental delivery

1. Setup + Foundational → the offending elements are known.
2. US1 → test → ship. Mobile is usable. **MVP.**
3. US2 verification → almost certainly a no-op confirming US1's side effect.
4. US3 → test → ship. Independent of the above; can ship first if desired.
5. Polish → full suite, full manual matrix, Lighthouse, scope check.

### What to escalate rather than solve

- T011 fails after T006 lands → research R3's prediction was wrong. Do not
  change the bar's positioning scheme without architect review (T012).
- Containment at the section still leaves overflow → the culprit is a
  different element than R1 identified; re-run T002's snippet rather than
  widening the containment.
- Anything that seems to need a browser test runner → stop. That is a
  Principle IV amendment plus an ADR, and the clarify session ruled it out of
  this feature's scope.
