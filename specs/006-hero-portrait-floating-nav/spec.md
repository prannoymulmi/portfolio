# Feature Specification: Portrait hero and floating navigation

**Feature Branch**: `feat/hero-portrait-floating-nav`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "I want to try something else without the FC card as I do not like it look at the rework_hero_nav.png, instead of the card I want a big picture of me but on the right side. Use the hero_pic and blend it with the background for both light and dark theme. Also rework the nav bar to look like the one from the picture with rounded edges and floating. Add the line where it is written I build secure. Also the buttons view work they are not aligned so fix that and add an icon there too. In the email add prannoy.mulmi@gmail.com. This should be the 6th spec"

## Context

The opening currently pairs three role phrases with a collectible football player
card holding a job title, year counts, a self-rated star rating, three soft-skill
bars, an AWS badge and two country flags. The card is being removed: it is the
one part of the football metaphor the site's owner does not want carrying the
first impression.

`public/images/rework_hero_nav.png` is the visual target. It shows a floating
rounded navigation bar detached from the top of the viewport, a large portrait
bleeding into the photographic backdrop, the three role phrases as stacked
colour bars, a tagline, and two calls to action that share one baseline.

This spec follows the reference for the navigation shape, the portrait treatment
and the button alignment. It deliberately does **not** adopt the reference's
credential chips or bottom statistics strip, and it keeps the site's real section
names rather than the reference's invented ones.

## Clarifications

### Session 2026-08-12

- Q: How should the portrait be separated from the grey studio background in `hero_pic.png`? → A: Remove it. A background-removed derivative with a real alpha channel was produced and committed as `public/images/hero_portrait.png`, so the portrait blends with whatever sits behind it in any theme.
- Q: Where should the email address be stored in the content files? → A: As an `email` field sitting beside the existing `social` array in `social.json`, not as an entry inside that array.
- Q: How should the floating navigation handle 375px, where its contents are roughly 2.2x the available width? → A: The section links scroll horizontally inside the bar with a fade at the edge; the profile, email and theme controls stay pinned. No menu, no shortened labels.
- Q: How should the portrait be framed once the layout stacks on mobile? → A: Constrained to roughly 300px tall and anchored to the top of the image, so it shows head and shoulders rather than the full torso.
- Q: Should the portrait drift on scroll the way the player card did? → A: Yes, but at roughly half the card's strength, so the depth cue survives without the dissolved edge visibly sliding.

Supporting detail, so the decision is not re-litigated from scratch later:

- `hero_pic.png` reports `hasAlpha: no` — every pixel is opaque and the grey paper sweep is picture data, not empty space.
- A positional CSS mask cannot resolve this: it fades by location, and the grey sits in the middle of the frame around the subject's head, where any mask that reaches it also erases the face.
- CSS `mix-blend-mode` cannot resolve it either: it keys on brightness, and the subject holds both the lightest pixels (white t-shirt) and the darkest (black hair and jacket), so `multiply` dissolves the shirt and `screen` dissolves the hair.
- Segmentation alone leaves a light halo on dark surfaces, because partially-transparent edge pixels still store a subject/backdrop blend. The committed asset has those edge pixels colour-corrected by inverting the blend the camera performed, so the silhouette is clean against both the sunset and the dark theme.
- On the email's placement: an entry *inside* the `social` array would validate — the existing address validator accepts a `mailto:` address — but the footer renders every member of that array, so the address would appear in a place it was explicitly not wanted and would then need suppressing. A sibling field avoids the side effect rather than compensating for it, and keeps "social" meaning "profile links".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The opening leads with the person (Priority: P1)

A recruiter opens the site for the first time. Instead of a stylised game card,
they see a large photograph of Prannoy on the right, blended into the page's
photographic surface so it reads as part of the scene rather than a pasted
cut-out. On the left, three role phrases and a sentence describing what he
builds. Nothing on screen asks to be decoded.

**Why this priority**: This is the change the whole feature exists for, and it
stands alone. Shipping only this already replaces the element the owner
rejected.

**Independent Test**: Load `/` at desktop and mobile widths in both themes. The
player card is absent, the portrait is present and legible, the roles and tagline
read correctly, and no card content is orphaned anywhere on the page.

**Acceptance Scenarios**:

1. **Given** a visitor loads the opening at a viewport of 1280px or wider, **When** the section renders, **Then** the portrait occupies the right half and the roles, tagline and calls to action occupy the left half.
2. **Given** a visitor loads the opening at a viewport narrower than 1024px, **When** the section renders, **Then** the text content is announced and displayed before the portrait, and the portrait does not push the calls to action below the fold on a 667px-tall screen.
3. **Given** the light theme is active, **When** the portrait renders, **Then** its edges fade into the surrounding surface with no visible rectangular boundary, hard cut-out edge, or grey studio background from the source file.
4. **Given** the dark theme is active, **When** the portrait renders, **Then** the same blend holds against the dark surface, and the subject's face and shirt remain distinguishable from the background.
5. **Given** any theme, **When** the page loads, **Then** no player card, star rating, self-rated skill bars, AWS badge or country flags appear in the opening.

---

### User Story 2 - Navigation floats and is reachable from anywhere (Priority: P1)

A visitor scrolling the story wants to jump to Projects. A rounded navigation
bar floats near the top of the viewport, visibly detached from the page edges,
carrying the site's sections plus the profile and email links. It stays
available at every scroll position.

**Why this priority**: The navigation is the only persistent chrome on a
single-page story; it is also the piece the reference image most obviously
changes. It is independent of the hero and testable on its own.

**Independent Test**: Scroll to any chapter, confirm the bar is still visible,
floating and rounded, and that each link moves to its section.

**Acceptance Scenarios**:

1. **Given** the page is at the top, **When** it renders, **Then** the navigation bar appears as a rounded, floating element with visible gaps on its left, right and top rather than spanning edge to edge.
2. **Given** the visitor scrolls to any point in the story, **When** they look at the top of the viewport, **Then** the navigation bar is still visible and still floating.
3. **Given** a visitor activates any section link, **When** the page moves, **Then** it lands on that section and the link corresponds to a section that exists on the page.
4. **Given** a keyboard user tabs into the navigation, **When** each control receives focus, **Then** a visible focus indicator appears and the tab order runs left to right through the bar.
5. **Given** a viewport of 375px, **When** the navigation renders, **Then** every control remains reachable without any part of the bar being clipped off-screen or forcing the page to scroll horizontally.
6. **Given** the scroll-progress indicator exists today, **When** the bar is reshaped, **Then** progress through the story is still conveyed.

---

### User Story 3 - The calls to action read as one pair (Priority: P2)

A visitor decides to look at the work. Two buttons sit side by side, the same
height, on the same baseline, each with an icon in the same position relative to
its label, so they read as a matched pair rather than two unrelated controls.

**Why this priority**: A visible defect in the primary conversion point, and
small enough to ship separately from the layout change.

**Independent Test**: Measure both buttons at desktop and mobile widths; compare
top edge, bottom edge, height and icon placement.

**Acceptance Scenarios**:

1. **Given** a viewport of 640px or wider, **When** both buttons render, **Then** their top edges, bottom edges and heights match, and their labels sit on a common baseline.
2. **Given** any supported viewport, **When** both buttons render, **Then** each carries an icon and the icons sit in the same position relative to their labels.
3. **Given** a viewport narrower than 640px, **When** the buttons stack, **Then** they share the same width and their labels and icons align to the same internal edge.
4. **Given** either theme, **When** a button's label is read against its own fill, **Then** the contrast ratio meets WCAG AA for its text size.

---

### User Story 4 - The email address is reachable (Priority: P2)

A visitor who wants to make contact finds the email address without hunting: an
envelope control sits in the floating navigation beside the profile links, and
the Contact chapter — currently an empty placeholder — carries the address as
readable text.

**Why this priority**: Contact is the story's endpoint and today it says
"coming soon". Independent of every other story here.

**Independent Test**: Activate the navigation's envelope control and confirm it
opens a message to the address; read the Contact chapter and confirm the address
is present as visible text.

**Acceptance Scenarios**:

1. **Given** the floating navigation renders, **When** a visitor activates the envelope control, **Then** their mail client opens a new message addressed to `prannoy.mulmi@gmail.com`.
2. **Given** a screen reader user reaches the envelope control, **When** it is announced, **Then** the announcement identifies it as an email link rather than an unlabelled icon.
3. **Given** a visitor reaches the Contact chapter, **When** it renders, **Then** `prannoy.mulmi@gmail.com` is visible as text and is activatable, and the "coming soon" placeholder is gone.
4. **Given** the address is defined once in content, **When** it is changed there, **Then** both the navigation control and the Contact chapter reflect the change with no other edit.

---

### Edge Cases

- **Content fails to load**: the opening's roles, tagline, portrait address and email all come from content files. If the fetch fails, the navigation's own links, progress indicator and theme control must keep working, and the opening must show its existing loading and error states rather than a half-drawn hero.
- **Portrait address missing from content**: the opening must fall back to a text-only layout that still fills the space, not a broken image or an empty column.
- **Reduced motion**: any drift, entrance or hover motion on the portrait and navigation must be suppressed for visitors who ask for reduced motion, through the existing detection path.
- **Very short viewports** (landscape phone, ~375px tall): the opening must not trap the calls to action below the portrait with no indication that more exists.
- **Very wide viewports** (≥2560px): the portrait must not scale to a size where the subject's head is disproportionate to the text column, and the floating navigation must not stretch to the full width of the screen.
- **Long role phrases**: a role phrase that wraps must keep its colour bar drawn around the wrapped text rather than spilling past it.
- **Portrait over the backdrop's brightest region**: the blend must not leave light portions of the subject (the white shirt) indistinguishable from the surface behind them.
- **Zoom to 200%**: the floating navigation must remain usable and must not overlap the opening's text.

## Requirements *(mandatory)*

### Functional Requirements

#### Opening layout

- **FR-001**: The opening MUST NOT render the player card or any of its parts — job title bar, year-count pills, star rating, self-rated skill bars, certification badge, or country flags.
- **FR-002**: The opening MUST render a single large portrait of the site's owner, positioned on the right at viewports 1024px and wider.
- **FR-003**: The portrait MUST render from a background-removed derivative of `hero_pic` that carries an alpha channel, committed as `public/images/hero_portrait.png`. The original `hero_pic.png` MUST be retained as the source of that derivative.
- **FR-004**: No part of the source image's grey studio background may be visible, at any viewport size, in either theme.
- **FR-004a**: The portrait's silhouette MUST NOT show a light halo or colour fringe against the dark theme's surface.
- **FR-004b**: The portrait MUST NOT read as a rectangle: its lower edge MUST dissolve into the section rather than ending on a visible horizontal crop line.
- **FR-005**: Below 1024px the opening MUST stack, with the text content preceding the portrait in both visual order and reading order.
- **FR-005a**: When stacked, the portrait MUST be constrained in height to approximately 300px and framed on the subject's head and shoulders rather than scaled to show the full torso.
- **FR-005b**: The portrait MUST remain visible at every viewport width. It MUST NOT be hidden on small screens.
- **FR-006**: The opening MUST retain the three role phrases with their existing hand-drawn colour bars, the tagline, the two calls to action and the CV link.
- **FR-006a**: The portrait MUST drift on scroll to read as nearer than the text beside it, at roughly half the strength the player card used, so its dissolved edge does not visibly travel against the pinned backdrop. This motion MUST be suppressed under reduced-motion through the existing detection path.
- **FR-007**: Content fields that existed only to feed the player card MUST be removed from the content file and its validation schema, and components rendered only by the card MUST be removed from the codebase.

#### Tagline

- **FR-008**: The opening's tagline MUST read "I build secure, scalable cloud systems, and I care about getting the security and the details right." — restoring the word "secure" that the current text omits.
- **FR-009**: The tagline MUST remain editable as content, not embedded in markup.
- **FR-010**: The tagline MUST meet WCAG AA contrast against the surface behind it in both themes.

#### Navigation

- **FR-011**: The navigation MUST render as a floating bar: detached from the viewport edges with visible space on its left, right and top, and with fully rounded ends.
- **FR-012**: The navigation MUST remain visible at every scroll position.
- **FR-013**: The navigation MUST carry links to the seven sections that exist on the page — Introduction, Skills, Career Journey, Education, Projects, Technical Playbook, Contact — under their existing names. It MUST NOT introduce links to sections that do not exist.
- **FR-014**: The navigation MUST carry the existing profile links, the theme control, and a new email control.
- **FR-015**: The navigation MUST continue to convey reading progress through the story.
- **FR-016**: The navigation MUST remain fully usable at 375px wide and at 200% zoom, without clipping controls or causing horizontal page scroll.
- **FR-016a**: Where the section links exceed the available width, they MUST scroll horizontally *within* the bar while the profile, email and theme controls stay pinned and always visible. The page itself MUST NOT scroll horizontally.
- **FR-016b**: The scrollable region MUST show a visible cue at the edge where more links exist, so the overflow reads as intentional rather than as a clipped label.
- **FR-016c**: Every section link MUST remain reachable by keyboard, and focusing a link that is scrolled out of view MUST bring it into view with its focus indicator unobscured by the edge cue.
- **FR-017**: Navigation text and glyphs MUST meet WCAG AA contrast against the floating bar's own fill in both themes, given that the photographic surface shows through behind it.

#### Calls to action

- **FR-018**: The two calls to action MUST share the same height and sit on a common baseline when displayed side by side.
- **FR-019**: Each call to action MUST carry an icon, and both icons MUST occupy the same position relative to their labels.
- **FR-020**: When stacked at narrow widths the two calls to action MUST share the same width and align their contents to the same internal edge.
- **FR-021**: Button icons MUST be drawn inline, not sourced from the icon library, which is reserved for brand marks in the profile links. The same applies to the navigation's envelope glyph: an envelope is not a brand mark.

#### Email

- **FR-022**: The email address `prannoy.mulmi@gmail.com` MUST be stored once, as a field beside the existing profile-link list rather than as a member of it, and read from there by every place that shows it.
- **FR-022a**: Adding the address MUST NOT cause it to appear anywhere it was not specified — in particular the footer, which renders the profile-link list.
- **FR-023**: The navigation MUST provide an email control that opens a new message to that address and carries an accessible name identifying it as such.
- **FR-024**: The Contact chapter MUST display the address as visible, activatable text, replacing the current "coming soon" placeholder.

#### Governance

- **FR-025**: Removing the player card changes an item named in the project constitution's fixed stack. The change MUST land with a new architecture decision record superseding the card portion of the existing hero-card record, a dated supersession note added to that record without altering its original text, the decision index updated, and a constitution amendment with a version bump — all in the same pull request.

### Key Entities

- **Opening content**: the name, role phrases, tagline, short biography, portrait address and CV pointer that the opening renders. Loses the card object.
- **Contact address**: a single email address, held in content, surfaced in the navigation and in the Contact chapter.
- **Section index**: the ordered list of story sections the floating navigation links to; each entry must correspond to a section that exists on the page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can identify who the site belongs to and what he does within 5 seconds of the opening rendering, without scrolling.
- **SC-002**: The portrait shows no visible rectangular edge, residual studio background, or edge halo at any viewport between 375px and 2560px, in both themes, verified by inspection at each of five widths.
- **SC-003**: Both calls to action measure identical heights and identical top offsets at every tested viewport width, with a tolerance of 0 pixels.
- **SC-004**: A visitor can reach any of the seven sections from any scroll position in one interaction, at every viewport width — including 375px, where reaching a later section may require scrolling within the bar but never opening a menu.
- **SC-004a**: At 375px the opening's roles, tagline and both calls to action are all reachable within one screen-height of scrolling from the top of the page.
- **SC-005**: A visitor can start an email to the site's owner in one interaction from any scroll position.
- **SC-006**: Every text and interactive element introduced or changed meets WCAG AA contrast in both themes, verified with a contrast checker rather than by eye.
- **SC-007**: The whole page remains operable by keyboard alone, with a visible focus indicator on every control in the floating navigation and the opening.
- **SC-008**: Lighthouse performance on a production build stays at or above 90, and the opening's largest contentful paint does not regress against the current build.
- **SC-009**: No orphaned content fields, unused components or dead tests referencing the player card remain after the change.

## Assumptions

- The reference image is a direction for the navigation shape, portrait placement and button alignment — not a pixel target. Its credential chips and bottom statistics strip are out of scope, per the owner's decision to drop the card's data outright rather than relocate it.
- The portrait sits on the right, as the owner asked, even though the reference image places it on the left.
- The pinned photographic backdrop behind the whole story stays as it is; only the opening's foreground changes.
- The football metaphor continues in the career and skills chapters. Only the opening leaves it.
- The three role phrases keep their existing hand-drawn colour bars and their current colours.
- The card's year counts, star rating and soft-skill ratings are deleted rather than relocated. The career and skills chapters already carry their own data and are unaffected.
- The portrait's blend is carried by the asset's alpha channel rather than by per-theme styling, which is what makes the light and dark requirement almost free: transparent is transparent against any surface. Remaining styling is the lower-edge dissolve and any optional rim light.
- The cut-out asset is committed to the repository and served through the image optimiser like every other image, never as a CSS background. Its alpha survives the optimiser's WebP/AVIF conversion.
- Both `hero_pic.png` (source) and `hero_portrait.png` (derivative) live in `public/images/`. Only the derivative is rendered; the source is kept so the cut-out can be regenerated if the treatment changes.
- The email is a plain address link. No contact form, no spam obfuscation, no send-from-page behaviour is in scope.
- The Contact chapter gains the address only. A fuller Contact chapter is a separate piece of work.
- The existing loading, error and reduced-motion behaviours carry over unchanged.
- `public/images/rework_hero_nav.png` is a design reference held in the repository; it is not shipped to visitors.

## Out of Scope

- Credential chips ("Secure Identity", "AWS & Cloud", "Built AI integrations") from the reference image.
- The bottom statistics strip ("9+ years", "40+ projects", "15+ production systems", "Led engineering teams") from the reference image.
- A blog section, which the reference navigation shows but the site does not have.
- Renaming existing sections to the reference image's labels.
- Removing the football metaphor from the career or skills chapters.
- A contact form or any server-side message handling.
- Changes to the pinned backdrop photograph.
