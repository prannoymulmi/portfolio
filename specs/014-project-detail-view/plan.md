# Implementation Plan: Featured Project Detail View

**Branch**: `feat/project-detail-view` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-project-detail-view/spec.md`

## Summary

Replace the featured project cards' hard `line-clamp-3` truncation with a
click-to-open modal that shows the complete project description, a clear
GitHub link, and — separately, at the gallery level — a low-emphasis link to
the visitor's full GitHub profile so the featured set reads as curated
highlights rather than the complete list. Built as a new `ProjectDetailModal`
client component following the portal/backdrop/focus-trap/reduced-motion
pattern already proven in `components/Navigation/HamburgerMenu.tsx`, wired
into `ProjectGallery`'s existing `selectedProjectId` state. No new
dependency, no schema change.

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 16 App Router, React 19

**Primary Dependencies**: Framer Motion (modal open/close motion — component
interaction domain, per Constitution IV). No new dependency.

**Storage**: N/A — reuses existing `public/data/projects.json` content and
`ProjectSchema` validation, unchanged.

**Testing**: Jest + React Testing Library (`tests/unit/components/`), reusing
the existing `framer-motion` + `prefersReducedMotion` mock pattern from
`HamburgerMenu.test.tsx`.

**Target Platform**: Web (all breakpoints the site already supports, evergreen
browsers).

**Project Type**: Single Next.js web app (no separate frontend/backend split).

**Performance Goals**: No regression to the existing Lighthouse floor (≥ 90,
Constitution Technology & Quality Constraints).

**Constraints**: `prefers-reduced-motion` handled via the existing
`lib/utils/animations.ts` helper, not a new detection path. `react-icons`
usage stays confined to `SocialIcons.tsx` — the close (✕) and external-link
glyphs are inline SVG. Dark mode via `dark:` utilities only. Modal carries
`role="dialog"`/`aria-modal="true"`/`aria-labelledby`; focus moves into the
modal on open, is trapped inside it while open, and returns to the triggering
card on close (spec FR-004, FR-005). Background scroll is locked while the
modal is open (spec FR-006).

**Scale/Scope**: One new component (`ProjectDetailModal`), edits to two
existing components (`ProjectGallery`, `ProjectCard`), no data/schema change.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. KISS & Maintainability** — Pass. The modal reuses an already-proven
  pattern (`HamburgerMenu`'s portal/backdrop/focus-trap) rather than inventing
  a new abstraction or pulling in a dialog library.
- **II. Test-First** — Pass, planned: new `ProjectDetailModal.test.tsx` plus
  updated `ProjectCard.test.tsx`/`ProjectGallery.test.tsx` (open/close,
  focus trap, Escape, outside-click, GitHub link resolution, missing
  role/metric, reduced motion) land alongside the component change.
- **III. Atomic Commits** — Pass, planned: the modal component + its test is
  one commit; the `ProjectGallery`/`ProjectCard` wiring + the GitHub profile
  link is a second, separable commit.
- **IV. Technology Stack** — Pass. Framer Motion (component interaction
  motion) is the correct library for open/close, already in use for the same
  pattern elsewhere. No new dependency. `react-icons` stays scoped to
  `SocialIcons.tsx`. No CSS-in-JS; Tailwind utilities only. Dark mode stays
  `.dark`-class-bound via `dark:` utilities.
- **V. Token Efficiency** — N/A to this feature's runtime behavior.
- **VI. Recorded Decisions (ADRs)** — No ADR triggered: no dependency
  added/removed, no URL/route/content-storage change (the modal is UI state,
  not a route — spec FR-007), and no new visual metaphor committed. This is a
  UI-interaction change layered on an existing chapter.

**Result**: No violations. Proceeding to Phase 0.

**Post-Phase 1 re-check**: Design artifacts (research.md, data-model.md,
quickstart.md) introduce no new dependency, entity, or interface beyond what
this gate already covered — the modal reads existing `Project` fields
unchanged and the GitHub profile link is a static constant, not new state.
Result unchanged: no violations.

## Project Structure

### Documentation (this feature)

```text
specs/014-project-detail-view/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature has no external interface (API,
schema, CLI) — it is a UI-only change to client components' render output.

### Source Code (repository root)

```text
components/
└── Projects/
    ├── ProjectGallery.tsx      # updated: renders ProjectDetailModal when
    │                           # selectedProjectId is set; adds the
    │                           # low-emphasis GitHub profile link
    ├── ProjectCard.tsx         # updated: card click opens the modal
    │                           # (existing onSelect wiring, no new prop)
    └── ProjectDetailModal.tsx  # new: portal + backdrop + focus-trap modal,
                                # full bodyText, GitHub link, role/metric

lib/
└── utils/
    └── animations.ts           # existing prefers-reduced-motion helper, reused

tests/
└── unit/
    └── components/
        ├── ProjectGallery.test.tsx      # updated: modal open/close wiring,
        │                                # GitHub profile link presence
        ├── ProjectCard.test.tsx         # updated: click opens modal
        └── ProjectDetailModal.test.tsx  # new: full text, GitHub link
                                          # resolution, focus trap, Escape,
                                          # outside-click, reduced motion,
                                          # missing role/metric
```

**Structure Decision**: Single Next.js app, no new top-level directory. The
detail view is a new `components/Projects/ProjectDetailModal.tsx`, kept
separate from `ProjectCard.tsx` so the card's own rendering and the modal's
overlay/focus-trap concerns stay independently testable (Constitution I & II) —
the same separation `HamburgerMenu.tsx` already has from `StoryProgressNav.tsx`.
`ProjectGallery` owns the open/closed state (already does, via
`selectedProjectId`) and renders the modal conditionally.

## Complexity Tracking

*No Constitution Check violations — this section intentionally left empty.*
