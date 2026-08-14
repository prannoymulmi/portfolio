# Feature Specification: Mobile Layout Fixes

**Feature Branch**: `feat/mobile-layout-fixes`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "I want to fix some issue with the mobile format. When it is in mobile there is always a space that is crollable to the right and also the navbar does not scroll all the way together. Also in the football caarer play section I want the date to be above What I built not in the bottom."

## Clarifications

### Session 2026-08-14

- Q: How should the layout success criteria (SC-001/002/003 — zero horizontal scroll at the named widths, navigation bar pinned and aligned throughout) be verified, given the project's test environment cannot measure layout geometry? → A: Hybrid — the geometry checks are verified manually against a written checklist covering the named widths, both orientations, 200% zoom and both colour themes; alongside that, automated tests cover only what is structurally assertable without a layout engine (that the sections requiring overflow containment carry it, and the career panel's element order). No new test dependency, ADR or constitution amendment is introduced by this feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The page ends where the screen ends on a phone (Priority: P1)

A visitor opens the site on a phone and swipes sideways anywhere on the page.
Nothing moves horizontally: there is no strip of empty surface to the right of
the content, and no chapter can be dragged off-centre. Every chapter reads at
the width the phone gives it, with the same left and right gutters top to
bottom.

**Why this priority**: This is the defect that affects every chapter and every
mobile visitor at once. A page that slides sideways reads as broken before any
of its content is judged, and it also causes the navigation complaint in User
Story 2 — fixing it is the largest single improvement and unblocks the rest.

**Independent Test**: On a phone-width viewport, swipe left-to-right and
right-to-left at the top, middle and bottom of the page. The page must not
move horizontally and no empty area must appear beside any chapter.

**Acceptance Scenarios**:

1. **Given** the story page is open at a phone-width viewport, **When** the
   visitor attempts to scroll or swipe horizontally at any vertical scroll
   position, **Then** the page does not move sideways and no empty space is
   revealed to the right of the content.
2. **Given** the story page is open at a phone-width viewport, **When** the
   visitor scrolls from the opening chapter to the footer, **Then** every
   chapter's content stays fully within the visible width, with no element
   extending past either edge and no element cut off mid-word.
3. **Given** the visitor has the section menu open at a phone-width viewport,
   **When** the menu is opened, used and closed, **Then** the page still
   cannot be scrolled horizontally at any point during or after that
   interaction.

---

### User Story 2 - The navigation bar stays with the page it belongs to (Priority: P2)

A visitor scrolling the story on a phone sees the floating navigation bar stay
put at the top of the screen, aligned with the chapters beneath it, for the
whole length of the page. It never drifts out of alignment with the content,
never slides partly off the side of the screen, and never stops following the
visitor part-way down the story.

**Why this priority**: The bar carries the section menu, the profile links and
the theme control — the only navigation on the site. It is high value but
narrower in scope than User Story 1, and on the current build its misbehaviour
is visible mainly once the page has been pushed sideways, so it is second.

**Independent Test**: At a phone-width viewport, scroll from the very top of
the page to the very bottom and confirm the bar remains pinned, fully visible,
horizontally centred with equal gutters, and in step with the content
underneath it at every point.

**Acceptance Scenarios**:

1. **Given** the story page is open at a phone-width viewport, **When** the
   visitor scrolls to any chapter including the last one and the footer,
   **Then** the navigation bar is still pinned at the top of the screen and
   entirely visible.
2. **Given** the visitor is scrolling on a phone, **When** the page moves
   vertically, **Then** the navigation bar and the content beneath it stay in
   horizontal alignment — the bar's gutters match the chapters' gutters and
   neither shifts relative to the other.
3. **Given** the navigation bar is pinned, **When** the visitor scrolls,
   **Then** the scroll-progress indicator on the bar continues to reflect how
   far through the story the visitor is, ending full at the bottom of the
   page.

---

### User Story 3 - The career chapter opens with its date (Priority: P3)

A visitor exploring the football-pitch career section selects a player and
reads the chapter panel beside it. The dates that chapter covers appear at the
top of the panel's detail, above the "What I built" summary, so the visitor
knows *when* before reading *what* — rather than finding the dates only after
scrolling past the achievements and technologies.

**Why this priority**: A content-ordering improvement rather than a defect. It
is real value for scanning the career, but the page works without it, so it
comes after the two layout faults.

**Independent Test**: Open the career section, select each chapter in turn and
confirm the date line is rendered above the "What I built" summary, and that
nothing else in the panel is lost or duplicated.

**Acceptance Scenarios**:

1. **Given** the career section is in its interactive pitch mode, **When** the
   visitor selects any chapter, **Then** the chapter's date range appears
   above the "What I built" summary in that chapter's panel.
2. **Given** any chapter is selected, **When** the panel is read from top to
   bottom, **Then** it contains exactly one date line, and no date line
   remains at the foot of the panel.
3. **Given** a chapter with no "What I built" summary available, **When** it is
   selected, **Then** the date line still appears above the remaining detail
   sections rather than falling to the foot of the panel.

---

### Edge Cases

- What happens at the narrowest supported phone width (320px) where headings,
  company names and technology tags are most likely to be the widest elements
  on the page?
- What happens in landscape orientation on a phone, and on a tablet-width
  viewport, where the same decorative and full-bleed elements are sized
  differently?
- What happens when a visitor zooms to 200% at a phone width, which
  effectively halves the layout width again?
- How does the page behave while the section menu slides in and out — the menu
  travels from off the right edge, and that motion must not leave a
  horizontally scrollable page behind it.
- How do decorative background washes, glows and the full-bleed photograph
  behave once horizontal overflow is prevented — they must still cover the
  full width of their chapters rather than being visibly boxed in or losing
  their soft edges.
- What happens on the career panel when a chapter has achievements or
  technologies but no summary, or no technologies at all — the date must stay
  first in either case.
- Does the plain-list ("timeline") view of the career section need changing?
  It already presents the date ahead of the description, so it must be left
  visually unchanged by this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST NOT be horizontally scrollable at any viewport
  width from 320px up to and including 768px, at any vertical scroll position,
  in either colour theme.
- **FR-002**: No element on the page MAY extend beyond the visible viewport
  width at those widths — including decorative washes, glows, the backdrop
  photograph, and the pitch visualisation.
- **FR-003**: Preventing horizontal overflow MUST NOT clip, hide or truncate
  any readable content, and MUST NOT box decorative full-bleed elements into
  narrower panels than they occupy today.
- **FR-004**: Preventing horizontal overflow MUST NOT disable or degrade the
  navigation bar's pinned-at-top behaviour, the page's smooth in-page anchor
  scrolling, or the pinned backdrop photograph.
- **FR-005**: The navigation bar MUST remain pinned at the top of the viewport
  and fully visible for the entire length of the page at all viewport widths,
  including over the final chapter and the footer.
- **FR-006**: The navigation bar MUST stay horizontally aligned with the page
  content while scrolling — its left and right insets MUST remain constant and
  it MUST NOT move sideways relative to the chapters beneath it.
- **FR-007**: The navigation bar's scroll-progress indicator MUST continue to
  track scroll position, reaching its full extent at the bottom of the page.
- **FR-008**: The career chapter panel MUST display the chapter's date range
  above its "What I built" summary.
- **FR-009**: The career chapter panel MUST display exactly one date line, in
  its new position only — no date line may remain at the foot of the panel.
- **FR-010**: The date's new position MUST apply at every viewport width, not
  only on mobile.
- **FR-011**: The date line MUST keep the visual treatment it has today (its
  calendar mark, monospaced label styling, and accessible-name behaviour)
  after moving.
- **FR-012**: When a chapter has no "What I built" summary, the date line MUST
  still render above whichever detail sections the panel does show.
- **FR-013**: All existing interactive behaviour of the navigation bar and the
  career section — the section menu, keyboard operation, focus styling and
  reduced-motion handling — MUST be unchanged by this feature.

### Key Entities *(include if feature involves data)*

- **Career Chapter Panel**: the detail panel for one career chapter. Presents,
  in order after this feature: chapter/position label, company, role, date
  range, "what I built" summary, achievements, technologies. No new data is
  introduced — only the order in which existing fields are presented changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At each of the viewport widths 320px, 360px, 375px, 390px, 414px
  and 430px, the page's total scrollable width equals the viewport width — a
  horizontal swipe moves the page 0px.
- **SC-002**: The same measurement holds at 768px and in landscape phone
  orientation, and at 200% zoom on a 375px-wide viewport.
- **SC-003**: Scrolling the full page at a phone width shows the navigation
  bar present and fully within the viewport in 100% of sampled scroll
  positions (top, each chapter boundary, footer), with its side gutters
  unchanged between samples.
- **SC-004**: 100% of career chapters display their date above the "What I
  built" summary, and 0% display a date at the foot of the panel.
- **SC-005**: No content that is readable on the current build becomes
  unreachable, clipped or truncated at any of the widths in SC-001 and SC-002.
- **SC-006**: The existing automated test suite passes, extended with tests
  for the structurally assertable guarantees only: that every section
  requiring overflow containment carries it, and that the career panel renders
  its date ahead of the "What I built" summary. Career-panel assertions are
  updated only for the new ordering.
- **SC-007**: SC-001, SC-002, SC-003 and SC-005 are confirmed by a written
  manual verification checklist, run in a browser before handoff, covering
  every listed width, both orientations, 200% zoom and both colour themes,
  with each check recorded as passed.

## Assumptions

- "Mobile" is taken to mean viewport widths from 320px to 768px inclusive, in
  both orientations; the horizontal-overflow requirement is stated for that
  range but any fix is expected to hold at wider widths too.
- "The navbar does not scroll all the way together" is read as the bar losing
  alignment with the page — sliding out of position sideways and no longer
  appearing to belong to the content beneath it — which is the visible
  consequence of the page being wider than the screen. It is specified here as
  its own requirement so that it is verified independently, in case a separate
  cause remains once User Story 1 is fixed.
- The bar's current design intent is unchanged: it stays a floating, pinned
  bar inset from the screen edges, not a full-bleed browser-chrome strip.
- The date reorder applies to the career chapter panel used by the interactive
  pitch view, at all viewport widths. The plain-list career view already shows
  dates ahead of the description and is out of scope.
- No content, schema or copy changes are required — the date text, summary and
  every other field already exist.
- Verification is split by what each method can actually observe: geometry
  (scrollable width, pinned position, gutters) is checked manually in a
  browser, because the project's test environment has no layout engine;
  structure (overflow containment present, career panel element order) is
  checked by automated tests. This feature introduces no new testing tool, so
  no ADR or constitution amendment is required.
- Verification is done against the current supported browsers, with mobile
  Safari and Chrome on Android as the reference targets, since horizontal
  overflow behaviour differs most there.
