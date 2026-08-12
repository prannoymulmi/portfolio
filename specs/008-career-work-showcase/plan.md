# Implementation Plan: Career & Work Showcase

**Branch**: `feat/career-work-showcase` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-career-work-showcase/spec.md`

## Summary

Replace the current Skills section (`SkillsFormation`, its arbitrary skill-to-pitch-position
mapping, and the "Frameworks & Technologies" category) with a "Three systems I'd happily defend
in a design review" showcase built from the site's existing `projects.json`. Replace Career
Journey's GSAP-scroll-driven single-marker pitch with a click/pass-driven chronological pitch
navigator built from the existing `experiences.json` — no new content required, since chronological
order, pitch position, and chapter detail are all derivable from data that already exists. Keep a
plain non-interactive timeline as an explicit fallback. Add one new pinned parallax section for a
single engineering-principle statement, reusing the Hero's existing scroll-linked transform pattern.
All three sections get a low-opacity gradient-image overlay inside their existing chapter scrim —
never a replacement of the shared pinned-photo surface.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19 — unchanged.

**Primary Dependencies**: Framer Motion (existing — reused for the new parallax principle band,
same `useScroll`/`useTransform` pattern as `HeroDrift`). No new dependency. GSAP + ScrollTrigger's
usage in Career actually *shrinks*: `PlayerAnimation.tsx`'s scroll-driven single marker is deleted,
replaced by a plain click/state-driven pitch (matching the reference prototype, which uses no
animation library for this interaction at all).

**Storage**: JSON files in `public/data/` (existing pattern). `experiences.json` needs **no schema
change** — chronological order, pitch position, and chapter fields are all derived at render time
from fields that already exist (`title`, `subtitle`, `dateText`, `workDescription`, `technologies`).
`projects.json` gains three **optional** fields (`year`, `role`, `metric`) to support the showcase
card's fields the current schema doesn't carry.

**Testing**: Jest + React Testing Library, following existing component/integration test
conventions (`tests/unit/components/`, `tests/integration/`).

**Target Platform**: Web, desktop and mobile — parity is a hard requirement (FR-003, FR-007), not
a "works on both" afterthought.

**Project Type**: Single Next.js web application (existing structure).

**Performance Goals**: Lighthouse ≥90 (constitution floor); parallax principle band holds the same
≥55fps bar the Hero's parallax layers were held to.

**Constraints**: Gradient overlays MUST NOT replace the pinned photographic surface (FR-010) — they
layer inside the existing `chapter-scrim`, as a low-opacity `next/image`, never a CSS
`background-image` or a `bg-gradient-to-br` utility (both forbidden by existing conventions and the
`backdrop-coverage` test). Pitch visualisation stays SVG (constitution, Principle IV). Reduced motion
must be respected wherever motion is added.

**Scale/Scope**: Deletes `components/Skills/` entirely (`SkillsFormation.tsx`, `SkillPosition.tsx`,
`SkillCard.tsx`) and `components/Career/PlayerAnimation.tsx`. Adds a new `components/Work/` directory
and two new Career components. Extends `Project` type/schema. Adds one new content file for the
engineering-principle statement.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Visualisation (Principle IV)**: pitch stays SVG, extending the existing `SVGPitch.tsx` rather
  than introducing canvas. **Pass.**
- **Surface (ADR 0015, Principle IV)**: the pinned photograph and its `chapter-scrim` stay exactly
  as they are; the new gradient overlays are additional low-opacity `next/image` elements *inside*
  each scrimmed chapter, not a new pinned layer and not an opaque replacement. This generalises the
  technique `specs/007-parallax-gradient-scroll` used for the Hero to three more chapters — worth
  recording, see ADR note below. **Pass, with an ADR obligation.**
- **Animation (Principle IV)**: no new library. GSAP usage in Career actually decreases
  (`PlayerAnimation.tsx` deleted); the new principle band reuses Framer Motion's existing
  `useScroll`/`useTransform` pattern already established by `HeroDrift`. **Pass.**
- **Content (Principle IV, ADR 0001/0003)**: `projects.json` gains optional fields, validated by an
  extended Zod schema before use — same pattern as every other content file. No CMS, no database.
  **Pass.**
- **ADR obligation (Principle VI)**: this change removes a live section (Skills), reworks Career
  Journey's structure, and extends a content schema — three of the explicit triggers for a required
  ADR. **A new ADR (0020) MUST land in the same PR**, recording: the Skills→Work-showcase swap, the
  generalised gradient-overlay-not-replacement rule, and the Project schema extension. Feature 007
  (Hero parallax) arguably should have had one for the overlay technique's first use and didn't;
  this ADR should also close that gap by stating the rule generally rather than only for this feature.

**Gate result: PASS**, conditional on the ADR being written during implementation (tracked as a task,
not a plan-blocking issue).

## Project Structure

### Documentation (this feature)

```text
specs/008-career-work-showcase/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

No `contracts/` directory: no external interface changes (no new API/route/CLI surface).

### Source Code (repository root)

```text
components/
├── Work/                          # NEW
│   ├── ThreeSystems.tsx           # Section: "Three systems I'd happily defend..."
│   └── SystemCard.tsx             # One showcased project entry
├── Career/
│   ├── CareerJourney.tsx          # MODIFIED: orchestrates CareerPitch | TimelineView
│   ├── CareerJourneyLazy.tsx      # Unchanged
│   ├── CareerPitch.tsx            # NEW: click/pass-driven chronological pitch (replaces the
│   │                                #   old "Interactive" mode's pitch + MilestoneCard list)
│   ├── ChapterDetail.tsx          # NEW: detail panel for the active chapter
│   ├── SVGPitch.tsx               # Extended: accepts the build-up route polyline + ball marker
│   ├── TimelineToggle.tsx         # Reused as-is (interactive/timeline switch)
│   ├── TimelineView.tsx           # Reused as-is (the plain fallback, FR-006)
│   ├── PlayerAnimation.tsx        # DELETED (GSAP scroll-marker superseded by click/state)
│   └── MilestoneCard.tsx          # DELETED (superseded by ChapterDetail's single-panel design)
├── Skills/                        # DELETED (SkillsFormation.tsx, SkillPosition.tsx, SkillCard.tsx)
├── EngineeringPrinciple/          # NEW
│   └── PrincipleBand.tsx          # Pinned parallax quote section
└── Common/
    └── ChapterGradientOverlay.tsx # NEW: reusable low-opacity next/image overlay for a
                                     #   scrimmed chapter (Work + Career use this; Hero keeps
                                     #   its own HeroGradientLayers — different job, 4 drifting
                                     #   layers vs. one static wash)

lib/
├── types/portfolio.ts             # MODIFIED: Project gains year?/role?/metric?; new
│                                    #   PrincipleFile type
└── utils/validation.ts            # MODIFIED: ProjectSchema extended; new PrincipleFileSchema

public/data/
├── projects.json                  # MODIFIED: year/role/metric added to existing 3 entries,
│                                    #   sourced from numbers already present in each bodyText
└── principle.json                 # NEW: the engineering-principle statement + supporting line

app/page.tsx                       # MODIFIED: SkillsFormation → ThreeSystems (id="skills"
                                     #   anchor kept for URL stability); new principle section
                                     #   mounted between two existing chapters

docs/adr/
└── 0020-<slug>.md                 # NEW: required per Constitution Check above

tests/
├── unit/components/
│   ├── ThreeSystems.test.tsx      # NEW
│   ├── CareerPitch.test.tsx       # NEW
│   └── PrincipleBand.test.tsx     # NEW
└── integration/
    ├── career-in-story.test.tsx   # MODIFIED: rewritten against the new pitch/detail structure
    └── backdrop-coverage.test.tsx # MODIFIED: extended to cover the new chapters' overlays
```

**Structure Decision**: Single Next.js project, existing structure. No new top-level directories
beyond the two new component folders (`Work/`, `EngineeringPrinciple/`) that mirror the existing
per-chapter component organisation (`Career/`, `Education/`, etc.).

## Complexity Tracking

*No unjustified violations — the one non-trivial item (ADR obligation) is tracked as a task, not a
gate failure.*
