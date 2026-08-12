# Implementation Plan: Portrait hero and floating navigation

**Branch**: `feat/hero-portrait-floating-nav` | **Date**: 2026-08-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-hero-portrait-floating-nav/spec.md`

## Summary

Retire the football player card from the opening and rebuild the section around a
background-removed portrait on the right, dissolved into the page surface at its
lower edge. Reshape the persistent navigation into a floating rounded bar whose
section links scroll inside it while the profile, email and theme controls stay
pinned. Correct the two calls to action so they share one box model, and
introduce a single stored email address surfaced in the navigation and the
Contact chapter.

The blend itself is already solved: `public/images/hero_portrait.png` carries a
real alpha channel with colour-decontaminated edges (feature 006 clarification
session), so no per-theme image treatment is needed. What remains is layout,
masking, box-model correction, a small content change, deletion of the card and
its five sub-components, and the governance record that removing the card
requires.

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`), React 19.2.8

**Primary Dependencies**: Next.js 16.3.0 (App Router), Tailwind CSS 4.3.3,
framer-motion ^11, next-themes ^0.4.6, rough-notation ^0.5.1, zod ^3.22,
react-icons ^5.7.0 (brand marks only, `SocialIcons.tsx` only)

**Storage**: JSON files in `public/data/`, fetched client-side and Zod-validated.
No CMS, no database.

**Testing**: Jest 29 + Testing Library + jsdom. **Verified baseline: 17 suites,
99 tests, all passing.** No task may reduce that count without replacing coverage.

**Target Platform**: Evergreen browsers; viewports 375px → 2560px; light and dark
themes driven by the `.dark` class.

**Project Type**: Single-page Next.js web application — one scrolling story at
`/`, sections as anchors.

**Performance Goals**: Lighthouse ≥ 90 on production builds; opening LCP must not
regress against the current build.

**Constraints**: WCAG AA for all changed text and controls; `prefers-reduced-motion`
honoured through existing helpers; no CSS-in-JS; inline `style` only for values
exported by a token module; `dark:` utilities only, never hand-written `.dark`
selectors.

**Scale/Scope**: One page, seven sections. ~10 files changed, 6 deleted, 3 added,
plus 2 governance documents.

## Constitution Check

*GATE: evaluated before Phase 0 and re-evaluated after Phase 1.*

| Principle | Verdict | Notes |
|---|---|---|
| I. KISS & Maintainability | **PASS** | Net simplification: 6 components deleted, 1 added. No new abstraction. The optional rim light from the reference image is deliberately not built — see research.md R7. |
| II. Test-First | **PASS with obligation** | Every behavioural change gets a test written alongside. Three visual criteria (FR-004, FR-004a, FR-004b) cannot be asserted by jsdom — recorded as a known gap, not silently skipped. |
| III. Atomic Commits | **PASS** | Sequenced into 8 commits below; none mixes concerns; the largest touches 5 files. |
| IV. Technology Stack | **VIOLATION — amendment required** | Principle IV names the hero player card in the fixed stack. See Complexity Tracking. |
| IV. Icons sub-rule | **PASS** | Envelope and button glyphs are inline SVG. `react-icons` stays confined to `SocialIcons.tsx` (ADR 0014). |
| IV. Styling sub-rule | **PASS** | Verified: Tailwind 4.3.3 emits `mask-b-from-*` / `mask-r-from-*` with `mask-composite: intersect`, so both fades are utilities. No new inline styles. |
| IV. Animation ceiling | **PASS** | Reuses `HeroDrift` (Framer Motion) and the existing scroll spring. No fourth library. |
| IV. Surface | **PASS** | Portrait served through `next/image`, never a CSS `background-image`. Chapters keep `chapter-scrim`. |
| V. Token Efficiency | **PASS** | N/A to runtime code. |
| VI. Recorded Decisions | **PASS with obligation** | New ADR 0018 + supersession note on ADR 0013 + index update, all in this PR. |

**Post-Phase 1 re-evaluation**: unchanged. The design introduced no new dependency,
no new inline style, and no new animation library. The single violation is the one
below, and it is resolved by amendment rather than by workaround.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Removing the hero player card, named in Principle IV's fixed stack ("The football metaphor extends to the hero player card") | The site's owner rejected the card as the first impression. That is a product decision the constitution cannot settle, and the constitution provides an explicit path: ADR + amendment in the same PR. | Keeping the card and restyling it was considered and rejected — it does not address the objection, which is to the card as a form, not to its styling. Removing it *without* the amendment was rejected because Governance requires both, and an undocumented stack change is exactly what Principle VI exists to prevent. |

**Resolution**: this PR must carry, as FR-025 requires:

1. `docs/adr/0018-the-opening-leaves-the-player-card.md` — new record, stating what it supersedes.
2. A dated supersession note at the top of `docs/adr/0013-hero-player-card.md`, **original text unaltered**.
3. `docs/adr/README.md` — 0013's status updated, 0018 added.
4. `.specify/memory/constitution.md` — Principle IV amended, version 1.2.0 → **1.3.0** (MINOR: redefinition within a principle, not removal of one), with a sync impact report.

## Project Structure

### Documentation (this feature)

```text
specs/006-hero-portrait-floating-nav/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── content-schemas.md
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # /speckit-tasks — NOT created here
```

### Source Code (repository root)

```text
components/
├── Hero/
│   ├── Hero.tsx                    # MODIFIED — card slot becomes the portrait
│   ├── HeroPortrait.tsx            # ADDED — the cut-out, masked and framed
│   ├── ValueProp.tsx               # MODIFIED — box model + leading icons
│   ├── CvLink.tsx                  # MODIFIED — comment referencing the card
│   ├── HeroParallax.tsx            # UNCHANGED — reused at lower strength
│   ├── palette.ts                  # MODIFIED — card-only tokens removed
│   ├── PlayerCard.tsx              # DELETED
│   ├── SkillBars.tsx               # DELETED
│   ├── StarRating.tsx              # DELETED
│   ├── AwsBadge.tsx                # DELETED
│   └── Flags.tsx                   # DELETED
├── Common/
│   └── ProfilePicturePlaceholder.tsx  # DELETED — only the card used it
├── Navigation/
│   ├── StoryProgressNav.tsx        # MODIFIED — floating pill + inner scroller
│   ├── SocialIcons.tsx             # UNCHANGED
│   └── EmailLink.tsx               # ADDED — inline-SVG envelope
└── Contact/
    └── ContactSection.tsx          # MODIFIED — real address

lib/
├── types/portfolio.ts              # MODIFIED — PlayerCard/PlayerStat/SoftSkill out, email in
└── utils/validation.ts             # MODIFIED — same, on the Zod side

public/
├── data/
│   ├── home.json                   # MODIFIED — "secure" restored, card removed
│   └── social.json                 # MODIFIED — email field added
└── images/
    ├── hero_portrait.png             # ADDED (already committed)
    └── hero_pic.png                # RETAINED as regeneration source

tests/unit/components/
├── Hero.test.tsx                   # REWRITTEN
├── HeroPortrait.test.tsx           # ADDED
├── ValueProp.test.tsx              # ADDED
├── EmailLink.test.tsx              # ADDED
├── ContactSection.test.tsx         # ADDED
└── StoryProgressNav.test.tsx       # MODIFIED

tests/integration/
└── content-sources.test.ts         # MODIFIED — schema shape changed

docs/adr/
├── 0018-the-opening-leaves-the-player-card.md  # ADDED
├── 0013-hero-player-card.md        # MODIFIED — supersession note only
└── README.md                       # MODIFIED — index

.specify/memory/constitution.md     # MODIFIED — Principle IV, 1.2.0 → 1.3.0
```

**Structure Decision**: no new top-level directories. The feature fits the
existing `components/<Domain>/` + `lib/` + `tests/{unit,integration}` layout.
Two new components are added in the domains that already own their concerns —
`Hero/HeroPortrait.tsx` and `Navigation/EmailLink.tsx` — rather than being
inlined, so each is independently testable, which is what lets the card's
five sub-components be deleted without losing coverage.

## Commit Sequence

Ordered so the tree builds and tests pass at every step (Principle III).

| # | Commit | Files | Why it is one unit |
|---|---|---|---|
| 1 | `feat(content): restore "secure" to the opening line and add the contact address` | `home.json`, `social.json`, `validation.ts`, `portfolio.ts` | One content-shape change, schema and types together |
| 2 | `feat(nav): float the story nav and give it the contact address` | `StoryProgressNav.tsx`, `EmailLink.tsx`, + 2 tests | The pill and its new control ship together |
| 3 | `feat(contact): give the Contact chapter the real address` | `ContactSection.tsx`, + test | Independent chapter |
| 4 | `fix(hero): match the two calls to action and lead both with an icon` | `ValueProp.tsx`, + test | The reported defect, on its own |
| 5 | `feat(hero): put the portrait where the card was` | `Hero.tsx`, `HeroPortrait.tsx`, + 2 tests | The layout change |
| 6 | `refactor(hero): delete the player card and its parts` | 6 deletions, `palette.ts`, `CvLink.tsx` | Pure removal, after nothing references it |
| 7 | `refactor(content): drop the card fields from the schema` | `validation.ts`, `portfolio.ts`, `home.json`, `content-sources.test.ts` | Schema cleanup once the renderer is gone |
| 8 | `docs(adr): record that the opening leaves the player card` | ADR 0018, ADR 0013 note, index, constitution | Governance, FR-025 |

Commits 6 and 7 are deliberately after 5: deleting the card before its
replacement renders would leave the tree broken mid-sequence.

## Phase 0: Research

Complete — see [research.md](research.md). Eight questions resolved, all
verified against the installed toolchain rather than assumed. The two findings
that changed the design:

- **R3** — the button misalignment is a box-model bug, not a flex bug. The
  primary button has no border while the secondary has `border-2`, so their
  heights differ by 4px. `align-items: stretch` masks this in a row but not when
  stacked. Fix is a transparent border on the primary, not a height override.
- **R1** — Tailwind 4.3.3 ships directional mask utilities, so the portrait fade
  and the nav's edge fade need no inline styles and no new dependency.

## Phase 1: Design

Complete — see [data-model.md](data-model.md),
[contracts/content-schemas.md](contracts/content-schemas.md), and
[quickstart.md](quickstart.md).

## Known Gaps Carried Forward

Recorded rather than hidden, so `/speckit-tasks` does not invent coverage that
cannot exist:

1. **FR-004, FR-004a, FR-004b are not machine-testable.** jsdom does not
   rasterise, so "no grey visible", "no halo on dark" and "lower edge dissolves"
   can only be verified by eye. Tests will assert the *mechanism* (correct asset
   referenced, mask utilities applied) but not the *appearance*. The asset itself
   was verified at 3× zoom over transparency, the sunset backdrop and the dark
   surface before being committed.
2. **SC-008 (Lighthouse ≥ 90, no LCP regression) needs a production build.**
   It cannot be checked from the unit suite. Measurement steps are in
   quickstart.md; the portrait is a plausible new LCP candidate and is
   deliberately not given `preload`, which the backdrop already holds.
3. **SC-003 asks for 0px tolerance on button heights.** Verified by computed
   style in a browser, not in jsdom, which does not lay out.
