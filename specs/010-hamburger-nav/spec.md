# Feature Specification: Minimal Nav with Hamburger Sections

**Feature Branch**: `010-hamburger-nav`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "I want to make the nav bar more minimalistic I want to leave the icons there but put the rest of the sections in a hamburger menu"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan a quiet nav bar (Priority: P1)

A visitor lands on the site and sees a compact nav bar: the wordmark, a hamburger
control, and the persistent icons (social links, email, theme toggle) — not a row
of seven scrolling chapter names competing for attention.

**Why this priority**: This is the entire point of the request — the current bar's
horizontally-scrolling chapter list is the clutter being removed. Without this, the
feature has not shipped anything.

**Independent Test**: Load the site at any viewport width and confirm the nav bar
shows only the wordmark, one hamburger control, and the icon group — no chapter
links inline.

**Acceptance Scenarios**:

1. **Given** the site has loaded, **When** the visitor looks at the nav bar,
   **Then** no chapter/section links (Introduction, Selected Work, Career Journey,
   Education, Projects, Technical Playbook, Contact) are visible inline in the bar.
2. **Given** the site has loaded, **When** the visitor looks at the nav bar,
   **Then** the wordmark, hamburger control, social icons, email link, and theme
   toggle are all visible, at every viewport width the bar currently supports.

---

### User Story 2 - Reach any chapter from the hamburger menu (Priority: P1)

A visitor opens the hamburger control and sees the same seven section links the
bar used to show inline, in the same order, and picking one jumps to that chapter
and closes the menu.

**Why this priority**: Moving the links out of sight must not mean losing them —
the nav's job of letting a visitor jump to any chapter is unchanged, only its
presentation is.

**Independent Test**: Open the hamburger menu, confirm all seven section links
appear in their existing order, click one, and confirm the page jumps to that
section and the menu closes.

**Acceptance Scenarios**:

1. **Given** the nav bar is at rest, **When** the visitor activates the hamburger
   control, **Then** a menu opens listing all seven sections in their current
   order (Introduction, Selected Work, Career Journey, Education, Projects,
   Technical Playbook, Contact).
2. **Given** the menu is open, **When** the visitor selects a section link,
   **Then** the page scrolls to that section's anchor and the menu closes.
3. **Given** the menu is open, **When** the visitor activates the hamburger
   control again, presses Escape, or clicks/taps outside the menu, **Then** the
   menu closes without navigating.

---

### User Story 3 - Operate the menu without a mouse (Priority: P2)

A keyboard or screen-reader user can discover, open, traverse, and close the
hamburger menu using the same means they use for the rest of the site.

**Why this priority**: The nav is the site's only wayfinding chrome (there is no
separate page-to-page navigation); it must stay fully operable for assistive
technology, matching the accessibility bar already set by the existing nav.

**Independent Test**: Tab to the hamburger control, open it with Enter/Space,
confirm focus moves into the menu and Tab cycles through its links only, confirm
Escape closes it and returns focus to the control.

**Acceptance Scenarios**:

1. **Given** keyboard focus is on the hamburger control, **When** the visitor
   presses Enter or Space, **Then** the menu opens and focus moves to the first
   link inside it.
2. **Given** the menu is open, **When** the visitor presses Escape, **Then** the
   menu closes and focus returns to the hamburger control.
3. **Given** the menu is closed, **When** a screen reader announces the control,
   **Then** it identifies itself as a menu toggle and states whether the menu is
   currently expanded or collapsed.

---

### Edge Cases

- What happens if a visitor has `prefers-reduced-motion` set? The menu MUST still
  open and close, using the site's existing reduced-motion handling instead of its
  normal open/close animation.
- What happens if the menu is open and the visitor resizes the window past a
  breakpoint where the layout changes? The menu MUST close rather than persist in
  a state that no longer matches the new layout.
- What happens if content (section list) has not finished loading yet? The
  hamburger control MUST still render and, if activated, open to whatever
  sections are available rather than appearing broken.
- What happens if a visitor navigates via keyboard past the last link in the open
  menu? Focus MUST NOT leave the menu silently; it should either wrap or move to
  a definite next stop (e.g. back to the toggle), matching standard menu focus
  behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The nav bar MUST NOT display the section/chapter links inline; it
  MUST show only the wordmark, a hamburger toggle control, and the existing icon
  group (social icons, email link, theme toggle) at every supported viewport
  width.
- **FR-002**: The nav bar MUST provide a single hamburger control that opens and
  closes a menu containing the full list of section links, in their existing
  order.
- **FR-003**: The menu MUST list every section currently reachable from the nav
  (Introduction, Selected Work, Career Journey, Education, Projects, Technical
  Playbook, Contact) with the same anchor targets and labels as today.
- **FR-004**: Selecting a section link in the menu MUST scroll the page to that
  section's anchor and close the menu.
- **FR-005**: The menu MUST close on: re-activating the hamburger control,
  pressing Escape, or a click/tap outside the menu.
- **FR-006**: The hamburger control MUST expose its expanded/collapsed state and
  purpose to assistive technology (accessible name plus expanded state).
- **FR-007**: Opening the menu MUST move keyboard focus into it; closing it MUST
  return focus to the hamburger control.
- **FR-008**: The scroll-progress indicator on the nav bar MUST continue to
  function unchanged by this feature.
- **FR-009**: Menu open/close motion MUST respect `prefers-reduced-motion` via
  the site's existing reduced-motion handling, not a new detection path.
- **FR-010**: The icon group (social icons, email link, theme toggle) MUST remain
  visible and functional in the nav bar exactly as it does today; this feature
  changes only the section links' presentation.
- **FR-011**: The hamburger menu MUST replace the inline section links at every
  viewport width the nav bar supports — there is no width at which section
  links render inline; desktop is included, not just narrow/mobile widths.

### Key Entities

- **Section link**: one entry in the site's chapter list — an id (anchor target),
  a display label, and its position in the fixed order. Already exists today;
  this feature relocates where these are rendered, not what they contain.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At every viewport width the site supports, the nav bar's default
  (menu-closed) state shows zero section links inline — only wordmark, hamburger
  control, and icons.
- **SC-002**: A visitor can reach any of the seven sections in two actions or
  fewer (open menu, select link) from anywhere on the page.
- **SC-003**: The full section list remains keyboard-reachable and screen-reader
  operable, with no regression in the accessibility behavior the current inline
  list provides today.
- **SC-004**: The nav bar's Lighthouse performance score remains at or above the
  project's existing floor (≥ 90) after the change.

## Assumptions

- "The icons" in the request refers to the persistent controls that already sit
  at the right of today's nav bar: social icons, the email link, and the theme
  toggle — not a new icon set. No new icons are introduced by this feature.
- The wordmark stays visible in the bar; the request describes trimming the
  section list, not the site's identity mark.
- The seven existing sections and their order are unchanged; only their
  presentation moves from an inline scrolling list to a hamburger-triggered menu.
- The hamburger menu is implemented as an overlay/panel triggered from the
  existing nav bar, not a separate page or route (consistent with the
  single-scrolling-story structure the constitution fixes).
