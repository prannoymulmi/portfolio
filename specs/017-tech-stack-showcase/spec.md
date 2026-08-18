# Feature Specification: Technologies Chapter

**Feature Branch**: `feat/tech-stack-showcase`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "look at the showcase I want to have a technologies section where I showcase what tecnologies I worked with Make it exactly like it is there. Use my skills and others to get the tech I used and how long. Also I want to tell the visitors that I made it using claude code using Spec driven development. It is also in my featured project. Make it more noticable but also not the highlight of the portfolio."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse technologies by category and depth (Priority: P1)

A visitor scrolls to the new Technologies chapter and sees every technology the
site owner has actually worked with, grouped into categories, each showing how
long it's been used. The visitor can filter by category and select an
individual technology to see more detail about where and how it was used.

**Why this priority**: This is the core value of the chapter — proving real,
dated experience rather than an unordered list of buzzwords. Without it there
is no chapter.

**Independent Test**: Land on the chapter with no interaction; confirm every
technology is visible with a category and a duration. Click a category filter
and confirm the list narrows to that category only. Select one technology and
confirm its detail (duration, where it was used, level of depth) appears.

**Acceptance Scenarios**:

1. **Given** the visitor scrolls to the Technologies chapter, **When** the
   chapter renders, **Then** every technology is shown with its category and
   duration of use, grouped so the visitor can scan by category at a glance.
2. **Given** the full technology list is showing, **When** the visitor selects
   a category filter, **Then** only technologies in that category remain
   visible, and an "All" option returns to the full list.
3. **Given** the technology list is showing, **When** the visitor hovers or
   taps one technology, **Then** a detail panel updates to show that
   technology's duration, proficiency level, and a short note on where/how it
   was used.
4. **Given** the visitor is on a touch device, **When** they tap a technology,
   **Then** the same detail panel updates (hover is not required to access the
   detail).

---

### User Story 2 - Learn the site itself was built with Claude Code + spec-driven development (Priority: P2)

A visitor reading the Technologies chapter or the featured "This Portfolio"
project sees a clear, low-key note that this site was designed and built using
Claude Code with spec-driven development — informative, not a banner.

**Why this priority**: The user explicitly wants this fact surfaced to
visitors, but explicitly does not want it to dominate the page. It supports
the credibility story the Technologies chapter is already telling, so it rides
along with P1 rather than requiring its own chapter.

**Independent Test**: View the Technologies chapter and the featured project
list independently; confirm each mentions Claude Code and spec-driven
development exactly once, in a way that reads as supporting detail rather than
a headline claim.

**Acceptance Scenarios**:

1. **Given** the visitor is in the Technologies chapter, **When** they read
   it, **Then** they encounter one clear mention that the site itself was
   built with Claude Code using spec-driven development, styled consistently
   with the rest of the chapter's supporting text (not a hero-sized claim).
2. **Given** the visitor opens the "This Portfolio" entry in the featured
   projects, **When** they read its description, **Then** the Claude Code /
   spec-driven development detail is present and easy to notice, without
   changing that project's rank or size relative to the other featured
   projects.

---

### User Story 3 - Trust the numbers are real (Priority: P3)

A visitor who is skeptical of a "years of experience" claim can see that each
duration traces back to actual professional history (roles and their dates)
rather than being an arbitrary number typed into a list.

**Why this priority**: Nice-to-have credibility reinforcement once the chapter
already exists and works; not required for the chapter to deliver its core
value, but consistent with the site's existing pattern of only showing claims
it can back up (e.g. project `metric` fields).

**Independent Test**: Compare each technology's displayed duration against the
site owner's existing work-history content; confirm no technology shows a
duration unconnected to when it was actually used professionally.

**Acceptance Scenarios**:

1. **Given** a technology used across multiple roles, **When** its duration is
   computed, **Then** it reflects the combined real time span it was used, not
   a guessed or rounded-up number.
2. **Given** a technology with no traceable professional history, **When** the
   chapter is built, **Then** it is either omitted or clearly marked as
   personal/learning use rather than shown with a fabricated duration.

### Edge Cases

- What happens when a technology's duration cannot be traced to any dated
  history? It MUST NOT display a fabricated duration; it is either left out of
  this chapter or shown without a duration claim.
- What happens when a category has only one technology after filtering? The
  filtered view still renders correctly with a single item, no broken layout.
- What happens on a touch device where there is no hover state? Tapping a
  technology must produce the same detail view a mouse hover would.
- What happens when a visitor uses keyboard-only navigation? Every filter
  control and technology item must be reachable and operable via keyboard,
  with visible focus states.
- What happens under `prefers-reduced-motion`? Any entrance or transition
  motion in this chapter must respect the site's existing reduced-motion
  behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST present a Technologies chapter listing the
  technologies the site owner has professionally used, each labeled with a
  category and a duration of use.
- **FR-002**: The chapter MUST let visitors filter the technology list by
  category, including an option to view all categories together.
- **FR-003**: The chapter MUST let visitors select an individual technology
  (via hover, tap, or keyboard focus) to see a detail view with its duration,
  proficiency level, and a short note on where/how it was used.
- **FR-004**: Every duration and proficiency claim MUST be derived from the
  site owner's actual recorded work history (roles and their date ranges,
  with the technologies used in each), not invented figures.
- **FR-005**: The chapter MUST include one clearly readable mention that the
  site itself was designed and built using Claude Code with spec-driven
  development.
- **FR-006**: The featured "This Portfolio" project entry MUST continue to
  state that it was built using Claude Code and spec-driven development, and
  this detail MUST be easy to notice without resizing, reordering, or
  otherwise elevating that project above the other featured projects.
- **FR-007**: The Technologies chapter MUST be visually consistent with the
  site's existing chapters (its typography, spacing, motion, and interaction
  patterns) rather than introducing a new visual language.
- **FR-008**: The Technologies chapter MUST NOT be styled or positioned as the
  most prominent chapter on the page (e.g., no larger scale, no exclusive
  color treatment, no top-of-page placement) — it earns attention through
  content, not through visual dominance over the rest of the story.
- **FR-009**: All interactive elements in the chapter (filters, technology
  selection) MUST be operable via keyboard and screen reader, consistent with
  the rest of the site's accessibility behavior.
- **FR-010**: The chapter MUST render correctly and remain usable at mobile,
  tablet, and desktop widths.

### Key Entities

- **Technology entry**: A tool, language, or platform the site owner has used
  professionally. Attributes: name, category, duration of use, proficiency
  level, and a short note on context of use. Duration and note trace back to
  one or more work-history roles.
- **Work-history role**: An existing entity (job title, employer, date range,
  technologies used in that role) that Technology entries derive their
  duration and context from.
- **Featured project entry**: An existing entity representing a project shown
  in the site's featured work; the "This Portfolio" entry is one instance that
  carries the Claude Code / spec-driven development detail.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can identify at least one technology, its category,
  and how long it's been used within 5 seconds of the chapter coming into
  view, with no interaction required.
- **SC-002**: A visitor can narrow the technology list to a single category in
  one interaction (one click or tap).
- **SC-003**: A visitor can find the detail (duration, level, context) for any
  single technology in one interaction (hover, tap, or keyboard focus) — no
  navigation to another page required.
- **SC-004**: 100% of displayed technology durations trace to a dated entry in
  the site owner's recorded work history — none are estimated or invented.
- **SC-005**: A visitor reading either the Technologies chapter or the
  featured projects list can state, without prompting, that the site was
  built using Claude Code and spec-driven development.
- **SC-006**: In an unprompted "what stood out" review of the page, the
  Technologies chapter is mentioned by visitors, but no more often than the
  site's existing primary chapters (opening, career, work) — confirming it
  reads as one chapter among several rather than the page's focal point.

## Assumptions

- "The showcase" refers to the reference prototype at `showcase/` (gitignored,
  built outside this repo) and specifically its `TechStack.tsx` component:
  category-filterable list, years-of-use bar, and a detail panel that updates
  on hover/tap/selection. "Make it exactly like it is there" is read as
  matching this interaction pattern and information density, not its literal
  color tokens or copy — those follow this site's existing design language
  (per FR-007), and its literal data storage approach (a hardcoded array)
  does not carry over, since this site's content must live in a validated
  JSON file per the existing constitution.
- "Use my skills and others" is read as: derive the technology list and
  per-technology duration from the site's existing recorded work history
  (roles, their date ranges, and the technologies used in each), since the
  site's earlier standalone skills list was deliberately removed for not
  being traceable to evidence (see the ADR that replaced it with the current
  work showcase). Technologies used across more than one role sum their
  real time spans rather than double-count overlapping periods.
- Proficiency level (e.g., "daily driver" vs "working knowledge") is not
  currently recorded as a distinct field in the site's data; this spec treats
  it as a reasonable derived label (e.g., from recency and duration) rather
  than a hand-authored classification, and implementation is free to define
  the exact levels and thresholds.
- "More noticeable but not the highlight" is read as: the Claude-Code /
  spec-driven-development mention gets its own clearly readable sentence
  (not buried in a paragraph, not omitted), while sizing, placement, and
  visual weight stay consistent with how the rest of the chapter and the
  featured project entry already present information — no banner, badge, or
  hero treatment.
- This chapter is additive: it does not replace, resize, or reorder any
  existing chapter (opening, career, work, education, contact). Its position
  in the page order is an implementation decision, made in planning, that
  respects "not the highlight" (i.e., not placed as or before the opening
  chapter).
- The featured "This Portfolio" project entry already exists in the site's
  project data and already mentions Claude Code and spec-driven development
  in its description; this feature confirms/tightens that existing copy for
  visibility rather than introducing the claim for the first time.
