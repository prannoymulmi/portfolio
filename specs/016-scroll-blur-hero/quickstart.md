# Quickstart: Validating the Scroll-Progressive Hero Blur

A runnable validation guide. Part A is automated; Parts B-E are the manual QA script that covers
the spec's acceptance scenarios, which jsdom cannot exercise because it has no layout or scroll.

Work through it in order — Part A must be green before the manual passes are worth running.

## Prerequisites

- Node with `pnpm` (pinned via `package.json`'s `packageManager` field — the constitution requires
  pnpm in every environment; do not use npm).
- Dependencies installed:

  ```bash
  pnpm install
  ```

- A Chromium-based browser and, ideally, one iOS Safari device or simulator for Part E.

## Part A — Automated checks

Run from the repository root:

```bash
pnpm type-check
pnpm lint
pnpm test
```

Expected:

- `type-check` and `lint` clean.
- All tests pass, including:
  - the new `tests/unit/components/useHeroScrollBlur.test.tsx`;
  - the existing `tests/unit/components/HeroParallax.test.tsx` (the Framer Motion drift must be
    untouched by this feature);
  - the existing `tests/integration/backdrop-coverage.test.tsx` (the pinned backdrop must still
    have no scroll-linked behaviour).

To focus just this feature:

```bash
pnpm test -- useHeroScrollBlur
```

The unit tests should establish, at minimum:

| Requirement | Assertion |
|---|---|
| FR-001 | `blurPxAt(0) === 0` |
| FR-002 | `blurPxAt` is monotonically non-decreasing across sampled progress values |
| FR-003 | `blurPxAt(1) === MAX_BLUR_PX` and `blurPxAt(5) === MAX_BLUR_PX` |
| FR-005 | with `matchMedia` reporting `prefers-reduced-motion: reduce`, the hook creates no ScrollTrigger and writes no `filter` |
| Constitution (cleanup) | the effect's cleanup calls `kill()` on the trigger it created |

## Part B — Start the app

```bash
pnpm dev
```

Open `http://localhost:3000` and scroll to the very top before each scenario below.

## Part C — Acceptance scenarios (motion enabled)

Keep DevTools open on the Elements panel with the hero `<section>` selected (the one inside
`<section id="hero">`), so you can watch its inline `filter` value change.

### C1 — US1 scenario 1: blur begins, imperceptibly (FR-001, FR-002)

1. At the top of the page, confirm the hero portrait and role bars are perfectly sharp, and that
   the selected `<section>` has **no** `filter` in its inline style.
2. Scroll down a small amount (roughly 5-10% of the screen height).
3. **Expected**: a `filter: blur(...)` appears with a sub-pixel-to-1px value; visually the hero is
   still essentially sharp — the onset is not abrupt.

### C2 — US1 scenario 2: continuous, not stepped (FR-002, SC-001)

1. Scroll down slowly and continuously through roughly one screen height.
2. **Expected**: the blur radius rises smoothly and the visual softening tracks your scroll with
   no perceptible jump, banding, or "snap" between levels.

### C3 — US1 scenario 3: reversible (FR-002)

1. From maximum blur, scroll back up to the top.
2. **Expected**: the blur decreases through the same values and returns to fully sharp at the
   very top, with the inline `filter` cleared again. There is no hysteresis — stopping at the same
   scroll position on the way up and on the way down gives the same blur.

### C4 — US2 scenario 1: the effect settles (FR-003, SC-002)

1. Scroll well past the hero, deep into the later chapters, then to the bottom of the page.
2. **Expected**: the inline `filter` stops changing once you are about one screen height down, and
   holds at the maximum (`blur(8px)` with the recommended default) for the rest of the page. It
   never keeps climbing.

### C5 — US2 scenario 2 / FR-004 / SC-003: nothing else is blurred

1. With the hero at maximum blur, scroll so a later chapter is on screen.
2. **Expected**: all body copy, cards and images below the hero are perfectly sharp.
3. **Expected**: the pinned background photograph is sharp at every scroll position, including
   the portion visible behind and around the hero itself. This is the clarification in the spec —
   the shared surface never blurs.
4. Watch for a soft halo bleeding a few tens of pixels past the hero's bottom edge over the next
   chapter's top. A faint gradient feather is expected (CSS blur renders beyond the element box);
   visibly blurred *content* from the next chapter is a defect.

### C6 — FR-006: correct on load, no catch-up

1. Navigate directly to `http://localhost:3000/#career` in a fresh tab.
2. Scroll back up to the hero.
3. **Expected**: the hero was already at its capped blur when you arrived — no animation ran to
   catch up, and there was no visible sharp-to-blurred transition on load.

### C7 — Fast-scroll edge case (FR-006, FR-007)

1. From the top, flick a trackpad hard, then press `End`, then drag the scrollbar rapidly up and
   down through the hero.
2. **Expected**: the blur value is always correct for wherever the scroll actually landed. It
   never lags behind, never overshoots and settles back, and never continues animating after the
   scroll has stopped.

## Part D — US3: reduced motion (FR-005, SC-004)

1. Enable the preference:
   - **macOS**: System Settings → Accessibility → Display → Reduce motion.
   - **Or in Chrome DevTools**: Command menu (`Cmd+Shift+P`) → "Show Rendering" → *Emulate CSS
     media feature prefers-reduced-motion* → `reduce`.
2. Reload the page (the preference is read once on first render, by design — see `research.md`
   R5; toggling it without a reload is not expected to take effect mid-session).
3. Scroll the full range of the page, top to bottom and back.
4. **Expected**: the hero never blurs at any scroll position, and the hero `<section>` never gains
   an inline `filter`.
5. Confirm the hero is otherwise unchanged — same layout, same spacing, same content. The effect
   is purely visual, so switching it off must shift nothing.
6. Turn the preference back off before continuing.

## Part E — Performance (FR-007, SC-005)

### E1 — Frame rate during scroll

1. In DevTools → Performance, record while scrolling through the hero at a natural speed.
2. **Expected**: no sustained long tasks and no dropped-frame cluster attributable to the hero.
   Occasional paint spikes are acceptable; a persistent sub-30fps stretch is not.
3. Repeat on a mobile device or with CPU throttling set to 4x slowdown. If this stutters, see the
   quantising fallback noted in `plan.md` (Risks, item 4).

### E2 — Lighthouse on a production build

```bash
pnpm build
pnpm start
```

Then run Lighthouse (Performance category, Desktop and Mobile) against `http://localhost:3000`.

**Expected**: performance score ≥ 90, matching the constitutional floor and SC-005. Compare
against a run on `main` if the score is borderline — the effect writes no `filter` at rest, so it
should not move the number meaningfully.

## Part F — Short-viewport edge case

1. In DevTools device emulation, pick a small phone (e.g. iPhone SE, 375x667) and reload.
2. Scroll down through the hero.
3. **Expected**: the blur still reaches its full maximum within one screen height of scrolling —
   the hero is not cut off part-blurred as it leaves the viewport.
4. Repeat on a short, wide desktop window (e.g. 1600x700).

## Sign-off checklist

- [X] Part A: type-check, lint and the full test suite pass.
- [ ] C1-C3: blur onset, continuity and reversibility confirmed (US1). — needs human browser QA
- [ ] C4-C5: cap holds and nothing outside the hero is blurred (US2, FR-004). — needs human browser QA
- [ ] C6-C7: correct on anchor load and under fast scroll (FR-006). — needs human browser QA
- [ ] Part D: no blur at any scroll position under reduced motion (US3). — needs human browser QA
- [ ] Part E: no visible stutter; Lighthouse ≥ 90 on a production build. — needs human browser QA; `pnpm build && pnpm start` verified to build and serve
- [ ] Part F: cap reached within one screen on a small phone viewport. — needs human browser QA
