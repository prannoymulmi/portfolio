# Feature Specification: Football Pitch Interaction Rework

**Feature Branch**: `feat/football-pitch-rework`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "I want rework the football interactive part when I click the player it shows a blue selected ball I do not want that make it more smoother I want a ball to be passed a small one and name the companys names in the field. Make abbriviation under the number. Also add a tip under the pitch. Make the details page like in the showcase where the achivements Technologies What I built are there. Try to make it as compact as possible"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Selecting a chapter feels smooth, not like a UI state toggle (Priority: P1)

A visitor clicks a different player on the pitch to open that career chapter.
Instead of the current heavy highlight (solid halo + colour swap on the
selected dot), the change reads as a small ball travelling across the pitch
from the previously active player to the newly active one, then settling.

**Why this priority**: This is the core complaint — the current selected
state looks abrupt and disconnected from the football metaphor the rest of
the section commits to. Fixing it is the reason the feature exists.

**Independent Test**: Click through several players in sequence and confirm
the transition shows a small ball moving between them rather than an instant
highlight swap, and that no leftover "selected" halo remains on the dot
itself.

**Acceptance Scenarios**:

1. **Given** the pitch with chapter 3 active, **When** the visitor clicks
   chapter 5, **Then** a small ball animates from chapter 3's position to
   chapter 5's position and chapter 5 becomes active once the animation
   settles.
2. **Given** `prefers-reduced-motion` is enabled, **When** the visitor
   selects a different chapter, **Then** the active chapter updates
   immediately without the travelling-ball animation.
3. **Given** any chapter is active, **When** the visitor inspects the player
   dot, **Then** no blue (or other) solid highlight ring is present — the
   distinction between active and inactive players is conveyed by the ball's
   resting position, not a colour block.

---

### User Story 2 - The pitch identifies who each player is, at a glance (Priority: P1)

A visitor scanning the pitch (not yet reading the detail panel) can tell
which company each player represents without clicking, via a short
abbreviation under the player's number and the company's name placed on the
field near that player.

**Why this priority**: The pitch is presented as the primary navigation for
the career story; today it only shows an anonymous numbered dot, forcing the
visitor to click blind or fall back to the separate pill list below the
controls.

**Independent Test**: Load the pitch without clicking anything and confirm
every player shows its order number, a short company abbreviation beneath
that number, and the full company name as a label on the field near the dot.

**Acceptance Scenarios**:

1. **Given** the pitch has rendered, **When** the visitor looks at any
   player, **Then** the order number, a company abbreviation beneath it, and
   the full company name near the dot are all visible without interaction.
2. **Given** a company name is long, **When** it renders on the pitch,
   **Then** it does not overlap a neighbouring player's label or run outside
   the pitch bounds.

---

### User Story 3 - The chapter detail panel matches the showcase's compact style (Priority: P2)

A visitor who selects a chapter sees a detail panel styled like the Work
showcase cards — compact, with achievements, technologies, and a short "what
I built" summary — rather than the current looser layout.

**Why this priority**: Consistency with the showcase panel makes the site
read as one design system rather than two treatments of similar content;
this depends on User Stories 1–2 landing first so the panel isn't restyled
twice.

**Independent Test**: Compare the reworked chapter detail panel against a
Work showcase card side by side and confirm matching section structure
(role/title, a short summary, achievements list, technology tags) and a
visibly tighter vertical rhythm than the current panel.

**Acceptance Scenarios**:

1. **Given** a chapter is active, **When** its detail panel renders,
   **Then** it shows a "What I built" summary, an achievements list, and a
   technologies list, styled consistently with the showcase cards.
2. **Given** the reworked panel, **When** compared to the current
   `ChapterDetail` panel, **Then** its vertical spacing is reduced (more
   compact) without truncating or hiding any achievement or technology tag.

---

### User Story 4 - A short tip explains how to use the pitch (Priority: P3)

A first-time visitor sees a brief tip below the pitch explaining that players
are clickable and how to move between chapters.

**Why this priority**: Lowest priority because the controls above the pitch
(prev/next, play, company pills) are already discoverable; the tip is a
polish addition for visitors who land on the pitch first.

**Independent Test**: Load the section and confirm one short line of tip
text appears below the pitch, distinct from the panel and controls.

**Acceptance Scenarios**:

1. **Given** the pitch has rendered, **When** the visitor looks below it,
   **Then** a single short line of tip text is visible explaining that
   players can be clicked (and, where relevant, that arrow keys or the
   prev/next controls step through chapters).

---

### Edge Cases

- What happens when the visitor clicks the already-active player? No ball
  travel animation should play (there is no movement), and the panel stays
  as-is.
- What happens when a company name is very long relative to its neighbours'
  spacing on the pitch (e.g., adjacent players close together)? The label
  must truncate or wrap rather than overlapping another player's content.
- What happens during rapid repeated clicks before a ball animation
  finishes? The ball animation for a new selection must interrupt/replace
  any in-flight one rather than queuing multiple animations.
- What happens under `prefers-reduced-motion`? Selection changes instantly,
  matching the existing reduced-motion behaviour elsewhere on the site.
- What happens on keyboard navigation (Enter/Space on a focused player)? The
  same smooth transition and abbreviation/name labelling apply identically
  to keyboard-driven selection as to click-driven selection.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The pitch MUST remove the current solid highlight/halo styling
  used to mark the active player.
- **FR-002**: When the active chapter changes, the pitch MUST show a small
  ball travelling from the previously active player's position to the newly
  active player's position, then coming to rest there.
- **FR-003**: The ball travel animation MUST be skipped (instant update) when
  `prefers-reduced-motion` is enabled, consistent with existing motion
  handling elsewhere in the section.
- **FR-004**: A new selection made while a ball animation is in flight MUST
  redirect the animation to the new target rather than queuing multiple
  animations.
- **FR-005**: Each player on the pitch MUST display, without interaction:
  its chronological order number, a short company abbreviation positioned
  beneath that number, and the full company name as a label placed on the
  field near the player.
- **FR-006**: Company name and abbreviation labels MUST NOT overlap another
  player's number, abbreviation, or name label at any pitch size the layout
  supports.
- **FR-007**: A single short tip line MUST render below the pitch, visible
  without interaction, describing that players are clickable.
- **FR-008**: The chapter detail panel MUST be restructured to match the
  Work showcase card's section pattern: a short "what I built" summary, an
  achievements list, and a technologies list.
- **FR-009**: The reworked chapter detail panel MUST use tighter vertical
  spacing than the current panel while still displaying every achievement
  and technology tag for the active chapter (no truncation or hiding of
  content).
- **FR-010**: All interactive player elements MUST retain accessible
  labelling (`aria-label`/`role`) and keyboard operability (Tab to focus,
  Enter/Space to select) after the rework.
- **FR-011**: The pitch MUST remain an in-browser SVG visualisation; no
  canvas or new rendering technology is introduced.

### Key Entities

- **Career Chapter** (existing `CareerChapter`): company, role, years,
  achievements, tech, pitch position. Gains a derived, short company
  abbreviation for on-pitch display (e.g., first letters or a truncated
  form of the company name).
- **Ball Marker**: a visual element representing which chapter is active and
  animating between two pitch positions on selection change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can identify which company a given player represents
  without clicking, for 100% of chapters, by reading the on-pitch
  abbreviation and/or company name.
- **SC-002**: Selecting a new chapter produces one continuous, non-jarring
  transition (the travelling ball) with no more than one visual state change
  perceived per selection, replacing the previous instant highlight swap.
- **SC-003**: The reworked chapter detail panel occupies visibly less
  vertical space than the current panel for the same chapter content
  (qualitative reduction, verified by side-by-side comparison), with zero
  content omitted.
- **SC-004**: A first-time visitor can state, after reading the tip alone,
  that players on the pitch are clickable.

## Assumptions

- "Blue selected ball" refers to the current active-player halo/highlight
  styling in `CareerPitch.tsx`; this spec treats "remove it" as "replace the
  colour-block highlight with the travelling-ball motion," since the pitch
  still needs some way to show which player is active.
- Company abbreviations are derived automatically from the existing
  `company` field (e.g., initials or a short truncation) rather than
  requiring new content authoring in the chapter data.
- "Showcase" refers to the existing Work section's `SystemCard` component
  and its section pattern (summary, tags, compact spacing); the detail panel
  adopts that pattern's structure and density, not its exact visual
  skin (the career section keeps its own colour treatment).
- The tip is static, site-authored text, not derived from chapter data or
  personalized per visitor.
- The existing controls (prev/next, play, company pill list) above the pitch
  are unaffected by this rework and remain as an alternative way to
  navigate chapters.
- "Small ball" implies a visibly smaller marker than the current player
  dots, distinguishing it as a moving indicator rather than another player.
