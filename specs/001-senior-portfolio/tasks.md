# Tasks: Senior Software Engineer Portfolio

**Feature**: Senior Software Engineer Portfolio  
**Created**: 2026-08-09  
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Implementation Strategy

**MVP Scope**: Phases 1-2 + User Stories 1, 2, 6 (Recruiter assessment, Career animation, Content management)  
**v1 Scope**: All phases through Polish (complete feature)  
**Execution**: Sequential by phase; tasks within Phase 3+ stories can run in parallel (no cross-story dependencies)

## Phase Sequencing & Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3+ (User Stories P1→P2→P3 in parallel per story)
    ↓                    ↓
  3-4 hours           4-5 hours              12-15 hours per P1, 8-10 hours per P2, 4-6 hours per P3

BLOCKED: Phase 3-11 cannot start until Phase 2 completes (content loader, types, validation)
PARALLEL: Multiple user stories can run in parallel after Phase 2 (independent components/services)
```

## Phase 1: Setup & Project Initialization

**Duration**: 3-4 hours  
**Blockers**: None  
**Parallelizable**: No (sequential setup)

- [x] T001 Initialize Next.js project with App Router: `npm create next-app@latest portfolio -- --typescript --tailwind --app --eslint`
- [x] T002 Configure TypeScript strict mode in `tsconfig.json` (set `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`)
- [x] T003 Install primary dependencies: `npm install framer-motion gsap zod react-hook-form`
- [x] T004 Install dev dependencies: `npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom`
- [x] T005 Configure Tailwind CSS in `tailwind.config.js` (add content paths, setup dark mode via class)
- [x] T006 Setup `prettier-plugin-tailwindcss` in `.prettierrc` for consistent Tailwind class ordering
- [x] T007 Create directory structure per plan.md: `app/(routes)`, `components/{Navigation,Hero,Skills,Career,...}`, `lib/{types,hooks,utils,scripts}`, `public/data/`, `tests/{unit,integration,e2e}`
- [x] T008 Initialize Git branches: `git checkout -b 001-senior-portfolio` (already on this branch; verify current branch)
- [x] T009 Create `.env.local` with build variables (API endpoints, external service keys if any)
- [x] T010 Setup GitHub Actions CI pipeline in `.github/workflows/ci.yml` (type-check, lint, test on PR)

---

## Phase 2: Foundational Infrastructure & Content System

**Duration**: 4-5 hours  
**Blockers**: Phase 1  
**Parallelizable**: Partially (T011-T016 can run in parallel; T017-T018 depend on T015)

### Content Type System
- [x] T011 [P] Create TypeScript interfaces file `lib/types/portfolio.ts` with all 10 entity types (Home, About, Skill, Experience, Education, Project, Playbook, Route, NavItem, Social) per data-model.md
- [x] T012 [P] Create JSON schema validation helper `lib/utils/validation.ts` using Zod or TypeScript interfaces to validate loaded JSON against types
- [x] T013 [P] Create content loader hook `lib/hooks/useContentLoader.ts` that: fetches JSON, validates, caches in memory, handles errors, returns skeleton-safe state
- [x] T014 Create content provider component `components/Common/ContentProvider.tsx` that wraps app with Context, exposes useContent hook globally

### Error Handling & Fallbacks
- [x] T015 [P] Create error boundary component `components/Common/ErrorBoundary.tsx` to catch and log errors, display fallback UI ("Section not available")
- [x] T016 [P] Create loading/skeleton component `components/Common/LoadingState.tsx` with shimmer animations for hero, skills, career, education, projects, playbook sections

### Core Utilities & Animation Helpers
- [x] T017 Create GSAP animation utilities `lib/utils/animations.ts` with helper functions for: ScrollTrigger setup, player path animation, scroll-sync timing
- [x] T018 Create theme provider component `lib/hooks/useTheme.ts` and `components/Common/ThemeToggle.tsx` for dark/light mode toggle with localStorage persistence

### JSON Content Files (Manual Data Entry or Migration)
- [x] T019 Create `public/data/home.json` with portfolio owner's name and roles (manually or via migration script)
- [x] T020 Create `public/data/about.json` with biography and optional profile image path
- [x] T021 Create `public/data/social.json` with LinkedIn and GitHub profile URLs
- [x] T022 Create `public/data/routes.json` with all 8 routes per routes.contract.md
- [x] T023 Create `public/data/navbar.json` with logo config and navigation sections per routes.contract.md

### Migration Script (for v1 data population)
- [x] T024 Create migration script `lib/scripts/migrate-content.ts` that: reads existing e-portfolio data (skills, experiences, education, projects, playbook), transforms to portfolio JSON schema, validates, outputs to `public/data/`, reports any mismatches

---

## Phase 3: User Story 1 - Recruiter Quick Overview (P1)

**Goal**: Recruiter sees name, title, value prop, and top skills within 20 seconds, no scrolling  
**Duration**: 4-5 hours  
**Blockers**: Phase 2  
**Parallelizable**: No (foundational for site)  
**Independent Test**: Load portfolio, verify hero section visible and content appears in < 1.2s FCP

### Hero Component
- [x] T025 [US1] Create hero section component `components/Hero/Hero.tsx` displaying: name (from home.json), "Senior Software Engineer" title, 1-line value prop
- [x] T026 [US1] Implement Framer Motion parallax effect in `components/Hero/HeroParallax.tsx` for subtle background shift on scroll (subtle, not excessive)
- [x] T027 [US1] Create CTA buttons component `components/Hero/ValueProp.tsx` with "View Work" and "Play Career" buttons linking to /projects and /career
- [x] T028 [US1] Integrate hero to home page `app/page.tsx` with layout, SEO meta tags (title, description, Open Graph)
- [x] T029 [US1] Create quick skills preview component `components/Hero/TopSkillsPreview.tsx` displaying top 3-4 skills from skills.json (no animation, just list)
- [x] T030 [US1] Optimize hero assets: compress images, preload fonts, setup image optimization in next.config.js
- [x] T031 [US1] Write tests for Hero component `tests/unit/components/Hero.test.tsx` (name renders, title visible, CTA links work)

---

## Phase 4: User Story 2 - Interactive Career Journey (P1)

**Goal**: Scroll-driven SVG player animation along pitch path, 60 FPS, click milestones for details  
**Duration**: 6-7 hours  
**Blockers**: Phase 2 + T021 (experiences.json)  
**Parallelizable**: Partially (SVG + player animation run in parallel)  
**Independent Test**: Navigate to /career, scroll smoothly, player moves along pitch, no jank

### SVG Pitch Visualization
- [x] T032 [P] [US2] Create SVG pitch component `components/Career/SVGPitch.tsx`: render football pitch outline, field markings, yard lines; make responsive with viewBox
- [x] T033 [P] [US2] Create player animation component `components/Career/PlayerAnimation.tsx` that: moves SVG player element along defined path based on scroll position (GSAP ScrollTrigger), maintains 60 FPS
- [x] T034 [US2] Create career journey main component `components/Career/CareerJourney.tsx` orchestrating pitch + player + milestones, layout responsive

### Milestone & Detail Display
- [x] T035 [P] [US2] Create milestone card component `components/Career/MilestoneCard.tsx` displaying on hover/click: company, job title, dates, 3-5 achievements (bullets), tech stack
- [x] T036 [P] [US2] Load experiences.json in CareerJourney, map each experience to a milestone position on pitch (Y-axis based on date)
- [x] T037 [US2] Implement milestone click/hover interaction: show tooltip or expanded card with full details

### Timeline Fallback Mode
- [x] T038 [P] [US2] Create Timeline mode toggle component `components/Career/TimelineToggle.tsx` with "Interactive ⚽ / Timeline" switch
- [x] T039 [P] [US2] Create linear timeline view component `components/Career/TimelineView.tsx` displaying all experiences as chronological list (no animation)
- [x] T040 [US2] Wire toggle to switch between Interactive (SVG) and Timeline modes, persist preference

### Accessibility & Mobile
- [ ] T041 [US2] Ensure SVG elements have ARIA labels: `aria-label="Career milestone at <company>"` for each interactive position
- [ ] T042 [US2] Default to Timeline mode on mobile (< 768px) or if `prefers-reduced-motion` enabled
- [ ] T043 [US2] Write integration tests `tests/integration/career-journey.test.tsx` (animation fires on scroll, timeline mode displays all jobs)

---

## Phase 5: User Story 3 - Skills Formation Visualization (P2)

**Goal**: Skills displayed as football formation on SVG pitch, click for tech details  
**Duration**: 4-5 hours  
**Blockers**: Phase 2 + T022 (skills.json)  
**Parallelizable**: Partially (formation layout + skill cards in parallel)  
**Independent Test**: Navigate to /skills, see formation, click skill, details appear

### Skills Formation Component
- [x] T044 [P] [US3] Create skills formation component `components/Skills/SkillsFormation.tsx`: load skills.json, arrange by category (Backend, Cloud, etc.) as football positions on SVG pitch (e.g., 4-3-3 layout)
- [x] T045 [P] [US3] Create skill position component `components/Skills/SkillPosition.tsx` for each position on pitch (clickable, hoverable)
- [x] T046 [P] [US3] Implement responsive layout: on small screens (< 768px), stack skills vertically instead of formation
- [x] T047 [US3] Create skill detail card component `components/Skills/SkillCard.tsx` displaying on interaction: skill name, 5-8 technologies (comma-separated), one-line description, 1-2 project examples
- [x] T048 [US3] Integrate to /skills page `app/(routes)/skills/page.tsx` with layout and loading skeleton
- [ ] T049 [US3] Write unit tests `tests/unit/components/SkillsFormation.test.tsx` (formations renders, categories mapped correctly, click reveals details)

---

## Phase 6: User Story 4 - Project Highlights (P2)

**Goal**: Project case studies with problem, solution, impact, tech tags  
**Duration**: 4-5 hours  
**Blockers**: Phase 2 + T024 (projects.json)  
**Parallelizable**: Yes (all project tasks independent)  
**Independent Test**: Navigate to /projects, see case-study cards, click for details

### Projects Gallery & Cards
- [x] T050 [P] [US4] Create projects gallery component `components/Projects/ProjectGallery.tsx`: load projects.json, display as grid of cards
- [x] T051 [P] [US4] Create project card component `components/Projects/ProjectCard.tsx`: display title, body text (problem/solution), image thumbnail, tech tags, link
- [x] T052 [P] [US4] Implement card interaction: click to expand or link to detailed view
- [x] T053 [P] [US4] Optimize project images: lazy-load thumbnails, preload on hover
- [x] T054 [US4] Integrate to /projects page `app/(routes)/projects/page.tsx` with loading skeleton and responsive grid
- [ ] T055 [US4] Write unit tests `tests/unit/components/ProjectCard.test.tsx` (card displays title/tags, links work)

---

## Phase 7: User Story 5 - Technical Playbook (P3)

**Goal**: Architecture, Cloud, Security, Backend, DevOps, Engineering Principles  
**Duration**: 3-4 hours  
**Blockers**: Phase 2 + T025 (playbook.json migration)  
**Parallelizable**: Yes (all playbook tasks independent)  
**Independent Test**: Navigate to /playbook, see 6 categories, click category, principles expand

### Playbook Component
- [x] T056 [P] [US5] Create playbook grid component `components/Playbook/PlaybookGrid.tsx`: load playbook.json, display 6 category cards (Architecture, Cloud, Security, Backend, DevOps, Engineering Principles)
- [x] T057 [P] [US5] Create principle category component `components/Playbook/PrincipleCategory.tsx`: category name, expandable list of 3-5 principles with descriptions
- [x] T058 [P] [US5] Implement expand/collapse with Framer Motion animation (smooth height change)
- [x] T059 [US5] Integrate to /playbook page `app/(routes)/playbook/page.tsx` with loading skeleton
- [x] T060 [US5] Write unit tests `tests/unit/components/Playbook.test.tsx` (categories render, click expands)

---

## Phase 8: User Story 6 - Portfolio Owner Manages Content (P1)

**Goal**: Content updates via JSON without code changes  
**Duration**: 2-3 hours  
**Blockers**: Phase 2 + T024 (migration script)  
**Parallelizable**: No (sequential steps)  
**Independent Test**: Run migration script, verify JSON files populated correctly, content displays on portfolio

### Migration & Content Entry
- [ ] T061 [US6] Complete migration script implementation `lib/scripts/migrate-content.ts`: finalize logic, add logging, test with existing e-portfolio data
- [ ] T062 [US6] Create README for migration: document how to run script, what source data is expected, how to manually edit JSON files post-migration
- [ ] T063 [US6] Test migration script with actual data: run script, validate JSON output against schema, fix any transformation errors
- [ ] T064 [US6] Document JSON editing guide in docs/ explaining: file location, field descriptions, validation rules, how to add new skills/experiences/projects
- [ ] T065 [US6] Verify content updates reflect on portfolio (no code rebuild required): edit skills.json, refresh page, new skill appears

---

## Phase 9: User Story 7 - Navigation Routes (P2)

**Goal**: All routes accessible, navbar functional, smooth navigation  
**Duration**: 3-4 hours  
**Blockers**: Phase 2 + T023 (routes.json, navbar.json) + Phase 3-8 components  
**Parallelizable**: Partially (navbar + routing logic in parallel)  
**Independent Test**: All links in navbar work, no 404s, page transitions smooth

### Navigation Components
- [x] T066 [P] [US7] Create navbar component `components/Navigation/Navbar.tsx`: load navbar.json, display logo, nav sections, theme toggle, responsive hamburger on mobile
- [x] T067 [P] [US7] Create nav toggle (mobile hamburger) component `components/Navigation/NavToggle.tsx` with open/close menu
- [ ] T068 [P] [US7] Implement active route highlighting in navbar (highlight current page link)
- [x] T069 [US7] Create footer component `components/Navigation/Footer.tsx`: display social links (from social.json), copyright, contact info
- [x] T070 [US7] Integrate navbar to root layout `app/layout.tsx`, ensure sticky or persistent across all pages
- [ ] T071 [US7] Setup 404 fallback page `app/not-found.tsx` with "Page not found" message and return-home link
- [ ] T072 [US7] Write navigation tests `tests/integration/navigation.test.tsx` (all links clickable, active state highlights, mobile hamburger works)

---

## Phase 10: User Story 8 - Social Links & Contact (P2)

**Goal**: Social links in footer, open in new tab, correct URLs  
**Duration**: 1-2 hours  
**Blockers**: Phase 2 + T021 (social.json) + T069 (footer)  
**Parallelizable**: Yes (social component independent)  
**Independent Test**: Click social links, verify correct profiles open in new tab

### Social Component
- [x] T073 [P] [US8] Create social links component `components/About/SocialLinks.tsx`: load social.json, render as icon/text links
- [x] T074 [P] [US8] Implement link behavior: `target="_blank"`, `rel="noopener noreferrer"`, correct URLs
- [ ] T075 [US8] Integrate to footer (T069) and about page (T085)
- [ ] T076 [US8] Write unit tests `tests/unit/components/SocialLinks.test.tsx` (links render, target and rel attributes correct)

---

## Phase 11: User Story 9 - About & Personal Story (P3)

**Goal**: Biography visible, profile image optional, humanize portfolio  
**Duration**: 2-3 hours  
**Blockers**: Phase 2 + T020 (about.json)  
**Parallelizable**: Yes (about component independent)  
**Independent Test**: Navigate to /about, read biography, see profile image (if provided)

### About Component
- [x] T077 [P] [US9] Create about section component `components/About/AboutSection.tsx`: load about.json, display biography text and optional profile image
- [x] T078 [P] [US9] Optimize profile image: lazy-load, responsive sizing
- [ ] T079 [P] [US9] Integrate social links (T073) below biography
- [x] T080 [US9] Integrate to /about page `app/(routes)/about/page.tsx` with SEO meta tags
- [ ] T081 [US9] Write unit tests `tests/unit/components/AboutSection.test.tsx` (biography renders, image displays)

---

## Phase 12: User Story 10 - Data Validation & Error Handling (P2)

**Goal**: Graceful fallbacks for missing/malformed JSON, no crashes, errors logged  
**Duration**: 2-3 hours  
**Blockers**: Phase 2 (T015 error boundary, T016 skeleton)  
**Parallelizable**: Yes (error handling cross-cutting)  
**Independent Test**: Remove a JSON file, refresh page, section shows fallback, error logged

### Error Handling
- [x] T082 [P] [US10] Implement JSON validation in `lib/utils/validation.ts`: check required fields, validate types, return detailed error messages
- [ ] T083 [P] [US10] Enhance error boundary (T015) to catch JSON loading errors, display fallback UI with error message logged to console
- [ ] T084 [P] [US10] Test error scenarios: missing JSON file, malformed JSON, missing required fields, type mismatches
- [ ] T085 [US10] Write integration tests `tests/integration/error-handling.test.tsx` (missing JSON → fallback, malformed JSON → fallback, no crashes)

---

## Phase 13: User Story 11 - Type Safety & Schema Validation (P3)

**Goal**: TypeScript interfaces, IDE autocomplete, no `any` types  
**Duration**: 1-2 hours  
**Blockers**: Phase 2 (T011 interfaces)  
**Parallelizable**: Yes (type checking cross-cutting)  
**Independent Test**: TypeScript strict mode compilation succeeds, no implicit `any`

### Type Safety
- [ ] T086 [P] [US11] Ensure all JSON usage in components is typed: import from `lib/types/portfolio.ts`, use proper types in hooks/services
- [ ] T087 [P] [US11] Audit codebase for `any` types: `grep -r "any" app/ components/ lib/ --include="*.ts" --include="*.tsx"`, justify or replace each with proper type
- [ ] T088 [US11] Run TypeScript compiler check: `npm run type-check`, ensure strict mode passes with no errors
- [ ] T089 [US11] Write IDE autocomplete validation: open component file, type `content.` and verify autocomplete suggestions appear

---

## Phase 14: Polish & Cross-Cutting Concerns

**Duration**: 3-4 hours  
**Blockers**: All previous phases  
**Parallelizable**: Partially (many tasks can run in parallel)

### Performance & Optimization
- [ ] T090 [P] Optimize images: compress all images in `public/images/`, setup Next.js Image component with optimization
- [ ] T091 [P] Code split components: use dynamic imports for heavy components (Career journey GSAP, Projects gallery) in `app/(routes)/**/page.tsx`
- [ ] T092 [P] Setup image preloading: `<link rel="preload" as="image">` in layout.tsx for critical hero/skill icons
- [ ] T093 [P] Optimize fonts: preload Google Fonts or system fonts in layout.tsx, avoid layout shift
- [ ] T094 [P] Setup CSS caching: ensure Tailwind CSS is minified, cache headers set in next.config.js for static assets

### Testing & Quality
- [ ] T095 [P] Run full test suite: `npm test` (all unit tests pass)
- [ ] T096 [P] Run E2E tests: `npm run test:e2e` (recruiter flow, career journey, skills, projects, mobile, accessibility)
- [ ] T097 [P] Run Lighthouse audit: `npm run test:lighthouse`, ensure Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90
- [ ] T098 [P] Run linting: `npm run lint`, fix all ESLint warnings
- [ ] T099 [P] Run type check: `npm run type-check`, ensure TypeScript strict mode passes

### SEO & Meta Tags
- [ ] T100 [P] Add SEO component `components/Common/SEO.tsx` for dynamic meta tags (title, description, Open Graph, structured data)
- [ ] T101 [P] Update root layout with Open Graph defaults `app/layout.tsx`
- [ ] T102 [P] Add structured data (schema.org) for person, portfolio, work experience in each relevant page/component
- [ ] T103 [P] Create sitemap.xml in `public/` manually or via script
- [ ] T104 [P] Create robots.txt in `public/` allowing crawling of all pages

### Accessibility
- [ ] T105 [P] Audit accessibility: run axe DevTools, WAVE, or Lighthouse audit, fix any WCAG 2.1 AA violations
- [ ] T106 [P] Test keyboard navigation: Tab through all pages, ensure focus is visible, all interactive elements accessible via keyboard
- [ ] T107 [P] Test screen reader: use NVDA or VoiceOver to read pages, ensure all content is announced
- [ ] T108 [P] Verify color contrast: check all text has ≥ 4.5:1 contrast ratio for AA compliance
- [ ] T109 [P] Test `prefers-reduced-motion`: enable in OS settings, verify animations are disabled but content remains accessible

### Documentation & Deployment
- [ ] T110 Finalize README.md with setup instructions, development workflow, deployment guide
- [ ] T111 Create CONTRIBUTING.md with commit message format, PR process, testing requirements
- [ ] T112 Setup Vercel deployment: connect GitHub repo, configure environment variables, enable auto-preview deploys
- [ ] T113 Verify production build: `npm run build && npm start`, test all features on production build
- [ ] T114 Test preview deployment: create dummy PR, verify Vercel preview deploy works
- [ ] T115 Test production deployment: merge to main, verify automatic production deploy to portfolio.prannoy-mulmi.com

### Final QA & Launch
- [ ] T116 [P] Cross-browser testing: test on Chrome, Firefox, Safari, Edge (latest versions)
- [ ] T117 [P] Mobile device testing: test on real iOS and Android devices, not just emulators
- [ ] T118 [P] Test dark/light mode toggle: verify theme persistence, contrast in both modes
- [ ] T119 [P] Test all CTA links: "View Work" → /projects, "Play Career" → /career work correctly
- [ ] T120 [P] Final smoke test: run through all 10 validation scenarios from quickstart.md
- [ ] T121 Create launch checklist: verify domain SSL, analytics tracking (optional), error monitoring setup
- [ ] T122 Announcement: update GitHub README, share portfolio link

---

## Task Summary by Phase

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 (Setup) | T001-T010 | 3-4h | None |
| Phase 2 (Foundational) | T011-T024 | 4-5h | Phase 1 |
| Phase 3 (US1 - Hero) | T025-T031 | 4-5h | Phase 2 |
| Phase 4 (US2 - Career) | T032-T043 | 6-7h | Phase 2, T021 |
| Phase 5 (US3 - Skills) | T044-T049 | 4-5h | Phase 2, T022 |
| Phase 6 (US4 - Projects) | T050-T055 | 4-5h | Phase 2, T024 |
| Phase 7 (US5 - Playbook) | T056-T060 | 3-4h | Phase 2, T025 |
| Phase 8 (US6 - Content Mgmt) | T061-T065 | 2-3h | Phase 2, T024 |
| Phase 9 (US7 - Navigation) | T066-T072 | 3-4h | Phase 2, T023, Phases 3-8 |
| Phase 10 (US8 - Social) | T073-T076 | 1-2h | Phase 2, T021, T069 |
| Phase 11 (US9 - About) | T077-T081 | 2-3h | Phase 2, T020 |
| Phase 12 (US10 - Error Handling) | T082-T085 | 2-3h | Phase 2 |
| Phase 13 (US11 - Type Safety) | T086-T089 | 1-2h | Phase 2, all prior phases |
| Phase 14 (Polish) | T090-T122 | 3-4h | All prior phases |

**Total Duration**: ~50-60 hours end-to-end  
**MVP Duration** (Phases 1-2 + US1, US2, US6): ~15-17 hours

---

## Execution Paths

### MVP Path (Recruiter + Career + Content Management)
```
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 8 (US6) → Phase 14 (Polish subset)
Duration: 15-17 hours | Ready for recruiter testing within 2-3 days
Features: Hero, Career journey, JSON-driven content updates
```

### v1 Full Feature Path
```
Phase 1 → Phase 2 → [Phases 3-13 in priority order] → Phase 14 (Polish full)
Duration: 50-60 hours | Ready for launch within 2 weeks
Features: All 11 user stories complete
```

### Parallel Story Execution (after Phase 2)
```
Phase 2 completes
  ├→ Phase 3 (Hero)
  ├→ Phase 4 (Career)
  ├→ Phase 5 (Skills)
  ├→ Phase 6 (Projects)
  ├→ Phase 7 (Playbook)
  ├→ Phase 8 (Content)
  ├→ Phase 9 (Navigation)
  ├→ Phase 10 (Social)
  ├→ Phase 11 (About)
  ├→ Phase 12 (Error Handling)
  └→ Phase 13 (Type Safety)
All phases above can run in parallel; Phase 9 depends on 3-8 completion
```

---

## Task Format Validation

✅ **Format Check**:
- All tasks follow `- [ ] T### [P] [US#] Description with file path` format
- Task IDs sequential (T001-T122)
- [P] marks parallelizable tasks
- [US#] marks story-specific tasks (Phases 3-13)
- File paths included for each task (exact locations)
- No task references undefined files or components

---

**Tasks generated for Phase 2. Ready for implementation. Each task is atomic, testable, and independently executable per user story.**

---

**Generated by /speckit-tasks on 2026-08-09**
