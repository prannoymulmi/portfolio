---
description: "Task list for feature 006 — portrait hero and floating navigation"
---

# Tasks: Portrait hero and floating navigation

**Input**: Design documents from `/specs/006-hero-portrait-floating-nav/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/content-schemas.md](contracts/content-schemas.md), [quickstart.md](quickstart.md)

**Tests**: **Required, not optional.** Constitution Principle II is NON-NEGOTIABLE — "Tests MUST be written before or alongside every feature. No feature is considered complete without passing tests." The template's "tests are optional" default does not apply to this repository.

**Organization**: Grouped by user story so each can be implemented, tested and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete work)
- **[Story]**: US1–US4, mapping to the user stories in spec.md
- Every task names the exact file it touches

## Path Conventions

Existing Next.js App Router layout, per plan.md — `app/`, `components/<Domain>/`, `lib/`, `tests/{unit,integration}/`, `public/data/`, `docs/adr/`. No new top-level directories.

---

## ⚠️ Two ordering constraints that are correctness, not style

Read before starting. Both come from [data-model.md](data-model.md):

1. **The card must stop rendering before its schema is trimmed.** If `card` leaves `home.json` while `HomeSchema` still requires it, every content load fails validation and the opening renders its error state — on that commit and every commit until fixed. Phase 7 therefore runs *after* Phase 3.
2. **Within Phase 7, trim the schema before the JSON.** `HomeSchema` is not strict, so a leftover `card` key in JSON is ignored harmlessly, but a missing required key is fatal. Schema → types → JSON.

---

## Phase 1: Setup

**Purpose**: Establish the baseline that later phases are measured against.

- [X] T001 Run `npx jest` from the repository root and confirm the documented baseline of 17 suites / 99 tests passing; record any pre-existing failure before changing code
- [X] T002 Confirm `public/images/hero_cutout.png` exists with an alpha channel via `sips -g hasAlpha public/images/hero_cutout.png` (expect `hasAlpha: yes`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The email content contract, which both US2 (nav control) and US4 (Contact chapter) depend on. Nothing else blocks across stories.

**⚠️ CRITICAL**: US2 and US4 cannot start until this phase completes.

- [X] T003 [P] Add `email: z.string().email()` to `SocialFileSchema` in `lib/utils/validation.ts`, with a comment recording why `.email()` and not the `.url()` used by `SocialSchema.href` — `.url()` accepts `mailto:` and rejects a bare address (research.md R6)
- [X] T004 [P] Add the required `email: string` field to the `SocialFile` interface in `lib/types/portfolio.ts`
- [X] T005 Add `"email": "prannoy.mulmi@gmail.com"` as a sibling of the `social` array in `public/data/social.json` (must land with T003 — the field is required, so schema and content cannot diverge across commits)
- [X] T006 Extend `tests/integration/content-sources.test.ts` to assert `social.json` carries a valid `email` and that it is **not** a member of the `social` array

**Checkpoint**: `npm run validate:json` and `npx jest` both pass; the email exists in content but nothing renders it yet.

---

## Phase 3: User Story 1 — The opening leads with the person (Priority: P1) 🎯 MVP

**Goal**: Replace the player card with the cut-out portrait on the right, blended into the page surface, and restore the missing word in the tagline.

**Independent Test**: Load `/` at desktop and mobile widths in both themes. No player card, portrait present and legible, roles and tagline correct, no orphaned card content.

### Tests for User Story 1

> Write these first and confirm they fail before implementing.

- [X] T007 [P] [US1] Create `tests/unit/components/HeroPortrait.test.tsx` asserting the contract in contracts/content-schemas.md — returns `null` without `imageSource`, renders exactly one image, non-empty `alt` naming the subject, a bottom-mask utility class present, an explicit `sizes`, and **no** `preload`
- [X] T008 [US1] Rewrite `tests/unit/components/Hero.test.tsx` — delete the card assertions (job title, year-count stats, blurb, soft-skill meters, AWS mark, country flags) and replace with: no `<figure>` in the section, portrait renders from `hero_cutout.png`, and text content precedes the portrait in DOM order with no `order-*` utility doing the reordering

### Implementation for User Story 1

- [X] T009 [P] [US1] In `public/data/home.json`, restore "secure" to `intro` so it reads "I build secure, scalable cloud systems, and I care about getting the security and the details right." and repoint `imageSource` to `/images/hero_cutout.png` (leave the `card` object in place — Phase 7 removes it)
- [X] T010 [P] [US1] Create `components/Hero/HeroPortrait.tsx` per the contract: `next/image`, `mask-b-from-60% mask-b-to-100%` for the lower dissolve, `object-top` with a height cap below `lg` for the ~300px head-and-shoulders framing (FR-005a), explicit `sizes`, no `preload` (research.md R2, R8)
- [X] T011 [US1] Update `components/Hero/Hero.tsx` — stop destructuring `card`, drop the `PlayerCard` import, render `HeroPortrait` in that slot, and lower the portrait's `HeroDrift` strength from 56 to 28 per FR-006a (depends on T010)
- [X] T012 [US1] Correct the `imageSource` doc comment in `lib/types/portfolio.ts`, which currently promises a placeholder fallback that Phase 7 deletes; absent now means a text-only opening

**Checkpoint**: The opening shows the portrait and no card. The card's files still exist but nothing renders them — the tree builds and the suite passes.

---

## Phase 4: User Story 2 — Navigation floats and is reachable (Priority: P1)

**Goal**: Reshape the persistent nav into a floating rounded bar whose section links scroll inside it while the controls stay pinned.

**Independent Test**: Scroll to any chapter; the bar is still visible, floating and rounded, and every link reaches its section.

**Depends on**: Phase 2 (the email field the new control reads). Independent of US1.

### Tests for User Story 2

- [X] T013 [P] [US2] Create `tests/unit/components/EmailLink.test.tsx` — renders `<a href="mailto:…">`, carries an `aria-label` identifying it as email (the glyph is `aria-hidden`), and imports no `react-icons` module (ADR 0014 confines that library to brand marks in `SocialIcons.tsx`)
- [X] T014 [US2] Update `tests/unit/components/StoryProgressNav.test.tsx` — assert the bar is rounded and inset from the viewport edges, the section list is a horizontally scrollable region, the control cluster is outside that region, the progress element survives, and all seven `STORY_SECTIONS` still render

### Implementation for User Story 2

- [X] T015 [P] [US2] Create `components/Navigation/EmailLink.tsx` with an inline `<svg>` envelope, `aria-hidden` on the glyph, `aria-label` on the anchor, and a focus-visible ring matching the sibling controls
- [X] T016 [US2] Rework `components/Navigation/StoryProgressNav.tsx` — `sticky` with horizontal inset and `rounded-full overflow-hidden`, progress hairline moved inside the pill along its bottom edge (keeping the existing reduced-motion branch untouched), `mask-r-from-85% mask-r-to-100%` on the scrolling section list, `scroll-px-*` so a focused link lands clear of the fade (research.md R4, R5, FR-016c), and `EmailLink` mounted in the `shrink-0` cluster (depends on T015)

**Checkpoint**: The bar floats, scrolls internally at 375px, and carries the envelope. US1 and US2 are both independently demoable.

---

## Phase 5: User Story 3 — The calls to action read as one pair (Priority: P2)

**Goal**: Make the two buttons share one box model and one icon convention.

**Independent Test**: Measure both buttons at desktop and mobile widths; top edge, bottom edge, height and icon placement all match.

**Depends on**: nothing beyond Phase 1. Fully independent.

### Tests for User Story 3

- [X] T017 [P] [US3] Create `tests/unit/components/ValueProp.test.tsx` — both links carry a leading icon, both resolve to the same border-box height by carrying an equal-width border (the primary's being transparent), and the primary retains its trailing arrow

### Implementation for User Story 3

- [X] T018 [US3] Fix `components/Hero/ValueProp.tsx` — add `border-2 border-transparent` to the primary so both buttons compute to the same height (they currently differ by 4px: 60px vs 64px, per research.md R3), and give the primary a leading icon so both icons sit in the same position. **Keep the primary's trailing arrow** — it is a deliberate hierarchy signal matching the reference image, not a fourth inconsistency

**Checkpoint**: Buttons align stacked and side by side. Note that jsdom does not lay out, so T017 asserts the *mechanism*; SC-003's 0px tolerance is verified in a browser during Phase 8.

---

## Phase 6: User Story 4 — The email address is reachable (Priority: P2)

**Goal**: Surface the stored address in the Contact chapter, and prove it comes from one place.

**Independent Test**: Activate the nav envelope; read the Contact chapter. Change the address in `social.json` and confirm both update with no other edit.

**Depends on**: Phase 2. The nav half of this story ships in US2; this phase completes the chapter and the single-source guarantee.

### Tests for User Story 4

- [X] T019 [P] [US4] Create `tests/unit/components/ContactSection.test.tsx` — the address renders as visible activatable text, "coming soon" is gone, and the component returns a safe empty state rather than throwing when `social` content is unavailable
- [X] T020 [P] [US4] Extend `tests/unit/components/Footer.test.tsx` with a regression assertion that the email does **not** appear in the footer (FR-022a) — the sibling-field design is what prevents it, and this test is what stops someone "simplifying" it into the `social` array later

### Implementation for User Story 4

- [X] T021 [US4] Update `components/Contact/ContactSection.tsx` to read `useContent().social` and render the address as a `mailto:` link with the plain address as its visible text, replacing the "Contact content coming soon." placeholder

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Remove the player card (Cross-Cutting Cleanup)

**Purpose**: FR-007 and SC-009 — delete what nothing renders any more.

**⚠️ Must run after Phase 3.** Deleting the card before its replacement renders leaves the tree broken mid-sequence. Within this phase, schema precedes JSON (see the ordering note at the top).

- [X] T022 [P] Delete `components/Hero/PlayerCard.tsx`
- [X] T023 [P] Delete `components/Hero/SkillBars.tsx`, `components/Hero/StarRating.tsx`, `components/Hero/AwsBadge.tsx` and `components/Hero/Flags.tsx` — verified by grep to have no importer other than `PlayerCard`
- [X] T024 [P] Delete `components/Common/ProfilePicturePlaceholder.tsx` — its only consumer was the card, and the spec's fallback is a text-only opening rather than a placeholder graphic
- [X] T025 Trim `components/Hero/palette.ts` — remove `CARD_INK`, `SUNGLOW` and `SUNGLOW_TEXT`; **keep** `INK`, `EMBER`, `TEAL` and `CREAM` (still driving the role highlights in `Hero.tsx`) and `WARM_INK` (still documenting the literal used in class strings)
- [X] T026 Update the doc comment in `components/Hero/CvLink.tsx` that describes the link's voice by reference to the card's scouting line, so it no longer points at a deleted component
- [X] T027 Remove `PlayerCardSchema`, `PlayerStatSchema`, `SoftSkillSchema` and the `card` field from `HomeSchema` in `lib/utils/validation.ts`
- [X] T028 Remove the `PlayerCard`, `PlayerStat` and `SoftSkill` interfaces and the `card` field from `Home` in `lib/types/portfolio.ts`
- [X] T029 Remove the `"card": { … }` object from `public/data/home.json` (after T027 — see the ordering note)
- [X] T030 Update `tests/integration/content-sources.test.ts` for the reduced `home.json` shape
- [X] T031 Run `npm run type-check` and `npx jest`; confirm no dangling imports and a test count **above** the 99 baseline

**Checkpoint**: `grep -rn "PlayerCard\|SkillBars\|StarRating\|AwsBadge" components app lib tests` returns nothing.

---

## Phase 8: Governance & Validation

**Purpose**: FR-025, plus the checks no automated suite can perform. None of this is optional and none of it is caught by CI.

### Governance (FR-025 — all four in this PR)

- [X] T032 [P] Write `docs/adr/0018-the-opening-leaves-the-player-card.md`, stating what it supersedes, the alternatives rejected (restyling the card; keeping it on mobile only), and the constraints in force
- [X] T033 Add a dated supersession note to the top of `docs/adr/0013-hero-player-card.md` naming ADR 0018 — **leave its original text unaltered**; Principle VI forbids rewriting an accepted record
- [X] T034 Update `docs/adr/README.md` — revise 0013's status and add the 0018 row
- [X] T035 Amend Principle IV in `.specify/memory/constitution.md` to remove the hero player card from the fixed stack, bump 1.2.0 → 1.3.0, and add a sync impact report at the top in the existing format

### Manual validation (quickstart.md §3–4)

- [X] T036 [P] Verify the blend by eye per `quickstart.md` §3a at 375, 768, 1024, 1440 and 2560px in **both** themes — no grey studio background, no light halo on the hair against dark, lower edge dissolves with no crop line (FR-004, FR-004a, FR-004b; not machine-testable). If a halo appears, check `imageSource` in `public/data/home.json` first — it is far more likely to be the wrong asset than a CSS fault
- [X] T037 [P] Verify button geometry in a browser using the DevTools snippet in quickstart.md §3b; both height and top deltas must be `0` at ≥640px **and** below 640px (SC-003)
- [X] T038 [P] Tab through every section link at 375px; each focused link must scroll into view with its focus ring fully visible and not under the edge fade (FR-016c — the identified risk in research.md R5)
- [X] T039 [P] Enable reduced motion per `quickstart.md` §3d and confirm the portrait does not drift, the progress bar tracks without spring overshoot, and the layout is identical to the un-reduced case — drift is transform-only in `components/Hero/HeroParallax.tsx`, so switching it off must shift nothing
- [X] T040 [P] Measure contrast with a checker per `quickstart.md` §3e, not by eye: tagline and body copy over the photograph, nav labels and glyphs against the pill fill, both button labels against their fills, in both themes. Body copy over the backdrop must use the `text-on-photo` token from `app/globals.css` — `gray-600`/`gray-700` fail AA against it (SC-006, ADR 0015)
- [X] T041 Run `npm run build && npm start`, then Lighthouse on mobile preset: performance ≥ 90, and **record which element is LCP**. The portrait deliberately has no `preload` while the backdrop does; if the portrait turns out to be the LCP element, note it and revisit that decision rather than leaving it standing on a disproved assumption (SC-008, research.md R8)

**Checkpoint**: every box in quickstart.md ticked.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies
- **Phase 2 (Foundational)**: after Phase 1 — blocks US2 and US4 only
- **Phase 3 (US1)**: after Phase 1. Does **not** need Phase 2
- **Phase 4 (US2)**: after Phase 2
- **Phase 5 (US3)**: after Phase 1 — fully independent
- **Phase 6 (US4)**: after Phase 2
- **Phase 7 (Cleanup)**: after Phase 3 — hard constraint, not a preference
- **Phase 8 (Governance & Validation)**: after all implementation

### User Story Dependencies

- **US1 (P1)**: independent. Only needs Setup
- **US2 (P1)**: needs Foundational for the email field. Independent of US1
- **US3 (P2)**: fully independent — touches one file nothing else touches
- **US4 (P2)**: needs Foundational. Shares `EmailLink` with US2, which is built in US2's phase so that story stays demoable on its own

### Parallel Opportunities

- T003 and T004 (different files)
- T007 and T009 and T010 (test, content, new component — all different files)
- T013 and T015 (test and component)
- T019 and T020 (different test files)
- T022, T023, T024 (independent deletions)
- T032 and T036–T040 (documentation and manual checks are mutually independent)
- **Across stories**: with more than one person, US1, US3 and (after Phase 2) US2 can run concurrently — they share no files

### Sequential by necessity

- T005 after T003 — required field, schema and content cannot diverge
- T011 after T010 — Hero imports HeroPortrait
- T016 after T015 — nav mounts EmailLink
- T029 after T027 — schema before JSON
- Phase 7 after Phase 3 — renderer before deletion

---

## Parallel Example: User Story 1

```bash
# Independent files, can run together:
Task: "Create tests/unit/components/HeroPortrait.test.tsx"
Task: "Update public/data/home.json — restore 'secure', repoint imageSource"
Task: "Create components/Hero/HeroPortrait.tsx"

# Then sequentially:
Task: "Update components/Hero/Hero.tsx to render HeroPortrait at drift 28"
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Phase 1 Setup
2. Phase 3 US1 — skip Phase 2, which US1 does not need
3. **Stop and validate**: the opening leads with the portrait, no card visible
4. Demoable. The card's files still exist but render nothing

This is the smallest increment that addresses the actual complaint.

### Incremental delivery

1. Setup → US1 → **MVP demo**
2. Foundational → US2 → floating nav demo
3. US3 → aligned buttons
4. US4 → email reachable
5. Phase 7 → cleanup
6. Phase 8 → governance and validation

### Mapping to the plan's commit sequence

plan.md defines 8 commits; the phases map as: Phase 2 → commit 1; Phase 4 → commit 2; Phase 6 → commit 3; Phase 5 → commit 4; Phase 3 → commit 5; Phase 7 → commits 6 and 7; Phase 8 → commit 8. Phases are ordered for *independent testability*, commits for *a tree that always builds*; where they differ, the commit order wins.

---

## Notes

- 41 tasks: 2 setup, 4 foundational, 6 US1, 4 US2, 2 US3, 3 US4, 10 cleanup, 10 governance/validation
- Tests are mandatory here (Constitution Principle II), not the template's optional default
- Three spec criteria (FR-004, FR-004a, FR-004b) have no possible automated test — T036 exists so they are checked rather than assumed
- The suite must finish **above** 99 tests; a lower count means coverage was deleted with the card rather than replaced
- Commit after each task or logical group, in the constitution's `<type>(<scope>): <what> — <why>` format

---

## Implementation notes

Recorded because three things the plan asserted turned out to be wrong, and the
record is worth more than the tidy version.

### Found during implementation, not planned for

- **The card carried the page's only `<h1>`.** `PlayerCard.tsx:167` was the sole
  heading in the document and the only place the owner's name appeared in the
  opening. Deleting the card as specified would have left the page with no
  heading at all and no name above the fold, quietly failing SC-001. The heading
  moved into the opening's text column (T011).

- **The portrait's right edge was also clipped.** research.md R2 claimed the
  bottom was "the only hard edge left". Measured mean alpha per edge on the
  asset: bottom 0.445, **right 0.183**, left 0.000. The bounding box said so all
  along — `929 + 94 = 1023`, the full frame width — and it was not read
  carefully enough. A second mask was added.

- **The portrait is the LCP element, not the backdrop.** R8 withheld `preload`
  on that assumption. Measured over four runs each, cache disabled: with
  preload 196/208/208/196ms, without 212–216ms, `main` baseline 348ms. Ranges do
  not overlap, so `preload` was added and R8 corrected in place.

- **Chrome does not scroll a partially visible focused child into view.** R5
  predicted the mask could obscure a focus ring and proposed `scroll-px`. Real
  Tab traversal at 375px showed worse: "Career Journey" sat 89px outside the
  scroller and `scrollLeft` never moved at all. Fixed with an explicit
  `scrollIntoView({ inline: 'center' })` on focus, plus `focus-within:mask-none`
  so the fade can never cover a ring.

### Corrected mid-implementation

- A claim that `max-w-full` was needed to stop the portrait overflowing at
  375px. Measurement disproved it — next/image emits the intrinsic aspect ratio,
  so the height cap already scales width (200px against a 300px cap). The class
  and the test asserting it were removed rather than left standing on a false
  rationale.

### Coverage lost, with no replacement possible

- A test asserting that the years claimed in `bio` matched `card.yearsExperience`
  is gone. It existed because the retired About copy once said "10+ years" while
  the card said 9. With the card removed the biography is the only place a year
  count appears, so there is nothing left to compare it against.

### Pre-existing, out of scope, still true

- The page has horizontal overflow at 375px: `document.scrollWidth` 673 against
  a 375 viewport. The source is the **Education chapter**, where a `div.text-4xl`
  renders the raw string `images/education/essex.png` as text — an icon path
  reaching the DOM as content. `git diff main...HEAD` touches no Education or
  Skills file, so this predates the feature. The opening and the navigation are
  both clean: hero section 375px, nav pill inset 12px each side.

### Verified by measurement rather than by eye

| Check | Result |
|---|---|
| SC-003 buttons, 1440px | height delta **0**, top delta **0**, both 64px |
| SC-003 buttons, 375px | height delta **0**, widths equal at 343px |
| FR-016c keyboard | all 7 links fully in view, 0px hidden, mask dropped |
| SC-006 contrast | 7/7 pass AA; lowest 9.59 |
| FR-006a reduced motion | `transform: none`, portrait moves exactly with scroll |
| SC-008 LCP | **348ms → ~202ms** against `main` |
