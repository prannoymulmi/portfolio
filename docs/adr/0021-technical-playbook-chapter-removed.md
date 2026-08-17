# ADR 0021: The Technical Playbook chapter is removed

- **Status**: Accepted
- **Date**: 2026-08-17
- **Amends**: [ADR 0012](0012-single-page-story.md) — the story is now six
  chapters, not seven.

## Context

A visitor asked for the Technical Playbook chapter — its principle
category grid (Architecture, Cloud, Security, Backend, DevOps, Engineering
Principles) — to be dropped from the one-page story. Unlike
[ADR 0016](0016-about-folds-into-the-opening.md), nothing else on the page
reads the chapter's content: `playbook.json` fed only `PlaybookGrid` and
`PrincipleCategory`, and no other component held a reference into it. The
removal is a clean deletion, not a merge into another chapter.

Principle IV / [ADR 0012](0012-single-page-story.md) require a retired path
to redirect rather than 404. `/playbook` already redirected to `/#playbook`;
once the anchor is gone that redirect would land a visitor on a fragment
that resolves to nothing, which is functionally the same failure as a 404.

## Decision

**1. The chapter is deleted from `app/page.tsx`.** The `<section id="playbook">`
and its `PlaybookGrid` import are removed; the page now goes straight from
Projects to Contact.

**2. `/playbook` now redirects to `/`, not `/#playbook`.** Same precedent
[ADR 0016](0016-about-folds-into-the-opening.md) set for `/about`: when a
chapter's anchor stops existing, the legacy path lands on the site root
rather than a dead fragment.

**3. The chapter is removed from every in-page reference to it.** `STORY_SECTIONS`
in `StoryProgressNav` drops the `playbook` entry, and `HamburgerMenu`'s
per-chapter icon paths drop the matching glyph. Nothing in the section jump
menu points at a chapter that no longer exists.

**4. The content path goes with it, same as ADR 0016's precedent for `about.json`.**
`public/data/playbook.json`, `components/Playbook/` (`PlaybookGrid`,
`PrincipleCategory`), `PlaybookFileSchema`, `PlaybookCategorySchema`,
`PrincipleSchema`, the `PlaybookCategory`/`PlaybookFile`/`Principle` types,
`PlaybookSkeleton`, and the `playbook` loader in `ContentProvider` are all
deleted. A schema or loader that outlives its only consumer is a network
request and a validation pass for data nobody renders.

**5. The two other JSON files that named "Playbook" as a page are trimmed too.**
`navbar.json` and `routes.json` are pre-single-page-story artifacts — neither
is read by any component today — but both still listed a Playbook entry.
Removing it is a one-line deletion in each file with no behavioral
consequence, done here so a future reader of either file isn't pointed at a
chapter that no longer exists.

## Consequences

**Positive**

- The story goes from seven chapters to six; Projects leads straight into
  Contact.
- One fewer content file, schema, and network request per visit.
- `/playbook` keeps working for old bookmarks and search results — it lands
  on the story's top instead of a broken fragment.

**Negative**

- **The principle-card content is gone, not relocated.** Unlike the About
  chapter's biography (folded into `home.json`), nothing on the page carries
  the Architecture/Cloud/Security/Backend/DevOps/Engineering-Principles
  copy forward. If that content is wanted again, it has to be rebuilt rather
  than un-hidden.
- **`Principle` (title/description pair) is deleted along with the schema
  that was its only consumer.** `EngineeringPrincipleFile` (the held
  statement between Career and Education) has an unrelated, differently
  shaped `statement`/`supporting` pair and was never affected by this
  change — the naming collision the old type comment warned about no longer
  exists because one side of it is gone.

## Alternatives rejected

- **Redirect `/playbook` to `/#projects` or `/#contact`**: picks a
  neighboring chapter arbitrarily rather than the story's own top, and
  invites the same "redirect to an anchor that isn't really the target"
  smell the spec called out for `/#playbook` itself.
- **Keep `playbook.json` and the component files in place, only unmounting
  the section**: leaves a schema, a loader, and two components with no
  reachable caller — dead weight the next reader has to independently
  discover is unused, for content this task is explicitly free to delete.
