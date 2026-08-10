# Feature Specification: Annotated Hero & Working Theme Switching

**Feature Branch**: `003-hero-annotations-theming`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "Look at this website https://simple-developer-portfolio-website.vercel.app/ — I want to use rough notation in my Hero section like how this guy did where my profile picture is on the right side as well and text like Software Engineer, AI enthusiast, Security Nerd are then highlighted. Also fix the dark and light mode. You can use next-themes as it is a good fit with next."

## Clarifications

### Session 2026-08-10

- Q: Should the three new role phrases replace the owner's existing published roles everywhere, or only in the hero? → A: Hero uses the three new casual phrases; the site-wide description stays professional but is rewritten to fold in the new focus areas — e.g. "Senior software engineer and cloud architect, with a focus on AI and security."
- Q: Should the style of each hand-drawn mark be editable as content, or fixed in code as a design decision? → A: Phrases stay editable as content; mark styles are fixed in code as a deliberate sequence applied in order.
- Q: When the portrait moves in beside the introduction, which of the hero's current elements should stay? → A: Keep the name, annotated phrases, intro line, and call-to-action buttons; drop the "Core Expertise" skills card, which duplicates the Skills chapter below.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Meet the owner through a hand-annotated introduction (Priority: P1)

A visitor lands on the portfolio and reads a short introduction naming the owner and what they do. The phrases that describe the owner's identity are marked with hand-drawn annotations — the kind a person would scrawl over printed text with a marker — so the eye lands on them first and the page feels personally made rather than generated.

**Why this priority**: This is the headline request and the first thing every visitor sees. It carries the personality of the whole portfolio; without it the redesign isn't delivered.

**Independent Test**: Load the site and look at the introduction without scrolling. Confirm the owner's name and role phrases are present, and that each designated role phrase carries a visible hand-drawn annotation that draws itself in on load.

**Acceptance Scenarios**:

1. **Given** a visitor loads the portfolio, **When** the introduction renders, **Then** the owner's name and an introductory sentence are visible, with each designated role phrase carrying a hand-drawn annotation.
2. **Given** the annotations animate as they draw in, **When** the animation finishes, **Then** every annotated phrase remains legible with the annotation visible behind or around it, not obscuring the words.
3. **Given** a visitor has "reduced motion" enabled, **When** the introduction renders, **Then** the annotations appear in their finished state without animating.
4. **Given** a visitor resizes the window or the page's fonts finish loading, **When** the introduction text reflows onto different lines, **Then** each annotation re-aligns to the words it belongs to rather than drifting away from them.

---

### User Story 2 - Switch between light and dark and have it actually work (Priority: P1)

A visitor can find a control to switch the site between light and dark, the whole page responds immediately, and their choice is still in effect the next time they open the site.

**Why this priority**: Theme switching is currently broken end to end — there is no visible control anywhere on the site, and even when one existed the page's styles followed the operating-system setting rather than the visitor's choice. This is a fix to advertised functionality, not an enhancement.

**Independent Test**: Load the site, find the theme control, switch it, and confirm every part of the page changes theme. Reload and confirm the choice survived. Confirm no wrong-theme flash appears during load.

**Acceptance Scenarios**:

1. **Given** a visitor is on any part of the story, **When** they look for a theme control, **Then** a clearly labelled light/dark control is visible and reachable by keyboard.
2. **Given** a visitor activates the theme control, **When** the theme switches, **Then** every section of the page — backgrounds, text, the background accent, and the hero annotations — updates to the chosen theme, with nothing left rendering in the previous one.
3. **Given** a visitor chose a theme on a previous visit, **When** they load the site again, **Then** the site opens in the theme they chose, regardless of their operating-system setting.
4. **Given** a visitor loads the site with a dark theme saved, **When** the page first paints, **Then** it paints dark immediately, with no flash of the light theme first.
5. **Given** a first-time visitor with no saved choice, **When** they load the site, **Then** it opens matching their operating-system preference.

---

### User Story 3 - See the owner's portrait beside the introduction (Priority: P2)

A visitor sees the owner's profile picture sitting alongside the introduction — portrait on one side, words on the other — so the introduction reads as a person introducing themselves rather than a block of text.

**Why this priority**: It makes the introduction feel personal and balances the layout, but the introduction still communicates everything it needs to without it. It enhances User Story 1 rather than blocking it.

**Independent Test**: Load the site on a desktop-width window and confirm the portrait and the introduction sit side by side; narrow to a phone width and confirm they stack without overflow.

**Acceptance Scenarios**:

1. **Given** a visitor on a desktop-width screen, **When** the introduction renders, **Then** the profile picture sits to one side of the introductory text rather than above it.
4. **Given** the hero has been reworked, **When** a visitor reads it, **Then** the name, annotated phrases, introductory line, and call-to-action buttons are all present, and the "Core Expertise" card is gone — with the Skills chapter below still presenting that content.
2. **Given** a visitor on a phone-width screen, **When** the introduction renders, **Then** the portrait and text stack vertically, remain fully visible, and cause no horizontal scrolling.
3. **Given** no real profile photo has been supplied yet, **When** the introduction renders, **Then** the reserved placeholder occupies the portrait position and looks intentional rather than broken.

---

### User Story 4 - Understand why the technical choices were made (Priority: P3)

Someone returning to this codebase later — the owner months from now, or a contributor — can read why each significant choice in this feature was made, what alternatives were weighed, and what the trade-offs were, without reverse-engineering it from the diff.

**Why this priority**: It doesn't change what a visitor sees, so it can't block the visible work. But this feature makes decisions that visibly contradict existing recorded ones — the project already has an accepted record justifying its animation stack and its bundle-size budget — and unrecorded contradictions are how a codebase quietly loses its rationale.

**Independent Test**: Open the project's decision-record index and confirm a record exists for each significant decision this feature makes, each stating context, decision, consequences, and rejected alternatives, and each reachable from the index.

**Acceptance Scenarios**:

1. **Given** a contributor opens the decision-record index, **When** they look for this feature's decisions, **Then** each significant decision has its own record listed in the index with a status.
2. **Given** a decision in this feature contradicts or narrows an existing accepted record, **When** the new record is written, **Then** it explicitly references the record it affects and states whether that record is amended, superseded, or merely qualified.
3. **Given** a reader who was not involved in building the feature, **When** they read a record, **Then** they can state what was chosen, what else was considered, and what the cost of the choice is.

---

### Edge Cases

- What happens before the annotations have drawn, or if they never draw at all? The introduction text must be fully readable on its own — annotations are emphasis, never the carrier of meaning.
- What happens when an annotated phrase wraps across two lines on a narrow screen? The annotation must follow the wrapped text rather than cutting across unrelated content.
- What happens when a visitor's operating-system theme changes while they have an explicit choice saved? Their explicit choice wins; the site does not switch out from under them.
- What happens to the hand-drawn annotations in dark mode? Their colours must be chosen per theme so annotated words stay readable in both, rather than a single colour that disappears against one background.
- What happens on the very first paint before any script runs? The page must already be in the correct theme — a visitor who chose dark must never see a white flash.
- What happens if a visitor has both "reduced motion" and a saved dark theme? Both preferences are honoured independently: dark theme, static annotations.

## Requirements *(mandatory)*

### Functional Requirements

**Annotated introduction**

- **FR-001**: The introduction MUST present the owner's name together with a short introductory statement describing who they are.
- **FR-002**: The introduction MUST visually annotate each designated role phrase with a hand-drawn-style mark, distinct from ordinary text styling.
- **FR-003**: The annotations MUST animate into place on load, and MUST render in their finished state without animating when the visitor prefers reduced motion.
- **FR-004**: The annotations MUST stay aligned to the words they annotate when text reflows — on window resize, orientation change, or after web fonts finish loading.
- **FR-005**: The introduction's text and its list of annotated role phrases MUST be editable as content, without code changes, consistent with how the rest of the portfolio's content is managed.
- **FR-024**: The visual style of each mark (highlight, circle, underline, box, bracket) MUST NOT be content-editable. Styles are fixed in code as a deliberate sequence applied to the phrases in order, so the marks stay visually varied regardless of how the phrases are later edited.
- **FR-025**: The mark-style sequence MUST accommodate a changed number of role phrases — adding or removing a phrase MUST still produce a coherent set of marks, with no phrase left unannotated and no error.
- **FR-006**: The annotated phrases MUST remain legible with the annotation applied, in both light and dark themes.

**Introduction layout**

- **FR-007**: On desktop-width screens the introduction MUST place the profile picture beside the introductory text rather than stacked above it.
- **FR-008**: On phone-width screens the introduction MUST stack the portrait and text vertically with no horizontal scrolling.
- **FR-009**: The portrait position MUST continue to show the existing intentional placeholder while no real photo is configured, and MUST show the real photo once one is supplied, without a layout break.
- **FR-026**: The hero MUST retain the owner's name, the annotated role phrases, the short introductory statement, and the existing call-to-action buttons.
- **FR-027**: The hero MUST no longer display the "Core Expertise" skills preview card, because the Skills chapter immediately below it in the story already presents that content in full.

**Theme switching**

- **FR-010**: The site MUST present a visible, clearly labelled control for switching between light and dark, reachable and operable by keyboard.
- **FR-011**: Activating the theme control MUST update the entire page — every section, the background accent, and the hero annotations — to the chosen theme.
- **FR-012**: The visitor's chosen theme MUST persist across reloads and return visits.
- **FR-013**: An explicitly chosen theme MUST take precedence over the operating-system preference.
- **FR-014**: With no previously chosen theme, the site MUST open matching the visitor's operating-system preference.
- **FR-015**: The site MUST paint in the correct theme on first render, with no visible flash of the opposite theme.
- **FR-016**: Text throughout the site MUST meet standard accessibility contrast guidance in both themes.

**Decision records**

- **FR-018**: Each significant technical decision made by this feature MUST be captured as a decision record, following the project's existing decision-record format and numbering, and MUST be listed in the decision-record index.
- **FR-019**: At minimum, records MUST cover: (a) whether to adopt a third rendering/animation library for the hand-drawn annotations, (b) how theme state is owned and applied across the site, and (c) the switch from operating-system-driven appearance to explicitly-chosen appearance.
- **FR-020**: Any record whose decision contradicts, narrows, or extends an existing accepted record MUST name that record and state its resulting status — amended, superseded, or unchanged-but-qualified.
- **FR-021**: Each record MUST state the context, the decision taken, its consequences (both positive and negative), and the alternatives rejected — enough for a reader who was not present to judge the trade-off later.

**Content**

- **FR-017**: The hero introduction MUST present the owner's role phrases as "Software Engineer", "AI enthusiast", and "Security Nerd", replacing the current "a Senior Software Engineer" / "a Cloud Architect" / "a Technical Leader" wording in the hero.
- **FR-022**: The site-wide description used for search results and link previews MUST stay in a professional register while reflecting the new focus areas — retaining the senior and cloud-architect positioning rather than adopting the hero's casual phrasing. Reference wording: "Senior software engineer and cloud architect, with a focus on AI and security."
- **FR-023**: The hero's casual phrasing and the site-wide professional description MUST be maintained as separate content, so changing one does not silently rewrite the other.

### Key Entities

- **Hero Introduction**: The owner's name, the introductory statement, and the ordered list of role phrases that receive annotations. The list is editable content; the mark style each phrase receives is not stored alongside it but derived from a fixed sequence defined in code (FR-024).
- **Theme Preference**: The visitor's chosen appearance — an explicit light or dark choice, or the absence of a choice meaning "follow the operating system" — persisted between visits.
- **Decision Record**: A numbered, dated account of one significant technical decision — its context, the decision, its consequences, and the alternatives rejected — carrying a status and, where relevant, a link to the record it replaces or qualifies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every designated role phrase in the introduction is visibly annotated within 2 seconds of the page becoming interactive.
- **SC-002**: Switching the theme updates 100% of the page's sections — zero elements remain rendered in the previous theme.
- **SC-003**: A chosen theme is restored on 100% of subsequent page loads, including after a full browser restart.
- **SC-004**: No visitor sees a flash of the wrong theme on first paint, measured by loading the site with each theme saved.
- **SC-005**: The introduction is fully readable with no horizontal scrolling at viewport widths from 320px through desktop.
- **SC-006**: After resizing the window, every annotation remains aligned to the phrase it belongs to, with no annotation left overlapping unrelated text.
- **SC-007**: All text, including annotated phrases, meets WCAG AA contrast in both light and dark themes.
- **SC-008**: With reduced motion enabled, no annotation animates, and all annotations are still visible in their finished state.
- **SC-009**: A visitor can find and operate the theme control using only a keyboard.
- **SC-012**: The site-wide description shown in search results and link previews names the owner's seniority, cloud-architecture background, and AI and security focus, in a professional register — while the hero uses the casual phrasing, with neither overwriting the other.
- **SC-010**: Every significant decision listed in FR-019 has a corresponding record reachable from the decision-record index — zero decisions left undocumented.
- **SC-011**: A reader unfamiliar with the feature can, from any one record alone, state what was chosen, what was rejected, and what the choice costs.

## Assumptions

- "Rough notation" refers to hand-drawn-looking annotation marks (highlight, circle, underline, box, bracket) drawn over text, as popularised by the `rough-notation` library the request alludes to. Which specific mark each phrase receives is a design decision taken during implementation and then fixed in code (FR-024) — this spec sets the behaviour, not the palette of marks.
- The reference site was reviewed for layout inspiration only. Its annotations are drawn by client-side script and were not visible in the fetched markup, so this spec follows the request's own description rather than the reference's exact treatment.
- The request names two specific libraries (`rough-notation` for annotations, `next-themes` for theming). Both would be **new dependencies** beyond the animation and styling stack the project constitution fixes as non-negotiable, so adopting them needs an explicit constitution check — and possibly an amendment — during planning. This spec states the required behaviour; the library decision is deliberately left to the plan.
- The theme control needs a new home: the component that used to host it was removed when the navigation bar was deleted in the story redesign, which is why no control is currently visible. The assumption is that it belongs in the persistent story-progress chrome at the top of the page.
- The theme control offers a straightforward light/dark switch. A separate explicit "follow system" option is out of scope; matching the operating system is the default behaviour before any choice is made.
- The profile-picture placeholder behaviour introduced in the story redesign carries over unchanged — this feature moves where the portrait sits, not how a missing photo is handled.
- Existing content lives in editable JSON files loaded at runtime; the introduction's copy and role phrases are expected to follow that same pattern.
- The project already has an established decision-record practice — numbered records in `docs/adr/` following Nygard's Context/Decision/Consequences format, indexed in `docs/adr/README.md`, numbered sequentially from `0009` onward. This feature adopts that existing convention rather than introducing a new one.
- Decision records are expected to be written as the decisions are actually taken during implementation, not reconstructed afterwards — a record written after the fact tends to justify what was built rather than capture what was weighed.

## Dependencies

- Builds directly on the single-page story layout and the profile-picture placeholder delivered in `002-portfolio-story-redesign`.
- The background accent added in that feature must be verified against the corrected theme switching, since it currently inverts based on the dark-mode styling this feature is changing the trigger for.
- **ADR 0005** ("GSAP for scroll-driven, Framer for component motion") is directly implicated: it records a deliberate two-animation-library ceiling and names bundle size as the accepted cost. Adding a third rendering library for the annotations must be reconciled against it (FR-020).
- **ADR 0006** ("Tailwind CSS v4 with `@theme inline`") is directly implicated: the current appearance switching is driven by the operating-system media query established there, which this feature replaces with an explicit visitor choice.
- Removing the "Core Expertise" card (FR-027) retires the hero's skills-preview component and invalidates the existing hero test that asserts the card is present — both need updating as part of this feature, not left dangling.
