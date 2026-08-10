# Implementation Plan: Story-Driven Portfolio Redesign

**Branch**: `002-portfolio-story-redesign` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-portfolio-story-redesign/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Collapse the portfolio's seven standalone pages (skills, career, education, projects, playbook, about, contact) plus home into one continuous scrolling story on `/`, remove the persistent navigation bar, add a modern gradient background, keep the existing interactive Career Journey experience embedded as a chapter, add a visible profile-picture placeholder, and redirect every old page URL into the matching section of the new story. Technical approach: reuse the existing content-driven section components as-is, assemble them sequentially in `app/page.tsx`, drop `<Navbar />` from the root layout, add a lightweight in-page section-jump control, and declare the seven legacy redirects in `next.config.ts`.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), Next.js 16.3.0 (App Router), React 19.2.8

**Primary Dependencies**: Tailwind CSS 4 (gradient/utility styling), Framer Motion ^11 (scroll-linked UI, section-jump indicator), GSAP ^3.12 + ScrollTrigger (already used for timeline animation in Career Journey — reused, not newly introduced), Zod ^3.22 (existing content validation)

**Storage**: N/A — content is static JSON in `app/data/` and `public/data/`, loaded via the existing `ContentProvider`/`useContent` hook

**Testing**: Jest + @testing-library/react (existing setup)

**Target Platform**: Web, deployed to Vercel; must work across modern desktop and mobile browsers

**Project Type**: Single Next.js web application (no separate frontend/backend split)

**Performance Goals**: Maintain the constitution's Lighthouse performance score ≥ 90; scroll-linked effects should run smoothly (no jank) on a single long page

**Constraints**: WCAG AA text contrast against the new gradient in both themes; `prefers-reduced-motion` must disable non-essential scroll/gradient animation; GSAP ScrollTrigger instances must be killed on unmount; no persistent multi-page nav bar

**Scale/Scope**: Single-owner personal portfolio; 8 story sections consolidated onto one route; 7 legacy routes redirected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. KISS & Maintainability | Reuses existing section components unchanged (`Hero`, `AboutSection`, `SkillsFormation`, `CareerJourneyLazy`, `EducationSection`, `ProjectGalleryLazy`, `PlaybookGrid`, plus the existing Contact placeholder), assembled in reading order on one page. No new state-management layer or abstraction introduced. | PASS |
| II. Test-First | Plan requires tests added alongside implementation: single-page renders all sections, nav bar absent, legacy redirects resolve, profile placeholder renders when `imageSource` is missing. Enforced during `/speckit-tasks` (tests precede/accompany each implementation task). | PASS (to be enforced at task level) |
| III. Atomic Commits | Not a design-time gate; enforced during implementation via small, single-purpose commits. | N/A at plan stage |
| IV. Technology Stack (fixed) | No new libraries required — gradient via Tailwind utilities, section-jump via Framer Motion, redirects via built-in Next.js `redirects()` config. | PASS |
| V. Token Efficiency | Plan reuses existing components/content rather than regenerating them; no large scaffolding introduced. | PASS |

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-portfolio-story-redesign/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── legacy-redirects.md   # Phase 1 output — old URL → story anchor mapping
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                     # Remove <Navbar /> from the tree; keep skip-link, Footer, ContentProvider
├── page.tsx                       # Rewritten: renders all story sections in order inside one <main>
├── (routes)/
│   ├── skills/page.tsx            # Removed — replaced by a next.config.ts redirect to /#skills
│   ├── career/page.tsx            # Removed — replaced by a next.config.ts redirect to /#career
│   ├── education/page.tsx         # Removed — replaced by a next.config.ts redirect to /#education
│   ├── projects/page.tsx          # Removed — replaced by a next.config.ts redirect to /#projects
│   ├── playbook/page.tsx          # Removed — replaced by a next.config.ts redirect to /#playbook
│   ├── about/page.tsx             # Removed — replaced by a next.config.ts redirect to /#about
│   └── contact/page.tsx           # Removed — replaced by a next.config.ts redirect to /#contact
└── data/                          # Unchanged — existing JSON content

components/
├── Navigation/
│   ├── Navbar.tsx                 # No longer mounted in layout.tsx; kept or removed per tasks.md decision
│   └── StoryProgressNav.tsx       # NEW — lightweight in-page section-jump control (anchors + scroll progress)
├── About/AboutSection.tsx         # Updated — render a placeholder graphic when imageSource is absent
├── Hero/Hero.tsx                  # Updated — apply the new gradient background; add profile-picture placeholder
└── (Career/Skills/Education/Projects/Playbook — unchanged, reused as-is)

next.config.ts                     # Add async redirects() for the 7 legacy paths
```

**Structure Decision**: Single Next.js app (no new project/package). The seven route segments under `app/(routes)/` are removed and replaced by config-level redirects rather than a parallel set of pages, keeping exactly one way to reach any section (KISS). All section content keeps using its existing component and content file — only the assembly point (`app/page.tsx`) and the navigation chrome (`layout.tsx`, `Navbar`) change.

## Complexity Tracking

*No Constitution Check violations — table omitted.*
