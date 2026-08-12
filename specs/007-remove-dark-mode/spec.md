# Feature Specification: Remove Dark Mode

**Feature Branch**: `feat/remove-dark-mode`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "remove the dark mode as it complicates things to manage always two designs also add an ADR"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every visitor sees the same site (Priority: P1)

A visitor opens the portfolio. Whatever their device is set to — light, dark, or
switching automatically at sunset — they see the one design the site was built
for: the sunset photograph at full strength behind the story, warm ink on the
chapter scrims, the three coloured bars in the opening headline.

Today that same visitor gets one of two different sites depending on a setting
they never chose for this site. The dark one dims the photograph to a fifth of
its opacity, which quietly removes the thing the whole design is built around.

**Why this priority**: This is the feature. Everything else is bookkeeping that
follows from it. Delivered alone, it already achieves the goal — one design to
maintain, and the design that was actually art-directed.

**Independent Test**: Load the site with the operating system set to dark, then
again set to light, then again with the system switching mid-visit. All three
render identically to the light design, with no flash of any other palette at
any point.

**Acceptance Scenarios**:

1. **Given** a visitor whose OS is set to dark mode, **When** they load any part
   of the story, **Then** they see the light design, at full photographic
   strength, with no dark-palette frame at any point during load.
2. **Given** a visitor who previously chose "dark" on this site and has that
   choice stored in their browser, **When** they return, **Then** they see the
   light design and the stale stored choice has no effect.
3. **Given** a visitor with the OS switching from light to dark while the page is
   open, **When** the switch happens, **Then** nothing on the page changes.
4. **Given** a visitor on any chapter, **When** they read body copy over the
   photograph, **Then** the text still clears WCAG AA against the surface behind
   it.

---

### User Story 2 - The theme control is gone (Priority: P2)

The control that switched between the two designs no longer appears in the
navigation bar, because there is nothing left for it to switch between. The space
it occupied closes up rather than leaving a gap, and the remaining navigation
items keep their spacing and alignment on both desktop and mobile.

**Why this priority**: A toggle that does nothing is worse than no toggle. But
the site is already correct once P1 lands — this is the visible tidy-up, not the
outcome.

**Independent Test**: Open the navigation bar at desktop and mobile widths and
confirm no theme control is present and no empty slot is left behind.

**Acceptance Scenarios**:

1. **Given** a visitor on any viewport width, **When** they look at the
   navigation bar, **Then** no theme switch is offered.
2. **Given** the navigation bar with the control removed, **When** it renders at
   mobile and desktop widths, **Then** the remaining items are spaced and aligned
   as they were, with no empty slot.
3. **Given** a keyboard user tabbing through the navigation, **When** they reach
   where the control used to be, **Then** focus moves to the next real control
   with no invisible stop.

---

### User Story 3 - The decision is recorded, not just made (Priority: P3)

A future reader — including the author in six months — finds a written record of
why the site has one theme. Without it, "the site should probably support dark
mode" is a reasonable-sounding suggestion that reintroduces the exact cost this
feature removes, and the earlier records still say dark mode is required.

**Why this priority**: The site works correctly without this. But the governing
rules require it, and the maintenance saving is only durable if the reasoning
survives.

**Independent Test**: Read the decision record and the governing document with no
other context and correctly answer: does this site support dark mode, and why not?

**Acceptance Scenarios**:

1. **Given** the merged change, **When** a reader opens the decision index,
   **Then** a new record explains the removal and names every earlier record it
   supersedes or amends.
2. **Given** the earlier records that required dark mode, **When** a reader opens
   them, **Then** their original text is intact and each carries a dated note
   pointing forward to the new record.
3. **Given** the governing document, **When** a reader checks it for what the
   site's theming must be, **Then** it describes a single theme and no longer
   requires the removed machinery.

---

### Edge Cases

- **A stored preference from before the change.** Returning visitors have
  "dark" or "system" saved in their browser from the old site. It must be inert,
  and must not produce a flash of the old palette before being ignored.
- **The operating system set to dark.** The single most common path into the old
  dark design. It must have no effect, including on browser-drawn chrome such as
  form controls, scrollbars, and the mobile address bar.
- **Contrast that was only ever verified in one theme.** Some colour pairings
  were chosen for the dark design and never checked against the light surface.
  Every text-on-surface pairing that remains must be verified against the light
  design specifically, not assumed to pass because it passed somewhere.
- **Hand-drawn annotation marks.** These pick their colour from the active theme
  at draw time and redraw when it changes. With one theme they must draw once, in
  the light colours, and never redraw for a theme reason.
- **Reduced-motion visitors.** The removal must not disturb the existing
  reduced-motion behaviour, which shares code paths with the annotation marks.
- **Printing the page.** Print output must remain legible; it must not inherit a
  dark surface from a half-removed rule.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST present exactly one visual design to every visitor.
- **FR-002**: The design presented MUST be the current light design, at full
  photographic strength, with the sunset photograph undimmed behind every chapter.
- **FR-003**: The operating system's colour-scheme preference MUST have no effect
  on the site's appearance.
- **FR-004**: A theme preference stored in a returning visitor's browser from
  before this change MUST have no effect on the site's appearance and MUST NOT
  cause a visible flash of a different palette.
- **FR-005**: The site MUST NOT offer any control for changing theme.
- **FR-006**: Removing that control MUST NOT change the spacing, alignment, or
  keyboard focus order of the remaining navigation items at any viewport width.
- **FR-007**: All alternate-theme styling MUST be removed from the codebase
  rather than left unreachable, so no second design remains to maintain.
- **FR-008**: The dependency that existed solely to manage theme state MUST be
  removed from the project's dependencies.
- **FR-009**: Every text-and-surface pairing that remains MUST meet WCAG AA
  contrast against the light design, verified rather than assumed.
- **FR-010**: Colour values that existed only to serve the removed design MUST be
  deleted, not retained as unused definitions.
- **FR-011**: Tests covering theme switching MUST be removed; tests covering
  components that merely used the theme MUST remain and MUST pass without any
  theme context supplied.
- **FR-012**: A new decision record MUST be added explaining why the site has one
  theme, and MUST name each earlier record it supersedes or amends.
- **FR-013**: Earlier decision records that mandated dark mode MUST keep their
  original text and MUST each gain a dated note pointing to the new record; the
  decision index MUST show their updated status.
- **FR-014**: The project's governing document MUST be amended in the same change
  so it no longer requires the removed machinery, and MUST record the amendment
  with a version bump and rationale.
- **FR-015**: Existing behaviour unrelated to theming — scroll-driven motion,
  content loading and validation, navigation, reduced-motion handling — MUST be
  unchanged.

### Key Entities

- **Decision record (new)**: The written justification for a single theme. Names
  the cost being removed, the alternatives rejected, and every prior record it
  overturns.
- **Decision records (superseded)**: The three earlier records that established
  class-based dark mode, the theme-state dependency, and the two-palette styling
  approach. Their text is preserved; each gains a forward-pointing dated note.
- **Governing document**: The project constitution, whose fixed-stack and quality
  sections currently require the removed machinery and must be amended alongside.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The site renders identically under every operating-system
  colour-scheme setting — light, dark, and no preference — with zero visual
  difference between them.
- **SC-002**: No visitor, including one returning with a stored dark preference,
  sees any frame of a non-light palette at any point during page load.
- **SC-003**: The number of visual designs a contributor must update when
  changing any styling drops from two to one.
- **SC-004**: Zero alternate-theme styling declarations remain anywhere in the
  codebase.
- **SC-005**: Every text-and-surface pairing on the page meets WCAG AA (4.5:1 for
  body copy, 3:1 for large text), measured against the light design.
- **SC-006**: The full test suite, type-check, and lint pass with no theme
  context provided anywhere.
- **SC-007**: The production Lighthouse performance score remains at or above 90,
  and the accessibility score does not fall.
- **SC-008**: A reader given only the decision index and the governing document
  can state correctly that the site has one theme and why, without reading any
  code.

## Assumptions

- **The light design is the one that survives.** Confirmed with the author. It is
  also the design the site was art-directed for: the dark design dimmed the
  backdrop photograph to a fifth of its opacity, contradicting the premise that
  the photograph is the page surface (ADR 0015), and the opening's palette is
  sampled from that photograph.
- **No replacement control.** The navigation slot the theme switch occupied is
  closed, not filled with something else. That would be a separate feature.
- **No migration for stored preferences.** Old stored values are simply ignored,
  not read and cleared. Nothing reads them once the theme machinery is gone.
- **Dark-only colour values are deleted outright.** They are not kept as
  commented-out or unused definitions "in case dark mode returns" — retaining
  them would preserve exactly the two-design maintenance cost this feature exists
  to remove.
- **The change ships as one unit.** The removal, the decision record, and the
  governing-document amendment land in the same pull request, because the
  governing rules require the record and the amendment to accompany the change.
- **Browser-drawn chrome follows.** Whatever signals the browser currently uses to
  render form controls, scrollbars, and mobile address-bar colour must be pinned
  to the light design rather than left following the OS.
- **The site has no users with an accessibility need met specifically by the dark
  design.** This is a personal portfolio with no such reported requirement. If one
  emerges, it is a new feature with a new decision record — not a reason to keep
  two designs speculatively.
