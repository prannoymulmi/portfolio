# Feature Specification: German Language Toggle & Hero Location Tag

**Feature Branch**: `feat/de-i18n-toggle`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "I want to have a german language site as well default is english and if someone wants then there is a button to togggle. Make the project so that multi language can be supported later. Also add in the Hero section Hamburg Germay with a location icon"

## Clarifications

### Session 2026-08-19

- Q: Who provides the actual German translation text for existing content — will you supply reviewed German copy, or should it be drafted for you to review during implementation? → A: Draft German copy is written during implementation; the user reviews and corrects it in the PR.
- Q: Does the German version of the site need a German CV/resume document, or should the CV download link stay the same file regardless of language? → A: The CV link stays the same file in both languages; no German CV is produced in this feature.
- Q: Where should the language toggle control live on the page? → A: In the navigation bar (desktop) / hamburger menu (mobile), alongside existing nav controls.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch the whole site to German (Priority: P1)

A visitor lands on the site in English (the default). They click a language
toggle and every piece of visible site copy — navigation, hero, about,
projects, credentials, footer, and any other on-page text — switches to
German. Clicking the toggle again returns everything to English.

**Why this priority**: This is the entire point of the feature. Without a
working, complete switch, there is no German site — only a partially
translated one, which is worse than none because it looks broken.

**Independent Test**: Load the site fresh, confirm it renders in English,
click the toggle, and confirm every section's text is now in German with no
mixed-language sections. Toggle back and confirm English returns exactly as
it was.

**Acceptance Scenarios**:

1. **Given** a first-time visitor with no stored preference, **When** the
   page loads, **Then** all content renders in English.
2. **Given** the site is showing English, **When** the visitor activates the
   language toggle, **Then** all on-page text updates to German without a
   full page reload.
3. **Given** the site is showing German, **When** the visitor activates the
   toggle again, **Then** all on-page text returns to English.
4. **Given** a visitor has switched to German, **When** they navigate within
   the site (e.g. follow an in-page anchor link) or reload the page,
   **Then** the site continues to display German.

---

### User Story 2 - Language choice is remembered (Priority: P2)

A returning visitor who previously chose German should not have to
re-toggle every time they open the site.

**Why this priority**: Meaningfully improves the experience for repeat
visitors and is a standard expectation for any language switcher, but the
site is still fully usable without it (P1 delivers the core value alone).

**Independent Test**: Switch to German, close the browser tab, reopen the
site, and confirm it still renders in German.

**Acceptance Scenarios**:

1. **Given** a visitor has switched to German, **When** they return to the
   site in a new session on the same browser, **Then** the site loads in
   German.
2. **Given** a visitor has never toggled (or has cleared their stored
   preference), **When** they load the site, **Then** it loads in English.

---

### User Story 3 - Hamburg, Germany shown in the Hero (Priority: P2)

A visitor viewing the Hero section sees a location tag reading "Hamburg,
Germany" alongside a location-pin icon, so they immediately know where the
site's owner is based.

**Why this priority**: Small, self-contained addition independent of the
language toggle; valuable on its own but not blocking the localization work.

**Independent Test**: Load the Hero section and confirm "Hamburg, Germany"
and a location icon are visible together, in both English and German states.

**Acceptance Scenarios**:

1. **Given** the Hero section is rendered in English, **When** the visitor
   views it, **Then** a location icon and the text "Hamburg, Germany" are
   visible.
2. **Given** the Hero section is rendered in German, **When** the visitor
   views it, **Then** the same location tag is visible with its label in
   German ("Hamburg, Deutschland").

---

### User Story 4 - Site can gain a third language later without a rework (Priority: P3)

A future contributor wants to add a third language. They should be able to
add one set of translated content and register the new language, without
restructuring how existing languages are stored or how components read
content.

**Why this priority**: Explicitly requested ("make the project so that
multi language can be supported later"), but it is a structural quality of
the P1 implementation rather than a separately shippable capability — there
is nothing a visitor can test until a third language actually exists.

**Independent Test**: Confirm (by inspection/documentation, since no third
language ships in this feature) that adding a new language requires adding
one new content set and a registry entry, not changes to component logic
that reads translated content.

**Acceptance Scenarios**:

1. **Given** the content and toggle architecture built for English and
   German, **When** a reviewer inspects it, **Then** no component contains
   English/German-specific branching — components read translated content
   generically for whatever language is active.

---

### Edge Cases

- What happens when a piece of content has no German translation yet? The
  site MUST show the English text for that item rather than a blank space
  or a broken layout, so a partial translation gap is never visible as an
  error.
- What happens if a visitor's stored language preference becomes invalid or
  unreadable (e.g. corrupted storage)? The site MUST fall back to English.
- What happens to content the visitor is actively reading (e.g. mid-scroll)
  when they toggle language? The toggle MUST NOT reset scroll position or
  collapse open UI state (e.g. an open project detail view) where avoidable.
- How does the language toggle behave for assistive technology? The toggle
  control and the language of the rendered content MUST both be announced
  correctly (e.g. the page's language attribute updates with the content).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST render entirely in English by default for any
  visitor with no previously stored language preference.
- **FR-002**: The site MUST provide a visible, clearly labeled control in
  the site navigation (and its mobile hamburger menu equivalent) that
  toggles the active language between English and German, reachable from
  every scroll position.
- **FR-003**: Activating the toggle MUST update all on-page, user-facing
  text on the current view to the selected language without a full page
  reload.
- **FR-004**: The site MUST persist the visitor's chosen language across
  page reloads and future visits in the same browser.
- **FR-005**: If a visitor's stored preference is missing, invalid, or
  unreadable, the site MUST default to English rather than erroring or
  guessing from browser/OS settings.
- **FR-006**: Where a specific piece of content has no German translation
  available, the site MUST display the English version of that content
  instead of an empty or broken element.
- **FR-007**: The content and translation structure MUST allow a new
  language to be added by supplying a new translated content set and
  registering it, without requiring changes to the components that display
  the content.
- **FR-008**: The Hero section MUST display a location tag reading "Hamburg,
  Germany" (or its German equivalent, "Hamburg, Deutschland", when the
  German language is active) accompanied by a location-pin icon.
- **FR-009**: The document's declared language (used by assistive
  technology and browsers) MUST match the currently active site language.
- **FR-010**: The language toggle control itself MUST have an accessible
  name that identifies its purpose and current state (e.g. which language
  is active, which one activating it switches to).

### Key Entities

- **Locale**: A supported language for the site (initially `en`, `de`).
  Has a code, a display name, and a complete or partial set of translated
  content.
- **Translated Content Set**: The German-language counterpart to each
  existing English content item (navigation labels, Hero copy, section
  headings, project/experience descriptions, footer text, accessible names,
  etc.), keyed so each string maps back to its English source.
- **Language Preference**: The visitor's chosen locale, stored in the
  browser so it can be restored on return visits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can switch the entire site from English to German,
  and back, in a single interaction (one click/tap) each way.
- **SC-002**: 100% of user-facing text visible on the page updates to the
  selected language when toggled — no section is left in the other
  language.
- **SC-003**: A returning visitor's previously chosen language is restored
  on 100% of subsequent visits in the same browser, without any repeat
  action from them.
- **SC-004**: Adding a third language in the future requires adding
  translated content and a registry entry only — zero changes to existing
  component code, verified by code review.
- **SC-005**: The Hamburg, Germany location tag is visible in the Hero
  section in both language states.

## Assumptions

- "German language site" means the entire visitor-facing site (all
  sections/content currently in English) gets a German counterpart, not
  a subset of pages.
- The toggle switches content in place on the same URL; it does not create
  separate German-language routes/pages. This matches the user's request
  for "a button to toggle" and keeps the site's existing single-page
  structure (per the project's fixed routing approach) unchanged.
- No automatic detection of browser/OS language is used to choose the
  initial language — the site always starts in English until the visitor
  explicitly toggles, consistent with the project's existing rule that no
  visitor is served a preference they did not explicitly choose.
- German translations for existing content will be drafted as part of
  delivering this feature (accurate, natural-sounding German copy for every
  existing English string), then reviewed and corrected by the site owner
  in the PR before merge — draft copy is not treated as final without that
  review.
- The language preference is stored per-browser (e.g. local storage), not
  tied to a user account, since the site has no authentication system.
- The Hero location tag is additive copy near the existing bio/intro
  content; it does not replace or restructure any existing Hero element.
- A location-pin icon for the Hero tag will be a simple inline graphic
  consistent with the site's existing icon treatment elsewhere in the UI,
  rather than pulling in a general-purpose icon library.
- Only English and German ship in this feature; the "supports more
  languages later" requirement is about the underlying content/toggle
  structure being extensible, not about shipping a third language now.
- The downloadable CV/résumé file is out of scope for translation — the
  same CV document is linked regardless of the active language.
