# Feature Specification: Mobile reading order, corrected LinkedIn link, and a CV link

**Feature Branch**: `005-mobile-order-contact-links`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "I want in mobile that the her card comes after the main text and the buttons view Work and play career, currently it is the first thing I see also my linked in link is wrong https://www.linkedin.com/in/prannoy-mulmi-0617026b/ it should be this. Also add a CV download link somewhere dont make it a big button like a link to click"

## Clarifications

### Session 2026-08-11

- Q: Is there a CV document ready to publish, or should the link be built now and the file follow? → A: Neither — the CV stays on an external host and the site links out to it. Nothing is committed to the repository.
- Q: How should the duplicate, unserved `app/data/social.json` be resolved? → A: Delete it. `public/data/` becomes the single source for social links; the rest of the dead `app/data/` files stay out of scope.
- Q: Where should the CV link live? → A: In the opening section, directly under the "View Work" and "Play Career" actions. It is hero content, not a social link, so it does not join the navigation or footer.

## User Scenarios & Testing *(mandatory)*

Three independent fixes to how a visitor first meets the portfolio owner: what they
read first on a phone, whether the LinkedIn link reaches the right person, and whether
they can take a CV away with them. Each ships and is verifiable on its own.

### User Story 1 - A phone visitor reads the pitch before the picture (Priority: P1)

Someone opens the site on a phone. Today the first full screen is the player card —
a portrait and a grid of figures — and the sentences explaining who the owner is and
what they do sit below it, along with the two calls to action. The visitor has to
scroll past an image to find out whose site this is.

The order on narrow screens should match the order on wide screens as it is read:
role phrases, intro, biography, then the "View Work" and "Play Career" actions, and
only then the player card.

**Why this priority**: It is the first impression on the majority-share device, and
it is the only one of the three items that costs a visitor something on every single
visit. The other two are wrong links and a missing extra.

**Independent Test**: Load the opening section at a phone-width viewport and read
down the page. Fully testable on its own — it changes no content and no links.

**Acceptance Scenarios**:

1. **Given** a visitor on a narrow (phone) screen, **When** the opening section
   loads, **Then** the role phrases and intro text are the first content they see,
   above the player card.
2. **Given** a visitor on a narrow screen, **When** they scroll down through the
   opening section, **Then** they encounter the "View Work" and "Play Career"
   actions **before** the player card.
3. **Given** a visitor on a wide (desktop) screen, **When** the opening section
   loads, **Then** the side-by-side arrangement is unchanged — text on the left,
   card on the right.
4. **Given** a visitor using a screen reader or keyboard on any screen size,
   **When** they move through the opening section, **Then** the announced and
   focus order matches the visual order they would see at that size.

---

### User Story 2 - The LinkedIn link reaches the right profile (Priority: P1)

Every LinkedIn link on the site currently points at a profile address that is not the
owner's. Anyone following it from the navigation bar or the footer lands somewhere
wrong — a dead end at the exact moment they were trying to make contact.

All LinkedIn links across the site must resolve to
`https://www.linkedin.com/in/prannoy-mulmi-0617026b/`.

**Why this priority**: A broken contact link silently loses the visitors who were
most interested. It is also the cheapest of the three to fix.

**Independent Test**: Follow the LinkedIn link from every place it appears and
confirm each one arrives at the owner's profile.

**Acceptance Scenarios**:

1. **Given** a visitor anywhere on the site, **When** they activate the LinkedIn
   link in the persistent navigation, **Then** they arrive at the owner's profile.
2. **Given** a visitor at the bottom of the page, **When** they activate the
   LinkedIn link in the footer, **Then** they arrive at the same profile.
3. **Given** the site's content files, **When** the LinkedIn address is read from
   any of them, **Then** every copy states the same address, so no future edit can
   revive the wrong one.

---

### User Story 3 - A visitor can take the CV away (Priority: P2)

A recruiter who has read the opening and wants to keep a record has nothing to take
with them — there is no CV anywhere on the site. They need a way to reach it without
hunting, but in a way that does not compete with the two existing calls to action.

The CV itself lives on an external host, not on this site; the portfolio only points
at it. It is offered as a small, plain, clickable text link — deliberately not a
third large button.

**Why this priority**: It adds a capability rather than repairing one, and it depends
on an address that has to be supplied (see Dependencies). The site is fully usable
without it.

**Independent Test**: Find and activate the CV link, and confirm the document
arrives. Testable without touching layout order or social links.

**Acceptance Scenarios**:

1. **Given** a visitor reading the opening section, **When** they look directly
   below the "View Work" and "Play Career" actions, **Then** they find a CV link
   presented as small text rather than as a button.
2. **Given** a visitor on any screen size, **When** they activate the CV link,
   **Then** the externally hosted CV opens for them and the portfolio remains open
   behind it.
3. **Given** a keyboard-only visitor, **When** they tab through the opening
   section, **Then** the CV link receives a visible focus indicator and can be
   activated with the keyboard.
4. **Given** the external host is unreachable, **When** the opening section
   renders, **Then** the rest of the section is unaffected and the visitor is not
   stranded away from the portfolio (see Edge Cases).

---

### Edge Cases

- **The card is still the tallest thing in the section.** Moving it below the text
  on a phone means the two calls to action move up, but the page as a whole gets
  longer above the fold boundary. The text block must not be so tall that the card
  becomes unreachable in practice — the visitor should meet the card within one or
  two swipes of the actions.
- **The external host is down, or the CV address goes stale.** The site does not
  control that host. The link must not break the opening section, and because the
  portfolio stays open behind it, a failed load must never cost the visitor their
  place on the page.
- **The CV is opened on a phone.** Handheld browsers vary in whether they can
  display a hosted document inline; the visitor must end up with the document either
  way, not with a blank tab.
- **A LinkedIn address is edited into one content file but not its duplicate.** The
  site currently keeps two copies of the social links; only one is served, and it is
  the one holding the wrong address. Once the duplicate is gone (FR-007) there is no
  wrong file left to edit — but any check for this feature must confirm the deletion
  broke nothing that was quietly reading it.
- **Motion and parallax on the opening section.** The two columns drift at different
  rates as the page scrolls. Reordering them on narrow screens must not leave the
  card drifting over or under the text it now follows.

## Requirements *(mandatory)*

### Functional Requirements

**Mobile reading order**

- **FR-001**: On narrow (phone-width) screens, the opening section MUST present the
  owner's role phrases, intro statement, and biography before the player card.
- **FR-002**: On narrow screens, the "View Work" and "Play Career" actions — and the
  CV link beneath them — MUST appear before the player card.
- **FR-003**: On wide (desktop) screens, the existing side-by-side arrangement —
  text beside the card — MUST be preserved unchanged.
- **FR-004**: The order in which the opening section is announced to assistive
  technology and traversed by keyboard MUST match the visual order presented at
  that screen size.

**LinkedIn address**

- **FR-005**: Every LinkedIn link the site renders MUST resolve to
  `https://www.linkedin.com/in/prannoy-mulmi-0617026b/`.
- **FR-006**: The site MUST hold exactly one authoritative copy of the social link
  addresses, so that correcting an address once corrects it everywhere it is shown.
- **FR-007**: The unserved duplicate copy of the social link content MUST be
  deleted, leaving exactly one file that anyone editing a social address can find,
  so a later edit cannot reintroduce the wrong address.

**CV link**

- **FR-008**: The opening section MUST offer a link to the owner's CV, positioned
  directly below the "View Work" and "Play Career" actions. It MUST NOT be added to
  the persistent navigation or the footer.
- **FR-009**: The CV link MUST be presented as small plain text — visually
  subordinate to the "View Work" and "Play Career" actions, and MUST NOT be styled
  as a third primary button.
- **FR-010**: The CV MUST be referenced by an external address. The site MUST NOT
  store, host, or serve a copy of the CV document.
- **FR-011**: Activating the CV link MUST open the CV without closing or navigating
  away from the portfolio, so a visitor who has scrolled keeps their place.
- **FR-012**: The CV link MUST be reachable and operable by keyboard, with a
  visible focus indicator, and MUST carry a label that states what it is and that
  it leads to an external document.
- **FR-013**: The CV link's label and address MUST be editable as content, in the
  same way the site's other external links are, without a code change.
- **FR-014**: The site MUST behave correctly when the CV address is absent from
  content: the opening section renders without the link rather than showing a broken
  or empty one.

### Key Entities

- **Social link**: a named external profile the site links to (network name plus
  address). Rendered in the persistent navigation and in the footer. LinkedIn and
  GitHub are the current entries.
- **CV link**: a reference to the owner's curriculum vitae, which is hosted
  elsewhere and not held by this site. Has an external address and a human-readable
  label; both are content. Optional — its absence is a valid state (FR-014).
- **Opening section**: the first screen of the single scrolling page. Holds the
  role phrases, intro, biography, the two calls to action, the new CV link, and the
  player card. Its internal arrangement differs between narrow and wide screens.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a phone-sized screen, a visitor can read who the owner is and what
  they do without scrolling past any image — the first text they meet is the role
  phrases, not the portrait.
- **SC-002**: On a phone-sized screen, both calls to action are reachable within one
  scroll gesture of the biography, and precede the player card.
- **SC-003**: The desktop arrangement is visually unchanged from before this feature —
  a side-by-side comparison shows no difference at wide screen sizes.
- **SC-004**: 100% of LinkedIn links on the site arrive at the owner's profile, from
  every place the link appears.
- **SC-005**: A visitor can locate and open the CV within 15 seconds of landing on
  the opening section, without scrolling past the opening section, and returns to
  the portfolio at the same scroll position afterwards.
- **SC-006**: The CV link is visibly smaller and lighter in weight than either call
  to action, and no user testing participant mistakes it for a primary button.
- **SC-007**: Every element added or reordered by this feature meets the site's
  existing contrast and keyboard-accessibility standard, verified at both narrow and
  wide screen sizes and in both light and dark themes.

## Assumptions

- **"Mobile" means the site's existing narrow breakpoint.** The opening section
  already switches between a stacked and a side-by-side arrangement at a defined
  width; this feature changes the stacked order at that same threshold rather than
  introducing a new one.
- **The reordering is presentational only.** No content is added, removed, or
  reworded by User Story 1 — only the order in which the existing blocks appear on
  narrow screens.
- **The CV link is hero content, not a social link.** Although it points outward
  like LinkedIn and GitHub do, it is authored and placed with the opening section
  rather than with the profile links rendered in the navigation and footer. That
  keeps the navigation's icon row unmixed and puts the CV where someone who has just
  read the pitch will look.
- **The CV link behaves like the site's other external links.** LinkedIn and GitHub
  already open in a new tab from the navigation and footer; the CV follows that
  established pattern, which is also what satisfies FR-011.
- **The site does not control the CV's format or availability.** Whatever the
  external host serves is what the visitor gets. The site makes no promise about the
  document itself — only that the link reaches it.
- **`public/data/` is the authoritative content location.** The site serves its
  content from there. A second, unserved copy of the same files exists under
  `app/data/` and has drifted — it happens to hold the *correct* LinkedIn address,
  which is why the wrong one has gone unnoticed. FR-007 deletes the social duplicate;
  the remaining dead files in that directory stay out of scope, as feature 004 decided.
- **No analytics or tracking is attached to the CV link.** The site does not measure
  clicks today, and this feature does not introduce that.

## Dependencies

- **The CV's external address.** The owner must supply the URL of the hosted CV.
  Until it is supplied, User Story 3 ships as an unpopulated link (FR-014) and cannot
  be verified end to end.
- **The external host.** Availability of the CV is that host's responsibility, not
  this site's. Anyone with the address can reach the document, so it should contain
  only what the owner is willing to publish — a CV commonly carries a home address
  and phone number. Keeping it off this repository avoids committing those details to
  public git history, but does not make the document private.
- **Nothing new is called at runtime.** The site renders a link; it does not fetch
  the CV or check whether the address resolves.

## Out of Scope

- Cleaning up the unserved `app/data/` files other than `social.json` (deferred by
  feature 004, still separable).
- Any change to the desktop arrangement of the opening section.
- Adding, removing, or restyling the "View Work" and "Play Career" actions themselves.
- Generating, writing, formatting, or hosting the CV document — this feature links
  to it, it does not produce or serve it.
- Verifying that the CV address still resolves, or alerting when it goes stale.
- Tracking or analytics on CV clicks.
