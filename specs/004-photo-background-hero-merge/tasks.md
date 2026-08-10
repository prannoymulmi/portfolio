---

description: "Task list for 004-photo-background-hero-merge"
---

# Tasks: One photo backdrop, a shorter opening, social links in the nav

**Input**: Design documents from `/specs/004-photo-background-hero-merge/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Included and **mandatory**. Constitution Principle II is NON-NEGOTIABLE — tests
are written before or alongside every feature, and no feature is complete without them.

**Organization**: Grouped by user story so each ships independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Exact file paths in every description

## Path Conventions

Single Next.js app at repository root: `app/`, `components/`, `lib/`, `public/`, `tests/`.

---

## Phase 1: Setup

**Purpose**: A known-good starting point, so later failures are attributable.

- [X] T001 Create branch `feat/photo-background-hero-merge` off `main` per the constitution's Development Workflow
- [X] T002 Record the baseline: run `npm run type-check`, `npm run lint`, and `npm test`, and note the current passing count so regressions are visible

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The one piece of shared styling both US1's chapters and US3's hero biography
depend on.

**⚠️ CRITICAL**: T003 blocks US1 and US3.

- [X] T003 Define the shared chapter scrim in `app/globals.css` — white at 35–45% in light, matching near-black in dark, expressed so `dark:` utilities drive it rather than a hand-written `.dark` selector (constitution: Technology & Quality Constraints)
- [X] T004 Define the on-photo body-text colour token in `app/globals.css` alongside the scrim, so chapters and the hero use one source rather than repeating `text-gray-900`

**Checkpoint**: Scrim and text token exist; US1 and US3 can proceed.

---

## Phase 3: User Story 1 - The whole story sits on one backdrop (Priority: P1) 🎯 MVP

**Goal**: The sunset photograph sits behind all seven chapters as one continuous, pinned
surface, with the depth cue moved to the foreground and every chapter still legible.

**Independent Test**: Load `/` and scroll top to bottom — the backdrop is continuous, the
horizon never moves, the player card and role bars drift, and text passes AA at the top,
middle and bottom of every chapter in both appearances.

### Tests for User Story 1 ⚠️ Write first, confirm they fail

- [X] T005 [P] [US1] Test that exactly one pinned backdrop layer renders, carries `priority` and `sizes="100vw"`, and changes opacity with the theme class, in `tests/unit/components/Backdrop.test.tsx`
- [X] T006 [P] [US1] Test that no section in the story carries an opaque background class, in `tests/integration/backdrop-coverage.test.tsx`
- [X] T007 [P] [US1] Test that foreground drift maps to zero displacement under `prefers-reduced-motion` and that disabling it changes no layout property, in `tests/unit/components/HeroParallax.test.tsx`

### Implementation for User Story 1

- [X] T008 [US1] Create `components/Common/Backdrop.tsx` — a `fixed inset-0 -z-10` layer rendering `/images/normal.jpg` through `next/image` with `fill`, `priority`, `sizes="100vw"`, full opacity in light and **18–22%** in dark (ceiling is ~41%, see [research.md](research.md) R1). Do **not** use `background-attachment: fixed` (R2)
- [X] T009 [US1] Replace the `background.svg` div in `app/layout.tsx` with `<Backdrop />`
- [X] T010 [P] [US1] Delete `public/images/background.svg` (557 KB, superseded — FR-006)
- [X] T011 [US1] Replace all seven `bg-gradient-to-br …` chapter backgrounds in `app/page.tsx` with the shared scrim from T003
- [X] T012 [US1] Darken body text to the T004 token in `components/Contact/ContactSection.tsx` — it has no card surface of its own, so its `text-gray-700` sits directly on the photograph and measures 3.37:1 (fails AA)
- [X] T013 [US1] Audit the remaining `text-gray-700` / `text-gray-600` call sites and darken **only** those rendering directly on the scrim. `SkillCard.tsx`, `MilestoneCard.tsx`, `ProjectCard.tsx`, `PrincipleCategory.tsx`, `EducationSection.tsx` and `TimelineView.tsx` draw their own `bg-white` / `bg-gray-800` surfaces and are exempt — changing them is wasted diff
- [X] T014 [US1] Rework `components/Hero/HeroParallax.tsx` — remove its private photo layer (now global) and apply the scroll-derived transform to the opening's foreground instead, keeping the existing `prefers-reduced-motion` branch and bounding travel so nothing overlaps the next chapter (FR-007c)
- [X] T015 [US1] Apply the drift to the player card and role bars in `components/Hero/Hero.tsx`
- [X] T016 [US1] Write `docs/adr/0015-photograph-as-page-surface.md` — the backdrop decision, the measured luminance floor, the dark-appearance opacity ceiling, and the move off CSS `background-image` onto the optimizer
- [X] T017 [US1] Add the ADR 0015 row to `docs/adr/README.md`
- [X] T018 [US1] Verify by hand per [quickstart.md](quickstart.md): sample contrast at top/middle/bottom of all seven chapters in both appearances, and confirm the network panel shows an optimized variant well under ~200 KB rather than the 1.73 MB original

**Checkpoint**: US1 ships alone. The story structure is untouched — About is still present.

---

## Phase 4: User Story 2 - Reaching LinkedIn and GitHub from anywhere (Priority: P2)

**Goal**: Small LinkedIn and GitHub icons in the persistent nav, reachable in one click
from any scroll position.

**⚠️ Governance gate**: T024–T026 are not follow-ups. The constitution requires the ADR and
the amendment in the same change as the dependency (FR-020, SC-010).

**Independent Test**: From the middle of any chapter, both icons are visible and open the
right profiles; keyboard focus announces each destination; at 320px neither icon nor the
theme toggle is displaced.

### Tests for User Story 2 ⚠️ Write first, confirm they fail

- [X] T019 [P] [US2] Test that both networks render from content with accessible names, open in a new tab with `rel="noopener noreferrer"`, that an unknown network falls back to a readable labelled link, and that missing content renders nothing rather than throwing, in `tests/unit/components/SocialIcons.test.tsx`
- [X] T020 [P] [US2] Extend `tests/unit/components/StoryProgressNav.test.tsx` to assert the nav still renders chapter links, progress bar and theme toggle when social content fails to load

### Implementation for User Story 2

- [X] T021 [US2] Install the icon set: `npm install @icons-pack/react-simple-icons --legacy-peer-deps` (13.13.0; the flag is needed for the pre-existing reason in ADR 0007, not for this package) — updates `package.json` and `package-lock.json`
- [X] T022 [US2] Create `components/Navigation/SocialIcons.tsx` — map `social.json` entries to `SiLinkedin` / `SiGithub` by case-insensitive network name, import per-icon so only used glyphs ship (FR-008b), with a labelled text fallback for unmatched networks
- [X] T023 [US2] Mount `<SocialIcons />` in `components/Navigation/StoryProgressNav.tsx`, in the `shrink-0` cluster beside the theme toggle so it cannot displace the scrolling chapter list at 320px (FR-010)
- [X] T024 [US2] Write `docs/adr/0014-icon-set-dependency.md` — records `@icons-pack/react-simple-icons`, and rejects `lucide-react` (carries no brand marks at all), `react-icons` (88 MB install and a `react: "*"` peer range for two glyphs), and hand-committed paths (offered and declined). Include the trademark note: the icon data is CC0 but the marks belong to LinkedIn and GitHub; linking to those profiles is nominative use
- [X] T025 [US2] Amend `.specify/memory/constitution.md` to **1.2.0** — add the icon set to Principle IV with its ADR reference, update the Sync Impact Report comment and the version footer
- [X] T026 [US2] Add the ADR 0014 row to `docs/adr/README.md`
- [X] T027 [US2] Verify by hand per [quickstart.md](quickstart.md): 320px layout, keyboard focus and announcement, the temporary unknown-network fallback, and the temporary missing-`social.json` case

**Checkpoint**: US1 and US2 both work. The social links now have a home outside About, so
US3 is unblocked.

---

## Phase 5: User Story 3 - One less chapter, a fuller opening (Priority: P3)

**Goal**: The About chapter is gone and its substance lives in the opening as a two-sentence
biography.

**⚠️ Hard dependency**: MUST NOT merge before US2 — About is the only place the social links
currently live.

**Independent Test**: The page has no About chapter, the nav lists seven entries that all
resolve, the opening carries a ≤2-sentence biography, and `/about` lands somewhere valid.

### Tests for User Story 3 ⚠️ Write first, confirm they fail

- [X] T028 [P] [US3] Test that `HomeSchema` accepts a valid `bio`, rejects one over 240 characters, rejects one under 40, and that `imageSource` stays optional, in `tests/unit/validation.test.ts`
- [X] T029 [P] [US3] Update the `/about` expectation from `/#about` to `/` in `tests/integration/legacy-redirects.test.ts`
- [X] T030 [P] [US3] Update `tests/integration/story-page.test.tsx` to expect seven sections with `about` absent
- [X] T031 [US3] Update `tests/unit/components/StoryProgressNav.test.tsx` to expect seven chapter entries with no "About" — **same file as T020**, so these two must not run in parallel

### Implementation for User Story 3

- [X] T032 [US3] Extend `HomeSchema` in `lib/utils/validation.ts` with `bio: z.string().min(40).max(240)` and `imageSource: z.string().optional()`, and delete `AboutSchema`
- [X] T033 [US3] Remove the `About` interface from `lib/types/portfolio.ts`
- [X] T034 [US3] Add `bio` to `public/data/home.json` — a ≤240-character, ≤2-sentence rewrite of the old about text that states **9 years**, not the "10+ years" the retired copy claimed (FR-015b). Carry `imageSource` across if ever set
- [X] T035 [US3] Delete `public/data/about.json`
- [X] T036 [US3] Remove the `about` loader and its context entry from `components/Common/ContentProvider.tsx` — must land with T035, or every visit 404s on a file that no longer exists
- [X] T037 [US3] Render `bio` beneath the intro line in `components/Hero/Hero.tsx`, using the T004 text token
- [X] T038 [US3] Read `imageSource` from home content instead of about content in `components/Hero/PlayerCard.tsx`, preserving the placeholder fallback when it is absent
- [X] T039 [US3] Remove the About `<section>` and its import from `app/page.tsx`
- [X] T040 [US3] Remove the `about` entry from `STORY_SECTIONS` in `components/Navigation/StoryProgressNav.tsx`
- [X] T041 [US3] Remove `AboutSkeleton` from `components/Common/LoadingState.tsx`
- [X] T042 [US3] Delete `components/About/` — both `AboutSection.tsx` and `SocialLinks.tsx`, the latter superseded by `SocialIcons.tsx`
- [X] T043 [US3] Delete `tests/unit/components/AboutSection.test.tsx`, `tests/unit/components/AboutSection.withPhoto.test.tsx` and `tests/unit/components/SocialLinks.test.tsx`, and remove the `AboutSection` case from `tests/integration/error-handling.test.tsx`
- [X] T044 [US3] Retarget the `/about` redirect from `/#about` to `/` in `next.config.ts` — the current target becomes a dead anchor that fails silently (FR-017)
- [X] T045 [US3] Write `docs/adr/0016-about-folds-into-the-opening.md` and add its index row to `docs/adr/README.md` — retiring a content file and its schema changes how content is stored, which Principle VI makes ADR-worthy

**Checkpoint**: All three stories complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T046 Run the full [quickstart.md](quickstart.md) end to end, including the deliberate 300-character `bio` failure to confirm validation is wired and loud
- [ ] T047 Run Lighthouse on a production build: performance ≥ 90, accessibility 100 (SC-007) — **RUN, NOT MET, NOT REGRESSED**. Branch scores 58/92 against main's 53/92; LCP improves 18.9s → 11.8s and page weight drops 3,093 KiB → 1,712 KiB. The ≥90 bar has never been met on this codebase: LCP is gated on client-side content loading (ADR 0003), and all four accessibility failures are pre-existing, in files this feature does not touch (MilestoneCard `text-gray-500`, ProjectCard `article role="button"`, SVGPitch `role="presentation"` with `aria-label`, TimelineToggle label mismatch). Left unchecked deliberately — see Notes
- [X] T048 Confirm the biography and the player card both say 9 years — nothing in validation catches a mismatch (SC-005a)
- [X] T049 Split the work into the seven commits in [plan.md](plan.md)'s Commit Plan, none exceeding five files (constitution Principle III)
- [X] T050 Final green: `npm run type-check`, `npm run lint`, `npm test`, `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup — blocks US1 and US3 (not US2)
- **US1 (Phase 3)**: after Phase 2
- **US2 (Phase 4)**: after Setup only — the icons touch no shared styling, so this can run alongside US1
- **US3 (Phase 5)**: after Phase 2 **and after US2 merges**
- **Polish (Phase 6)**: after all stories

### User Story Dependencies

- **US1 (P1)**: independent. Ships alone as the MVP.
- **US2 (P2)**: independent of US1. Carries the governance gate (T024–T026).
- **US3 (P3)**: **blocked by US2.** Removing About before the icons land strands both social
  links. This is the one ordering constraint in the feature.

### File Conflicts (do not parallelize)

- `components/Navigation/StoryProgressNav.tsx` — T023 (US2) and T040 (US3)
- `tests/unit/components/StoryProgressNav.test.tsx` — T020 (US2) and T031 (US3)
- `app/page.tsx` — T011 (US1) and T039 (US3)
- `components/Hero/Hero.tsx` — T015 (US1) and T037 (US3)
- `docs/adr/README.md` — T017, T026 and T045; each phase appends its own row

### Parallel Opportunities

- T005, T006, T007 — all three US1 tests, different files
- T010 alongside T008/T009 — deleting the SVG touches nothing else
- T019, T020 — both US2 tests
- T028, T029, T030 — three US3 tests in different files (T031 excluded, see conflicts)
- **US1 and US2 in parallel** with two people — disjoint files, no shared styling

---

## Parallel Example: User Story 1

```bash
# All three US1 tests together, before any implementation:
Task: "Backdrop renders one pinned layer in tests/unit/components/Backdrop.test.tsx"
Task: "No section carries an opaque background in tests/integration/backdrop-coverage.test.tsx"
Task: "Drift is zero under reduced motion in tests/unit/components/HeroParallax.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → Phase 2 Foundational → Phase 3 US1
2. **STOP and VALIDATE**: contrast sweep across all seven chapters, both appearances, plus
   the backdrop weight check
3. Deploy — the site looks redesigned with its structure untouched

### Incremental Delivery

1. Setup + Foundational
2. **US1** → validate → deploy (MVP: the visual change, on its own)
3. **US2** → validate → deploy (icons + the ADR and amendment that let them exist)
4. **US3** → validate → deploy (About folds in — only now safe)

### Parallel Team Strategy

US1 and US2 are genuinely disjoint and can run side by side. US3 cannot start until US2 has
merged, so a third person is better spent reviewing the contrast sweep than waiting.

---

## Notes

- **Deviation from plan.md, deliberate**: the plan folded the About retirement into ADR
  0015. This splits it into ADR 0016 (T045) because ADR 0015 merges with US1 and Principle
  VI forbids rewriting a merged ADR — US3 would have had to edit it. Two records, each
  landing with its own change.
- `app/data/` stays untouched. It is dead and drifted, but cleaning it up is separable work
  and does not belong in this feature.
- The old about text cannot be shortened in place: `AboutSchema.about` was `min(100)`, and
  the replacement field carries its own 40–240 bounds.
- Contrast is verified by hand, not in jsdom. T018 is a real task, not a formality — it is
  the acceptance gate for the whole P1 story.

## Outcome notes (2026-08-10)

- **T047 is the one task left unchecked.** SC-007 asks for Lighthouse ≥ 90 and
  accessibility 100. Measured: 58 and 92, against a `main` baseline of 53 and 92. The
  feature improves every metric it touches — LCP 18.9s → 11.8s, total weight 3,093 KiB →
  1,712 KiB — but does not reach a bar this codebase has never reached. Closing the gap
  means addressing client-side content loading and four pre-existing accessibility
  defects, none of which are in this feature's scope.
- **The plan's icon package could not be used.** `@icons-pack/react-simple-icons` has no
  LinkedIn mark; it was removed from Simple Icons after a legal request. Switched to
  `react-icons`, recorded in ADR 0014.
- **`npm run validate:json` is broken** and always has been — it points at
  `lib/scripts/validate-json.js`, which does not exist. Pre-existing, left alone.
