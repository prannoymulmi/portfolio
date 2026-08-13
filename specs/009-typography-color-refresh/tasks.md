# Tasks: Typography & Color Refresh

**Input**: Design documents from `/specs/009-typography-color-refresh/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested for this feature (spec doesn't ask for TDD; contrast can't be asserted
in jsdom per ADR 0015, so verification is the manual `quickstart.md` sweep plus the existing
component test suite staying green as a behavior-parity gate).

**Organization**: Tasks are grouped by user story (spec.md: US1 = P1, US2 = P2, US3 = P3) so each
can be delivered and checked independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1/US2/US3)
- File paths are exact and repo-relative

---

## Phase 1: Setup

- [X] T001 Run `npm run type-check && npm run lint && npm test` on this branch to confirm a
      clean baseline before any token/class changes begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The token system and font loaders every chapter's restyle depends on. No user
story task can start until this phase is complete.

- [X] T002 Rewrite the light-theme token block in `app/globals.css`: replace `--background`,
      `--foreground`, `--primary`, `--accent`, `--border` with the new oklch values; add
      `--primary-foreground`, `--muted-foreground`, `--card`, `--ink-deep`; register all of them
      in the `@theme inline` block (`--color-primary-foreground`, `--color-muted-foreground`,
      `--color-card`, `--color-ink-deep`, plus the existing `--color-background` /
      `--color-foreground` / `--color-primary` / `--color-accent` / `--color-border` mappings).
      Re-derive `--scrim`, `--panel`, `--panel-border`, and `--on-photo` from the new tokens,
      using `--card` for the scrim/panel tint and `--foreground` (never `--muted-foreground`) for
      `--on-photo`, per research R1 — keep the existing 42%/55% opacities unchanged. Leave the
      `.dark` block untouched (FR-007).
- [X] T003 [P] Add `next/font/google` loaders for `Space_Grotesk` (weights
      `["400","500","600","700"]`) and `JetBrains_Mono` (weights `["400","500"]`), both subset
      `latin`, in `app/layout.tsx`, replacing the `Geist`/`Geist_Mono` loaders. Name the exposed
      variables `--font-display` and `--font-mono-ui`, and update the `<html>` `className` string
      that currently applies `geistSans.variable`/`geistMono.variable` to apply the new
      variables instead.
- [X] T004 In `app/globals.css`, register `--font-display` and `--font-mono-ui` in the
      `@theme inline` block (replacing the `--font-sans`/`--font-mono` → Geist mapping) with
      system-font fallback stacks (`ui-sans-serif, system-ui, sans-serif` / `ui-monospace,
      monospace`), and add a `label-mono` `@utility` — matching the existing `chapter-panel`/
      `chapter-scrim`/`text-on-photo` pattern — that applies `font-mono-ui` with a consistent
      uppercase/tracking treatment for reuse across every label/eyebrow/tag. Depends on T002
      (same file) and T003 (variables must exist first).

**Checkpoint**: Token system and fonts are live. Every chapter task below can now proceed.

---

## Phase 3: User Story 1 - A cohesive, intentional visual identity site-wide (Priority: P1) 🎯 MVP

**Goal**: Every chapter and every piece of site chrome renders in the new typefaces and colors
instead of the old default typeface and gray/blue palette (spec FR-001–004, FR-009; SC-001).

**Independent Test**: Load the page and scroll from Hero to Contact; every chapter's headings,
body copy, and accents use the new typefaces and colors, with none left on the old system.

### Implementation for User Story 1

- [ ] T005 [P] [US1] `app/layout.tsx`: change the body's light-mode classes `bg-white
      text-gray-900` to `bg-background text-foreground` (leave `dark:bg-gray-900
      dark:text-gray-100` unchanged, FR-007); change the skip-link's `bg-blue-600`/
      `ring-blue-500` to `bg-primary`/`ring-primary`.
- [ ] T006 [P] [US1] `app/not-found.tsx`: replace `text-gray-900`, `text-gray-600`, and
      `bg-blue-600`/`hover:bg-blue-700`/`ring-blue-500` (light-mode classes only) with
      `text-foreground`, `text-muted-foreground`, and `bg-primary`/`hover:bg-primary`/
      `ring-primary`.
- [ ] T007 [P] [US1] `components/Navigation/Footer.tsx`: replace `border-gray-200`,
      `text-gray-900`, `text-gray-600`, `text-gray-700`, and `hover:text-blue-600` (light-mode
      classes only) with `border-border`, `text-foreground`, `text-muted-foreground`, and
      `hover:text-primary`.
- [ ] T008 [P] [US1] `components/Navigation/StoryProgressNav.tsx`: replace the hard-coded
      `text-[#111c38]` and `ring-blue-500` with `text-foreground` and `ring-primary`; apply the
      `label-mono` utility (T004) to the chapter-name labels.
- [ ] T009 [P] [US1] `components/Navigation/SocialIcons.tsx`: replace the hard-coded
      `text-[#111c38]` and `hover:text-blue-600`/`ring-blue-500` with `text-foreground` and
      `hover:text-primary`/`ring-primary`.
- [ ] T010 [P] [US1] `components/Navigation/EmailLink.tsx`: replace the hard-coded
      `text-[#111c38]` and `hover:text-blue-600`/`ring-blue-500` with `text-foreground` and
      `hover:text-primary`/`ring-primary`.
- [ ] T011 [P] [US1] `components/Common/ThemeToggle.tsx`: replace `bg-gray-200`,
      `text-gray-900`, `hover:bg-gray-300`, and `ring-blue-500` (light-mode classes only) with
      `bg-card`, `text-foreground`, a `foreground`-derived hover tint, and `ring-primary`.
- [ ] T012 [P] [US1] `components/Common/ErrorBoundary.tsx`: replace `bg-white`, `text-gray-900`,
      `text-gray-600`, and `bg-blue-600`/`hover:bg-blue-700`/`ring-blue-500` (light-mode classes
      only) with `bg-background`, `text-foreground`, `text-muted-foreground`, and
      `bg-primary`/`hover:bg-primary`/`ring-primary`.
- [ ] T013 [P] [US1] `components/Common/LoadingState.tsx`: replace the light-mode shimmer
      gradient stops (`from-gray-200 via-gray-100 to-gray-200`) with tones derived from
      `--background`/`--card` so the skeleton matches the new cream palette (leave the `dark:`
      stops unchanged).
- [ ] T014 [P] [US1] `components/Hero/Hero.tsx`: replace the light-mode gradient stops
      (`from-white/55 via-white/25`) with equivalent stops derived from `--background`, and apply
      `font-display` to the headline.
- [ ] T015 [P] [US1] `components/Hero/ValueProp.tsx`: replace the hard-coded `#3d2318` (CTA
      border and text) with `foreground`; apply `font-display` to the headline and `label-mono`
      (T004) to the mono accent label; keep the stats row on `font-mono-ui` for figures.
- [ ] T016 [P] [US1] `components/Hero/CvLink.tsx`: replace `font-sans` with `font-display` (or
      `font-mono-ui` if the element is label-styled — check current markup); update its contrast
      comment to reference the new `foreground`/photo-contrast numbers from research R1 instead
      of `gray-600`/`gray-700`.
- [ ] T017 [P] [US1] `components/Career/CareerPitch.tsx`: replace `font-sans`/`font-mono` with
      `font-display`/`font-mono-ui`; replace the `hover:bg-white/60 dark:hover:bg-gray-700/60`
      light-mode hover fill with a `foreground`-derived tint; apply `label-mono` to player
      role/position labels.
- [ ] T018 [P] [US1] `components/Career/TimelineView.tsx`: replace `font-sans`/`font-mono` with
      `font-display`/`font-mono-ui`.
- [ ] T019 [P] [US1] `components/Career/ChapterDetail.tsx`: replace `font-sans`/`font-mono` with
      `font-display`/`font-mono-ui`; apply `label-mono` to the Company/Role/Years/Technologies/
      Achievements field labels.
- [ ] T020 [P] [US1] `components/EngineeringPrinciple/PrincipleBand.tsx`: replace
      `font-sans`/`font-mono` with `font-display`/`font-mono-ui`.
- [ ] T021 [P] [US1] `components/Work/ThreeSystems.tsx` and `components/Work/SystemCard.tsx`:
      replace `font-sans`/`font-mono` with `font-display`/`font-mono-ui`; apply `label-mono` to
      the year/role/metric badge labels.
- [ ] T022 [P] [US1] `components/Projects/ProjectCard.tsx`: replace `font-sans`/`font-mono` with
      `font-display`/`font-mono-ui`; apply `label-mono` to tag/year labels.
- [ ] T023 [P] [US1] `components/Education/EducationSection.tsx`: apply `font-display` to
      headings/body and `label-mono` to date/institution labels, per FR-002.
- [ ] T024 [P] [US1] `components/Playbook/PlaybookGrid.tsx` and
      `components/Playbook/PrincipleCategory.tsx`: replace the `hover:bg-white/25
      dark:hover:bg-gray-700/25` light-mode hover fill with a `foreground`-derived tint; apply
      `font-display`/`label-mono` typography to headings and pillar labels.
- [ ] T025 [P] [US1] `components/Contact/ContactSection.tsx`: replace `text-gray-900` with
      `text-foreground`; apply `font-display` to the centered heading and `label-mono` to any
      eyebrow label; confirm the email/GitHub/LinkedIn buttons resolve to `bg-primary`/
      `text-primary`.

**Checkpoint**: User Story 1 is fully functional — every chapter and all site chrome present the
new typefaces and colors. This is the shippable MVP.

---

## Phase 4: User Story 2 - Labels and accents read as a distinct, consistent voice (Priority: P2)

**Goal**: The mono label treatment and the primary/accent hues are used identically in every
chapter, not as one-off variants (spec FR-002, FR-005; SC-004).

**Independent Test**: Inspect every label, tag, stat caption, and interactive element (buttons,
active states, highlighted metrics) across chapters; confirm they consistently use the mono face
and the primary/accent hues respectively, with no chapter using an ad hoc variant.

### Implementation for User Story 2

- [ ] T026 [US2] Sweep every uppercase label/eyebrow/tag across all 8 chapters and site nav
      (files touched in T005–T025) and confirm each uses the shared `label-mono` utility from
      T004 rather than a locally-styled mono/uppercase combination; fix any outlier found.
- [ ] T027 [US2] Sweep every primary CTA, active/hover state, and highlighted metric/badge across
      all 8 chapters and confirm each resolves to `primary` or `accent` (not a leftover
      `blue-*`, `gray-*`, or component-local hex value); normalize any outlier found.

**Checkpoint**: User Stories 1 and 2 both work independently — the site is cohesive and its
label/accent language is consistent everywhere.

---

## Phase 5: User Story 3 - Text stays legible on every surface it sits on (Priority: P3)

**Goal**: Body and label text clears WCAG AA on every surface it can appear on — the bare
background, the card/panel over the photo, the bare photo, and solid primary/accent fills (spec
FR-006; SC-002), applying research R1's corrected token pairings everywhere they're needed.

**Independent Test**: Check contrast of body and label text against each of the site's surfaces
(bare background, card/panel, photo + scrim, primary/accent fills) and confirm each meets WCAG
AA.

### Implementation for User Story 3

- [ ] T028 [US3] Grep all touched components for `primary-foreground`/`text-primary-foreground`
      used as text color on a `bg-primary`/`bg-accent` fill (buttons, badges, highlighted
      metrics) and replace with `foreground`, per research R1's measured 3.26:1 / 2.01:1
      failures.
- [ ] T029 [US3] Grep all touched components for `muted-foreground`/`text-muted-foreground` used
      on the bare photo/scrim (i.e. outside `bg-background` or an opaque card) and replace with
      `foreground`, per research R1's measured 2.01:1 / 3.70:1 failures.
- [ ] T030 [US3] Run the manual contrast sweep in `specs/009-typography-color-refresh/
      quickstart.md` (section 4: bare background, card/panel over photo, bare photo, primary
      fill, accent fill) and fix any row that measures below 4.5:1.

**Checkpoint**: All three user stories are independently functional — the site is cohesive,
consistent, and legible everywhere.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T031 [P] Run `npm run type-check && npm run lint && npm test`; fix any failure caused by
      the class/token renames (existing component tests must stay green per FR-010/SC-005).
- [ ] T032 [P] DevTools Performance/Network sweep per `quickstart.md` section 5: confirm Space
      Grotesk/JetBrains Mono are self-hosted (not `fonts.gstatic.com`), no flash of invisible
      text, no visible layout shift on font swap.
- [ ] T033 `npm run build && npm start`, run Lighthouse against the production build: Performance
      ≥ 90 (constitution floor).
- [ ] T034 Visit `/?experiment=true`, toggle the theme control, confirm the experimental dark
      theme still functions unmodified (FR-007).
- [ ] T035 Run through `quickstart.md` sections 1–6 in full; confirm every acceptance scenario in
      `spec.md` passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks every user story** — the token system
  (T002, T004) and font loaders (T003) are what every chapter task edits into.
- **User Story 1 (Phase 3)**: Depends on Foundational only. Delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; in practice audits/fixes the files US1
  touched, so do it after Phase 3 even though it introduces no new files.
- **User Story 3 (Phase 5)**: Depends on Foundational; likewise audits/fixes US1's output for the
  specific contrast failures research R1 identified — sequence after Phase 3.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- Phase 2: T002 and T003 are independent ([P]); T004 depends on both (same file as T002, needs
  T003's variables).
- Phase 3: T005–T025 are all independent files, all [P] — can be split across contributors or
  done in one sweep.
- Phase 4/5: sequential — each task is a whole-codebase sweep, not a single file.

### Parallel Opportunities

- T002 and T003 (Phase 2).
- All of T005–T025 (Phase 3) — 21 independent files.
- T031 and T032 (Phase 6) — independent checks.

---

## Parallel Example: User Story 1

```bash
# After Phase 2 (Foundational) completes, launch the chapter/chrome files together:
Task: "app/layout.tsx: swap body + skip-link classes to background/foreground/primary"
Task: "app/not-found.tsx: swap gray/blue classes to foreground/muted-foreground/primary"
Task: "components/Navigation/Footer.tsx: swap gray/blue classes to border/foreground/primary"
Task: "components/Hero/ValueProp.tsx: swap #3d2318 to foreground, apply font-display/label-mono"
# ...and so on for T008-T025, each touching a distinct file.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (token system + fonts) — **blocks everything else**.
3. Complete Phase 3: User Story 1 — every chapter now shows the new type/color system.
4. **STOP and VALIDATE**: run `quickstart.md` sections 1–2 independently.
5. This is a shippable MVP: the visual identity is cohesive even before the consistency (US2)
   and contrast-correction (US3) passes run.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. User Story 1 → validate → this is the MVP visual restyle.
3. User Story 2 → validate → label/accent consistency confirmed.
4. User Story 3 → validate → contrast corrections applied and swept.
5. Polish → full quickstart run, Lighthouse, dark-theme regression check.

---

## Notes

- [P] tasks touch different files with no dependency on an incomplete task.
- US2 and US3 are sweeps over the same files US1 touched, not new files — sequence them after
  Phase 3 even though they're logically independent stories.
- `.dark` token values are never touched by any task (FR-007) — every task above scopes its
  class replacements to light-mode classes only, explicitly leaving `dark:` classes as they are.
- The four existing gradient-overlay assets and `ChapterGradientOverlay` usage are out of scope
  (data-model.md) — no task touches them.
- Commit after each task or logical group, per the constitution's atomic-commit principle
  (Principle III) — most Phase 3 tasks are naturally one commit each (one file, one concern).
