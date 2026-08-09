# Implementation Plan: Senior Software Engineer Portfolio

**Branch**: `001-senior-portfolio` | **Date**: 2026-08-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-senior-portfolio/spec.md`

## Summary

Build a modern, JSON-driven senior software engineer portfolio using Next.js + TypeScript with a football-themed interactive career journey. The portfolio separates UI from content (JSON files for skills, experiences, education, projects, playbook, routes, and navigation) to enable content updates without code changes. Key features: 20-second recruiter assessment on hero, scroll-driven SVG player animation with GSAP for career milestones, Framer Motion parallax/transitions for premium UX, skills displayed as football formation, project case studies, technical playbook, and accessibility-first design (WCAG 2.1 AA, prefers-reduced-motion, skeleton screens during load).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)

**Primary Dependencies**:
- Next.js 14+ (App Router)
- Framer Motion (UI animations, parallax)
- GSAP + ScrollTrigger (scroll-sequenced player animation)
- Tailwind CSS (styling)
- React Testing Library + Jest (testing)
- Zod or TypeScript interfaces (JSON schema validation)

**Storage**: JSON files in `public/data/` (skills.json, experiences.json, education.json, projects.json, playbook.json, routes.json, navbar.json, social.json, about.json, home.json); files bundled with deployment

**Testing**: Jest + React Testing Library; E2E tests via Playwright or Cypress (optional for v1)

**Target Platform**: Web browsers (modern Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (Next.js SPA with static JSON content)

**Performance Goals**:
- Lighthouse score ≥ 90 (all metrics)
- First Contentful Paint (FCP) < 1.2s on 4G
- Time to Interactive (TTI) < 2.5s on 4G
- Content sections load within 2 seconds
- Career Journey animations at 60 FPS
- Interactive element response within 100ms
- Skeleton screens visible within 100ms of load

**Constraints**:
- No hardcoded content (all from JSON)
- No backend API (static content only)
- No database (Git-versioned JSON files)
- No real-time updates (redeployment required for content changes)
- TypeScript strict mode mandatory
- Tailwind only (no CSS-in-JS outside utilities)
- Atomic, small commits with "what — why" messages
- Simple, readable code (KISS principle)
- All code must have tests

**Scale/Scope**:
- 10 JSON entities (Skill, SkillCategory, Experience, Education, Project, NavItem, Route, Social, Home, About, Playbook)
- 11 user stories (P1-P3 priorities)
- ~8 main portfolio pages/sections
- 38 functional requirements
- 22 success criteria

## Constitution Check

*GATE: All violations documented. Justification provided for any overrides.*

**Principles Applied**:

| Principle | Requirement | Status |
|-----------|-------------|--------|
| **I. KISS & Maintainability** | Code must be simple, readable, no clever tricks | ✅ Enforced: Component-based architecture, clear separation of concerns, no unnecessary abstractions |
| **II. Test-First** | All features require passing tests; tests must be simple | ✅ Enforced: Jest + React Testing Library; simple, readable test cases prioritized |
| **III. Atomic Commits** | Small, self-contained commits with "what — why" messages | ✅ Enforced: Each task = one atomic commit; format: `<type>(<scope>): <what> — <why>` |
| **IV. Technology Stack** | Fixed stack (Next.js, TypeScript, Tailwind, Framer Motion, GSAP, SVG, Vercel) | ✅ Enforced: No substitutions without amendment; all choices match spec |
| **V. Token Efficiency** | LLM prompts must be concise, no redundant context | ✅ Enforced: All planning prompts terse, context reused |

**Gate Status**: ✅ **PASS** — No violations. Constitution principles align with spec requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-senior-portfolio/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (Phase 1 output)
├── research.md          # Phase 0 output (no gaps; can be omitted or minimal)
├── data-model.md        # Phase 1 output (entity definitions, validation)
├── contracts/           # Phase 1 output (interface/route contracts)
│   ├── home.contract.md
│   ├── api.contracts.md
│   └── routes.contract.md
├── quickstart.md        # Phase 1 output (validation guide)
├── checklists/
│   └── requirements.md   # Quality checklist (passing)
└── tasks.md             # Phase 2 output (/speckit-tasks) — not yet created
```

### Source Code (Next.js App Router structure)

```text
portfolio/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout with theme toggle, navigation
│   ├── page.tsx                 # Hero section (home page)
│   ├── not-found.tsx            # 404 fallback
│   ├── (routes)/                # Route group for portfolio sections
│   │   ├── skills/page.tsx
│   │   ├── career/page.tsx
│   │   ├── education/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── playbook/page.tsx
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   └── api/
│       └── content/route.ts     # Serve JSON with caching headers
│
├── components/                  # React components (by feature)
│   ├── Navigation/
│   │   ├── Navbar.tsx
│   │   ├── NavToggle.tsx
│   │   └── Footer.tsx
│   ├── Hero/
│   │   ├── Hero.tsx
│   │   ├── HeroParallax.tsx
│   │   └── ValueProp.tsx
│   ├── Skills/
│   │   ├── SkillsFormation.tsx
│   │   ├── SkillCard.tsx
│   │   └── SkillsLoading.tsx
│   ├── Career/
│   │   ├── CareerJourney.tsx
│   │   ├── SVGPitch.tsx
│   │   ├── PlayerAnimation.tsx  # GSAP scroll-driven
│   │   ├── MilestoneCard.tsx
│   │   ├── TimelineToggle.tsx
│   │   ├── TimelineView.tsx
│   │   └── CareerLoading.tsx
│   ├── Education/
│   │   ├── EducationList.tsx
│   │   ├── EducationCard.tsx
│   │   └── EducationLoading.tsx
│   ├── Projects/
│   │   ├── ProjectGallery.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ProjectsLoading.tsx
│   ├── Playbook/
│   │   ├── PlaybookGrid.tsx
│   │   ├── PrincipleCategory.tsx
│   │   └── PlaybookLoading.tsx
│   ├── About/
│   │   ├── AboutSection.tsx
│   │   ├── Biography.tsx
│   │   └── SocialLinks.tsx
│   └── Common/
│       ├── LoadingState.tsx
│       ├── ErrorBoundary.tsx
│       ├── ThemeToggle.tsx
│       └── SEO.tsx
│
├── lib/                         # Utilities and helpers
│   ├── types/
│   │   └── portfolio.ts         # TypeScript interfaces for all JSON entities
│   ├── hooks/
│   │   ├── useContentLoader.ts
│   │   ├── useScrollAnimation.ts
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── animations.ts
│   │   ├── validation.ts
│   │   ├── performance.ts
│   │   └── constants.ts
│   └── scripts/
│       ├── migrate-content.ts   # Manual migration script
│       └── validate-json.ts
│
├── public/
│   ├── data/                    # JSON content (bundled)
│   │   ├── home.json
│   │   ├── skills.json
│   │   ├── experiences.json
│   │   ├── education.json
│   │   ├── projects.json
│   │   ├── playbook.json
│   │   ├── about.json
│   │   ├── social.json
│   │   ├── navbar.json
│   │   └── routes.json
│   └── images/
│       ├── hero.jpg
│       ├── skills/
│       ├── projects/
│       └── education/
│
├── tests/
│   ├── unit/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── components/
│   ├── integration/
│   │   ├── content-loading.test.ts
│   │   ├── navigation.test.tsx
│   │   └── error-handling.test.tsx
│   └── e2e/
│       ├── recruiter-flow.test.ts
│       ├── career-journey.test.ts
│       └── mobile-accessibility.test.ts
│
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── jest.config.js
└── package.json
```

**Structure Decision**: Next.js App Router with route groups for logical organization. Components co-located by feature. Utilities separated (types, hooks, helpers). Public data folder for JSON bundling. Tests mirror source structure.

## Design Decisions & Tradeoffs

| Decision | Rationale | Alternative Rejected |
|----------|-----------|----------------------|
| **JSON-driven content** | Separates data from code; enables updates without rebuilds | Database: too complex for v1 |
| **Skeleton screens** | Communicates progress; improves perceived performance | Spinner: less informative |
| **Client-side JSON loading** | No backend; static bundled files; faster load | Server-side: adds latency |
| **GSAP + ScrollTrigger** | Superior scroll-linked animations; better performance | Pure Framer Motion: less control |
| **SVG football pitch** | Scalable, responsive, accessible | Canvas: harder to make accessible |
| **Vercel deployment** | Automatic CI/CD; zero-config Next.js hosting | Manual servers: more ops |

## Complexity Tracking

**No violations to justify.** Constitution principles align perfectly with spec requirements. All design choices support KISS, test-first, atomic commits, and fixed tech stack.

## Phase Sequence

1. **Phase 0 (Research)**: No blocking unknowns; all technical decisions documented above. Can be omitted or minimal.
2. **Phase 1 (Design)**: Generate data-model.md, contracts/, quickstart.md
3. **Phase 2 (Tasks)**: `/speckit-tasks` generates tasks.md with atomic, dependency-ordered task list
4. **Phase 3 (Implementation)**: Developer work following tasks.md

---

**Plan generated by /speckit-plan on 2026-08-09**
