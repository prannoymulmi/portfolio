# Feature Specification: Featured Project Detail View

**Feature Branch**: `feat/project-detail-view`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "For the featured projects I want to be able to click on it and I can read the complete text. Right now it ends with... and fill the description with relevant information in the detailed card. Make it concise and not too boring. If the reader wants they can still go to the project in GIthub make it clear use frontend design to figure out a good UX way to do this. Also low key show that there are other poejects in my github there are just the highlights"

## Clarifications

### Session 2026-08-17

- Q: How should the project detail open — as a centered modal overlay, an inline expansion within the card's own space, or a slide-in side panel? → A: Centered modal overlay with a dimmed backdrop over the page
- Q: Where should the low-key "more on GitHub" link sit — near the gallery's section heading/intro, as a trailing grid item, or in the page footer? → A: Near the gallery's section heading/intro, as a small text link

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read a project's full description (Priority: P1)

A visitor is scanning the featured projects gallery. Each card currently shows
a truncated description that cuts off mid-sentence. The visitor wants to read
the whole thing without losing their place in the page or the story.

**Why this priority**: This is the core complaint driving the feature — the
truncated "..." reads as unfinished and undersells the work. Without this, the
rest of the feature has nothing to attach to.

**Independent Test**: Click/tap a featured project card and confirm the full,
untruncated description is readable, with no further action required.

**Acceptance Scenarios**:

1. **Given** the featured projects gallery, **When** a visitor clicks a
   project card, **Then** the complete project description is shown with no
   truncation.
2. **Given** a project detail view is open, **When** the visitor closes it
   (close control, clicking outside, or Escape), **Then** they return to the
   gallery in the same scroll position they left it.
3. **Given** the project detail view is open, **When** the visitor reads the
   description, **Then** it reads as a concise, engaging summary rather than a
   wall of text (see FR-009 on content tone).

---

### User Story 2 - Go to the project on GitHub (Priority: P2)

Having read the full description, an interested visitor wants to see the
actual code or README behind a project.

**Why this priority**: The detail view is the natural place to convert
interest into a click-through; without a clear path out, the deeper
description is a dead end.

**Independent Test**: Open a project's detail view and confirm a clearly
labeled link to that project's GitHub repository is visible and opens the
repository in a new tab.

**Acceptance Scenarios**:

1. **Given** a project detail view is open, **When** the visitor looks for a
   way to see the code, **Then** a clearly labeled GitHub link is visibly
   present without scrolling or searching.
2. **Given** the GitHub link, **When** the visitor activates it, **Then** the
   project's repository opens in a new tab, leaving the portfolio open.

---

### User Story 3 - Discover there are more projects on GitHub (Priority: P3)

A visitor who has looked through all the featured projects wonders whether
this is the visitor's complete body of work.

**Why this priority**: Lowest priority because the featured set stands on its
own — this is a light-touch addition, not something the page depends on. It
should not compete for attention with the featured work itself.

**Independent Test**: View the projects gallery (with or without opening a
detail view) and confirm a subtle, secondary link to the visitor's GitHub
profile is present, distinguishable from the featured project links by lower
visual emphasis.

**Acceptance Scenarios**:

1. **Given** the featured projects gallery, **When** a visitor views it,
   **Then** a low-emphasis link to the full GitHub profile is present
   somewhere in or near the gallery.
2. **Given** that link, **When** the visitor activates it, **Then** the
   visitor's GitHub profile (repository list) opens in a new tab.

---

### Edge Cases

- What happens if a visitor opens a detail view, then resizes the window or
  rotates a mobile device? The detail view must remain readable and its
  controls (close, GitHub link) must stay reachable.
- What happens if a visitor navigates via keyboard only (no mouse/touch)? The
  card must be focusable and openable with Enter/Space, and Escape must close
  the detail view and return focus to the card that opened it.
- What happens if a visitor has `prefers-reduced-motion` enabled? The open/close
  transition must be instant or minimal rather than the default motion.
- What happens if a project has no metric or role (both are optional fields)?
  The detail view must degrade gracefully, omitting the field rather than
  showing an empty label.
- What happens when a visitor opens one project's detail view and then clicks
  a different project card without closing the first? Only one detail view is
  open at a time — opening a second replaces the first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let a visitor open a detail view for any
  featured project by clicking or tapping its card.
- **FR-002**: The detail view MUST display the project's complete description
  text with no truncation and no "..." cutoff.
- **FR-003**: The detail view MUST display a clearly labeled link that opens
  the project's GitHub repository in a new browser tab.
- **FR-004**: The detail view MUST be dismissible via an explicit close
  control, a click/tap outside the detail view, and the Escape key.
- **FR-005**: The detail view MUST be fully operable by keyboard: reachable
  via Tab, openable via Enter/Space, closable via Escape, with focus trapped
  inside the modal while it is open and returned to the triggering card on
  close.
- **FR-006**: The detail view MUST render as a centered modal overlay with a
  dimmed backdrop over the rest of the page, and MUST prevent the page behind
  it from scrolling while open.
- **FR-007**: Opening or closing a detail view MUST NOT change the page URL or
  navigate away from the single-page story.
- **FR-008**: The featured projects gallery's section heading or intro area
  MUST include a small text link to the visitor's full GitHub profile, styled
  with lower visual emphasis than the per-project GitHub links and positioned
  outside the project grid so it never reads as a fourth featured item.
- **FR-009**: The low-emphasis GitHub profile link MUST communicate that the
  featured projects are a curated subset (e.g. wording such as "more on
  GitHub") rather than the complete list.
- **FR-010**: The description text shown in the detail view MUST be written to
  be concise and engaging on its own — not simply the same truncated sentence
  continued at length, but content that reads well in full.
- **FR-011**: The detail view's open/close transition MUST respect
  `prefers-reduced-motion` via the existing motion-preference handling already
  used elsewhere on the site.

### Key Entities

- **Project**: Existing entity (title, description, tags, links, optional
  role/metric). No new fields are required — the detail view surfaces the
  same description already stored per project, just without visual
  truncation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can read a project's complete description in one
  click/tap from the gallery, with zero additional navigation.
- **SC-002**: 100% of each featured project's description text is available
  to the visitor on demand — none permanently hidden behind a fixed-line
  truncation.
- **SC-003**: A visitor can reach a project's GitHub repository in exactly one
  click from the open detail view.
- **SC-004**: A visitor can discover the full GitHub profile from the gallery
  without that link visually outranking any featured project.
- **SC-005**: The entire flow (open detail, read, follow GitHub link or close)
  is completable using only a keyboard.

## Assumptions

- "Featured projects" refers to the existing projects gallery on the
  single-page story (currently the three entries in `projects.json`); no new
  content source is introduced.
- Each project already has (or will have) a GitHub link among its `links`
  entries; where a project's most relevant link is not GitHub, the existing
  primary link is used in its place.
- "Low-key" is interpreted as a visually secondary, single link near the
  gallery (not a full repository list rendered on the page) — pulling a live
  list of the visitor's other repositories is out of scope for this feature.
- The detail view is a centered modal overlay with a dimmed backdrop,
  presented in-page rather than as a separate route, consistent with the
  site's single-page structure.
- Existing project data (title, description, tags, role, metric) is reused
  as-is; rewriting the underlying `projects.json` copy, if needed for tone,
  is a content edit that can happen alongside or after this feature ships.
