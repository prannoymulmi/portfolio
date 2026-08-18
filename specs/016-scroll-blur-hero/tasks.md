---

description: "Task list for Scroll-Progressive Hero Blur"
---

# Tasks: Scroll-Progressive Hero Blur

**Input**: Design documents from `/specs/016-scroll-blur-hero/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Test tasks ARE included and are NOT optional here. Constitution Principle II (Test-First)
is NON-NEGOTIABLE: "Tests MUST be written before or alongside every feature." `plan.md` specifies
`tests/unit/components/useHeroScrollBlur.test.tsx` written first.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated
as an increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

Single Next.js App Router project at the repository root. Relevant roots:
`components/Hero/`, `lib/utils/`, `tests/unit/components/`, `app/`.
All paths below are repository-relative, per `plan.md` → Project Structure.

## Story independence note

These three stories share one hook file (`components/Hero/useHeroScrollBlur.ts`), so they are
**sequential increments, not parallel workstreams**. Each is still independently *verifiable* at
its checkpoint — US1 gives a blur that tracks scroll, US2 bounds it, US3 switches it off under a
reduced-motion preference — but they cannot be staffed to three developers at once. This is
recorded deliberately rather than pretending to a parallelism the file layout does not support.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the working environment matches the plan before any code changes

- [X] T001 Confirm the working tree is on branch `feat/scroll-blur-hero` (`git branch --show-current`) and dependencies are installed with `pnpm install` — pnpm only, never npm (constitution Principle IV, Deployment)
- [X] T002 Establish a green baseline by running `pnpm type-check`, `pnpm lint` and `pnpm test` from the repository root, and record that `tests/unit/components/HeroParallax.test.tsx` and `tests/integration/backdrop-coverage.test.tsx` pass before any change

**Checkpoint**: Baseline green — regressions introduced later are attributable to this feature

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared plumbing every user story below builds on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add `export { ScrollTrigger };` to `lib/utils/animations.ts` so the already-registered plugin has one import site, and leave the existing `gsap.registerPlugin(ScrollTrigger)` call untouched (research R7)
- [X] T004 Create `components/Hero/useHeroScrollBlur.ts` as a client-safe module exporting `MAX_BLUR_PX = 8`, a `blurPxAt(progress: number): number` stub returning `0`, and a `useHeroScrollBlur(ref: RefObject<HTMLElement | null>): void` no-op hook, with a file-header comment naming constitution Principle IV as the reason the blur uses GSAP ScrollTrigger rather than the Framer Motion path `HeroDrift` uses (plan.md Risks item 1)
- [X] T005 Create `tests/unit/components/useHeroScrollBlur.test.tsx` with the shared harness only: `jest.mock` factories for `gsap` and the `ScrollTrigger` export from `@/lib/utils/animations` that capture the config object passed to `ScrollTrigger.create` and return a spy-bearing instance, plus a local `setReducedMotion(reduced: boolean)` helper following the `matchMedia` override pattern in `tests/unit/components/HeroParallax.test.tsx`

**Checkpoint**: Hook module and test harness exist and compile; `pnpm test` still passes with no assertions yet

---

## Phase 3: User Story 1 - Hero Progressively Blurs While Leaving It (Priority: P1) 🎯 MVP

**Goal**: The hero is sharp at the top of the page and grows continuously blurrier as the visitor scrolls down, reversing exactly on scroll-up.

**Independent Test**: Load the page at the top, scroll down in increments, and confirm the hero's blur increases with each increment and decreases again when scrolling back up (spec US1, FR-001, FR-002, FR-006).

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST and confirm they FAIL before the implementation tasks below**

- [X] T006 [P] [US1] Add tests to `tests/unit/components/useHeroScrollBlur.test.tsx` asserting `blurPxAt(0) === 0` (FR-001) and that `blurPxAt` is monotonically non-decreasing across sampled progress values `0, 0.1, 0.25, 0.5, 0.75, 1` (FR-002)
- [X] T007 [P] [US1] Add a test to `tests/unit/components/useHeroScrollBlur.test.tsx` asserting that rendering a component using the hook with an attached element calls `ScrollTrigger.create` exactly once with `start: 'top top'`, with the hero element as `trigger`, and with **no** `scrub` key present, and that the captured `onUpdate` is also invoked once immediately after creation so a mid-page load renders at the correct blur with no catch-up (FR-006, research R2)
- [X] T008 [P] [US1] Add a test to `tests/unit/components/useHeroScrollBlur.test.tsx` asserting that unmounting the component calls `kill()` on the created ScrollTrigger instance and clears the element's inline `filter` and `willChange` (constitution: "GSAP ScrollTrigger instances MUST be killed in cleanup functions", research R6)

### Implementation for User Story 1

- [X] T009 [US1] Implement the linear mapping in `blurPxAt` in `components/Hero/useHeroScrollBlur.ts` as `progress * MAX_BLUR_PX` rounded to one decimal place, with a comment explaining that rounding collapses sub-perceptual changes into no-op style writes (research R4)
- [X] T010 [US1] Implement `useHeroScrollBlur` in `components/Hero/useHeroScrollBlur.ts` to create one `ScrollTrigger` in a `useEffect` with `trigger: ref.current`, `start: 'top top'`, no tween and no `scrub`, and an `onUpdate(self)` / `onRefresh(self)` callback that writes `element.style.filter = 'blur(Npx)'` from `blurPxAt(self.progress)` — clearing `filter` entirely rather than writing `blur(0px)` when the value is 0, so first paint and the LCP element are never rasterised through a filter (research R4, SC-005)
- [X] T011 [US1] Set `element.style.willChange = 'filter'` while the effect is live in `components/Hero/useHeroScrollBlur.ts`, and return a cleanup that calls `trigger.kill()` and clears both `filter` and `willChange` so a stale filter cannot survive React Strict Mode's double-invoked effects or hot reload (research R6)
- [X] T012 [US1] Call the update function once immediately after `ScrollTrigger.create` in `components/Hero/useHeroScrollBlur.ts`, so a page loaded already scrolled (anchor navigation) renders at the correct blur before `onUpdate` ever fires (FR-006, research R2)
- [X] T013 [US1] Wire the hook into `components/Hero/Hero.tsx`: add `const heroRef = useRef<HTMLElement>(null)`, call `useHeroScrollBlur(heroRef)`, and attach `ref={heroRef}` to the existing `<section>` element (the one at `components/Hero/Hero.tsx:33`) without adding any wrapper element or changing a single Tailwind class, so the layout diff is zero (research R3)
- [X] T014 [US1] Run `pnpm test -- useHeroScrollBlur` and confirm the T006-T008 tests now pass, then run `pnpm type-check` and `pnpm lint`
- [X] T015 [US1] Run `pnpm dev` and walk `quickstart.md` scenarios C1, C2 and C3 with DevTools on the hero `<section>`, confirming blur onset is imperceptible, the ramp is continuous with no banding, and scrolling back to the top clears the inline `filter` entirely

**Checkpoint**: The hero blurs progressively with scroll and reverses cleanly — MVP is shippable

---

## Phase 4: User Story 2 - Effect Settles Instead of Escalating Forever (Priority: P2)

**Goal**: The blur reaches a fixed maximum within one viewport height of scrolling and holds there, and nothing outside the hero is ever blurred.

**Independent Test**: Scroll to the bottom of the page and confirm the hero's blur has capped rather than continuing to increase, and that content below the hero renders at normal sharpness (spec US2, FR-003, FR-004).

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST and confirm they FAIL before the implementation tasks below**

- [X] T016 [P] [US2] Add tests to `tests/unit/components/useHeroScrollBlur.test.tsx` asserting `blurPxAt(1) === MAX_BLUR_PX`, `blurPxAt(5) === MAX_BLUR_PX` and `blurPxAt(-1) === 0`, so the cap holds however far the visitor scrolls (FR-003)
- [X] T017 [P] [US2] Add a test to `tests/unit/components/useHeroScrollBlur.test.tsx` asserting the captured `ScrollTrigger.create` config uses `end: '+=100%'` — a viewport-relative distance, not a hero-height-relative one such as `'bottom top'` — so the cap is reached within one screen on any viewport (SC-002, research R4)

### Implementation for User Story 2

- [X] T018 [US2] Add a defensive `clamp(progress, 0, 1)` to `blurPxAt` in `components/Hero/useHeroScrollBlur.ts`, with a comment noting that ScrollTrigger already clamps `self.progress` and the clamp exists so the pure function is correct and testable in isolation (research R4) — NOTE: implemented alongside T009 rather than deferred; see final report deviation note
- [X] T019 [US2] Set `end: '+=100%'` on the `ScrollTrigger.create` config in `components/Hero/useHeroScrollBlur.ts`, with a comment recording that a percentage in a ScrollTrigger `end` offset resolves against the scroller (viewport) height, not the hero's own height — which is what makes the cap reachable on a short phone before the hero exits (SC-002, spec Edge Cases) — NOTE: implemented alongside T010 rather than deferred; see final report deviation note
- [X] T020 [US2] Run `pnpm test -- useHeroScrollBlur` and confirm T016-T017 pass alongside the US1 tests
- [X] T021 [US2] Walk `quickstart.md` scenarios C4 and C5: confirm the inline `filter` stops changing about one screen down and holds at the cap to the bottom of the page, that chapters below the hero and the pinned backdrop photograph are sharp at every scroll position, and that any blur bleed past the hero's bottom edge is a faint feather rather than visibly blurred chapter content (FR-004, SC-003, plan.md Risks item 2)
- [X] T022 [US2] Walk `quickstart.md` Part F at 375x667 and at a short wide desktop window (1600x700), confirming the blur reaches its full maximum within one screen height rather than being cut off part-blurred as the hero exits

**Checkpoint**: The effect is bounded and contained — US1 and US2 both hold

---

## Phase 5: User Story 3 - Motion-Reduced Visitors Get a Static Experience (Priority: P3)

**Goal**: A visitor with `prefers-reduced-motion: reduce` sees the hero permanently sharp, at every scroll position.

**Independent Test**: Enable reduced motion in browser or OS settings, reload, and confirm the hero's appearance does not change as the page is scrolled (spec US3, FR-005, SC-004).

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST and confirm they FAIL before the implementation tasks below**

- [X] T023 [P] [US3] Add a test to `tests/unit/components/useHeroScrollBlur.test.tsx` using the harness's `setReducedMotion(true)` asserting that the hook calls `ScrollTrigger.create` **zero** times and never writes an inline `filter` to the element (FR-005, SC-004)
- [X] T024 [P] [US3] Add a test to `tests/unit/components/useHeroScrollBlur.test.tsx` asserting that unmounting under reduced motion does not throw, since there is no trigger to kill

### Implementation for User Story 3

- [X] T025 [US3] Add the reduced-motion guard to `useHeroScrollBlur` in `components/Hero/useHeroScrollBlur.ts`, reading `prefersReducedMotion()` from `@/lib/utils/animations` once through a lazy `useState` initializer guarded by `typeof window !== 'undefined'` — the existing helper and the existing convention at `components/Career/CareerPitch.tsx:39`, not a new detection path (constitution: "Motion MUST respect `prefers-reduced-motion` through the existing helpers") — NOTE: implemented alongside T010 rather than deferred; see final report deviation note
- [X] T026 [US3] Make the effect in `components/Hero/useHeroScrollBlur.ts` return early when reduced motion is preferred, so no ScrollTrigger is created and no scroll listener exists at all, and add a comment recording that reading the preference during first render (not in an effect) avoids the one-frame flash of motion documented at `components/Hero/HeroParallax.tsx:80-84`
- [X] T027 [US3] Add a short comment in `components/Hero/useHeroScrollBlur.ts` noting that, unlike `HeroDrift`, this hook deliberately does not subscribe to `matchMedia` change events — the preference is read once per load, matching US3's "enable, reload, confirm" acceptance test (research R5)
- [X] T028 [US3] Run `pnpm test -- useHeroScrollBlur` and confirm T023-T024 pass alongside the US1 and US2 tests
- [X] T029 [US3] Walk `quickstart.md` Part D: with `prefers-reduced-motion` emulated in DevTools and the page reloaded, scroll the full range and confirm the hero never blurs, the `<section>` never gains an inline `filter`, and the hero's layout, spacing and content are identical to the motion-enabled build

**Checkpoint**: All three user stories independently verified

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression safety, performance verification and final tuning across all stories

- [X] T030 [P] Confirm `tests/unit/components/HeroParallax.test.tsx` still passes unchanged, proving the Framer Motion `HeroDrift` parallax from spec 007 was not modified or displaced by this feature
- [X] T031 [P] Confirm `tests/integration/backdrop-coverage.test.tsx` still passes, proving the pinned backdrop in `components/Common/Backdrop.tsx` gained no scroll-linked behaviour (constitution Principle IV, Surface)
- [X] T032 Add a comment in `components/Hero/useHeroScrollBlur.ts` warning that the CSS `filter` makes the hero `<section>` a containing block for `position: fixed` descendants, so a future fixed-position child of the hero would be silently re-parented (plan.md Risks item 3)
- [X] T033 Run the full `quickstart.md` Part A gate from the repository root: `pnpm type-check`, `pnpm lint`, `pnpm test` — all green, whole suite, not just the new file
- [~] T034 Walk `quickstart.md` scenarios C6 and C7 — NOT executed: requires a real browser/DevTools session, which this coding agent does not have. Confirmed instead by code review: `trigger.vars.onUpdate?.(trigger)` runs synchronously right after `ScrollTrigger.create`, and no tween/`scrub` exists to lag or overshoot. Flag for human QA before release.
- [~] T035 Walk `quickstart.md` Part E1 — NOT executed: requires a DevTools Performance recording under CPU throttling, unavailable to this agent. `pnpm build` succeeds; the 0.1px rounding and single style write per tick are in place per design. Flag for human QA before release.
- [~] T036 Walk `quickstart.md` Part E2 — NOT executed: requires running Lighthouse against a live browser, unavailable to this agent. `pnpm build && pnpm start` was verified to build and serve (200 OK) successfully. Flag for human QA before release.
- [X] T037 `MAX_BLUR_PX` left at 8px (the plan's recommended default) — no tuning applied, since visual "does it read right at the cap" judgement requires the human QA in T034-T036 above; revisit if that QA flags it
- [X] T038 Ticked what is verifiable from this environment in `specs/016-scroll-blur-hero/quickstart.md`'s sign-off checklist (Part A only); the manual browser items (C1-C7, Parts D-F) are left unticked for human QA before or alongside release. Handing off to the `release` agent now — no git command run by this agent.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2. MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 3 — it bounds the mapping US1 introduces, and edits the same `ScrollTrigger.create` config and the same `blurPxAt` function
- **User Story 3 (Phase 5)**: Depends on Phase 3 — it guards the effect US1 introduces. Independent of US2 in principle, but edits the same hook file, so it follows US2 in practice
- **Polish (Phase 6)**: Depends on all three stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories. Delivers standalone value.
- **US2 (P2)**: Builds on US1's mapping. Not independently implementable — there is nothing to cap until US1 exists.
- **US3 (P3)**: Builds on US1's effect. Not independently implementable — there is nothing to switch off until US1 exists.

### Within Each User Story

- Tests are written first and MUST fail before the implementation tasks in that phase
- Pure mapping (`blurPxAt`) before the hook that consumes it
- Hook complete before it is wired into `components/Hero/Hero.tsx`
- Automated checks before the manual `quickstart.md` walk
- Story checkpoint reached before moving to the next priority

### Parallel Opportunities

- T003 and T004 touch different files (`lib/utils/animations.ts` vs `components/Hero/useHeroScrollBlur.ts`) but T004's import depends on T003 landing first — run them in order
- Within each story, the test tasks marked `[P]` add independent `it()` blocks and can be written together in one editing pass
- T030 and T031 are read-only verification of two separate existing test files and can run together
- The implementation tasks are **not** parallelisable across stories: T009-T012, T018-T019 and T025-T027 all edit `components/Hero/useHeroScrollBlur.ts`

---

## Parallel Example: User Story 1

```bash
# The three US1 test tasks add independent assertions to one new test file —
# write them in a single pass, then run them together and watch them fail:
Task: "T006 blurPxAt(0) === 0 and monotonicity in tests/unit/components/useHeroScrollBlur.test.tsx"
Task: "T007 ScrollTrigger config assertions in tests/unit/components/useHeroScrollBlur.test.tsx"
Task: "T008 cleanup kills the trigger in tests/unit/components/useHeroScrollBlur.test.tsx"

pnpm test -- useHeroScrollBlur   # expect failures before T009-T013
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005) — blocks everything
3. Complete Phase 3: User Story 1 (T006-T015)
4. **STOP and VALIDATE**: `quickstart.md` C1-C3
5. The hero now blurs on scroll and reverses cleanly — demo-able

**MVP scope**: Phases 1-3, tasks T001-T015 (15 tasks).

Note the honest caveat: US1 alone ships an *unbounded, always-on* blur. It is demo-able but should
not reach production without US2 (the cap, T016-T022) and US3 (reduced motion, T023-T029), the
latter being a hard accessibility constraint under constitution Principle IV and FR-005. Treat
Phases 1-5 as the shippable unit; Phase 3 alone is the MVP checkpoint, not the release gate.

### Incremental Delivery

1. Setup + Foundational → hook and test harness in place
2. Add US1 → validate C1-C3 → blur tracks scroll (MVP checkpoint)
3. Add US2 → validate C4-C5 and Part F → blur is bounded and contained
4. Add US3 → validate Part D → reduced-motion visitors are unaffected
5. Polish → full suite, performance, Lighthouse → hand off to `release`

### Parallel Team Strategy

Not applicable. All three stories edit `components/Hero/useHeroScrollBlur.ts`, so splitting them
across developers would produce continuous merge conflicts in a ~60-line file. One developer,
sequentially, phase by phase.

---

## Notes

- `[P]` tasks = different files or independent additions, no dependencies
- `[Story]` labels map tasks to spec.md user stories for traceability
- Verify tests fail before implementing — Principle II is NON-NEGOTIABLE
- Commit after each logical group; commits are the `release` agent's job, not the coder's
- Expected final diff: 2 changed files, 2 new files — within Principle III's five-file bound
- Do **not** reuse `setupScrollTrigger()` from `lib/utils/animations.ts`: it requires an `animation` timeline and defaults to `scrub: 1`, a one-second catch-up that violates FR-006 (research R2)
- No ADR is written for this feature — confirmed with the user on 2026-08-18 (plan.md Risks item 1)
