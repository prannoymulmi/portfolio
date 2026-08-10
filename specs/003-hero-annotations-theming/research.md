# Phase 0 Research: Annotated Hero & Working Theme Switching

No Technical Context entries were left as NEEDS CLARIFICATION — the three open spec questions were resolved in the clarify session. Research here covers the two new-dependency decisions the constitution forces, the mechanics of the theming repair, and the annotation reflow problem.

## 1. Why theme switching is broken today (root cause)

**Finding**: Three independent defects, not one. Fixing any single one leaves the feature broken.

| # | Defect | Evidence |
|---|---|---|
| 1 | No theme control is mounted anywhere | `ThemeToggle` is defined in `components/Common/ThemeToggle.tsx` but grep shows zero imports. It was rendered by `Navbar`, deleted in `002-portfolio-story-redesign`. |
| 2 | `dark:` utilities ignore the toggle | `lib/hooks/useTheme.ts` adds a `.dark` class to `<html>`, but `app/globals.css` never overrides Tailwind's default `dark` variant, which is bound to `prefers-color-scheme`. Every `dark:` class in the codebase therefore follows the OS, not the class. |
| 3 | CSS custom properties also OS-bound | `--background` / `--foreground` / `--border` swap inside `@media (prefers-color-scheme: dark)` in `globals.css`, so `body` can't follow an explicit choice either. |
| 4 | Flash of wrong theme | `useTheme` applies the class in a `useEffect`, i.e. after hydration. A dark-mode visitor always sees a light first paint. |

**Rationale for recording this**: the spec treats theming as one fix; it is four. Task decomposition must cover all four or the acceptance scenarios fail.

## 2. Theme state ownership — `next-themes` vs. fixing the hand-rolled hook

**Decision**: Adopt `next-themes` 0.4.6; delete `lib/hooks/useTheme.ts`.

**Rationale**:
- Defect 4 (flash) can only be fixed by setting the theme class **before first paint**, which requires a synchronous blocking script in `<head>`. `next-themes` injects exactly this; a `useEffect` fundamentally cannot.
- Verified React 19 compatible: peer range `^16.8 || ^17 || ^18 || ^19`, so it adds no new peer conflict. **Correction found at install time**: the install still requires `--legacy-peer-deps`, but for a pre-existing reason — `@testing-library/react@14` pins React ^18, so a bare `npm install` fails identically with no new packages. This is the condition ADR 0007 already records; it is not caused by this feature.
- ~2KB gzipped. Also provides cross-tab sync and live system-preference tracking, both of which the hand-rolled hook lacks.
- **Net code reduction**: deletes ~45 lines of hand-rolled hook, adds a ~10-line provider wrapper.

**Alternatives considered**:
- *Keep and fix `useTheme.ts`*: rejected. The no-flash fix means hand-authoring a `dangerouslySetInnerHTML` inline script that reads `localStorage`, resolves the system preference, and writes the class before paint — then keeping storage, system changes, and DOM in sync by hand. Strictly more bespoke code than the dependency avoids, and precisely the subtle, breakable code Principle I targets.
- *CSS-only (`light-dark()` + `color-scheme`)*: rejected. Genuinely elegant and zero-JS, but it cannot express an explicit user override that outlives the OS setting (FR-013), and the codebase's hundreds of `dark:` utilities would all need rewriting to custom properties.

## 3. Tailwind v4 class-based dark mode

**Decision**: Add `@custom-variant dark (&:where(.dark, .dark *));` to `app/globals.css`, and move the OS-scoped custom-property block to a `.dark` selector.

**Rationale**: Tailwind v4 removed the v3 `darkMode: 'class'` JS config option; `@custom-variant` is the CSS-first replacement. Verified `custom-variant` is present in the installed `tailwindcss@4.3.3` bundle. The `:where()` wrapper keeps specificity at zero so the variant doesn't outrank unrelated utilities. This single declaration makes every existing `dark:` utility in the codebase respond to the class — no per-component edits.

**Alternatives considered**:
- *Rewrite components to custom properties*: rejected — touches hundreds of call sites to solve what one CSS line solves.
- *Keep the media query and layer a class on top*: rejected — two competing sources of truth, and OS changes would still fight an explicit choice.

**Consequence to watch**: the background accent added in `002` uses `dark:invert`. Once the variant is class-bound it will invert on explicit choice rather than OS — which is the intended behaviour, but must be verified visually (spec Dependencies).

## 4. Hand-drawn annotations — `rough-notation` vs. building it

**Decision**: Adopt `rough-notation` 0.5.1, isolated behind a `RoughAnnotation` wrapper component.

**Rationale**:
- Delivers precisely the requested effect: five mark types (highlight, circle, underline, box, bracket) drawn as multi-pass sketchy paths with seeded jitter, animated on.
- ~9KB gzipped (bundles a trimmed RoughJS; no external runtime deps).
- Isolating it behind one wrapper means a future swap touches one file, not the hero.

**Alternatives considered**:
- *Hand-rolled CSS/SVG*: a CSS highlight is trivial, but credible hand-drawn circles and boxes require reimplementing RoughJS's path-roughening — seeded randomisation, multi-pass stroke offsetting, per-mark-type geometry. Dozens of lines of exactly the "clever tricks" Principle I forbids, to reproduce a solved problem.
- *Framer Motion*: animates values and transforms, not generated path geometry. Would still need the rough paths authored by hand; Framer would only animate their reveal.
- *GSAP DrawSVGPlugin*: a paid Club GreenSock plugin, and still requires hand-authored rough paths. Rejected on both cost and the same geometry problem.

**Constitution impact**: this is the third animation/rendering library, against ADR 0005's explicit two-library ceiling. Recorded as an amendment in ADR 0009 with the boundary rule: **GSAP for scroll-driven, Framer for interaction/entrance, RoughJS for hand-drawn marks** — no overlap, each with a stated domain.

## 5. Keeping annotations aligned through reflow

**Decision**: The `RoughAnnotation` wrapper observes its own size and re-runs the annotation when the box changes; it also waits for web fonts before the first draw.

**Rationale**: `rough-notation` measures the target element's bounding box once and draws an absolutely-positioned SVG. Anything that moves the text afterwards — window resize, orientation change, or a late web font swapping metrics — leaves the mark stranded (SC-006). Two triggers cover it: a resize observation on the annotated element, and the browser's font-loading signal before the initial draw. Both are standard browser APIs, no extra dependency.

**Alternatives considered**:
- *Redraw on window resize only*: rejected — misses the font-swap case, which is the more common visible failure on first load.
- *Fixed-width hero text to prevent reflow*: rejected — breaks responsive layout (FR-008) to avoid a solvable problem.

## 6. Reduced motion

**Decision**: When `prefers-reduced-motion: reduce` is set, render annotations with animation duration zero so they appear complete immediately.

**Rationale**: SC-008 requires annotations *visible but not animated* — not hidden. `rough-notation` exposes an animation toggle, so the mark still draws, just instantly. The project already has `prefersReducedMotion()` in `lib/utils/animations.ts`; reuse it rather than adding a second detection path (ADR 0005 already flags duplicated reduced-motion logic as a known cost — this avoids adding a third).

## 7. Where the theme control lives

**Decision**: Mount the existing `ThemeToggle` inside `StoryProgressNav`.

**Rationale**: It is the only persistent chrome left after the nav bar was removed — sticky, present on every part of the single-page story, and already keyboard-navigable. Satisfies FR-010 without reintroducing a nav bar. The toggle component itself needs only its state source swapped to `next-themes`; its markup and ARIA labelling already meet the requirement.

**Alternatives considered**:
- *Footer*: rejected — invisible until the visitor scrolls the entire story.
- *Floating button*: rejected — extra floating UI competing with the progress bar, for no gain.

## 8. Hero content shape

**Decision**: Extend `home.json` with an `intro` string and replace `roles` with the three annotated phrases; keep the site-wide description separate in the layout metadata.

**Rationale**: FR-005 requires the phrases to be content-editable; FR-023 requires hero copy and the professional site description to stay independent. `home.json` already holds `name` and `roles` and is Zod-validated, so this is a schema extension, not a new pipeline. Mark styles deliberately stay out of the content (FR-024) — the schema does not gain a styling enum.

**Note**: `roles` is currently typed `min(10).max(100)` per entry with 1–3 entries. "AI enthusiast" (13 chars) and "Security Nerd" (13) pass; "Software Engineer" (17) passes. No schema loosening needed for length, but the semantic shift from "a Senior Software Engineer" (article-prefixed, displayed singly) to bare annotated phrases (displayed together) should be reflected in the field name and validation.
