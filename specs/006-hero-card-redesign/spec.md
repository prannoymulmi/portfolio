# Feature Specification: Hero card, rebuilt to the collectible reference

**Feature Branch**: `feat/hero-card-redesign`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "I want to rework on my hero card lood at images card.png make my card exactly like that with my hero_pic.png the pic is for the light mode and also use frontend_design skill to match the color tone in the dark mode make it exactly like the vard. DO not commit the card"

## Context

The opening section already carries a player card (ADR 0004, ADR 0013): a deep-navy
rectangle with a job title, three year-count pills, a portrait, an honours rail and a
name banner. It is recognisably *a* card. It is not recognisably *the* card the
reference proposes.

`public/images/card.png` is a rendered mock of the intended design: a shield-shaped
collectible card in warm ivory and gold foil, with a rating block, a position
abbreviation, a meta column, a cut-out portrait bleeding past the frame, a name in
condensed navy caps, five achievement rows, and a crest at the foot. This feature
replaces the current card with that one, and gives it a dark-mode counterpart of equal
deliberateness rather than a dimmed copy.

The reference image is a **design input only**. It is not an asset, it does not ship,
and it is not committed.

## Clarifications

### Session 2026-08-11

- **The figure block keeps the reference's shape and loses its invented number.** The
  reference
  prints "91 OVR". ADR 0013 rejected a composite rating in as many words — *"the card
  should not state a number nobody computed"* — and that rule stands. The block keeps
  the reference's position, display size and visual weight, but prints the career total
  in years: a large `9` over a `YRS` label. The card's most prominent figure is
  therefore checkable, and no ADR has to be reversed to ship it.
- **The cut-out is produced during implementation.** No background-removed portrait
  exists; one is derived from `hero_pic.png` as part of this work. The flat grey studio
  ground makes this tractable, and hair edges are where it will show, so the matte
  carries an explicit quality bar (FR-007a) rather than being assumed to come out clean.
- Q: On a phone, does the card keep the mock's tall proportion and shrink its text, or
  hold the text readable and stretch? → A: Hold the text at a legible minimum and let
  the card stretch taller than the reference's proportion. Legibility is a floor; the
  card's outline proportion is not. The full anatomy is present at every width.
- Q: Do the current card's stat pills, star rating and soft-skill bars survive the new
  anatomy? → A: All three retire, along with the scouting blurb. The card's evidence
  becomes the meta column and the achievement rows; the AWS certification moves from a
  badge to an achievement row.
- Q: Does the card animate? → A: One signature moment only — a sheen travelling the
  foil border. No tilt, no deal-in, nothing scattered. Suppressed under reduced motion.
- Q: At desktop width, does the card grow to dominate the opening? → A: No. It widens
  enough to hold the new content comfortably, but the opening stays a two-column
  composition sharing the stage with the three annotated role phrases.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The opening reads as a collectible card (Priority: P1)

A visitor arrives at the site for the first time in light mode. Beside the three
annotated role phrases sits a card that reads unmistakably as a collectible player
card: a shield silhouette in gold on ivory, a figure block top-left, the position and
title beneath it, where he is and how long he has been doing this, his portrait cut
out and standing past the frame, his name across the middle, and five things he has
actually done listed below it.

**Why this priority**: This is the feature. The card is the first object on the page
and the whole football metaphor rests on it; every other story here is a refinement of
this one. Shipped alone, it delivers the entire visible value.

**Independent Test**: Load `/` in light mode at desktop width and compare the rendered
card against `card.png` element by element. Every element of the reference anatomy is
present, in the same position, in the same colour family.

**Acceptance Scenarios**:

1. **Given** the site is loaded in light mode at 1280px, **When** the opening section
   renders, **Then** the card shows all eleven of: shield outline with gold border,
   figure block, position abbreviation, full job title, location row, country row,
   years-of-experience row, portrait, name, five achievement rows, and the foot crest.
2. **Given** the card is on screen, **When** a reader looks at any figure printed on
   it, **Then** that figure is a count of years or a fact supplied by content — never
   an uncomputed composite score presented as a measurement.
3. **Given** the reference places the portrait bleeding past the card's right edge,
   **When** the card renders, **Then** the portrait occupies the same region and
   relationship to the frame as in the reference.
4. **Given** a keyboard user tabs through the opening, **When** focus reaches anything
   interactive on the card, **Then** the focus ring is visible against the card ground.

---

### User Story 2 - Dark mode is a parallel edition, not a dimmed one (Priority: P2)

The same visitor has their system in dark mode, or toggles the theme. The card does
not turn into a washed-out version of the light card, and it does not turn into a
generic dark rectangle. It reads as the *black parallel* of the same collectible — the
convention real card sets use for their rare printings: the ivory ground goes to deep
ink, the foil stays foil and gains warmth, the type inverts to the ivory it used to sit
on, and the rust accent lifts far enough to hold its own on black.

**Why this priority**: Half the audience will see this. A card that only works in one
theme is a card that is broken half the time — but it is refinement of an anatomy that
must exist first, which is why it sits behind P1.

**Independent Test**: Toggle the theme with the card on screen. No surface, rule, or
glyph keeps a light-mode value, and every text element still clears AA.

**Acceptance Scenarios**:

1. **Given** the card is on screen in light mode, **When** the theme is switched to
   dark, **Then** every surface, border, glyph and rule changes to its dark-edition
   value with no element left at a light-mode colour.
2. **Given** the card is in dark mode, **When** each text element is measured against
   the surface behind it, **Then** all clear WCAG AA (4.5:1), and display-size text
   clears AAA (7:1) as the current hero already does.
3. **Given** the theme is switched, **When** the card re-renders, **Then** the gold,
   navy/ivory and rust hues remain recognisably the same three hues — the theme
   changes their value, not their identity.
4. **Given** a visitor loads the site directly in dark mode, **When** first paint
   happens, **Then** no flash of the light-mode card appears.

---

### User Story 3 - The card's claims stay editable (Priority: P3)

The card now states where he lives, how long he has worked, and five specific things he
has built. Those facts change. Editing them is a content edit — the same workflow as
every other fact on the site — not a code change.

**Why this priority**: It preserves an existing property of the card rather than adding
a new one, so it is the least visible of the three. It is still mandatory: hardcoding
the achievements would make the card the only part of the site whose content lives in
markup.

**Independent Test**: Change the location, the years figure, and the text of one
achievement in the content file. Reload. The card shows the new values, with no code
touched.

**Acceptance Scenarios**:

1. **Given** the content file supplies the card's facts, **When** any of them is
   edited, **Then** the rendered card reflects the edit with no code change.
2. **Given** the content file is missing a required card field or supplies the wrong
   shape, **When** the page loads, **Then** the failure is caught by validation and
   surfaced the way existing content failures are, rather than rendering a broken card.
3. **Given** an achievement's text is longer than the reference's two lines, **When**
   the card renders, **Then** the row grows to fit without overlapping its neighbours
   or breaking the card outline.

---

### Edge Cases

- **No portrait in content** — the card falls back to the existing placeholder and the
  remaining anatomy still reads as a complete card, with no empty cut-out silhouette.
- **Fewer or more than five achievements** — the design is drawn for five. The card
  must stay balanced at three and must not overflow the shield at seven; the content
  contract caps the list rather than letting content break the layout.
- **Very narrow screens (320px)** — the reference is a tall, dense, portrait-format
  card. At phone width the card keeps its full anatomy and holds its text at a legible
  size, growing taller than the reference's proportion to do so (FR-020a). It must stay
  uncropped without the page scrolling sideways, and because it grows rather than
  shrinks, the pitch and its two calls to action must still come first — they precede
  the card in source order, and nothing here may change that.
- **Very long single-word content** — a long location or achievement word must not
  force the card wider than its column.
- **Reduced motion** — the foil sheen is suppressed for visitors who ask for reduced
  motion, through the existing helper rather than a new detection path, and the card
  reads as finished without it.
- **Touch devices** — the sheen is the card's only motion and has no hover to trigger
  it on a touch screen. It must not leave the card looking unfinished there, and must
  not become a tap-to-play interaction competing with the page's real controls.
- **Theme toggled mid-scroll** — the card re-themes without layout shift.
- **Portrait fails to load** — the card holds its shape rather than collapsing.

## Requirements *(mandatory)*

### Functional Requirements

**Card anatomy (light mode)**

- **FR-001**: The card MUST take the reference's shield silhouette — a rectangle with a
  notched shoulder at the top — rather than a plain rounded rectangle.
- **FR-002**: The card MUST carry a two-part metallic border: an outer foil edge
  following the shield outline and an inner hairline rule inset from it.
- **FR-003**: The card ground MUST be the reference's warm ivory, graded toward sand at
  the outer edges, and MUST carry the reference's faint surface texture and pitch-diagram
  line art without either becoming legible enough to compete with the content.
- **FR-004**: The card MUST show a figure block in the top-left, set at display size
  with a small caps label beneath it and a rule under the pair, holding the same
  position and visual weight the reference gives its rating block.
- **FR-004a**: The figure in that block MUST be the career total in years, labelled as
  years — not a composite rating. The card MUST NOT print any score that is not a count
  of something or a fact a reader could check, upholding ADR 0013 rather than amending it.
- **FR-005**: The card MUST show a position abbreviation in the accent colour, with the
  full job title in navy small caps beneath it.
- **FR-006**: The card MUST show a meta column of three rows, each an icon beside a
  short fact: location, country, and total years of experience.
- **FR-007**: The card MUST show the portrait as a cut-out figure occupying the right
  side, overlapping the meta column and standing past the card's inner frame, as in the
  reference — not as a rectangular photograph held inside a frame.
- **FR-007a**: The cut-out MUST be produced from the supplied portrait as part of this
  work, and MUST meet a stated quality bar: no visible halo of the original background,
  no hard-edged fringing along the hair or shoulders at the size the card displays, and
  a silhouette that holds up against both card grounds. If the matte cannot meet that
  bar, the card falls back to a framed portrait rather than shipping a poor cut-out.
- **FR-008**: The card MUST show the name across the full width in condensed navy caps,
  centred, at the largest type size on the card, with a small ornamental divider beneath.
- **FR-009**: The card MUST show a list of achievement rows, each pairing an icon tile
  with one to two lines of text, separated by hairline rules, with exactly one row
  carried in the accent colour for emphasis.
- **FR-010**: The card MUST show a crest at the foot, centred, closing the composition.
- **FR-011**: Every icon on the card MUST be drawn as part of the site rather than
  pulled from an icon dependency, per ADR 0014's scope.

**Dark mode**

- **FR-012**: The card MUST have a distinct dark-mode edition in which the ivory ground
  becomes a deep ink ground, the type inverts to warm ivory, the foil is re-tuned to
  stay legible as metal on a dark ground, and the accent is lifted in value.
- **FR-013**: The dark edition MUST preserve hue identity with the light edition — the
  same three hue families (gold, navy/ivory, rust), changed in value rather than
  swapped for different colours.
- **FR-014**: Dark-mode styling MUST be bound to the site's existing theme class, never
  to the operating-system media query, per ADR 0006 and ADR 0011.
- **FR-015**: All card colour values MUST come from a shared token module so that both
  editions are defined in one place rather than scattered across markup.

**Content**

- **FR-016**: The card's facts — name, job title, position abbreviation, location,
  country, years of experience, achievements, and the figure block's value — MUST be
  supplied by the site's content file and validated before use.
- **FR-017**: The content contract MUST cap the achievement list at the count the
  design holds, and MUST reject content that would overflow the card.
- **FR-018**: Content that fails validation MUST surface through the existing error
  path rather than rendering a partial card.
- **FR-018a**: The card's retired elements — the three stat pills, the star rating, the
  soft-skill bars and the scouting blurb — MUST be removed rather than hidden, and their
  fields MUST be removed from the content contract so the file stops carrying values
  nothing renders. The AWS certification MUST survive as an achievement row rather than
  a separate badge.

**Quality floor**

- **FR-019**: Every text element on the card MUST clear WCAG AA (4.5:1) against its own
  background in both editions; display-size text MUST clear AAA (7:1).
- **FR-020**: The card MUST remain readable and uncropped from 320px to 1920px, and
  MUST NOT introduce horizontal page scrolling at any width.
- **FR-020a**: Text legibility MUST take precedence over the card's proportion. Body
  text on the card MUST NOT render below 14px at any width; where holding that size
  makes the card taller than the reference's proportion, the card grows. The full
  anatomy MUST be present at every width — no element is dropped, hidden, or moved
  outside the card on small screens.
- **FR-021**: The card MUST NOT push the pitch text and its two calls to action below
  the fold on a phone — source and reading order established in feature 005 stay intact.
- **FR-021a**: At desktop width the opening MUST remain a two-column composition. The
  card MAY widen to hold its new content comfortably, but MUST NOT be enlarged to the
  point where the three annotated role phrases read as secondary to it.
- **FR-022**: The redesign MUST NOT add a runtime dependency.
- **FR-023**: The card MUST carry exactly one motion treatment: a sheen that travels
  the foil border. No tilt, no entrance animation, no per-element motion. The card's
  existing scroll drift is unchanged and is not part of this.
- **FR-023a**: The sheen MUST be suppressed entirely for visitors who prefer reduced
  motion, through the existing helper rather than a new detection path, and its absence
  MUST leave the card visually complete rather than mid-state.
- **FR-024**: The reference image `card.png` MUST NOT be committed, MUST NOT be
  referenced by the running site, and MUST NOT ship in the deployed bundle.

**Record**

- **FR-025**: The change MUST be accompanied by an architecture decision record that
  amends ADR 0013 — it replaces the card anatomy that ADR committed to, and retires the
  soft-skill bars that ADR introduced as its bounded answer to a composite rating. Per
  Principle VI the earlier record keeps its text and gains a dated note. The new record
  MUST state what the card gives up, not only what it gains.

### Key Entities

- **Player Card**: the collectible object shown in the opening. Holds the name, the
  position abbreviation and full title, the figure block's value and label, the meta
  facts, the achievement list, and the portrait reference.
- **Meta Fact**: one row of the meta column — a kind (place, country, duration), a
  short display value, and the icon that identifies it.
- **Achievement**: one row of the honours list — a short piece of text, the kind of
  icon that fronts it, and whether it is the emphasised row.
- **Card Palette**: the two editions' colour values — ground, foil, type, accent,
  rule — held in one module so light and dark are defined side by side.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Placed beside the reference, a reviewer can account for every element of
  the reference's anatomy in the built card — all eleven elements enumerated in User
  Story 1, Scenario 1 present and in the same relative position.
- **SC-002**: All text on the card measures at or above 4.5:1 against its background in
  both editions, and the name and figure block measure at or above 7:1.
- **SC-003**: The card renders complete and readable at every width from 320px to
  1920px, with no horizontal page scroll and no clipped content, and no text on it
  measures below 14px at any width.
- **SC-004**: Switching the theme changes every surface, rule, and glyph on the card —
  a reviewer comparing screenshots finds zero elements holding a light-mode value in
  the dark edition.
- **SC-005**: Every fact printed on the card can be changed by editing the content file
  alone, verified by changing one fact of each kind and reloading with no code edit.
- **SC-006**: Lighthouse performance stays at or above 90 on a production build, the
  floor the constitution sets.
- **SC-007**: Every number printed on the card is traceable to either a count of years
  or a value a reader could check — a reviewer can name the source of each one.
- **SC-008**: The cut-out portrait shows no halo or fringing from its original
  background when inspected at twice the size the card displays it, on both grounds.
- **SC-009**: The repository contains no committed copy of the reference image
  introduced by this feature, and the deployed bundle does not include it.
- **SC-010**: With reduced motion requested, the card renders complete and static — a
  reviewer sees no sheen, no partial gradient, and no element mid-transition.

## Assumptions

- **`card.png` is a design input, not an asset.** It is already tracked in the
  repository from earlier work and has been replaced locally with the new mock. This
  feature leaves that modification uncommitted, which means the working tree stays dirty
  on this branch for the duration. Every commit here stages files explicitly.
- **`hero_pic.png` is the source for the portrait**, as stated. A cut-out is derived
  from it during implementation and becomes a committed asset; the original stays as
  the source. Both editions use the same cut-out — a figure with no background of its
  own works on either ground, which is the point of cutting it out.
- **The card's most prominent figure is the career total**, so it duplicates the years
  fact that also appears in the meta column. That repetition is deliberate: it is how
  the reference's rating block and meta rows relate, and it keeps the block honest.
- **The reference's own values define the light palette**: ivory ground around
  `#F8EDE0` grading to `#EED6BB`, foil in the `#D89D6B`–`#A86A3F` range, type at
  `#001126`, accent around `#9A3B1E`. These were sampled from the mock and are the
  starting point, subject to contrast tuning.
- **The dark edition follows the collectible convention of a black parallel** — the
  same card printed on black stock with the foil warmed rather than a different design.
  This is the default direction unless review says otherwise.
- **The current card's stat pills, star rating, soft-skill bars and scouting blurb
  retire** (confirmed, see Clarifications). The reference's anatomy has no slot for
  them, and the meta column plus the achievement rows carry more concrete evidence than
  a self-rated bar does. This gives up two things worth naming: the per-area year counts
  (Backend 9 / Cloud 6 / Security 4), and the soft-skill bars that ADR 0013 introduced
  as the bounded alternative to the composite rating it rejected. The ADR amendment
  (FR-025) records that trade rather than letting it happen silently.
- **The country flag treatment already built for the current card is reused** rather
  than redrawn.
- **The three annotated role phrases beside the card are out of scope** and stay as
  they are.
- **The achievement list is capped at five**, matching the reference. A different cap
  is a content-contract change, not a layout accident.
- **No new dependency** — icons, the shield outline, the crest and the foil are drawn
  with what the project already has.
- **Reduced-motion and the existing reading order from feature 005 are constraints to
  preserve**, not things this feature revisits.

## Dependencies

- The existing content loading and validation path (ADR 0001, ADR 0003).
- The existing theme mechanism (ADR 0010, ADR 0011).
- The hero palette module introduced by ADR 0013, which this feature extends or replaces.
- An ADR amending ADR 0013, landing in the same pull request (Principle VI).
