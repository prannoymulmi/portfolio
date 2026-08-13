# Phase 0 Research: Minimal Nav with Hamburger Sections

No open `[NEEDS CLARIFICATION]` markers remain in the spec or Technical Context
(the one scope question — hamburger applies at every width — was resolved
during `/speckit-specify`). This records the implementation-approach decisions
made in filling out the plan's Technical Context.

## Motion library for open/close

**Decision**: Framer Motion (`AnimatePresence` + `motion.div` for the panel),
same library already imported in `StoryProgressNav.tsx`.

**Rationale**: Constitution IV fixes exactly three animation libraries, each
with one non-overlapping domain: GSAP/ScrollTrigger for scroll-sequenced
motion, Framer Motion for component entrance/exit/interaction motion,
`rough-notation` for text annotation marks. Opening and closing a menu panel is
component interaction motion — Framer Motion's domain, not GSAP's or
`rough-notation`'s.

**Alternatives considered**: A CSS-only transition (`max-height`/`opacity`
utilities) was considered to avoid a JS dependency entirely, but the component
already imports Framer Motion for the scroll-progress hairline, so a
CSS-only panel would add a second animation approach for no dependency
savings, working against Principle I (KISS).

## Reduced-motion handling

**Decision**: Reuse `prefersReducedMotion()` from `lib/utils/animations.ts`
(the same helper `StoryProgressNav` already calls), branching the panel's
open/close to an instant show/hide instead of Framer Motion's transition when
true.

**Rationale**: Constitution Technology & Quality Constraints requires motion
respect `prefers-reduced-motion` "through the existing helpers, not a new
detection path per component" — the helper already exists and is already
imported in this file.

**Alternatives considered**: Framer Motion's own `useReducedMotion` hook was
considered, but it would be a second, parallel detection path alongside the
helper `StoryProgressNav` already uses for its own spring, which the
constitution explicitly rules out.

## Focus management (open → into menu, close → back to toggle, Escape, outside click)

**Decision**: Plain React state + refs — no new dependency. On open, move focus
to the first menu link with a `useEffect` keyed on the open flag; on close (via
toggle, Escape, or outside click), return focus to the toggle button ref.
Escape and outside-click are handled with a `document` `keydown`/`pointerdown`
listener attached only while the menu is open, removed on cleanup.

**Rationale**: The interaction surface is small and well-understood (a single
toggle plus a link list) — Principle I disfavors pulling in a focus-trap
library for something this bounded. No such library is already in the fixed
stack, and adding one would need a Constitution IV amendment for something
this scoped.

**Alternatives considered**: A dedicated headless menu/focus-trap package
(e.g. Radix, Headless UI) was considered for robustness, but none is in the
fixed stack (Constitution IV) and pulling one in for a seven-item static link
list is disproportionate — an amendment for this would not clear the bar the
constitution's own commentary sets for touching Principle IV.

## Outside-click detection

**Decision**: A `pointerdown` listener on `document`, checking
`event.target` against the menu panel and toggle button refs via
`.contains()`, attached only while open.

**Rationale**: Standard pattern already implicit in the codebase's
ResizeObserver-based measurement approach in `StoryProgressNav.tsx` (attach
while relevant, detach in cleanup) — consistent with existing code style
rather than introducing a new idiom.

**Alternatives considered**: A full-screen invisible overlay behind the panel
that closes on click was considered, but it complicates z-index/stacking with
the existing sticky bar and scrim layers for no behavioral difference the spec
requires.
