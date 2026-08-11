---

description: "Task list for feature 005 — mobile reading order, corrected LinkedIn link, and a CV link"
---

# Tasks: Mobile reading order, corrected LinkedIn link, and a CV link

**Input**: Design documents from `/specs/005-mobile-order-contact-links/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/content-schema.md](contracts/content-schema.md), [quickstart.md](quickstart.md)

**Tests**: **Required, not optional.** Constitution Principle II (Test-First) is
NON-NEGOTIABLE for this project: "Tests MUST be written before or alongside every
feature. No feature is considered complete without passing tests." Test tasks below are
therefore first-class, and each precedes the implementation it covers.

**Organization**: One phase per user story. The three stories share no code and can be
implemented, tested, and shipped in any order or individually.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are given in every task

## Path Conventions

Single Next.js App Router project at the repository root. Components in `components/`,
shared logic in `lib/`, content in `public/data/`, tests in `tests/unit/` and
`tests/integration/`, decision records in `docs/adr/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the baseline so that any later red test is caused by this
feature's work and not by pre-existing state.

- [X] T001 Confirm the working tree is green before changing anything: run `npx tsc --noEmit`, `npx eslint components lib tests`, and `npx jest` from the repository root. Record the passing test count (currently 81) — the count must only ever grow during this feature.

**Note**: no dependency installation, scaffolding, or configuration is needed. The stack,
test harness, and lint rules are already in place and unchanged by this feature
(see [plan.md](plan.md) § Technical Context).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None. This phase is intentionally empty.

**⚠️ There are no blocking prerequisites for this feature.** The three user stories touch
disjoint files — US1 is a layout class change, US2 is content plus a deletion, US3 is a
new schema field and a new component. No shared model, service, or migration exists
between them, so inventing a foundational phase here would create a false dependency.

**Checkpoint**: After T001, all three user stories may begin immediately and in parallel.

---

## Phase 3: User Story 1 — A phone visitor reads the pitch before the picture (Priority: P1) 🎯 MVP

**Goal**: On narrow screens the opening section reads roles → intro → bio → CTAs → CV
link → player card, matching the desktop reading order and the DOM. Desktop is unchanged.

**Independent Test**: Load the opening at phone width and read down the page — text
first, card last. Then check at ≥1024px that nothing moved. Touches no content and no
links, so it can ship entirely on its own.

### Tests for User Story 1 ⚠️ Write first, confirm they FAIL

- [X] T002 [US1] Add a reading-order test to `tests/unit/components/Hero.test.tsx` asserting the role list, intro, bio, and the CTA block all precede the player card in document order (compare positions via `Node.compareDocumentPosition` or index within the section's children).
- [X] T003 [US1] Add the regression guard to `tests/unit/components/Hero.test.tsx`: assert that neither grid cell's `className` contains an `order-` utility. **This is the assertion that actually protects the fix** — `order-*` moves boxes visually without moving DOM nodes, so a DOM-order test alone would keep passing if the classes were re-added. See [research.md](research.md) § R1.

### Implementation for User Story 1

- [X] T004 [US1] In `components/Hero/Hero.tsx`, delete `order-2` and `lg:order-1` from the text column's `HeroDrift` className (line ~37) and `order-1` and `lg:order-2` from the card column's (line ~78). **Keep `min-w-0` on both** — a grid item defaults to `min-width:auto` and the card's fixed side rails would push the column past the viewport on narrow screens.
- [X] T005 [US1] In `components/Hero/Hero.tsx`, update the comment above the text column (currently at lines ~34-36) so it explains why `min-w-0` is there without referring to the deleted `order-*` classes. Do not delete the `min-w-0` rationale — it is the reason the class survives.
- [X] T006 [US1] Run `npx jest tests/unit/components/Hero.test.tsx` and confirm T002 and T003 now pass, and that the pre-existing Hero tests still pass.

### Manual verification for User Story 1

- [ ] T007 [US1] Follow [quickstart.md](quickstart.md) § US1 manual steps: at 390×844 confirm "Software Engineer." is the first thing on screen, then confirm the ≥1024px layout is byte-for-byte the previous side-by-side arrangement.
- [ ] T008 [US1] Tab from the top of the page at phone width and confirm focus reaches the text and both CTAs before anything inside the player card — this is the WCAG 1.3.2 (Meaningful Sequence) defect the deletion closes.

**Checkpoint**: US1 is complete and shippable on its own. Commit 1 (`fix(hero)`).

---

## Phase 4: User Story 2 — The LinkedIn link reaches the right profile (Priority: P1)

**Goal**: Every LinkedIn link on the site resolves to
`https://www.linkedin.com/in/prannoy-mulmi-0617026b/`, and only one file in the
repository can ever define it.

**Independent Test**: Follow the LinkedIn link from the navigation and from the footer;
both reach the owner's profile. Independent of US1 and US3.

### Tests for User Story 2 ⚠️ Write first, confirm they FAIL

- [X] T009 [P] [US2] Create `tests/integration/content-sources.test.ts` asserting the LinkedIn entry in `public/data/social.json` equals `https://www.linkedin.com/in/prannoy-mulmi-0617026b/` exactly.
- [X] T010 [US2] In the same `tests/integration/content-sources.test.ts`, assert that no file named `social.json` exists anywhere in the repository outside `public/data/` (walk the tree, skipping `node_modules`, `.git`, and `.next`). This encodes FR-006/FR-007 — a rule no schema can express — and fails if `app/data/social.json` is ever restored.

### Implementation for User Story 2

- [X] T011 [US2] In `public/data/social.json`, change the LinkedIn `href` to `https://www.linkedin.com/in/prannoy-mulmi-0617026b/`. Leave the GitHub entry and the `network` values untouched.
- [X] T012 [US2] Delete `app/data/social.json`. Delete nothing else under `app/data/` — the other four files are equally dead but were scoped as separable work by feature 004.
- [X] T013 [US2] Run `npx jest tests/integration/content-sources.test.ts tests/unit/components/SocialIcons.test.tsx tests/unit/components/Footer.test.tsx` and confirm all pass — the latter two prove neither consumer hardcodes the address and that the deletion broke nothing reading it.

### Manual verification for User Story 2

- [ ] T014 [US2] With `npm run dev` running, click the LinkedIn glyph in the top navigation and the LinkedIn link in the footer; both must land on the owner's profile.

**Checkpoint**: US2 is complete. Commits 2 (`fix(content)`) and 3 (`refactor(content)`) — kept apart because one is a value correction and the other is a deletion carrying its own justification.

---

## Phase 5: User Story 3 — A visitor can take the CV away (Priority: P2)

**Goal**: The opening section offers a small text link to the owner's externally hosted
CV, directly below the two CTAs, and renders nothing at all when no address is configured.

**Independent Test**: With a `cv` object in content, the link appears, is small, and opens
a new tab; without one, the opening section renders normally with no gap or placeholder.

> **Ships in the absent state.** The CV address is a Dependency the owner has not yet
> supplied, so `public/data/home.json` gains **no** `cv` key in this feature (FR-014).
> That is a designed-for case, not a stub. Consequence for testing: `Hero.test.tsx` reads
> the real `home.json`, so the *present* state must be covered by `CvLink`'s own unit
> tests with a fixture — do not add a `cv` key to real content just to make a Hero test
> pass.

### Tests for User Story 3 ⚠️ Write first, confirm they FAIL

- [X] T015 [P] [US3] Add `cv` schema tests to `tests/unit/validation.test.ts`: a label under 2 or over 40 characters is rejected, a malformed `href` is rejected, a valid `cv` is accepted, and a `home.json` with the whole `cv` key omitted is accepted.
- [X] T016 [P] [US3] Create `tests/unit/components/CvLink.test.tsx` covering, with fixture props: renders the label as a link to `href`; carries `target="_blank"` and `rel="noopener noreferrer"`; its accessible name states it is the CV and that it opens in a new tab; and returns nothing when `cv` is undefined.

### Implementation for User Story 3

- [X] T017 [P] [US3] In `lib/types/portfolio.ts`, add the `CvLink` interface (`label`, `href`) and an optional `cv?: CvLink` on `Home`, with a doc comment noting that absent means no link is rendered (FR-014) and that the site links to the CV but never hosts it (FR-010).
- [X] T018 [P] [US3] In `lib/utils/validation.ts`, add `CvLinkSchema` (`label: z.string().min(2).max(40)`, `href: z.string().url()`) and `cv: CvLinkSchema.optional()` on `HomeSchema`. Comment why the bounds are what they are — see [data-model.md](data-model.md).
- [X] T019 [US3] Create `components/Hero/CvLink.tsx`: a presentational component taking the `cv` object as a prop (not calling `useContent()`), returning `null` when it is undefined. Style as small plain text using the `text-on-photo` utility plus underline with offset — **not** as a button. No inline `style`; the token keeps the ADR 0013 exception unused here. Reference ADR 0015 in a comment for why `text-on-photo` rather than a grey.
- [X] T020 [US3] In `components/Hero/Hero.tsx`, destructure `cv` from `home.data` and render `<CvLink cv={cv} />` as a sibling directly below `<ValueProp />` inside the existing `mt-8` wrapper. Do not modify `ValueProp.tsx` — the two CTAs are explicitly out of scope.
- [X] T021 [US3] Add a test to `tests/unit/components/Hero.test.tsx` asserting that, with the shipped content (no `cv` key), the opening section renders and contains no CV link — the absent state (FR-014) verified against real content.
- [X] T022 [US3] Run `npx jest tests/unit/validation.test.ts tests/unit/components/CvLink.test.tsx tests/unit/components/Hero.test.tsx` and confirm all pass.

### Manual verification for User Story 3

- [ ] T023 [US3] Follow [quickstart.md](quickstart.md) § US3 State A: with no `cv` key, confirm the opening section renders with no link, no gap, and no console error.
- [ ] T024 [US3] Follow [quickstart.md](quickstart.md) § US3 State B: temporarily add `"cv": { "label": "Download CV", "href": "https://example.com/cv.pdf" }` to `public/data/home.json`, then confirm the link appears below the CTAs, is visibly smaller and lighter than either button, opens a new tab keeping the portfolio's scroll position, and shows a visible focus ring on tab. Check both light and dark themes over the photograph. **Remove the key again before committing.**

**Checkpoint**: US3 is complete. Commit 4 (`feat(hero)`).

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T025 Write `docs/adr/0017-content-lives-in-one-place-and-the-cv-lives-elsewhere.md` recording two content-storage decisions: (a) `public/data/` is the single source and the `app/data/` social duplicate is deleted, with the drift that caused the LinkedIn bug as the evidence; (b) the CV is referenced at an external address and deliberately **not** committed to `public/`, because a CV commonly carries a home address and phone number and a public repository keeps them in git history forever. State the rejected alternatives (sync both files; self-host the PDF with a `download` attribute) and note that `download` does nothing cross-origin. Required by Constitution Principle VI, in the same PR.
- [X] T026 Add the ADR 0017 row to the index table in `docs/adr/README.md` with status `Accepted`.
- [X] T027 Add an amendment note to `docs/adr/0001-json-files-over-cms.md` recording that the `app/data/social.json` half of the "second set of JSON files" it describes is now gone, and pointing at ADR 0017. Do not rewrite its original text — Principle VI forbids editing an accepted record; it gains a dated note instead.
- [X] T028 Split the work into the five commits defined in [plan.md](plan.md) § Commit plan, each stating what changed and why in the `<type>(<scope>): <what> — <why>` format (Principle III). Verify each commit is green in isolation before pushing.
- [X] T029 Run the full gate from the repository root: `npx tsc --noEmit && npx eslint components lib tests && npx jest && npx next build`. All four must pass.
- [ ] T030 Confirm Lighthouse performance ≥ 90 on the production build (Constitution: Technology & Quality Constraints). Nothing in this feature should move it — no new dependency, no new image, no runtime fetch — so a regression here means something unintended landed.
- [ ] T031 Walk [quickstart.md](quickstart.md) end to end as a final check, including the constitution gate checklist at its foot.

---

## Implementation outcome (2026-08-11)

**24 of 31 tasks complete.** All code, content, tests, and decision records are done and
committed on `feat/mobile-order-contact-links`. Test count went 81 → 97; every commit is
green in isolation (verified by checking each out and running the suite).

**The 7 open tasks all need a browser or a human, and none was performed:**

| Task | Why it is still open |
|---|---|
| T007, T008 | Visual check at 390×844 and a real tab-order walk. The `order-*` guard (T003) proves the classes are gone, but only a person can confirm what the phone actually shows and where focus lands. |
| T014 | Clicking the LinkedIn links in a running browser. The address is asserted in content (T009) and both consumers are proven to read it rather than hardcode it (T013), so what remains is confirming the profile page itself is the right one. |
| T023, T024 | State A is covered automatically by T021; the visual "no gap, no console error" is not. State B requires temporarily adding a `cv` key, which must not be committed. |
| T030 | Lighthouse on a production build. `next build` succeeds and nothing was added that should move the score — no dependency, no image, no runtime fetch — but the number was not measured. |
| T031 | The end-to-end quickstart walk, which is the sum of the above. |

**Deviation from the plan, recorded:** T002 could not fail before T004, and this was
predicted in [plan.md](plan.md) § Design Notes. The DOM order was already correct — only
the CSS was wrong — so a document-order assertion passes both before and after the fix.
T003 is the test that was actually red. T002 is kept as a characterisation test that
locks in the DOM order the fix now depends on.

**One thing the tasks did not anticipate:** the `framer-motion` mock in
`tests/unit/components/Hero.test.tsx` discarded `className`, so T003 could not see the
classes it exists to check. The mock now forwards `className`. This is a test-fidelity
fix, not a production change.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 only. No dependencies.
- **Foundational (Phase 2)**: empty by design — see the note in that phase.
- **User Stories (Phases 3–5)**: each depends only on T001. They do not depend on each other and may be done in any order, or concurrently by different people.
- **Polish (Phase 6)**: T025–T027 depend on US2 and US3 being decided (they record those decisions); T028–T031 depend on all stories being complete.

### User Story Dependencies

- **US1 (P1)** — independent. Touches only `components/Hero/Hero.tsx` and `tests/unit/components/Hero.test.tsx`.
- **US2 (P1)** — independent. Touches only `public/data/social.json`, `app/data/social.json`, and a new integration test.
- **US3 (P2)** — independent. Touches `lib/`, a new component, `Hero.tsx`, and tests.

**One shared file to sequence around**: US1 (T004, T005) and US3 (T020) both edit
`components/Hero/Hero.tsx`, and US1 (T002, T003) and US3 (T021) both edit
`tests/unit/components/Hero.test.tsx`. The edits are in different regions and do not
conflict logically, but they are not `[P]` with each other. If both stories are worked
concurrently, land US1 first — it is the MVP and its diff is smaller.

### Within Each User Story

- Tests are written first and confirmed failing before the implementation task that satisfies them (Principle II).
- Types and schema before the component that consumes them (T017, T018 → T019).
- Component before its wiring into the page (T019 → T020).

### Parallel Opportunities

- After T001, all three story phases can start at once.
- **Within US2**: T009 is `[P]` — it is a new file touching nothing else.
- **Within US3**: T015 and T016 are `[P]` (different test files); T017 and T018 are `[P]` (different source files).
- **Across stories**: US2's tasks are `[P]` with everything in US1 and US3 — it shares no file with either.

---

## Parallel Example: User Story 3

```bash
# Write both test files together (they fail until T017–T020 land):
Task: "Add cv schema tests to tests/unit/validation.test.ts"
Task: "Create tests/unit/components/CvLink.test.tsx"

# Then the two source files that have no dependency on each other:
Task: "Add CvLink interface and optional cv on Home in lib/types/portfolio.ts"
Task: "Add CvLinkSchema and cv on HomeSchema in lib/utils/validation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. T001 (baseline green)
2. Phase 3 — US1 (T002–T008)
3. **STOP and VALIDATE**: phone width reads text-first; desktop unchanged; tab order correct
4. Ship. This alone fixes the thing that costs every mobile visitor something on every visit, and closes a WCAG 1.3.2 failure.

### Incremental Delivery

1. T001 → baseline established
2. US1 → validate → ship (MVP)
3. US2 → validate → ship (broken contact link repaired; two commits)
4. US3 → validate → ship (CV link, in its absent state until the address arrives)
5. Phase 6 → ADRs, commit split, full gate

Each story is independently revertable. None breaks the ones before it.

### Note on scope for the implementer

`public/data/home.json` gains no `cv` key in this feature — the address is not yet
available. US3 is nonetheless complete and testable: FR-014 makes the absent state a
requirement with its own test (T021), and the populated state is covered by `CvLink`'s
unit tests (T016). When the owner supplies the URL, adding it is a one-line content edit
with no code change (FR-013).
