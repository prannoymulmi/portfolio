# Feature Specification: Story-Driven Portfolio Redesign

**Feature Branch**: `002-portfolio-story-redesign`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "I want to use a new gradient background that makes my portfolio look more modern. I also want to have my portfolio as a story of myself rather than clicking multiple navigation bars etc. However I want to have a interactive part as well where people can play around the play career part do not remove this remove the navigation bar and then make the portfolio like a story to tell and make a place holder for my profile picture."

## Clarifications

### Session 2026-08-10

- Q: Should the old standalone page URLs (/skills, /career, /education, /projects, /playbook, /about, /contact) keep working after the site becomes one scrolling story? → A: Redirect each old URL into the matching section of the new single-page story.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the portfolio as one continuous story (Priority: P1)

A visitor lands on the portfolio and reads through the owner's background, skills, career, education, projects, and ways to get in touch as one continuous narrative by scrolling, instead of clicking through a navigation bar to separate pages.

**Why this priority**: This is the core of the requested redesign — replacing a multi-page, nav-driven site with a single cohesive story. Without this, the feature isn't delivered.

**Independent Test**: Can be fully tested by loading the site and scrolling from top to bottom, confirming every existing content category (about, skills, career, education, projects, playbook, contact) is reachable without clicking a navigation menu, and that no persistent top nav bar is present.

**Acceptance Scenarios**:

1. **Given** a visitor on the portfolio's landing view, **When** they scroll down, **Then** they progress through the owner's story (introduction, skills, career, education, projects, playbook, contact) in a single continuous flow.
2. **Given** the redesigned portfolio, **When** the page loads, **Then** no persistent navigation bar with links to separate pages is displayed.
3. **Given** a visitor viewing the story on a mobile device, **When** they scroll, **Then** the narrative remains legible and each section is fully viewable without horizontal scrolling.

---

### User Story 2 - Explore the interactive career journey within the story (Priority: P1)

A visitor reaches the career part of the story and can actively interact with it (e.g., explore milestones, click through moments) rather than just reading static text — the existing "play with it" quality of the career section is preserved.

**Why this priority**: The user explicitly called out keeping this interactive element ("do not remove this"). It's the one interactive centerpiece of an otherwise narrative-driven experience, so losing it would be a regression.

**Independent Test**: Can be fully tested by scrolling to the career section of the story and confirming the interactive exploration behavior (present today as the standalone Career Journey page) still functions identically inside the new story layout.

**Acceptance Scenarios**:

1. **Given** a visitor has scrolled to the career part of the story, **When** they interact with it (e.g., click/tap on a milestone), **Then** the interactive career exploration responds exactly as it does today.
2. **Given** the navigation bar has been removed, **When** a visitor wants to reach the career section directly, **Then** they can still do so via in-story scrolling or an in-page shortcut, without relying on a nav bar link.

---

### User Story 3 - See a modern, on-brand first impression (Priority: P2)

A visitor's first impression of the portfolio is a modern gradient background and a clearly-reserved spot for the owner's profile picture, even before a real photo is added.

**Why this priority**: Visual modernization and personalization matter for first impressions but don't block the core story/interaction functionality — they enhance it.

**Independent Test**: Can be fully tested by loading the story's introduction and confirming a gradient background renders (in both light and dark mode) and a clearly-labeled profile picture placeholder is visible near the introduction.

**Acceptance Scenarios**:

1. **Given** a visitor loads the portfolio, **When** the introduction renders, **Then** a modern gradient background is visible behind the story content, remaining readable in both light and dark themes.
2. **Given** the owner has not yet uploaded a real profile picture, **When** a visitor views the story's introduction, **Then** a clearly-intentional placeholder occupies the profile picture spot instead of a broken image or blank space.

---

### Edge Cases

- What happens when a visitor arrives via a link that used to point directly to a former standalone page (e.g., a bookmark or resume link to "/projects")? The old URL redirects into the matching section of the new single story page (see FR-009).
- What happens when the profile picture placeholder is never replaced with a real photo? It must continue to look like an intentional design choice, not a missing asset.
- What happens when a visitor has "reduced motion" or high-contrast accessibility settings enabled? The gradient background and any scroll effects must not violate those preferences, and the interactive career section must remain usable via keyboard alone.
- What happens on a very long story page for a visitor who wants to skip ahead (e.g., straight to Contact)? There must be some in-page way to jump between sections without a traditional nav bar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The portfolio MUST present its content (about, skills, career, education, projects, playbook, contact) as a single continuous scrolling story rather than as separate pages requiring navigation-bar clicks.
- **FR-002**: The portfolio MUST remove the persistent navigation bar (including its mobile menu equivalent) from the browsing experience.
- **FR-003**: The portfolio MUST apply a modern gradient background to the story, remaining legible and accessible (sufficient text contrast) in both light and dark themes.
- **FR-004**: The portfolio MUST preserve the existing interactive career-journey exploration experience, unchanged in its interactivity, embedded as a chapter within the story.
- **FR-005**: The portfolio MUST include a clearly-labeled placeholder for the owner's profile picture near the story's introduction, so the spot never appears broken or empty before a real photo is added.
- **FR-006**: The portfolio MUST present every existing content category in a coherent, readable narrative order from introduction through contact information.
- **FR-007**: The portfolio MUST provide an in-page way to jump between story sections (e.g., a scroll-linked progress indicator or anchor shortcuts) so visitors are not forced to scroll through the entire story to reach a specific part, and so keyboard/screen-reader users retain a way to skip ahead.
- **FR-008**: The portfolio MUST remain fully readable and usable on both mobile and desktop viewport sizes.
- **FR-009**: The portfolio MUST redirect each previous standalone page URL (/skills, /career, /education, /projects, /playbook, /about, /contact) to the matching section of the new single-page story, so existing bookmarks, shared links, and search results continue to work.
- **FR-010**: The portfolio MUST relocate any external links previously in the navigation bar (e.g., GitHub, LinkedIn) to a place still reachable within the story (such as the contact section or a footer), since the nav bar itself is being removed.

### Key Entities

- **Story Section**: A segment of the single-page narrative (Introduction, About, Skills, Career, Education, Projects, Playbook, Contact) with its own content, visuals, and place in reading order.
- **Profile Picture Placeholder**: The reserved visual slot at the story's introduction representing the owner, shown until a real photograph is provided.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can view the owner's entire portfolio story by scrolling alone, without clicking any navigation menu.
- **SC-002**: 100% of the content categories previously found on separate pages (skills, career, education, projects, playbook, about, contact) are present and reachable within the unified story.
- **SC-003**: The interactive career-exploration element remains fully functional within the story, with at least 80% of visitors in informal testing recognizing it as something they can click/interact with (not just read).
- **SC-004**: Text throughout the story maintains readable contrast against the new gradient background in both light and dark themes, meeting standard accessibility contrast guidelines.
- **SC-005**: The profile picture placeholder can be replaced with a real photo through a content update alone, with no visible layout break before or after the swap.
- **SC-006**: Every previous standalone page URL redirects a visitor to the matching section of the new story, with no broken (404) links among the old URLs.

## Assumptions

- The "interactive part... the play career part" refers to the existing interactive Career Journey experience (currently its own page); its interaction model stays the same — only its presentation context moves into the story.
- A natural narrative order for the story is: Introduction (with profile picture placeholder) → About → Skills → Career Journey (interactive) → Education → Projects → Playbook → Contact.
- The profile picture placeholder is a static, generic graphic (e.g., a silhouette or initials avatar) that the owner can later swap for a real photo through the same content-update process used for other portfolio content — no upload UI is required.
- "Modern gradient background" means a subtle, contemporary color gradient applied consistently across the story, adapting to both light and dark themes, and never reducing text legibility below current standards.
- "Remove the navigation bar" refers to the persistent top nav/menu used for page-to-page navigation; a minimal accessibility aid (e.g., a skip link or scroll-position indicator) is still allowed since it does not function as a multi-page nav.
