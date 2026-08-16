# Feature Specification: Modernize Education & Certification Grade Display

**Feature Branch**: `feat/education-cert-redesign`

**Created**: 2026-08-16

**Status**: Draft

**Input**: User description: "I want to make the education and certification section more meaningful. The text Distinction and 1.9 Grade look really off. I want to make them look better using frontend design to make it more modern"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grade/classification reads as an achievement, not stray text (Priority: P1)

A visitor scanning the Education & Certifications section currently sees "Distinction" and "1.9 Grade" rendered as plain paragraph text underneath the institution name — indistinguishable in weight and treatment from any other body copy, and easy to skim past or misread as a stray sentence fragment. The visitor should instead immediately recognize these as a qualification's result: a small, visually distinct marker set apart from the surrounding text.

**Why this priority**: This is the exact problem the user flagged — it is the highest-visibility issue and the reason the request exists.

**Independent Test**: Can be fully tested by viewing the Education & Certifications section and confirming the grade/classification value is rendered as a distinct visual element (not a plain paragraph line) for both entries that carry one.

**Acceptance Scenarios**:

1. **Given** an education entry with a `cardDetailedText` value (e.g., "Distinction"), **When** the section renders, **Then** the value appears as a styled badge/label distinct from body text, not as an unstyled paragraph.
2. **Given** an education entry with a numeric grade value (e.g., "1.9"), **When** the section renders, **Then** the value is presented with enough context that a visitor unfamiliar with the grading scale can tell it denotes a strong result, not a raw/low score.

---

### User Story 2 - Consistent, modern treatment across all entries (Priority: P2)

A visitor scrolling through all four entries (two degrees with grades, two AWS certifications without a grade field) should see one coherent, modern visual language across the section — not a layout that looks polished for two rows and unfinished for the other two.

**Why this priority**: The user described "the section," not just the two grade values — a fix that only touches two of four rows would look inconsistent and half-done.

**Independent Test**: Can be fully tested by comparing all four rendered entries side by side and confirming consistent spacing, typography, and badge treatment regardless of whether a grade value is present.

**Acceptance Scenarios**:

1. **Given** an entry with no `cardDetailedText` value (a certification), **When** the section renders, **Then** no empty badge, broken spacing, or visual gap appears where the grade badge would otherwise sit.
2. **Given** the four entries render together, **When** compared, **Then** heading hierarchy, spacing rhythm, and badge styling are visually consistent across all of them.

---

### User Story 3 - Legible on the photographic background in both themes (Priority: P3)

A visitor viewing the site in either the default light theme or the experimental dark theme (behind `?experiment=true`) sees the new grade badge clearly against the site's pinned photographic backdrop, meeting the same contrast standard already required of body copy on that surface.

**Why this priority**: A "modern" badge that fails contrast on the photo surface would be a regression, not an improvement — but it's a quality gate on Stories 1–2 rather than a new capability.

**Independent Test**: Can be fully tested by rendering the section in both the default theme and the `?experiment=true` theme and checking the badge's text/background contrast against the pinned photo surface.

**Acceptance Scenarios**:

1. **Given** the default (light) theme, **When** the badge renders over the photographic surface, **Then** its text meets WCAG AA contrast against the surface behind it.
2. **Given** the `?experiment=true` theme, **When** the badge renders, **Then** it remains legible and uses only the existing `dark:` utility approach — no new hand-written dark-mode selectors.

---

### Edge Cases

- What happens for an entry whose `cardDetailedText` is present but empty/whitespace? Treat it the same as absent — no badge rendered.
- How does the badge handle a future longer value (e.g., "First Class Honours with Distinction") without wrapping awkwardly or breaking the row layout on mobile widths?
- What happens if a future entry has a grade value but no `media` image — does the badge's position still read cleanly in the single-column layout?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render an education entry's grade/classification value (currently the `cardDetailedText` field) as a visually distinct badge/label element, not as plain paragraph text.
- **FR-002**: The badge MUST use the site's existing design tokens (color, border, radius) rather than introducing new arbitrary colors or one-off styling.
- **FR-003**: The badge's text MUST meet WCAG AA contrast against the pinned photographic background in both the default theme and the `?experiment=true` theme, using only existing `dark:` utilities.
- **FR-004**: Entries with no grade/classification value MUST render with no badge and no leftover empty space or broken alignment.
- **FR-005**: The badge MUST display the exact value already present in `education.json` (`cardDetailedText`) — this change is presentational only and MUST NOT alter, rename, or add fields to the underlying data file.
- **FR-006**: For a numeric grade value (e.g., "1.9"), the rendered treatment MUST include enough label context (e.g., a short qualifier or accompanying text) that the value is not misread as a bare, out-of-context number.
- **FR-007**: The badge MUST remain fully legible and correctly laid out at mobile viewport widths, without text overflow or wrapping that breaks the badge shape.
- **FR-008**: Any entrance motion added to the badge (optional) MUST go through the site's existing Framer Motion or `rough-notation` usage and MUST respect `prefers-reduced-motion` via the existing helpers — no new animation library or bespoke detection path.

### Key Entities *(include if feature involves data)*

- **Education Entry**: An item in `education.json` representing either a degree or a certification. Relevant existing attributes: `cardTitle` (qualification name), `cardSubtitle` (institution), `cardDetailedText` (optional grade/classification, e.g., "Distinction" or "1.9"), `media`/`icon` (optional image). No new attributes are introduced by this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of education entries carrying a grade/classification value display it as a styled badge rather than plain paragraph text.
- **SC-002**: The badge passes a WCAG AA contrast check against the photographic background in both supported themes.
- **SC-003**: A visitor unfamiliar with the German grading scale can correctly identify "1.9" as a strong academic result without leaving the page, based on the label/qualifier shown alongside it.
- **SC-004**: The section's Lighthouse performance score remains ≥ 90 on production builds after the change (no regression from the existing baseline).
- **SC-005**: The four education/certification entries read as one visually consistent set when viewed together, with no entry appearing unstyled or inconsistent relative to the others.

## Assumptions

- Scope is limited to the visual presentation of the existing `cardDetailedText` value and the section's overall visual consistency; it does not add new data fields, new entries, or restructure the section's layout (single-column row list) established in the prior redesign.
- "More modern" is interpreted as: a styled badge/pill treatment for the grade value, using the site's existing token system — not a wholesale layout change (e.g., not switching back to a card grid or timeline component).
- The numeric grade clarification (FR-006) is satisfied with a short inline qualifier (e.g., a label preceding the value) rather than a tooltip, footnote, or external link, keeping the fix simple per the KISS principle.
- No new dependency, animation library, or content-storage mechanism is required; this is a Tailwind-only styling change to `components/Education/EducationSection.tsx`, so no ADR is expected to be triggered.
- Certification entries (AWS badges) are unaffected beyond the general consistency pass in User Story 2 — they already have their own `media` badge image and "Learn more" link, which are out of scope for this change.
