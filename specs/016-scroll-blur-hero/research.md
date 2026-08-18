# Phase 0 Research: Scroll-Progressive Hero Blur

All unknowns from the Technical Context are resolved here. Nothing is left as
NEEDS CLARIFICATION.

## R1. Which library drives the blur — GSAP ScrollTrigger or Framer Motion?

**Decision**: GSAP + ScrollTrigger.

**Rationale**: Principle IV (NON-NEGOTIABLE) names GSAP + ScrollTrigger as the library for
"scroll-sequenced and timeline motion", and a blur that is a continuous function of scroll
position is exactly that. GSAP is already a dependency (`gsap` ^3.12) and the plugin is already
registered in `lib/utils/animations.ts:5`, so nothing is installed. ScrollTrigger also gives, for
free, the two behaviours the spec's edge cases demand: correct progress on creation and on
`refresh` (anchor-jump / mid-page load, FR-006), and exact progress under fast scroll jumps
rather than an animated catch-up.

**Alternatives considered**:

- **Framer Motion `useScroll` + `useTransform` + `useMotionTemplate`.** This is what the hero's
  existing scroll motion uses (`components/Hero/HeroParallax.tsx`, `HeroDrift`), and spec 007
  explicitly chose it over GSAP *for this section* to avoid running two scroll systems in one
  component. It would be a shorter change — `useTransform(scrollY, [0, vh], [0, MAX], { clamp: true })`
  fed into `useMotionTemplate\`blur(${blur}px)\`` on a `motion.div`'s `filter`. Rejected here in
  favour of the constitution's literal domain assignment and the direction set for this feature.
  **This remains the single open question flagged in `plan.md`**; if the user prefers continuity
  with 007, this alternative is a drop-in and the rest of this research (mapping, cap, target
  element, reduced motion, performance) applies unchanged.
- **Pure CSS `animation-timeline: view()` / scroll-driven animations.** No new library at all and
  runs off the main thread. Rejected: browser support is still uneven (notably Safari), and the
  constitution's stack does not contemplate a fourth motion mechanism appearing as raw CSS.

## R2. How is the blur value driven — a scrubbed tween, or an `onUpdate` callback?

**Decision**: `ScrollTrigger.create({ ..., onUpdate, onRefresh })` with **no tween and no
`scrub`**, plus one explicit call of the update function immediately after creation.

**Rationale**: `scrub` is a *smoothing* control — `scrub: 1` (the default in this repo's
`setupScrollTrigger` helper, `lib/utils/animations.ts:29`) makes the animation take a second to
catch up to the scroll position, which directly violates FR-006 and the fast-scroll edge case.
`scrub: true` links directly and would be correct, but it requires a tween whose only job is to
interpolate one number GSAP then has to parse out of a `filter` string. Reading `self.progress`
in `onUpdate` and writing the style is fewer moving parts, is trivially unit-testable, and makes
"the blur is a direct function of scroll position" true by construction rather than by
configuration (Principle I). `onRefresh` covers resize and layout changes; the explicit first
call covers the case where the page loads already scrolled and progress has not *changed* yet.

**Alternatives considered**:

- **`gsap.to(el, { filter: 'blur(8px)' })` with `scrub: true`.** Works — GSAP's CSSPlugin
  interpolates filter strings. Rejected as strictly more machinery for the same result, and it
  leaves a tween alive that also has to be killed.
- **Reusing `setupScrollTrigger()` from `lib/utils/animations.ts`.** Rejected: it requires an
  `animation` timeline and defaults to `scrub: 1`. Its signature does not fit a callback-only
  trigger, and widening it would complicate a helper three other places depend on.

## R3. What element gets the filter, and does it satisfy FR-004?

**Decision**: the existing `<section>` element rendered inside `components/Hero/Hero.tsx:33`,
reached with a `useRef`. No new DOM node is introduced.

**Rationale**: A CSS `filter` on an element blurs that element and its whole subtree and nothing
else. That subtree is exactly the hero's foreground: the scrim gradient on the section itself,
`HeroGradientLayers` (the four hero-local washes), the role bars, intro, bio, `ValueProp`,
`CvLink`, and `HeroPortrait`. The pinned photograph lives in `components/Common/Backdrop.tsx`,
rendered as a `fixed inset-0 -z-10` element outside `<Hero />` in `app/page.tsx`, so it is not a
descendant and cannot be blurred — satisfying the spec's clarification and FR-004. Every chapter
below is a sibling `<section>` in `app/page.tsx` and is likewise untouched (SC-003). Using the
existing section also means a zero-line layout diff.

**Alternatives considered**:

- **A new `<HeroBlur>` wrapper component inside the section**, mirroring `HeroDrift`'s shape.
  Rejected: the section is a `flex items-center` container and `HeroGradientLayers` is
  `absolute inset-0` against it, so inserting a wrapper requires getting `w-full` and the
  positioning context right to avoid a layout regression — real risk for no benefit.
- **Blurring each foreground element separately** (portrait, text column, washes). Rejected: the
  spec's Assumptions explicitly say the blur applies to the hero's foreground as a whole, not to
  individual pieces independently; and N filters cost more than one.
- **Blurring the outer `<section id="hero">` in `app/page.tsx`.** Equivalent visually, but it puts
  hero-specific behaviour in the page composition file rather than in the Hero component.

## R4. What is the mapping from scroll position to blur radius?

**Decision**: `blur = clamp(progress, 0, 1) * MAX_BLUR_PX`, with `MAX_BLUR_PX = 8`, over a
ScrollTrigger range of `start: 'top top'`, `end: '+=100%'` on the hero section. The result is
rounded to one decimal place. At `progress === 0` the `filter` style is cleared entirely rather
than set to `blur(0px)`.

**Rationale**:

- `start: 'top top'` means progress is 0 while the hero is fully in view at the top of the page
  (FR-001).
- In ScrollTrigger, a percentage in an `end` offset resolves against **the scroller's height**,
  i.e. the viewport — so `'+=100%'` is one viewport height of scrolling on every device. That is
  what makes SC-002 and the short-phone edge case hold: the cap is reached within one screen
  regardless of how tall the hero itself is. An end expressed against the hero's own height
  (`'bottom top'`) would stretch on a tall mobile hero and leave it half-blurred when it exits.
- ScrollTrigger clamps `self.progress` to `[0, 1]` by definition, so the blur cannot exceed the
  cap however far the visitor scrolls (FR-003, US2). The explicit `clamp` in the mapping function
  is defensive and makes the pure function testable in isolation.
- Linear rather than eased: FR-002 asks for a smooth continuous function of scroll, and the
  spec's first acceptance scenario ("imperceptibly at first") is satisfied by a linear ramp
  because a 0→0.8px change over the first 10% of a viewport is already imperceptible. An ease
  would be extra tuning for no stated requirement (Principle I).
- 8px is a starting value, not a requirement — the spec's Assumptions allow tuning. It is enough
  to read as clearly out of focus without turning the portrait into a colour haze.
- Rounding to 0.1px collapses sub-perceptual value changes into no-op writes, cutting repaints on
  high-frequency scroll ticks while staying visually continuous.
- Clearing the filter at rest matters for SC-005: with no `filter` property present, the hero and
  the LCP imagery are composited normally on first paint, and no filter/stacking context exists
  until the visitor actually scrolls.

**Alternatives considered**: an eased (`power2`) ramp — rejected as unrequested tuning; a
larger 16-20px cap — rejected as likely to breach the "never obscured" intent of US2 and to cost
noticeably more per frame.

## R5. How is `prefers-reduced-motion` handled?

**Decision**: read `prefersReducedMotion()` from `lib/utils/animations.ts` once through a lazy
`useState` initializer guarded by `typeof window !== 'undefined'`; when true, create no
ScrollTrigger and write no `filter` at all.

**Rationale**: The constitution requires motion to respect the preference "through the existing
helpers, not a new detection path per component". `prefersReducedMotion()`
(`lib/utils/animations.ts:141`) is that helper, and the lazy-initializer pattern is the
established convention here — `CareerPitch.tsx:39` uses exactly this, and `HeroDrift` uses the
same shape (it inlines the media query only because it also subscribes to changes). Reading
during the first render rather than in an effect prevents the one-frame flash of motion that
`HeroParallax.tsx:80-84` documents. Not creating the trigger at all — rather than creating it and
mapping to 0 — means there is no scroll listener and nothing to fall out of sync (FR-005, SC-004).

**Note**: unlike `HeroDrift`, this does *not* subscribe to `matchMedia` change events. A visitor
toggling the OS setting mid-session keeps the state they loaded with until reload. Adding a
listener is three lines if desired, but the spec's US3 independent test is written as "enable it,
reload, confirm" — so the simpler read matches the stated acceptance criterion. Flagged rather
than assumed.

The global CSS block at `app/globals.css:171` neutralises `animation-duration` and
`transition-duration` under the preference; it does **not** cover a JS-written `filter`, which is
why the JS guard is required.

## R6. Cleanup and leak prevention

**Decision**: the `useEffect` returns a cleanup that calls `trigger.kill()` and clears the
element's inline `filter` and `willChange`.

**Rationale**: "GSAP ScrollTrigger instances MUST be killed in cleanup functions to prevent memory
leaks" is a hard constitutional constraint. `kill()` on the specific instance — not
`ScrollTrigger.killAll()` — because other triggers may exist elsewhere on the page. Clearing the
inline styles matters under React Strict Mode's double-invoked effects and on hot reload, where a
stale `filter` would otherwise persist on a remounted element.

## R7. ScrollTrigger plugin registration

**Decision**: re-export the already-registered plugin from `lib/utils/animations.ts`
(`export { ScrollTrigger };`) and import it from there in the hook.

**Rationale**: `lib/utils/animations.ts` already does `gsap.registerPlugin(ScrollTrigger)` at
module scope. Importing `gsap/ScrollTrigger` again in the hook and re-registering works
(registration is idempotent) but creates a second registration site that a future reader has to
reconcile. One registration point, one import path.

## R8. Browsers without `filter: blur()` support

**Decision**: no feature detection, no fallback code.

**Rationale**: an unsupported CSS property value is dropped by the CSS parser and the element
renders normally. The hero degrades to permanently sharp, which is precisely the "render legibly
rather than erroring" outcome the edge case asks for. Adding a `CSS.supports` guard would be code
that can never be exercised on any browser this site targets (Principle I).

## R9. Hook signature and testability

**Decision**:

```ts
export const MAX_BLUR_PX = 8;
export function blurPxAt(progress: number): number;
export function useHeroScrollBlur(ref: RefObject<HTMLElement | null>): void;
```

**Rationale**: exporting the pure mapping separately is what makes Principle II satisfiable —
FR-001 (0 at top), FR-003 (capped), monotonicity and the clamp are all assertable without a
browser, a scroll, or a mock. The hook itself is tested with `gsap`/`gsap/ScrollTrigger` module
mocks for two things jsdom *can* prove: that no trigger is created under reduced motion, and that
the returned cleanup kills the trigger it created. `RefObject<HTMLElement | null>` matches React
19's `useRef<HTMLElement>(null)` typing under strict mode.

**Alternatives considered**: testing through a rendered `<Hero />` — rejected, it drags in
`ContentProvider`, four `next/image` layers and `rough-notation` to assert one number.

## Summary of resolved unknowns

| Unknown | Resolution |
|---|---|
| Motion library | GSAP + ScrollTrigger (R1) — Framer alternative documented, pending user confirmation |
| Drive mechanism | `onUpdate` callback, no tween, no `scrub` (R2) |
| Blur target | The existing hero `<section>`, via `useRef` (R3) |
| Ramp and cap | Linear, `top top` → `+=100%`, 8px cap, rounded to 0.1px, cleared at 0 (R4) |
| Reduced motion | `prefersReducedMotion()` helper, lazy `useState`, trigger never created (R5) |
| Cleanup | `trigger.kill()` + clear inline `filter`/`willChange` (R6) |
| Plugin registration | Re-export from `lib/utils/animations.ts` (R7) |
| Unsupported browsers | No code; CSS drops the value and the hero stays sharp (R8) |
| Test seam | Exported pure `blurPxAt` + mocked-GSAP hook test (R9) |
