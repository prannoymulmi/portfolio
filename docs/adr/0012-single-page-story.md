# ADR 0012: One scrolling story instead of per-page routes

- **Status**: Accepted, amended by [ADR 0016](0016-about-folds-into-the-opening.md)
- **Date**: 2026-08-10

> **Amendment note**: the story is seven chapters now, not eight — About folded
> into the opening per [ADR 0016](0016-about-folds-into-the-opening.md), and
> `/about` redirects to `/` rather than to a section anchor. Everything else
> below stands.
- **Supersedes**: the route structure in [ADR 0002](0002-nextjs-app-router.md).
  App Router itself still stands — only the number of routes changes.
- **Amends**: [ADR 0008](0008-file-based-seo-conventions.md) — the sitemap's
  route list drops from eight entries to one.

## Context

Feature `002` reframed the portfolio: it should read as one continuous story,
not as a set of pages a visitor has to click through. The site as built had:

- Eight routes under `app/(routes)/` — home, about, career, skills, projects,
  education, playbook, contact — each with its own `metadata` export.
- A `Navbar` with page-to-page links, which also happened to be the only thing
  rendering `ThemeToggle`.
- Deep links and search results pointing at all eight URLs.

A recruiter reading top-to-bottom had to make seven navigation decisions to see
everything, and each one cost a route transition and a fresh content fetch.

## Decision

Collapse the site to a single route. `app/page.tsx` renders every chapter as a
`<section id="…">` in reading order: hero, about, skills, career, education,
projects, playbook, contact.

Supporting decisions that follow from it:

- **Legacy URLs redirect.** `next.config.ts` maps each old path to its anchor
  (`/career` → `/#career`) with `permanent: true`, so bookmarks, shared links
  and indexed results keep working and pass their ranking to `/`.
- **The nav bar goes.** `Navbar` and `NavToggle` have no job once there is one
  page, and are deleted.
- **`StoryProgressNav` replaces it.** A sticky scroll-progress bar plus anchor
  links to all eight sections, so the story stays skippable — a long page with
  no jump control is worse than the pages it replaced, especially for keyboard
  and screen-reader users.
- **The theme toggle moves into `StoryProgressNav`**, the only persistent
  chrome left.

## Consequences

**Positive**

- The intended reading order is the only order; nothing is behind a click.
- One URL to share, and every section's content is on it — a link preview and a
  crawler both see the whole portfolio.
- No route transitions, and `ContentProvider`'s session cache now covers the
  entire visit rather than being re-warmed per page.
- Anchor navigation is free: `#career` works with JavaScript disabled.

**Negative**

- **One `metadata` block for the whole site.** Per-section titles and
  descriptions are gone, so `/#projects` shares the home page's preview card.
  Accepted: a portfolio is one document about one person.
- **Everything is in one document**, so the initial payload is larger.
  Mitigated by deferring the two heaviest sections behind dynamic imports
  (`CareerJourneyLazy`, `ProjectGalleryLazy`), which keeps GSAP out of the
  first load.
- **The theme toggle has one host again.** Deleting or restructuring
  `StoryProgressNav` unmounts it — which is precisely how it went missing the
  first time (defect 1 in [ADR 0010](0010-next-themes-for-theme-state.md)).
  A test asserting the toggle is reachable is the guard here, not vigilance.
- Anchors are client-resolved position, not server-resolved routes: a deep link
  lands at the right place only after the section has laid out.

## Alternatives rejected

- **Keep the routes and add a "read as one page" view**: two renderings of the
  same content to keep in sync, for a site whose whole content fits in one
  scroll.
- **Route groups with shared scroll**: App Router does not stitch separate
  routes into one scroll container; this would mean hand-rolling a router,
  exactly the kind of cleverness Principle I forbids.
- **Redirect-free removal of the old paths**: cheapest to implement and
  silently breaks every existing link. Permanent redirects cost seven lines.
