# Implementation Plan: Typography & Color Refresh

**Branch**: `feat/typography-color-refresh` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-typography-color-refresh/spec.md`

## Summary

Replace the site's current typefaces (Geist / Geist Mono) and ad hoc gray/blue palette with a
warm-orange-on-cream token system (Space Grotesk for display/body, JetBrains Mono for labels,
nine oklch color tokens) across all 8 rendered chapters and site chrome, while preserving the
existing pinned-photo + scrim/panel surface (ADR 0015), the decorative gradient-overlay mechanism
(ADR 0020), and every existing interactive behavior unchanged. Research (R1) found that two of
the token *pairings* implied by the given names fail WCAG AA against how the site actually
composites them — `primary-foreground` on `primary`/`accent` fills, and `muted-foreground` on the
photo/scrim — and resolves both by routing that text through `foreground` instead, without
changing any color value the user supplied.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19 — unchanged.

**Primary Dependencies**: Tailwind CSS v4 (`@theme inline`, existing). `next/font/google`
(existing mechanism — swaps `Geist`/`Geist_Mono` for `Space_Grotesk`/`JetBrains_Mono`, no new
npm dependency). `next-themes` (existing, untouched — dark theme values are out of scope per
FR-007). No new dependency, so no ADR obligation under Principle VI.

**Storage**: N/A — no `public/data/` schema change; this is a token/typeface change only.

**Testing**: Jest + React Testing Library, existing conventions (`tests/unit/components/`).
Contrast against the pinned photograph can't be asserted in jsdom (ADR 0015's documented
limitation), so `quickstart.md` carries the manual sweep; automated tests cover that touched
components still render and behave identically (FR-010/SC-005), not color values.

**Target Platform**: Web, desktop and mobile — existing responsive/parity requirements apply
unchanged; this feature doesn't touch layout or breakpoints beyond what new font metrics require
(edge case: label/heading wrap behavior).

**Project Type**: Single Next.js web application (existing structure).

**Performance Goals**: Lighthouse ≥ 90 (constitution floor, unchanged). Font swap must not
regress CLS — `next/font/google`'s adjusted-metrics fallback (already relied on for Geist) is
reused for the same guarantee (research R2).

**Constraints**:
- The pinned-photo + scrim/panel surface (ADR 0015) and the gradient-overlay rule (ADR 0020)
  are both preserved as-is; no `bg-*` utility or CSS `background-image` may carry a chapter
  background (FR-004).
- Text placement is constrained by research R1's findings: `foreground` (not
  `primary-foreground`) on primary/accent fills and on the bare photo/scrim; `muted-foreground`
  confined to the bare background / opaque card.
- `.dark` token values are untouched (FR-007) — this feature only adds/changes `:root` (light)
  values in `app/globals.css`.
- Tailwind class ordering via `prettier-plugin-tailwindcss` (existing tooling); no inline
  `style` except through the existing shared-token-module exception.

**Scale/Scope**: `app/globals.css` (token + `@theme inline` block) and `app/layout.tsx` (font
loaders) are the source of the change; approximately 24 component files carry the hard-coded
gray/blue/hex values or `font-sans`/`font-mono` classes that need remapping (full inventory in
`data-model.md`). No files are added or deleted; no component is restructured.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Styling (Principle IV)**: new tokens go through `@theme inline` / `:root`, the sanctioned
  mechanism — no CSS-in-JS, no new hand-written `.dark` selector. **Pass.**
- **Surface (Principle IV, ADR 0015)**: pinned photograph and `chapter-scrim`/`chapter-panel`
  stay exactly as they are; `card`/`ink-deep` are applied as panel tints, never opaque fills
  (FR-004). **Pass.**
- **Decorative gradients (ADR 0020)**: unchanged — this feature doesn't add or retint gradient
  overlay assets; `ChapterGradientOverlay` usage is untouched. **Pass.**
- **Animation (Principle IV)**: no motion changes; existing GSAP/Framer/rough-notation usage is
  restyled, not altered (FR-010). **Pass.**
- **Theming (Principle IV)**: dark theme stays behind `?experiment=true`, its values untouched,
  `next-themes` still owns theme state (FR-007). **Pass.**
- **Contrast floor**: research R1 measured every new token pairing against the surfaces FR-006
  names and documented which named token covers which surface. **Pass, with the R1 usage rules
  as the compliance mechanism** (not a constitution amendment — no oklch value changes).
- **Dependencies**: none added or removed (`next/font/google` already in use for Geist).
  **No ADR obligation under Principle VI** — this is a value/config change, not a dependency,
  structure, content-storage, or metaphor change.
- **Icons (Principle IV)**: unaffected — `react-icons` scope in `SocialIcons.tsx` unchanged.
  **Pass.**

No violations. Complexity Tracking table below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/009-typography-color-refresh/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output — contrast measurements, font-loading decision
├── data-model.md        # Phase 1 output — design token table + migration inventory
├── quickstart.md         # Phase 1 output — manual + automated validation guide
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no external interface (API, CLI, schema) for a
contract to describe — consistent with specs `007-parallax-gradient-scroll` and
`008-career-work-showcase`, the two most recent purely-visual features, which also omitted it.

### Source Code (repository root)

Existing single Next.js application; no new top-level directories.

```text
app/
├── globals.css           # token definitions (:root, @theme inline) — primary change surface
├── layout.tsx             # next/font/google loaders (Geist → Space Grotesk / JetBrains Mono)
└── not-found.tsx          # hard-coded gray/blue → tokens

components/
├── Hero/                  # Hero, ValueProp, HeroPortrait, HeroParallax, CvLink
├── Work/                  # ThreeSystems, SystemCard
├── EngineeringPrinciple/  # PrincipleBand
├── Career/                # CareerPitch, TimelineView, ChapterDetail, CareerJourneyLazy
├── Education/             # EducationSection
├── Projects/               # ProjectGalleryLazy, ProjectCard
├── Playbook/               # PlaybookGrid, PrincipleCategory
├── Contact/                # ContactSection
├── Navigation/             # Footer, StoryProgressNav, SocialIcons, EmailLink
└── Common/                 # ThemeToggle, ErrorBoundary, LoadingState, ChapterGradientOverlay (unchanged), Backdrop (unchanged)

tests/unit/components/      # existing tests for every touched component — behavior assertions
                             # stay green (FR-010); no new test files expected, since this is a
                             # visual restyle of already-tested behavior
```

**Structure Decision**: no structural change. The full list of files carrying old-palette values
is enumerated in `data-model.md`'s migration inventory; `tasks.md` will turn each row into a
task rather than this plan re-deriving it.

## Complexity Tracking

*No Constitution Check violations — table intentionally empty.*
