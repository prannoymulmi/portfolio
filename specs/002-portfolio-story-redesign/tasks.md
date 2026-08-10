---

description: "Task list for Story-Driven Portfolio Redesign"
---

# Tasks: Story-Driven Portfolio Redesign

**Input**: Design documents from `/specs/002-portfolio-story-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/legacy-redirects.md, quickstart.md

**Tests**: Included — the project constitution's Principle II (Test-First, NON-NEGOTIABLE) requires tests alongside every feature.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are exact and relative to the repo root

## Path Conventions

Single Next.js app — paths under `app/`, `components/`, `tests/`, and root config files, per `plan.md`'s Project Structure.

---

## Phase 1: Setup

**Purpose**: Nothing new to install — stack is fixed by the constitution and already present. This phase only confirms the workspace is ready.

- [X] T001 Run `npm run type-check` and `npm run lint` on the current `main` branch to confirm a clean baseline before changes begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared groundwork every user story's tasks build on top of — must land first.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add `async redirects()` to `next.config.ts` mapping the 7 legacy paths to story anchors per `specs/002-portfolio-story-redesign/contracts/legacy-redirects.md` (`/skills`→`/#skills`, `/career`→`/#career`, `/education`→`/#education`, `/projects`→`/#projects`, `/playbook`→`/#playbook`, `/about`→`/#about`, `/contact`→`/#contact`, all `permanent: true`)
- [X] T003 [P] Add a redirect test in `tests/integration/legacy-redirects.test.ts` asserting each of the 7 source paths in `next.config.ts` resolves to its documented destination anchor
- [X] T004 Remove `<Navbar />` from `app/layout.tsx` (keep `ContentProvider`, `ErrorBoundary`, the existing skip-link, and `<Footer />`)
- [X] T005 Delete the 7 now-redundant route folders: `app/(routes)/skills/`, `app/(routes)/career/`, `app/(routes)/education/`, `app/(routes)/projects/`, `app/(routes)/playbook/`, `app/(routes)/about/`, `app/(routes)/contact/`
- [X] T006 Update `app/sitemap.ts` to list only `/` (drop the removed standalone routes)
- [X] T007 [P] Update the existing `tests/integration/navigation.test.tsx` suite: remove assertions about `<Navbar />` sections/active-route styling that no longer apply once it's unmounted from the layout (keep or relocate any still-relevant external-link assertions to a Footer test) — replaced by `tests/unit/components/Footer.test.tsx` since Navbar is fully removed from the app

**Checkpoint**: Redirects work, nav bar is gone from the layout, and old route files no longer exist — user story implementation can now begin

---

## Phase 3: User Story 1 - Read the portfolio as one continuous story (Priority: P1) 🎯 MVP

**Goal**: A visitor can scroll through the owner's entire story (introduction → about → skills → career → education → projects → playbook → contact) on `/` in one continuous flow, with no navigation bar.

**Independent Test**: Load `/`, scroll top to bottom, and confirm every content category renders in order with no nav bar present, on both desktop and mobile widths.

### Tests for User Story 1

- [X] T008 [P] [US1] Integration test in `tests/integration/story-page.test.tsx` asserting `app/page.tsx` renders all 8 section landmarks (`#hero`/intro, `#about`, `#skills`, `#career`, `#education`, `#projects`, `#playbook`, `#contact`) in document order
- [X] T009 [P] [US1] Integration test in `tests/integration/story-page.test.tsx` asserting no element with the Navbar's nav-bar role/links renders on `/`

### Implementation for User Story 1

- [X] T010 [US1] Rewrite `app/page.tsx` to render `Hero`, `AboutSection`, `SkillsFormation`, `CareerJourneyLazy`, `EducationSection`, `ProjectGalleryLazy`, `PlaybookGrid`, and the existing Contact content, each wrapped in a `<section id="...">` per the `StorySection` order in `specs/002-portfolio-story-redesign/data-model.md`
- [X] T011 [US1] Update `app/layout.tsx`/`app/page.tsx` metadata so the single `/` page's title/description cover the full story (merge the per-page metadata previously on the removed route pages)
- [X] T012 [US1] Verify each reused section component renders correctly stacked (no duplicate `<main>`/heading-level conflicts) and adjust heading levels (`h1`/`h2`) in `app/page.tsx`'s section wrappers so the page has one logical heading outline — verified: Hero already owns the page's only `h1`, every other section already opens with `h2`, no changes needed

**Checkpoint**: User Story 1 is fully functional — the whole story reads top to bottom on `/` with no nav bar. This alone is shippable as the MVP.

---

## Phase 4: User Story 2 - Explore the interactive career journey within the story (Priority: P1)

**Goal**: The existing interactive Career Journey experience keeps working exactly as before, now embedded as a chapter inside the story, and is reachable without a nav bar.

**Independent Test**: Scroll to `#career` on `/` and interact with a milestone — behavior matches today's standalone `/career` page. Reach `#career` directly via the in-page jump control added in this phase, without any nav bar link.

### Tests for User Story 2

- [ ] T013 [P] [US2] Integration test in `tests/integration/career-in-story.test.tsx` asserting `CareerJourneyLazy`'s interactive milestone behavior (e.g., clicking a milestone updates the displayed detail) is unchanged when rendered inside `app/page.tsx`
- [ ] T014 [P] [US2] Unit test in `tests/unit/components/StoryProgressNav.test.tsx` asserting the jump control renders a link/button for every `StorySection` and that activating the "career" entry moves focus/scroll to `#career`

### Implementation for User Story 2

- [ ] T015 [US2] Create `components/Navigation/StoryProgressNav.tsx` — a Framer Motion `useScroll`/`useSpring`-driven progress indicator with keyboard-accessible anchor links to every `StorySection` id (per FR-007)
- [ ] T016 [US2] Mount `StoryProgressNav` in `app/layout.tsx` (or `app/page.tsx`) so it's present without reintroducing a page-to-page nav bar
- [ ] T017 [US2] Confirm `CareerJourneyLazy`'s GSAP ScrollTrigger instances (if any target page-level scroll) still initialize/clean up correctly nested inside the new single-page layout; adjust selectors in `components/Career/CareerJourney.tsx` if they assumed a standalone page

**Checkpoint**: User Stories 1 AND 2 both work — the story flows top to bottom and the career chapter stays fully interactive and directly reachable.

---

## Phase 5: User Story 3 - See a modern, on-brand first impression (Priority: P2)

**Goal**: The story opens with a modern gradient background and a clearly-intentional profile-picture placeholder, in both light and dark themes.

**Independent Test**: Load `/`, toggle light/dark mode, and confirm the gradient renders with readable contrast and a placeholder occupies the profile-picture slot when no real photo is configured.

### Tests for User Story 3

- [ ] T018 [P] [US3] Unit test in `tests/unit/components/AboutSection.test.tsx` asserting a placeholder graphic (not blank space) renders when `about.imageSource` is undefined, and the real image renders when it is set
- [ ] T019 [P] [US3] Unit test in `tests/unit/components/Hero.test.tsx` asserting the gradient background classes are present and the profile-picture placeholder renders in the introduction

### Implementation for User Story 3

- [ ] T020 [US3] Extend the `About` handling in `components/About/AboutSection.tsx` to render a generic placeholder (initials or silhouette) with descriptive `alt`/label text when `imageSource` is absent, instead of omitting the image block
- [ ] T021 [US3] Apply the extended gradient background (per `specs/002-portfolio-story-redesign/research.md` §3) to the story's outer wrapper in `app/page.tsx`/`components/Hero/Hero.tsx`, consistent in light and dark mode
- [ ] T022 [US3] Add the same profile-picture placeholder treatment to `components/Hero/Hero.tsx`'s introduction area, reusing the placeholder logic added in T020

**Checkpoint**: All three user stories work independently and together — this is the full feature.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, cleanup, and final validation across all stories.

- [ ] T023 [P] Verify `prefers-reduced-motion` disables/minimizes `StoryProgressNav` scroll animation and the gradient's any transition effects, across `components/Navigation/StoryProgressNav.tsx` and `components/Hero/Hero.tsx`
- [ ] T024 [P] Update `components/Navigation/Footer.tsx`'s "Quick Links" (`/projects`, `/skills`, `/career`) to point at the in-page anchors (`/#projects`, `/#skills`, `/#career`) instead of the removed standalone routes
- [ ] T025 Remove now-unused `components/Navigation/Navbar.tsx` and `components/Navigation/NavToggle.tsx` (and their `navbar.json` content wiring) once nothing references them, or confirm via grep that they're fully unreferenced
- [ ] T026 Run `npm run type-check`, `npm run lint`, and `npm test` and fix any failures
- [ ] T027 Walk through every scenario in `specs/002-portfolio-story-redesign/quickstart.md` manually and confirm each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational; builds on the `app/page.tsx` structure from US1 (needs the `#career` section to exist) but its own tests/components are additive
- **User Story 3 (Phase 5)**: Depends on Foundational; touches the same `app/page.tsx`/`Hero.tsx` files as US1, so should follow US1 to avoid merge churn, though its placeholder/gradient logic is otherwise independent
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each User Story

- Tests are written first and must fail before their corresponding implementation task
- `app/page.tsx` assembly (US1) precedes the career-specific and gradient/placeholder refinements (US2, US3) that render inside it

### Parallel Opportunities

- T003 and T007 (Phase 2) can run in parallel with each other, but after T002/T004/T005/T006 respectively
- T008 and T009 (US1 tests) can run in parallel
- T013 and T014 (US2 tests) can run in parallel
- T018 and T019 (US3 tests) can run in parallel
- T023 and T024 (Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch both US1 tests together (write first, confirm they fail):
Task: "Integration test asserting all 8 section landmarks render in order in tests/integration/story-page.test.tsx"
Task: "Integration test asserting no nav bar renders on / in tests/integration/story-page.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (redirects + nav bar removal + old route deletion)
3. Complete Phase 3: User Story 1 (single scrolling story assembled)
4. **STOP and VALIDATE**: Scroll `/` top to bottom, confirm all sections present and no nav bar
5. Deploy/demo if ready — this alone satisfies "story, not clicking through navigation"

### Incremental Delivery

1. Setup + Foundational → redirects and nav-bar-free layout ready
2. Add User Story 1 → full story renders → validate → deploy (MVP)
3. Add User Story 2 → career chapter interactive + in-page jump control → validate → deploy
4. Add User Story 3 → gradient + profile placeholder → validate → deploy
5. Polish → accessibility, footer links, dead-code removal, full quickstart pass

---

## Notes

- [P] tasks touch different files with no unmet dependencies
- Commit after each task or small logical group, per the constitution's Atomic Commits principle — small, self-contained, `what` + `why` in the message
- Kill any GSAP ScrollTrigger instances on unmount (constitution requirement) when touching `components/Career/CareerJourney.tsx` in T017
- Stop at any checkpoint to validate a story independently before moving on
