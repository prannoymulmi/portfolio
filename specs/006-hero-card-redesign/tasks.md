---
description: "Task list for the hero card rebuild"
---

# Tasks: Hero card, rebuilt to the collectible reference

**Input**: Design documents from `/specs/006-hero-card-redesign/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/content-schema.md](./contracts/content-schema.md),
[quickstart.md](./quickstart.md)

**Tests**: Included and not optional. Principle II of the constitution is NON-NEGOTIABLE —
*"Tests MUST be written before or alongside every feature."* Test tasks are ordered before
the implementation they cover.

**Organization**: Grouped by user story so each ships as an independent increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelisable — different file, no dependency on an incomplete task
- **[Story]**: the user story it serves (US1, US2, US3)

## Carried risks

Three things from planning that shape this list:

1. **The cut-out is blocked on an asset that does not exist** (research §5). Automated
   matting was spiked and fails structurally. T021 is a decision point, not a build task,
   and T022 is the fallback that keeps US1 shippable either way.
2. **Schema, types, content and components must land in one commit** (contract
   "Compatibility"). T005–T010 are a single unit of work — the build does not pass
   part-way through. This is the exemption Principle III already allows.
3. **The display font spends LCP budget** (research §6) against a Lighthouse floor of 90.
   T041 measures it; T042 is the documented retreat.

---

## Phase 1: Setup (shared infrastructure)

**Purpose**: the mechanisms every later phase draws on. Nothing here renders.

- [ ] T001 Add the light-edition card tokens to `app/globals.css` — declare
      `--card-ground`, `--card-edge`, `--card-ink`, `--card-accent`, `--card-foil`,
      `--card-foil-lite` under the existing `:root` block, and expose each through the
      existing `@theme inline` block as `--color-card-*`. Values from research §2. Add a
      comment naming research §2 as the source of the measured ratios, per the
      constitution's ADR-reference rule.
- [ ] T002 [P] Add one condensed display face at a single heavy weight to
      `app/layout.tsx` via `next/font/google` with `display: 'swap'` and the Latin
      subset, exposed as a CSS variable beside the existing Geist pair, and register it
      in the `@theme inline` block of `app/globals.css` as a font token.
- [ ] T003 [P] Create `components/Hero/CardIcons.tsx` exporting seven inline SVG glyph
      components — pin, calendar, trophy, shield, code, cloud, people — each accepting
      `className`, using `currentColor`, and carrying `aria-hidden="true"`.
- [ ] T004 [P] Add `tests/unit/card-contrast.test.ts` asserting the computed WCAG ratio
      of each token pair from research §2 — ink/ground and accent/ground clear 7:1 in
      both editions, foil/ground clears 3:1. This is the guard that stops a later colour
      tweak from silently dropping below AA.

**Checkpoint**: tokens resolve, the font loads, glyphs render in isolation.

---

## Phase 2: Foundational (blocking prerequisites)

**⚠️ CRITICAL**: no user story work can begin until this phase completes. T005–T010 land
as **one commit** — the build is broken at every point between them.

- [ ] T005 Write the contract tests in `tests/unit/validation.test.ts` for the reshaped
      card, all nine cases enumerated in [contracts/content-schema.md](./contracts/content-schema.md)
      §"Contract tests". These fail until T006 lands, which is the point.
- [ ] T006 Reshape `PlayerCardSchema` in `lib/utils/validation.ts` — add
      `positionAbbrev` (`/^[A-Z]{2,3}$/`), `location` (3–40), and `achievements` (3–5 of
      `AchievementSchema`); remove `rating`, `stats`, `softSkills`, `blurb`. Add
      `AchievementSchema` with `text` (10–80), `icon` (closed enum of the six values),
      and optional `emphasis`, plus a refinement rejecting more than one `emphasis: true`.
      Delete `PlayerStatSchema` and `SoftSkillSchema`.
- [ ] T007 Update `lib/types/portfolio.ts` to match — reshape `PlayerCard`, add
      `Achievement`, delete `PlayerStat` and `SoftSkill`. Keep the doc comments' habit of
      saying why a bound exists, not just what it is.
- [ ] T008 Update `public/data/home.json` to the new card shape using the mock's own five
      achievement lines as the starting content, per the contract's worked example.
      Remove `rating`, `stats`, `softSkills`, `blurb` entirely — leaving them fails the
      load, by design.
- [ ] T009 [P] Delete `components/Hero/SkillBars.tsx` and `components/Hero/StarRating.tsx`.
- [ ] T010 [P] Delete `components/Hero/AwsBadge.tsx` — the AWS certification becomes an
      achievement row carrying `icon: "cert"`.

**Checkpoint**: `npm run type-check` and `npm test` pass; the site renders with a card
that is temporarily broken-looking but structurally sound. Do not stop here in a commit.

---

## Phase 3: User Story 1 — The opening reads as a collectible card (P1) 🎯 MVP

**Goal**: the full reference anatomy in light mode.

**Independent test**: load `/` at 1280px in light mode beside `card.png` and account for
all eleven anatomy elements (SC-001).

### Tests first

- [ ] T011 [P] [US1] Create `tests/unit/components/PlayerCard.test.tsx` asserting each of
      the eleven anatomy elements renders — shield frame, figure block, position
      abbreviation, job title, location row, country row, years row, portrait, name,
      five achievement rows, crest.
- [ ] T012 [P] [US1] Add assertions to the same file that the retired elements are
      **absent** — no star rating, no soft-skill bars, no stat pills, no blurb — so they
      cannot creep back in a later edit.
- [ ] T013 [P] [US1] Add an assertion that exactly one achievement row carries the accent
      treatment (FR-009), and that it is the row content marks with `emphasis`.

### Frame and ground

- [ ] T014 [US1] Create `components/Hero/CardFrame.tsx` — the shield outline as a
      rounded rectangle plus a separate crown element at top centre (research §3: **do
      not** clip with an `objectBoundingBox` SVG path, it distorts when the card
      stretches), the two-part foil border, and the ivory-to-sand ground grade.
- [ ] T015 [P] [US1] Add the paper texture and the pitch-diagram line art to
      `CardFrame.tsx` as inline SVG — a `<pattern>` of dots and a small line-art group —
      both at low opacity, both `aria-hidden`, neither legible enough to compete with
      content (FR-003).

### Card regions

- [ ] T016 [P] [US1] Create `components/Hero/FigureBlock.tsx` — the career total as a
      display-size numeral over a `YRS` label with a rule beneath. It prints
      `yearsExperience`; it must never print a composite score (FR-004a).
- [ ] T017 [P] [US1] Create `components/Hero/MetaColumn.tsx` — three icon-and-fact rows
      for location, country and years, reusing the existing `Flags.tsx` for the country
      row and `CardIcons.tsx` for the other two.
- [ ] T018 [P] [US1] Create `components/Hero/HonoursList.tsx` — the achievement rows,
      each an icon tile beside one-to-two lines of text, separated by hairline rules,
      with the `emphasis` row carried in the accent colour. Rows grow to fit longer text
      rather than overlapping (US3 scenario 3).
- [ ] T019 [P] [US1] Create `components/Hero/CardCrest.tsx` — the foot crest as inline
      SVG, centred, `aria-hidden`.
- [ ] T020 [US1] Rewrite `components/Hero/PlayerCard.tsx` to compose the regions above in
      the reference's arrangement: figure block and position over the meta column on the
      left, portrait bleeding at the right, name across the full width, honours list
      beneath, crest at the foot.

### Portrait

- [ ] T021 [US1] **Decision point — read research §5 first.** Obtain a
      background-removed portrait and commit it as `public/images/hero_pic_cutout.png`,
      then point `imageSource` at it. macOS Finder → Quick Actions → Remove Background
      produces this in two clicks. Automated matting was spiked and cannot meet FR-007a's
      bar, so this task cannot be completed by tuning a threshold.
- [ ] T022 [US1] If T021 is not satisfied, implement FR-007a's fallback in
      `PlayerCard.tsx`: the portrait renders framed inside the card rather than as a
      bleeding cut-out, and SC-008 is recorded as deferred. **US1 ships either way** —
      do not block the story, and do not ship a poor matte to close the criterion.

### Responsive

- [ ] T023 [US1] Make the card's height content-driven with fluid type that floors at
      14px (FR-020a), so the card stretches taller than the mock's proportion on narrow
      screens instead of shrinking its text.
- [ ] T024 [US1] Widen the card's column by one step in `components/Hero/Hero.tsx` while
      keeping the opening a two-column grid (FR-021a). Do not introduce an `order-*`
      utility — feature 005's source order must survive.
- [ ] T025 [P] [US1] Add a responsive test asserting no text on the card computes below
      14px and the anatomy stays complete at 320px.

**Checkpoint**: US1 is independently shippable. The card is complete in light mode; dark
mode still shows light values, which US2 fixes.

---

## Phase 4: User Story 2 — Dark mode is a parallel edition (P2)

**Goal**: the black-parallel edition. Because colour resolves through custom properties,
this phase is mostly values rather than markup — if it turns into markup, T001 was done
wrong.

**Independent test**: toggle the theme; no element holds a light-mode value, all text
still clears AA (SC-004, SC-002).

- [ ] T026 [P] [US2] Add a test to `PlayerCard.test.tsx` asserting the card renders no
      hardcoded colour literals — every coloured element resolves through a `card-*`
      token — which is what makes the theme flip total rather than partial.
- [ ] T027 [US2] Add the dark-edition values to the **existing** `.dark` block in
      `app/globals.css`, re-declaring the same six custom properties with the dark values
      from research §2. Add no component-level `.dark` selector and no `dark:` utility on
      the card — see plan.md's judgement call for why this block is the right home.
- [ ] T028 [US2] Re-tune the foil gradient stops for the dark ground so the border still
      reads as metal rather than as a flat tan line, using `--card-foil` and
      `--card-foil-lite`.
- [ ] T029 [US2] Sweep every element across `components/Hero/CardFrame.tsx`,
      `FigureBlock.tsx`, `MetaColumn.tsx`, `HonoursList.tsx`, `CardCrest.tsx` and
      `PlayerCard.tsx` in both themes, fixing any that did not change — a missed element
      shows up as one that stays put when the theme flips.
- [ ] T030 [US2] Verify no flash of the light-mode card when loading `/` directly with
      the theme already dark (US2 scenario 4); if one appears, the cause is in
      `app/layout.tsx`'s theme bootstrap, not in the card.
- [ ] T031 [P] [US2] Confirm the light-edition foil carries no text anywhere on the card
      — it measures 3.79:1 and fails AA for text (research §2, Finding B). Frame and
      rules only, in both editions, so the two stay structurally identical.

**Checkpoint**: both editions complete and measured.

---

## Phase 5: User Story 3 — The card's claims stay editable (P3)

**Goal**: every fact on the card is content. Most of the mechanism landed in Phase 2;
this phase proves it and covers the failure path.

**Independent test**: change a fact of each kind in `home.json`, reload, see all of them
(SC-005).

- [ ] T032 [P] [US3] Add a test asserting the card renders values read from `home.json`
      rather than literals — following the existing `Hero.test.tsx` habit of reading the
      content file and asserting against it, so reworded content does not fail the test.
- [ ] T033 [P] [US3] Add a test that invalid card content surfaces through the existing
      error path rather than rendering a partial card (FR-018).
- [ ] T034 [US3] Update `tests/unit/components/Hero.test.tsx` for the new anatomy —
      the stat-pill test asserts figures that no longer exist and must be replaced with
      the meta column and honours list equivalents.
- [ ] T035 [US3] Walk the SC-005 procedure in `specs/006-hero-card-redesign/quickstart.md`
      by hand against `public/data/home.json`: edit `location`, `yearsExperience`, one
      achievement's wording and the `emphasis` row; then break it three ways (six
      achievements, two emphasis rows, unknown icon) and confirm each fails loudly at load.

**Checkpoint**: all three stories complete.

---

## Phase 6: Polish and cross-cutting concerns

- [ ] T036 Create `components/Hero/FoilSheen.tsx` — a narrow angled highlight travelling
      the foil border on hover and once on entrance, animated with Framer Motion
      (interaction motion is its declared domain). Masked so it lights the frame only and
      never washes the portrait.
- [ ] T037 Gate `FoilSheen` on `prefersReducedMotion()` from `lib/utils/animations.ts`
      and return `null` when set. It must **not** rely on the global reduced-motion rule
      in `globals.css`, which collapses durations to `0.01ms` and would freeze the sheen
      mid-frame — the exact state FR-023a forbids (research §4).
- [ ] T038 [P] Add a test asserting the sheen does not render under reduced motion and
      the card reads as complete without it (SC-010).
- [ ] T039 [P] Clean up `components/Hero/palette.ts` — remove `CARD_INK`, `SUNGLOW` and
      `SUNGLOW_TEXT`, now superseded by the card tokens. Keep `INK`, `EMBER`, `TEAL`,
      `CREAM` and `WARM_INK`: the annotation bars still use them and are out of scope.
- [ ] T040 Write `docs/adr/0018-collectible-card-anatomy.md` amending ADR 0013 (FR-025).
      It must record: the anatomy replacement, the content-contract change, the move from
      inline styles to themed tokens, the display font as a design commitment, and —
      explicitly — **what the card gives up**: the per-area year counts, and the
      soft-skill bars ADR 0013 introduced as its bounded answer to the composite rating
      it rejected. Add the dated supersession note to ADR 0013 without altering its text,
      and update `docs/adr/README.md`.
- [ ] T041 Run `npm run build && npm start` and measure Lighthouse on the production
      build, mobile preset, per `specs/006-hero-card-redesign/quickstart.md` §SC-006.
      Performance must land ≥ 90. The two new costs are the font from `app/layout.tsx`
      and the portrait in `public/images/`.
- [ ] T042 If T041 falls short, apply research §6's retreat — drop the display face and
      set the name in Geist at maximum weight with tightened tracking, recording the loss
      of fidelity in the ADR.
- [ ] T043 [P] Run the width sweep in `specs/006-hero-card-redesign/quickstart.md` §SC-003
      — 320 / 375 / 768 / 1024 / 1440 / 1920 — confirming no horizontal scroll, no
      clipped content, complete anatomy, and no text below 14px.
- [ ] T044 [P] Verify `public/images/card.png` is still uncommitted and unreferenced
      (SC-009): `git log --oneline --all -- public/images/card.png` shows no commit from
      this feature, and no grep hit in `app`, `components` or `public/data`.
- [ ] T045 Run `npx prettier --write` across `components/Hero/`, `app/globals.css`,
      `app/layout.tsx`, `lib/` and `tests/` so `prettier-plugin-tailwindcss` orders the
      many new class strings, then `npm run type-check && npm run lint && npm test` as
      the final gate.

---

## Dependencies

```text
Phase 1 (T001–T004)  Setup
        │
        ▼
Phase 2 (T005–T010)  Foundational — ONE COMMIT, blocks everything
        │
        ├────────────► Phase 3 (US1, T011–T025)  MVP
        │                      │
        │                      ▼
        │              Phase 4 (US2, T026–T031)  needs the anatomy to theme
        │
        └────────────► Phase 5 (US3, T032–T035)  independent of US2
                               │
                               ▼
                       Phase 6 (T036–T045)  Polish
```

**Story independence**: US1 ships alone as a complete light-mode card. US2 depends on
US1 only because there must be an anatomy to theme — it adds no markup. US3 is
independent of US2 and could be done in either order.

**The one hard serialisation**: T005–T010. Every other boundary is soft.

## Parallel opportunities

- **Phase 1**: T002, T003, T004 all touch different files — run together after T001.
- **Phase 2**: T009 and T010 (two deletions) run together; T005–T008 are serial.
- **Phase 3**: the three test tasks T011–T013 in parallel; then the four region
  components T016–T019 in parallel — they are separate files with no shared state — while
  T014/T015 build the frame.
- **Phase 6**: T038, T039, T043, T044 are independent.

## Implementation strategy

**MVP = Phase 1 + Phase 2 + Phase 3.** That delivers the card the feature exists for, in
light mode, content-driven and tested. It is a legitimate stopping point: the site would
have a complete collectible card, with dark mode still showing light values — visibly
wrong in dark mode, which is why US2 should follow closely rather than being deferred
indefinitely.

**Recommended increments**:

1. Phases 1–2 — mechanism and contract, nothing visible.
2. Phase 3 — the card. Ship, look at it, decide whether the mock still reads as right at
   real size before investing in the rest.
3. Phase 4 — the dark edition, cheap once tokens are in place.
4. Phase 5 — proof and failure paths.
5. Phase 6 — the sheen, the ADR, and the measurements.

**T021 should be resolved before Phase 3 starts**, even though it sits inside it. The
portrait asset has a lead time this list cannot shorten, and knowing early which of T021
or T022 applies avoids building the bleeding layout twice.
