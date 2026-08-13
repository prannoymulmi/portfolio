# Implementation Plan: Minimal Nav with Hamburger Sections

**Branch**: `feat/hamburger-nav` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-hamburger-nav/spec.md`

## Summary

Replace the nav bar's always-visible, horizontally-scrolling row of seven section
links with a single hamburger toggle. The toggle opens a menu holding the same
seven links (unchanged order, labels, anchors); the wordmark and the existing
icon group (social icons, email link, theme toggle) stay put in the bar exactly
as they render today. Applies at every viewport width — there is no width at
which links render inline. Built as a new client component driving Framer Motion
open/close state inside the existing `StoryProgressNav`, reusing its scroll
progress hairline and reduced-motion handling unchanged.

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 16 App Router, React 19

**Primary Dependencies**: Framer Motion (menu open/close motion — component
interaction domain, per Constitution IV), Tailwind CSS v4 (styling, `dark:`
utilities). No new dependency.

**Storage**: N/A — `STORY_SECTIONS` stays a static in-file array, as it is today.

**Testing**: Jest + React Testing Library (`tests/unit/components/`), matching
the existing `StoryProgressNav.test.tsx` suite and its `framer-motion` mock
pattern.

**Target Platform**: Web (all breakpoints the site already supports, evergreen
browsers).

**Project Type**: Single Next.js web app (no separate frontend/backend split).

**Performance Goals**: No regression to the existing Lighthouse floor (≥ 90,
Constitution Technology & Quality Constraints).

**Constraints**: `prefers-reduced-motion` handled via existing
`lib/utils/animations.ts` helper, not a new detection path (Constitution
Technology & Quality Constraints; spec FR-009). Dark mode via `dark:` utilities
only, no hand-written `.dark` selectors. `react-icons` usage stays confined to
`SocialIcons.tsx` — the hamburger glyph is a plain inline SVG. Menu toggle
carries `aria-expanded`/`aria-label`; focus moves into the menu on open and
back to the toggle on close (spec FR-006, FR-007).

**Scale/Scope**: One component change (`StoryProgressNav.tsx`, or a new
`HamburgerMenu` child it renders); seven static links, unchanged content.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. KISS & Maintainability** — Pass. The menu is toggle state (open/closed)
  plus the existing link list; no new abstraction layer needed.
- **II. Test-First** — Pass, planned: new/updated tests in
  `tests/unit/components/` cover toggle open/close, focus movement, Escape,
  outside-click, and that all seven links render inside the menu, before/alongside
  the component change.
- **III. Atomic Commits** — Pass, planned: implementation lands as one commit
  (component + its test), matching the existing single-component scope.
- **IV. Technology Stack** — Pass. Framer Motion (component interaction motion)
  is the correct library for open/close per the fixed three-library animation
  ceiling. No new icon set — hamburger glyph is inline SVG, not `react-icons`.
  No CSS-in-JS; Tailwind utilities only. Dark mode stays `.dark`-class-bound via
  `dark:` utilities.
- **V. Token Efficiency** — N/A to this feature's runtime behavior.
- **VI. Recorded Decisions (ADRs)** — No ADR triggered: no dependency
  added/removed, no URL/content-storage change, no new metaphor committed.

**Result**: No violations. Proceeding to Phase 0.

**Post-Phase 1 re-check**: Design artifacts (research.md, data-model.md,
quickstart.md) introduce no new dependency, entity, or interface beyond what
this gate already covered. Result unchanged: no violations.

## Project Structure

### Documentation (this feature)

```text
specs/010-hamburger-nav/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature has no external interface (API,
schema, CLI) — it is a UI-only change to a client component's render output.

### Source Code (repository root)

```text
components/
└── Navigation/
    ├── StoryProgressNav.tsx   # renders wordmark, hamburger toggle, icon group
    ├── HamburgerMenu.tsx      # new: toggle button + section-link menu panel
    ├── SocialIcons.tsx        # unchanged
    └── EmailLink.tsx          # unchanged

lib/
└── utils/
    └── animations.ts          # existing prefers-reduced-motion helper, reused

tests/
└── unit/
    └── components/
        ├── StoryProgressNav.test.tsx   # updated: bar shows no inline links
        └── HamburgerMenu.test.tsx      # new: open/close, focus, a11y, links
```

**Structure Decision**: Single Next.js app, no new top-level directory. The
section-link list and its open/close behavior move into a new
`components/Navigation/HamburgerMenu.tsx`, kept separate from
`StoryProgressNav.tsx` so the bar's layout/scroll-progress concerns and the
menu's toggle/focus-trap concerns stay independently testable (Constitution
I & II). `StoryProgressNav` renders `HamburgerMenu` in place of the current
inline `<nav aria-label="Story sections">` list.

## Complexity Tracking

*No Constitution Check violations — this section intentionally left empty.*
