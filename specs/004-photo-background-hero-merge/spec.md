# Feature Specification: One photo backdrop, a shorter opening, social links in the nav

**Feature Branch**: `004-photo-background-hero-merge`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "I want to use the background normal where there it is light themed in all the sections and the sections are fixed accordingly also I want to remove the about section. I would want to add this in the hero section and make it short put the two social links in the nav bar with linkedin and github small icons there."

## Clarifications

### Session 2026-08-10

- Q: Where should the condensed biography live, now that the About chapter that owned it is
  going away? → A: Option A — move the short biography and the portrait reference into the
  opening's own content; the About content file and its schema are retired. The biography
  must be **very short**, and must state **9 years** of experience, matching the player
  card (the retired About text said "10+ years", which was wrong).
- Q: Should the shared backdrop stay still while scrolling, or keep the drifting parallax
  the opening has today? → A: Neither — move the parallax to the foreground. The photo is
  pinned and continuous; the opening's own elements (player card, role bars) drift slightly
  against it. Keeps the depth cue, keeps the backdrop seamless, and switches off cleanly
  under reduced motion.
- Q: Where should the LinkedIn and GitHub glyphs come from — hand-drawn paths in the repo,
  or an icon package added as a dependency? → A: Option B — take the dependency. This makes
  the feature subject to Principle IV of the constitution, so it MUST also deliver an ADR
  recording the new dependency and a constitution amendment, in the same change.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The whole story sits on one backdrop (Priority: P1)

A visitor scrolls from the opening straight through to contact. The sunset photograph
that today appears only behind the opening now sits behind every chapter, so the page
reads as one continuous surface rather than eight panels with their own backgrounds.
Each chapter is adjusted so its text stays legible against the photograph.

**Why this priority**: This is the visual identity of the site. It is also the only part
of the request that touches every chapter, so it is the change a visitor notices first
and the one that constrains everything else.

**Independent Test**: Load the page and scroll top to bottom. The backdrop is continuous
and every chapter's text remains readable against it, with no chapter reverting to a flat
or gradient panel. Delivers the redesign on its own, with the story structure untouched.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site in light appearance, **When** they scroll through
   every chapter, **Then** the photograph is visible behind all of them and no chapter
   introduces a competing background.
2. **Given** a visitor is reading any chapter, **When** they read body text, headings, and
   card content, **Then** all of it meets WCAG AA contrast against what sits behind it.
3. **Given** a visitor scrolls through the story, **When** they pass the opening, **Then**
   the photograph stays pinned and the player card and role bars drift slightly against
   it, giving depth without the backdrop moving.
4. **Given** a visitor has asked their system to reduce motion, **When** they scroll,
   **Then** nothing drifts — the opening's elements sit at their resting positions and the
   layout is identical to the moving version at rest.
5. **Given** a visitor opens the site in dark appearance, **When** they scroll, **Then**
   the photograph is still present behind every chapter at reduced strength, and text
   contrast still holds.

---

### User Story 2 - Reaching LinkedIn and GitHub from anywhere (Priority: P2)

A recruiter part-way through the career chapter decides to check the candidate's GitHub.
Small LinkedIn and GitHub icons live in the persistent navigation bar, so they can go
there in one click from any point in the story without hunting for a particular chapter.

**Why this priority**: Independently shippable and valuable on its own, and it must land
before or with Story 3 — removing the About chapter takes away the only place these links
currently exist.

**Independent Test**: From each chapter of the page, the two icons are visible in the
navigation bar and each opens the correct destination. Testable without touching the
About chapter or the backdrop.

**Acceptance Scenarios**:

1. **Given** a visitor is anywhere in the story, **When** they look at the navigation bar,
   **Then** a LinkedIn icon and a GitHub icon are visible without scrolling.
2. **Given** a visitor activates the LinkedIn icon, **When** the link opens, **Then** it
   goes to the configured LinkedIn profile in a new tab.
3. **Given** a visitor uses a screen reader, **When** focus reaches each icon, **Then** it
   is announced with the destination name, not as an unlabelled image or link.
4. **Given** a visitor is on a narrow phone screen, **When** they view the navigation bar,
   **Then** both icons remain reachable and do not push the chapter links out of reach.
5. **Given** the social content lists a network with no matching icon, **When** the bar
   renders, **Then** that link still appears in a readable form rather than blank.

---

### User Story 3 - One less chapter, a fuller opening (Priority: P3)

A visitor lands on the site and learns who this person is in the opening itself — a short
version of the biography sits alongside the player card. The separate "About" chapter is
gone, so the story is seven chapters instead of eight and the visitor reaches the
substance faster.

**Why this priority**: Depends on Story 2 for the social links to keep a home. Delivers a
shorter story and a stronger opening once that dependency is met.

**Independent Test**: The page contains no About chapter, the navigation lists seven
chapters, and the opening carries a condensed biography. Old links to the About chapter
still land somewhere valid.

**Acceptance Scenarios**:

1. **Given** a visitor loads the page, **When** they read the opening, **Then** it carries
   a condensed biography in addition to the existing role phrases and player card.
2. **Given** a visitor opens the navigation, **When** they read the chapter list, **Then**
   "About" is absent and every remaining entry jumps to a chapter that exists.
3. **Given** someone follows an old bookmark to the About page, **When** it resolves,
   **Then** they land on a valid position in the story rather than a missing anchor.
4. **Given** the site owner edits the condensed biography, **When** they reload, **Then**
   the new text appears without a code change or redeploy.

---

### Edge Cases

- **A chapter's own colours fight the backdrop.** Chapters currently paint near-white and
  near-black gradients. Any chapter that keeps an opaque background defeats the feature;
  any chapter that becomes fully transparent may drop below the contrast floor.
- **Old anchors after removal.** `/about` currently redirects to `#about`. Once that
  anchor is gone the redirect points at nothing, and the browser silently stays at the
  top instead of reporting an error.
- **Content that outlives its chapter.** The portrait shown on the player card comes from
  the same content as the About chapter; removing the chapter must not remove the card's
  image or the biography text.
- **Social content grows.** The content format allows up to five social entries. The bar
  must stay usable if a third is added, and must not break on a network with no icon.
- **Social content fails to load.** The navigation bar must still render its chapter links
  and appearance toggle if the social content is unavailable.
- **Text over the busiest part of the photo.** The photograph is not uniform; a chapter
  whose text lands over its brightest region can pass a contrast check in one place and
  fail in another.
- **Very long pages on small screens.** A fixed backdrop can behave differently on mobile
  browsers than on desktop, including during over-scroll at the top and bottom.
- **Print and high-contrast modes.** A photographic backdrop should not make text
  unreadable when printed or under forced colours.
- **Drift at the chapter boundary.** Foreground elements that drift as the opening scrolls
  away can reach into the chapter below, or expose a gap where they came from, if the
  movement is not bounded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The photograph currently behind the opening MUST serve as the backdrop for
  the entire story, behind every chapter.
- **FR-002**: The backdrop MUST be a single continuous surface across the page — there
  MUST be no visible seam, repeat, or restart at a chapter boundary.
- **FR-003**: Every chapter MUST be adjusted so the backdrop shows through it, and MUST
  NOT introduce a background that hides the photograph.
- **FR-004**: The photograph MUST appear in both appearances, shown at reduced strength in
  dark appearance so it reads as a low ember behind the dark surface rather than
  disappearing — the behaviour the opening already has today.
- **FR-005**: All text, in every chapter and in both appearances, MUST meet WCAG AA
  contrast against whatever sits immediately behind it (4.5:1 for body text, 3:1 for
  large text and meaningful non-text elements).
- **FR-006**: The decorative accent currently layered behind the page MUST be removed, so
  the photograph is the only backdrop.
- **FR-007**: The backdrop MUST be pinned — it MUST NOT move relative to the viewport as
  the visitor scrolls, at any scroll position in the story.
- **FR-007a**: The depth cue MUST come from the foreground instead: elements within the
  opening — the player card and the role bars — MUST drift slightly against the pinned
  photograph as the visitor scrolls past.
- **FR-007b**: Foreground drift MUST be switched off entirely when a reduced-motion
  preference is set, and switching it off MUST NOT change the layout or leave any element
  displaced from its resting position.
- **FR-007c**: Drift MUST be bounded so that no element it moves overlaps adjacent content,
  leaves its column, or extends the page, at any width down to 320px.
- **FR-008**: The navigation bar MUST show a LinkedIn icon and a GitHub icon, drawn from
  the existing social content rather than hardcoded.
- **FR-008a**: The glyphs MUST come from a maintained third-party icon set taken on as a
  project dependency, not from artwork hand-committed to the repository.
- **FR-008b**: Adding that dependency MUST NOT pull the whole icon set into what visitors
  download — only the glyphs actually shown may reach the browser.
- **FR-009**: Each social icon MUST open its destination in a new tab and MUST carry an
  accessible name identifying the destination.
- **FR-010**: Social icons MUST be visually secondary to the chapter links — small enough
  to read as supporting controls, and MUST NOT displace the chapter links or the
  appearance toggle at any screen width down to 320px.
- **FR-011**: A social entry whose network has no matching icon MUST still render as a
  usable, labelled link.
- **FR-012**: The navigation bar MUST continue to function — chapter links, scroll
  progress, and appearance toggle — when social content is missing or fails to load.
- **FR-013**: The About chapter MUST be removed from the page and from the chapter list.
- **FR-014**: The opening MUST carry a condensed biography of no more than 2 sentences and
  no more than 40 words.
- **FR-015**: The condensed biography MUST live in the opening's own content, alongside the
  name, intro, roles, and player card. The retired About content file and its schema MUST
  be removed, and the portrait reference it held MUST move with it.
- **FR-015a**: The condensed biography MUST remain editable content, changeable without a
  code change or redeploy, and MUST be validated on load like all other content.
- **FR-015b**: Any figure the biography states MUST agree with the player card. Years of
  experience is **9**; the retired About text said "10+ years" and MUST NOT be carried
  over. No two places on the page may state a different figure for the same fact.
- **FR-016**: The opening MUST remain readable on a phone with the biography added —
  content MUST NOT overflow, and the opening MUST NOT require more than one screen of
  additional scrolling versus today.
- **FR-017**: The retired About URL MUST resolve to a valid position in the story.
- **FR-018**: The portrait used on the player card MUST survive the removal of the About
  chapter.
- **FR-019**: No chapter other than About MUST be removed, reordered, or have its content
  changed by this feature.
- **FR-020**: Because this feature takes on a new dependency, it MUST also deliver, in the
  same change: a decision record justifying the dependency and naming what was rejected,
  and an amendment to the project's fixed-stack principle admitting it. Neither is optional
  and neither may be deferred to a follow-up.

### Key Entities

- **Backdrop**: the single photographic surface behind the story; one image, applied once,
  with a strength that differs by appearance.
- **Social link**: an existing content entry with a network name and destination address;
  the network name determines which icon represents it.
- **Condensed biography**: short editable prose introducing the person, shown in the
  opening and stored with the opening's other content; replaces the long-form biography
  that lived in the About chapter. Any figure it states must match the player card.
- **Portrait reference**: the optional pointer to the person's photograph, previously held
  by the About content and read by the player card; moves to the opening's content. It is
  unset today, so the card currently shows its placeholder.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The photograph is visible behind 100% of the story's chapters, in a
  top-to-bottom scroll at 1280px wide and at 375px wide.
- **SC-002**: 100% of text on the page meets WCAG AA contrast against its backdrop, in
  both light and dark appearance, measured at the top, middle, and bottom of each chapter.
- **SC-003**: A visitor can reach LinkedIn or GitHub in one click from any scroll position
  in the story, without first navigating to a specific chapter.
- **SC-004**: The story is 7 chapters, and every entry in the chapter list resolves to a
  chapter that exists — zero dead entries.
- **SC-005**: A visitor learns who the person is within the first screen, from a biography
  of 2 sentences or fewer and 40 words or fewer.
- **SC-005a**: Zero contradictions between the biography and the player card — a reader
  comparing them finds the same years of experience (9) in both.
- **SC-006**: Every previously reachable destination stays reachable: both social profiles,
  and every retired URL resolves to a valid position rather than a missing anchor.
- **SC-007**: Lighthouse performance stays at or above 90 on a production build, and
  accessibility stays at 100.
- **SC-008**: The site remains usable with the appearance toggle in either position and
  with reduced motion requested — no chapter becomes unreadable in any combination.
- **SC-009**: With reduced motion requested, nothing on the page moves in response to
  scrolling. With motion allowed, no drifting element overlaps neighbouring content or
  leaves its column at any width from 320px upward.
- **SC-010**: The change that introduces the icon dependency also contains a decision record
  and a constitution amendment — reviewable as a fact about the change, not a promise.

## Assumptions

- "The background normal" refers to the sunset photograph already used behind the opening
  (`public/images/normal.jpg`). No new photograph is introduced by this feature.
- "The sections are fixed accordingly" means each chapter is adjusted so the shared
  backdrop shows through and its text stays legible — not that new fixed positioning is
  requested per chapter. The backdrop itself stays put while content scrolls over it.
- The condensed biography is a rewrite of the existing About text, not new content the
  owner must author from scratch; the owner can still edit it afterwards.
- The player card, role phrases, and their annotation marks keep their content and
  appearance; the biography is added alongside them, not in place of them. What changes is
  that the card and role bars now carry the scroll drift the backdrop used to have.
- The About chapter's separate portrait image is not reproduced elsewhere — the player
  card already carries the portrait.
- Exactly two social entries exist today (LinkedIn, GitHub) and both get icons; the
  content format's five-entry ceiling is unchanged.
- The navigation bar keeps its scroll-progress indicator and appearance toggle.
- The story stays a single page with anchor navigation; no routes are added or restored.
- Existing chapters keep their current content and order.

## Dependencies

- Story 3 (removing the About chapter) MUST NOT ship before Story 2 (social icons in the
  navigation bar), or the social links become unreachable in the interim.
- The condensed biography depends on the existing editable-content mechanism, which stays
  the source of truth for it.
- Story 2 carries a governance dependency: the project's constitution fixes the technology
  stack and requires a decision record **and** a constitution amendment, in the same change,
  before a new dependency may be added. The icon package cannot land without both. Which
  package to adopt is left to planning; the decision record must justify the choice.
