# Feature Specification: Scroll-Progressive Hero Blur

**Feature Branch**: `feat/scroll-blur-hero`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "when I scroll from my hero page I want a blurring effect that slowing blurs more when I scroll down"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hero Progressively Blurs While Leaving It (Priority: P1)

A visitor starts at the top of the page with the hero section sharp and in focus. As they scroll down and away from it, the hero visually recedes by growing more blurred in step with scroll distance, reinforcing that they are moving on to the next part of the story.

**Why this priority**: This is the entire feature. Without it there is nothing to ship.

**Independent Test**: Can be fully tested by loading the page at the top, scrolling down in increments, and confirming the hero's blur amount increases each time scroll position increases, and decreases again when scrolling back up.

**Acceptance Scenarios**:

1. **Given** a visitor at the top of the page, **When** they begin scrolling down, **Then** the hero starts to blur, imperceptibly at first.
2. **Given** a visitor partway down the page, **When** they continue scrolling further down, **Then** the hero's blur increases smoothly and continuously with scroll distance, not in discrete jumps.
3. **Given** a visitor who has scrolled the hero to maximum blur, **When** they scroll back up toward the top, **Then** the blur decreases smoothly back down to none, matching their new scroll position.

---

### User Story 2 - Effect Settles Instead of Escalating Forever (Priority: P2)

A visitor who keeps scrolling well past the hero, deep into the rest of the page, does not see the blur keep intensifying indefinitely — it reaches a maximum and holds there, so later sections are never obscured by an ever-growing blur that has nothing left to do with the hero.

**Why this priority**: Prevents the effect from producing a degenerate, distracting result (e.g. a fully opaque blur haze) on long scrolls; secondary to the core motion in P1 but necessary for the feature to be presentable.

**Independent Test**: Can be fully tested by scrolling to the bottom of the page and confirming the hero's blur has capped at a fixed maximum rather than continuing to increase, and that content below the hero is unaffected by the blur.

**Acceptance Scenarios**:

1. **Given** a visitor scrolled well past the hero, **When** they keep scrolling further, **Then** the hero's blur has already reached its maximum and does not intensify further.
2. **Given** the hero at maximum blur, **When** a visitor views the sections below it, **Then** those sections render at normal sharpness, unaffected by the hero's blur.

---

### User Story 3 - Motion-Reduced Visitors Get a Static Experience (Priority: P3)

A visitor with `prefers-reduced-motion` enabled sees the hero at a fixed, sharp (unblurred) state regardless of scroll position, since the effect is a continuous motion tied to scroll rather than a one-off transition.

**Why this priority**: Required for accessibility compliance and consistency with how the rest of the site already handles reduced motion; not the core value but a hard constraint.

**Independent Test**: Can be fully tested by enabling reduced-motion in browser settings, reloading the page, and confirming the hero's appearance does not change as the page is scrolled.

**Acceptance Scenarios**:

1. **Given** a browser with `prefers-reduced-motion: reduce` enabled, **When** the visitor scrolls past the hero, **Then** the hero does not blur at any scroll position.

---

### Edge Cases

- What happens on a very short viewport (e.g. small phone) where the hero occupies most of the visible screen and there is little scroll distance before it's off-screen? The blur must still reach its cap within that shorter distance rather than being cut off half-blurred.
- What happens if a visitor jumps directly to a mid-page anchor link (skipping the top) — does the hero render already blurred at the appropriate amount for that scroll position, or unblurred? It MUST reflect the scroll position immediately, with no animated catch-up on load.
- What happens during fast, large scroll jumps (e.g. flicking a trackpad, pressing Page Down, or using a scrollbar drag)? The blur MUST track the resulting scroll position directly rather than animating gradually to catch up, so it never lags behind or overshoots.
- What happens on browsers/devices that don't support the CSS blur filter? The hero MUST still render legibly (i.e. degrade to unblurred) rather than erroring or showing a broken visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The hero section MUST render with zero blur when it is fully in view at the top of the page.
- **FR-002**: The hero's blur amount MUST increase continuously and smoothly as the visitor scrolls down away from the top of the page, and decrease the same way when scrolling back up — the blur amount is always a direct function of current scroll position, not a one-time triggered animation.
- **FR-003**: The blur MUST reach a fixed maximum amount once the visitor has scrolled a bounded distance past the hero, and MUST NOT continue increasing beyond that point regardless of how much further the visitor scrolls.
- **FR-004**: Sections below the hero MUST NOT be blurred by this effect at any scroll position.
- **FR-005**: When the visitor has `prefers-reduced-motion` enabled, the hero MUST remain unblurred at every scroll position.
- **FR-006**: The blur effect MUST reflect the current scroll position immediately on page load or on navigation to an anchor, without an animated catch-up.
- **FR-007**: The effect MUST remain smooth (no visible stutter or frame drops) during normal scrolling on supported devices.

### Key Entities

*(Not applicable — this feature has no data entities; it is a purely visual scroll-driven effect.)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor scrolling down from the top of the page perceives the hero's sharpness decreasing smoothly, with no visible jumps or delay, at every scroll position measured.
- **SC-002**: The hero's blur reaches and holds at its maximum within the first full viewport height of scrolling, on both desktop and mobile viewport sizes.
- **SC-003**: Content below the hero is never visually affected by the hero's blur, verified at any scroll position.
- **SC-004**: Visitors with reduced-motion preferences enabled see no change in the hero's appearance while scrolling, verified across the full scroll range.
- **SC-005**: The site's Lighthouse performance score remains at or above 90 on production builds with the effect enabled.

## Assumptions

- The "hero page" refers to the site's existing opening/hero section (the portrait-and-intro area at the top of the single-page story), not a separate route.
- The blur applies to the hero section as a whole (its visual surface, including its background) rather than to individual pieces of hero content independently.
- A blur cap equal to roughly one viewport height of scroll distance is a reasonable default for "settling" — this can be tuned during implementation without changing the feature's intent.
- The effect is purely visual (CSS blur intensity driven by scroll position) and does not change hero layout, spacing, or content.
- This is additive to, and must coexist with, the existing parallax/gradient scroll motion already on the hero (see spec 007) rather than replacing it.
