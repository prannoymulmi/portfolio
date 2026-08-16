# Feature Specification: Remove the Technical Playbook Section

**Feature Branch**: `feat/remove-technical-playbook`

**Created**: 2026-08-16

**Status**: Draft

**Input**: User description: "Remove the technical playbook section from the site"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The story no longer includes a Technical Playbook chapter (Priority: P1)

A visitor reading the portfolio top to bottom moves from Projects straight to
Contact — the Technical Playbook chapter (its principle cards and category
grid) is gone from the page, and so is any way to reach it while scrolling or
jumping via the section menu.

**Why this priority**: This is the entire request — removing the section is
the feature.

**Independent Test**: Load `/`, scroll or use the section jump menu, and
confirm no "Technical Playbook" heading, content, or anchor target exists
anywhere on the page.

**Acceptance Scenarios**:

1. **Given** a visitor on `/`, **When** they scroll through the full story,
   **Then** the page goes from the Projects chapter directly to the Contact
   chapter with no Technical Playbook chapter in between.
2. **Given** a visitor opens the section jump menu (hamburger nav), **When**
   they view the list of chapters, **Then** "Technical Playbook" is not one of
   the options.

---

### User Story 2 - Old links to the playbook don't break (Priority: P2)

A visitor who has an old bookmark, a shared link, or a search result pointing
at `/playbook` (or `/#playbook`) still lands on a working page instead of a
broken anchor or a 404.

**Why this priority**: The constitution requires retired paths to redirect
rather than 404 (Principle IV, ADR 0012) — this is a correctness requirement
for the removal, not new scope, but it's easy to get wrong (redirecting to an
anchor that no longer exists is effectively the same failure as a 404).

**Independent Test**: Request `/playbook` directly and confirm it redirects to
a working page (the story's top), not to a missing anchor.

**Acceptance Scenarios**:

1. **Given** the existing `/playbook` → `/#playbook` redirect, **When** the
   `#playbook` anchor no longer exists on the page, **Then** the redirect
   target is updated so `/playbook` lands somewhere real (the site's root),
   not on a fragment that resolves to nothing.

---

### Edge Cases

- What happens to the "Technical Playbook" entry in the site's section-jump
  menu (hamburger nav) and its dedicated icon? Both are removed along with the
  chapter.
- What happens to the playbook's underlying content data (principle
  categories/cards)? It is no longer fetched or rendered; the data file itself
  is out of scope to delete (see Assumptions) unless removing it is trivial to
  do safely.
- What happens to any other page's cross-reference to "Technical Playbook"
  (e.g. the section list surfaced in the hamburger menu's chapter icons)? Any
  reference is removed as part of this same change, not left dangling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST NOT render the Technical Playbook chapter (heading, principle category grid, and cards) anywhere on `/`.
- **FR-002**: The system MUST NOT include a "Technical Playbook" entry in the section jump menu (hamburger navigation) or any other in-page chapter listing.
- **FR-003**: The system MUST NOT expose an anchor named `playbook` (or equivalent in-page jump target) once the chapter is removed.
- **FR-004**: The system MUST continue to redirect requests for the legacy `/playbook` path to a working destination (the site root) rather than a 404 or a redirect to a now-nonexistent anchor.
- **FR-005**: The removal MUST NOT change the rendering, content, or ordering of any other chapter (Hero, Skills, Career, Education, Projects, Contact).
- **FR-006**: The removal MUST NOT introduce a new dependency, animation library, or styling approach — this is a deletion, not a redesign.

### Key Entities *(include if feature involves data)*

- **Story Chapter**: One `<section>` in the single-page story (`app/page.tsx`), identified by an anchor id and represented in the section jump menu. The Technical Playbook chapter is being removed from this set; the remaining six chapters (Hero, Skills, Career, Education, Projects, Contact) are unaffected.
- **Legacy Route**: A pre-redesign standalone path (`/playbook`) preserved only as a redirect target per ADR 0012's rule that retired paths must redirect rather than 404. Its destination changes from an anchor that will no longer exist to the site root.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 instances of "Technical Playbook" text, heading, or anchor appear anywhere on the rendered `/` page.
- **SC-002**: 100% of requests to `/playbook` receive a redirect to a page that renders successfully (not a 404, not a broken fragment).
- **SC-003**: The remaining six chapters render in the same order and with the same content as before the change, verified by comparing the page before and after.
- **SC-004**: The section jump menu lists exactly the remaining six chapters, with no empty or broken entry where Playbook used to be.

## Assumptions

- "Remove the technical playbook section" means removing the chapter from the visible story and its navigation — it does not necessarily mean deleting the underlying `public/data/playbook.json` content file or the `components/Playbook/` component files outright. Whether those are deleted or merely disconnected is an implementation decision for planning, not a behavior a visitor can observe, as long as nothing playbook-related renders or is reachable.
- No other page or chapter references the Playbook chapter's content or anchor in a way that would break if it's removed — this was verified by inspection: the chapter is self-contained (its own section, its own component, its own content file).
- Per Principle VI, this change is architecturally significant (it changes the site's structure and a URL's redirect target) and requires an ADR landing in the same PR as the code change.
- The legacy `/playbook` redirect's new destination is the site root (`/`), matching the precedent already set by `/about` → `/` (ADR 0016) for a chapter that no longer has its own anchor.
