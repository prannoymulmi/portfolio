# Feature Specification: Career & Work Showcase

**Feature Branch**: `feat/career-work-showcase`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "Look at the project in folder show case I want take the gradient back ground from there I want to remove technolgies section and add Three systems happying defend get the pass the ball to see where I've plyed do it exactly like this also for mobile version leave the timeline without the playing part as well. Also add the engineering principle line"

**Reference**: A local reference project at `showcase/` (gitignored, not part of this codebase) contains a working prototype of the three pieces this feature ports: a "Three systems I'd happily defend in a design review" project showcase, a "Pass the ball to see where I've played" interactive career pitch, and an "engineering principle" parallax quote band. All three use the `mesh-soft` / `mesh-soft-flip` gradient assets already present in `public/images/` from the prior parallax feature (`specs/007-parallax-gradient-scroll`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Three Systems Worth Defending (Priority: P1)

A visitor scrolls past the opening and, instead of a flat list of technology names, sees three real systems the site's owner has built — each with the company, the role, what was built, the stack used, and one headline metric — framed as work they'd stand behind in a design review.

**Why this priority**: This replaces the current "Skills"/"Frameworks & Technologies" list — a list of tool names with no context — with evidence of what those tools were used to build. It's the single highest-value change: it turns a résumé bullet into a case study.

**Independent Test**: Load the page, scroll to the section that replaces today's Skills section, and confirm three systems are shown, each with company, role, description, tech stack, and a metric, without needing to click into an SVG pitch first.

**Acceptance Scenarios**:

1. **Given** a visitor on desktop, **When** they reach the section, **Then** they see three systems listed with year, name, role, a short description of what was built, the stack used, and one metric per system
2. **Given** the same section, **When** they compare it to the previous "Frameworks & Technologies" grouping, **Then** that category and its flat tool list are no longer present anywhere on the page
3. **Given** a visitor on mobile, **When** they reach the section, **Then** the same three systems and all their details are present and readable — not a reduced or summary-only version

---

### User Story 2 - Pass the Ball to See Where I've Played (Priority: P1)

A visitor explores the site owner's career as a sequence of positions on a football pitch, passing between chapters in any order or following the numbered build-up play from earliest to most recent, with each position revealing the company, role, dates, what was built, and achievements for that chapter.

**Why this priority**: This is the flagship interaction the request names explicitly ("do it exactly like this") and replaces the existing Career Journey's less legible interactive mode. It is equally essential to the feature's value as User Story 1.

**Independent Test**: Load the page, scroll to the Career Journey section, click at least two different pitch positions in any order, and confirm each shows its own company/role/dates/build/achievements without a page reload. Then use the "play in order" control and confirm it steps through chapters chronologically.

**Acceptance Scenarios**:

1. **Given** a visitor at the Career Journey section, **When** they click any position on the pitch, **Then** that chapter's company, role, years, what-was-built, tech, and achievements appear
2. **Given** the same section, **When** the visitor presses "play in order", **Then** the pitch steps through every chapter from earliest to most recent automatically, and pausing stops the sequence at the current chapter
3. **Given** a visitor on mobile, **When** they reach this section, **Then** the same pitch, chapter selection, and chapter detail are available and usable by touch — not replaced by a plain list
4. **Given** a visitor who prefers a non-interactive view, **When** they choose the plain timeline option, **Then** they see every career chapter as a simple chronological list with no pitch, no player marker, and no play/pause control

---

### User Story 3 - Read the Engineering Principle (Priority: P2)

A visitor scrolling through the story encounters a single, pinned statement of engineering philosophy — set apart visually from the surrounding chapters, with a background that shifts at a different speed than the text as they scroll past it.

**Why this priority**: This is a smaller, self-contained addition — a single new section — that reinforces the site's message but does not depend on User Stories 1 or 2 to deliver value on its own.

**Independent Test**: Scroll to the new quote section and confirm the principle statement is legible, present exactly once, and its background visibly shifts at a different rate than the text while scrolling past it.

**Acceptance Scenarios**:

1. **Given** a visitor scrolling through the page, **When** they reach the new section, **Then** they see one short engineering-principle statement, clearly set apart from the chapters around it
2. **Given** the same section, **When** the visitor scrolls through it, **Then** the background and the text move at visibly different speeds
3. **Given** a visitor with `prefers-reduced-motion` enabled, **When** they reach this section, **Then** the statement is fully readable with no parallax motion

---

### Edge Cases

- What happens if the career data has only one chapter — does "play in order" and the build-up route still render sensibly with nothing to step through?
- How does the three-systems section behave if fewer than three qualifying projects exist in the underlying data?
- What happens when a visitor rotates a mobile device mid-interaction with the pitch — does the current chapter selection survive?
- How do the new sections' gradient backgrounds interact with the existing photographic page surface at the very top and bottom of each section, where the pinned photo would otherwise show through?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the current Skills section's "Frameworks & Technologies" category and its flat tool-name display from the page entirely
- **FR-002**: System MUST replace that section with a "Three systems I'd happily defend in a design review" section presenting exactly three systems, each with: year, name, role, description of what was built, technology stack used, and one headline metric
- **FR-003**: System MUST present the three-systems section identically in substance on mobile viewports — same systems, same fields, no summarization or omission
- **FR-004**: System MUST replace the current Career Journey interactive experience with a pitch-based, chronologically-ordered career navigator ("pass the ball to see where I've played"), where selecting any position shows that chapter's company, role, years, what-was-built, tech, and achievements
- **FR-005**: System MUST provide a control that steps through every career chapter in chronological order automatically ("play in order"), with the ability to pause
- **FR-006**: System MUST provide a plain, non-interactive chronological timeline view of career chapters, containing no pitch, no player marker, and no play/pause control
- **FR-007**: System MUST present the pitch-based career navigator identically in substance on mobile viewports, remaining usable by touch
- **FR-008**: System MUST add exactly one new section presenting a single engineering-principle statement, visually distinct from surrounding chapters
- **FR-009**: The new engineering-principle section's background MUST move at a different scroll-linked speed than its text, and MUST collapse to no motion when `prefers-reduced-motion` is set
- **FR-010**: The gradient backgrounds used in the three-systems, career-pitch, and engineering-principle sections MUST preserve the site's existing single pinned-photograph surface — they layer as translucent overlays on top of the existing scrim, not as opaque replacements of it — consistent with how the Hero's parallax gradient layers (specs/007-parallax-gradient-scroll) were already built
- **FR-011**: All content shown in the three-systems and career-pitch sections MUST come from the site's real, existing career and project data — no placeholder or fictional company/role/project names from the reference prototype are carried into the live site

### Key Entities

- **System (showcase entry)**: One of the three highlighted projects — year, name, role, description of what was built, technology stack, one headline metric
- **Career Chapter**: One position on the career pitch — company, role, years, what was built, technology stack, achievements, chronological order, and a pitch position/coordinate
- **Engineering Principle Statement**: The single pinned quote — the statement text and a short supporting line beneath it

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can identify what was built, for whom, and with what measurable result for all three showcased systems within 30 seconds of reaching that section
- **SC-002**: A visitor can reach any career chapter's full detail (company, role, dates, achievements) within two interactions (one click/tap) from the Career Journey section, on both desktop and mobile
- **SC-003**: 100% of career chapter content available on desktop is also available on mobile — measured by field-for-field parity, not visual layout
- **SC-004**: The engineering-principle statement is visible and fully readable regardless of a visitor's motion preference
- **SC-005**: Lighthouse performance score remains ≥90 on production builds after the change (constitution floor)
- **SC-006**: No chapter on the page shows an opaque or gradient background that fully replaces the shared photographic surface — verified against the existing automated backdrop-coverage guard

## Assumptions

- The "showcase/" reference project's example content (fictional companies like "Northwind Labs", "Streamline", "Ledger Core") is a design/interaction prototype only; this feature ports the *pattern*, not that content — real data comes from this site's existing career and project sources
- The current Skills section is fully replaced, not kept alongside the new three-systems section — "remove technologies section and add three systems" is read as one swap, not an addition
- The three systems are chosen from the site's most significant/complete project entries; exactly three are shown, matching the reference pattern
- The plain timeline view (FR-006) is reachable via a visible toggle or link alongside the interactive pitch, consistent with how a non-interactive fallback existed before this change
- "Do it exactly like this" governs the interaction pattern and visual structure (pitch, passing between chapters, play-in-order, showcase card layout, parallax quote band) — not the reference's placeholder copy, its non-photographic page background, or its component library, all of which stay consistent with this project's existing constitution
