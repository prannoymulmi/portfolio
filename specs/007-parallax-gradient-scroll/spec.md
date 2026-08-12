# Feature Specification: Parallax Gradient Scrolling

**Feature Branch**: `feat/parallax-gradient-scroll`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "I added new gradients four images, gradient-hero, gradient-text, mesh-soft-flip and mesh-soft. I want to use these gradients to make use of the parallax and have a very smooth and modern scrolling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Experience Smooth Parallax on Hero Section (Priority: P1)

Visitors scroll through the portfolio and see gradient layers move at different speeds, creating visual depth and a sense of motion. This establishes the site's modern aesthetic and draws attention to key sections.

**Why this priority**: The hero/opening section is the first impression. A smooth, sophisticated parallax effect immediately communicates quality and design intent. It's the anchor that justifies adding the gradients.

**Independent Test**: Can be fully tested by loading the page, scrolling through the hero section, and verifying that gradient layers move smoothly at distinct speeds relative to scroll position, delivering visual depth and motion without jank.

**Acceptance Scenarios**:

1. **Given** a visitor at the top of the page, **When** they scroll down 200px, **Then** background gradient layers have moved at proportionally different distances (creating parallax illusion)
2. **Given** a visitor scrolling at normal speed, **When** they observe the parallax effect, **Then** motion appears smooth (no frame drops) and proportional to scroll velocity
3. **Given** the hero section with parallax, **When** a visitor scrolls past it, **Then** the gradient layers fade smoothly into the next section without jarring transitions

---

### User Story 2 - Layered Gradients Enhance Visual Hierarchy (Priority: P2)

Multiple gradient layers (hero, text, soft mesh) are positioned at different depths, so scrolling reveals intentional visual relationships between sections. This reinforces the portfolio's narrative structure.

**Why this priority**: Adds sophistication and intentional design. Secondary to the core parallax motion but creates the reason for multiple gradient assets.

**Independent Test**: Can be fully tested by examining the visual layer stack, scrolling through multiple sections, and verifying that each gradient layer appears at the correct depth and timing, contributing to overall visual hierarchy.

**Acceptance Scenarios**:

1. **Given** the page at various scroll positions, **When** examining the visual layer stack, **Then** each gradient (hero, text, mesh-soft, mesh-soft-flip) is visible at its intended depth
2. **Given** a visitor moving between sections, **When** gradient layers transition, **Then** the motion creates a sense of progression rather than abrupt changes

---

### User Story 3 - Graceful Fallback for Motion-Reduced Users (Priority: P3)

Users with `prefers-reduced-motion` enabled see static gradient backgrounds without parallax animation, maintaining visual appeal while respecting accessibility preferences.

**Why this priority**: Essential for accessibility compliance; ensures the site remains usable and attractive for all visitors, including those with motion sensitivity.

**Independent Test**: Can be fully tested by enabling reduced-motion in browser settings, reloading the page, and verifying that gradients are visible but parallax animation does not occur.

**Acceptance Scenarios**:

1. **Given** a browser with `prefers-reduced-motion: reduce` enabled, **When** the page loads, **Then** gradient backgrounds are visible but parallax animation is disabled
2. **Given** reduced-motion enabled, **When** scrolling through the page, **Then** no motion animation occurs, only static gradient layers

---

### Edge Cases

- What happens when a user scrolls very rapidly (swipe on mobile)?
- How do gradients render on low-end devices or slow connections — do they load in time or cause layout shift?
- What is the visual result when gradients are cached vs. first load?
- How do parallax layers interact with the existing pinned background photograph (ADR 0015)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load four gradient images (gradient-hero, gradient-text, mesh-soft, mesh-soft-flip) from public assets
- **FR-002**: System MUST render gradient layers with parallax effect, moving at different speeds relative to scroll position
- **FR-003**: System MUST ensure parallax animation remains smooth (60fps target) on typical desktop devices without visual jank or stutter
- **FR-004**: System MUST apply parallax only to viewport-visible layers to avoid unnecessary rendering
- **FR-005**: System MUST compose gradient layers seamlessly with the existing pinned photograph background and translucent chapter scrims, maintaining visual hierarchy (ADR 0015)
- **FR-006**: System MUST disable parallax animation when `prefers-reduced-motion` is enabled, showing static gradients instead
- **FR-007**: System MUST not cause Cumulative Layout Shift (CLS) when gradients load or parallax animation begins
- **FR-008**: Gradient image assets MUST be optimized for web delivery (size, format) to ensure fast loading

### Key Entities

- **Gradient Layer**: A visual element composed of a gradient image, positioned at a specific depth, with a parallax scroll offset defining its relative motion speed
- **Parallax Offset**: A numerical factor (0–1 range typical) defining how much a layer moves relative to viewport scroll; 0 = stationary, 1 = normal scroll speed, <1 = slower (parallax effect)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Parallax animation maintains ≥55 fps average during scroll on desktop devices (no dropped frames visible to user)
- **SC-002**: Gradient images load in ≤200ms combined, with no visible layout shift (CLS score remains <0.1 for the feature)
- **SC-003**: Parallax effect is perceived as smooth and intentional by 90% of beta testers (subjective visual quality)
- **SC-004**: Lighthouse performance score remains ≥90 on production builds (satisfying existing site constraint per constitution)
- **SC-005**: Parallax animation respects `prefers-reduced-motion` and disables on affected browsers
- **SC-006**: Visual hierarchy between gradient layers and pinned background photograph is clear and intentional across all viewport sizes

## Assumptions

- **Browser capability**: Target modern browsers (latest 2 major versions) with CSS animation and scroll event support; parallax may degrade gracefully on older browsers
- **Asset location**: Four gradient images are assumed to be stored in `public/images/` and remain there; the feature does not move or reorganize assets
- **Existing animation setup**: GSAP + ScrollTrigger library is already configured in the project (Principle IV); no new animation library installation required
- **Background surface constraints**: Parallax layers will be integrated with the existing pinned photograph background (ADR 0015) and chapter scrims; they do not replace or bypass this design
- **Scroll context**: Parallax applies to the main page scroll; individual section scrolling is out of scope for v1
- **Desktop-first**: Primary target is desktop viewing; mobile parallax optimization may be addressed in a future enhancement
- **No CMS or data dependency**: Gradient selection and layer ordering are static, defined in code or configuration, not pulled from external data sources
