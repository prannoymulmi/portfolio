# Implementation Plan: Hero card, rebuilt to the collectible reference

**Branch**: `feat/hero-card-redesign` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-hero-card-redesign/spec.md`

## Summary

Replace `PlayerCard` with the collectible card in the reference mock: a shield
silhouette in warm ivory and gold foil carrying a figure block, position abbreviation,
meta column, cut-out portrait, name banner, five achievement rows and a foot crest —
plus a black-parallel dark edition and one signature motion, a sheen along the foil.

The technical spine of this feature is **colour tokens, not markup**. The current card
paints itself with inline `style` from `components/Hero/palette.ts`, and an inline style
cannot carry a `dark:` variant — which is precisely why today's card is a fixed navy in
both themes. `app/globals.css` already runs the mechanism that solves this: custom
properties declared under `:root`, re-declared under `.dark`, exposed to Tailwind
through `@theme inline`. Card colour moves onto that mechanism, and the two editions
then differ by nothing but the values of ten custom properties. No `dark:` utility, no
inline style, no component-level `.dark` selector.

The user's note on this run — *"the 91 ov should be year no random numbers"* — is the
decision already recorded as FR-004a in the clarify session. The figure block prints the
career total in years. Nothing in this plan revisits it.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16.3 (App Router)

**Primary Dependencies**: Tailwind CSS v4 (`@theme inline`, `@custom-variant`),
`next-themes`, Framer Motion. No dependency added — see Constitution Check.

**Storage**: JSON content in `public/data/home.json`, fetched client-side, validated by
Zod before use (ADR 0001, ADR 0003)

**Testing**: Jest + React Testing Library; existing suites in `tests/unit/components/`
and `tests/integration/`

**Target Platform**: Modern evergreen browsers, mobile and desktop; deployed to Vercel

**Project Type**: Single-page Next.js web application

**Performance Goals**: Lighthouse performance ≥ 90 on production builds (constitution
floor). The card is on the LCP path — it holds the portrait, and now a display font.

**Constraints**: WCAG AA (4.5:1) for all card text, AAA (7:1) for the name and figure
block; body text never below 14px at any width; no horizontal scroll 320px–1920px; the
pitch and its two calls to action stay ahead of the card in source order (feature 005)

**Scale/Scope**: One component tree (~8 files under `components/Hero/`), one content
schema, one stylesheet token block, one derived image asset

## Constitution Check

*GATE: evaluated before Phase 0, re-evaluated after Phase 1 — see bottom of file.*

| Principle | Verdict | How this plan satisfies it |
|---|---|---|
| **I. KISS & Maintainability** | Pass | The card decomposes into named sub-components (`CardFrame`, `FigureBlock`, `MetaColumn`, `HonoursList`, `CardCrest`) rather than one 400-line file. The shield outline is one SVG path definition reused by both the clip and the border stroke, not two hand-tuned copies. |
| **II. Test-First** | Pass | Tests are written per user story before the component work: anatomy presence (P1), theme flip and contrast (P2), content-driven rendering and schema rejection (P3). Retired elements get explicit absence tests so they cannot creep back. |
| **III. Atomic Commits** | Pass, with care | The work is split into commits that stand alone: tokens, then frame, then content schema, then each card region, then the sheen, then the ADR. The schema change and the component change land together — a commit that removed `softSkills` without removing `SkillBars` would not build. |
| **IV. Technology Stack** | Pass | No library added. Shield and crest are SVG (the constitution's stated preference over canvas). Sheen sits in Framer Motion's declared domain — interaction motion. Icons are drawn inline, keeping `react-icons` scoped to `SocialIcons.tsx` per ADR 0014. |
| **V. Token Efficiency** | Pass | Research below records decisions, not transcripts. |
| **VI. Recorded Decisions** | **Action required** | An ADR amending ADR 0013 must land in this PR. It is triggered twice: the card anatomy the metaphor was committed to is replaced, and the content contract changes. It must also record what the card gives up — the per-area year counts and the soft-skill bars ADR 0013 introduced as its bounded answer to a composite rating. |

### Quality-constraint gates

- **Inline styles** — this feature *removes* the card's dependence on them. Colour moves
  to Tailwind utilities backed by custom properties. Inline `style` survives only where
  a value genuinely cannot be a class: the SVG gradient stops for the foil.
- **`dark:` utilities / no hand-written `.dark` selectors** — see the judgement call
  below. No component-level `.dark` selector is added.
- **Contrast** — every token pair is measured before it ships, not eyeballed. Research
  records the computed ratios.
- **Reduced motion** — the sheen is gated on the existing `prefersReducedMotion()`
  helper in `lib/utils/animations.ts`, not a new detection path. It must not render at
  all, because the global `@media (prefers-reduced-motion: reduce)` rule in `globals.css`
  collapses durations to `0.01ms` — which would leave an animated sheen frozen at its
  end state, exactly the mid-state FR-023a forbids.
- **Lighthouse ≥ 90** — one new font weight and one new image asset are the two risks;
  both are measured in the quickstart rather than assumed.

### Judgement call: extending the `.dark` custom-property block

The constitution says *"hand-written `.dark` selectors MUST NOT be added, as they
silently outrank the zero-specificity custom variant."* This plan adds ten declarations
to the **existing** `.dark { … }` block in `globals.css`.

That block is not the thing the rule forbids. The rule targets component styling —
`.dark .player-card { background: … }` — which wins over `dark:` utilities by
specificity and makes the cascade unpredictable. The existing block declares *custom
property values only*, is the mechanism ADR 0011 established, and already carries
`--background`, `--foreground`, `--scrim` and `--on-photo` for exactly this purpose. Its
own comment states the intent: *"Keyed off the same class as the `dark` variant above,
so the custom properties and the utilities can never disagree about the theme."*

Adding card tokens there is using that mechanism, not circumventing it. A card token
resolved this way is consumed as an ordinary zero-specificity utility (`bg-card-ground`),
so nothing outranks anything. The alternative — `dark:` variants on every coloured
element — would need roughly forty paired utilities across the card and would put the
two editions in different files from each other.

**No violation recorded.** If a reviewer disagrees, the fallback is paired `dark:`
utilities, which is more verbose but changes no visual outcome.

## Project Structure

### Documentation (this feature)

```text
specs/006-hero-card-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── content-schema.md
├── checklists/
│   └── requirements.md  # from /speckit-specify + /speckit-clarify
├── spec.md
└── tasks.md             # /speckit-tasks output — NOT created here
```

### Source code

```text
app/
├── globals.css                      # + card token block under :root and .dark,
│                                    #   + @theme inline exposure
└── layout.tsx                       # + condensed display face via next/font/google

components/Hero/
├── PlayerCard.tsx                   # rewritten to the new anatomy
├── CardFrame.tsx                    # NEW  shield outline, foil border, ground, texture
├── FigureBlock.tsx                  # NEW  years numeral + label + rule
├── MetaColumn.tsx                   # NEW  location / country / years rows
├── HonoursList.tsx                  # NEW  the five achievement rows
├── CardCrest.tsx                    # NEW  foot crest
├── CardIcons.tsx                    # NEW  inline SVG glyphs (pin, calendar, trophy,
│                                    #      shield, code, cloud, people)
├── FoilSheen.tsx                    # NEW  the one motion treatment
├── Flags.tsx                        # reused unchanged
├── palette.ts                       # card constants removed; annotation bars stay
├── AwsBadge.tsx                     # DELETED — AWS becomes an achievement row
├── SkillBars.tsx                    # DELETED
└── StarRating.tsx                   # DELETED

lib/
├── types/portfolio.ts               # PlayerCard type reshaped
└── utils/validation.ts              # PlayerCardSchema reshaped

public/
├── data/home.json                   # card content reshaped
└── images/hero_pic_cutout.png       # NEW  derived, committed

tests/unit/components/
├── PlayerCard.test.tsx              # NEW  anatomy, theme, retired elements
└── Hero.test.tsx                    # updated for the new anatomy

docs/adr/
└── 0018-collectible-card-anatomy.md # NEW  amends ADR 0013
```

**Structure Decision**: The existing `components/Hero/` directory is the whole surface
area. The card is decomposed into one component per region of the reference anatomy,
which keeps each file small enough to read in one screen and makes the anatomy
checkable against the mock file by file. No new top-level directory is introduced;
this is a redesign of one component tree, not a new subsystem.

## Complexity Tracking

> No constitution violations require justification. The single judgement call — extending
> the existing `.dark` custom-property block — is argued in the Constitution Check above
> and is deliberately *not* recorded as a violation, because it uses the mechanism ADR
> 0011 established rather than working around it.

## Post-Design Constitution Re-Check

Re-evaluated after Phase 1 artefacts were written:

- **No new dependency** — confirmed. The condensed display face arrives through
  `next/font/google`, which is part of Next.js; `package.json` is untouched. It is still
  a visible design commitment, so the ADR names it.
- **Icons** — confirmed inline. `CardIcons.tsx` draws seven glyphs; `react-icons` stays
  scoped to `SocialIcons.tsx`.
- **Content contract** — confirmed in [contracts/content-schema.md](./contracts/content-schema.md).
  Every fact on the card is content; nothing is hardcoded.
- **Test-first** — the test files are listed ahead of the components they cover in the
  structure above, and [quickstart.md](./quickstart.md) states the verification for each
  success criterion.
- **One risk carried forward**: the cut-out matte (research §5). It is the only task in
  this feature that can fail on quality rather than on correctness, and the spec already
  gives it a named fallback.
