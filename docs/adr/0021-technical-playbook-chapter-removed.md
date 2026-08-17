# ADR 0021: The Technical Playbook chapter is removed

- **Status**: Accepted
- **Date**: 2026-08-17
- **Amends**: [ADR 0012](0012-single-page-story.md) — the story now runs hero, work, career,
  education, projects, contact. Playbook is no longer one of its chapters.

## Context

A visitor requested the Technical Playbook chapter be dropped from the one-page story. The chapter
rendered `PlaybookGrid` — six categories of three-to-five principle cards (Architecture, Cloud,
Security, Backend, DevOps, Engineering Principles) sourced from `playbook.json` — between Projects
and Contact.

A prior commit removed the chapter's entry from `StoryProgressNav`'s `STORY_SECTIONS` and the
hamburger menu, so the chapter was already unreachable from in-page navigation. It kept rendering on
the page itself: `app/page.tsx` still mounted `<section id="playbook">` with `PlaybookGrid` inside
it, reachable by direct scroll or by the `/playbook` legacy redirect (which pointed at `/#playbook`).

## Decision

**The chapter, its component, and its content are deleted outright — not hidden, not kept for a
later restore.** The visitor's ask was to drop it, not park it.

1. `app/page.tsx` no longer renders the `#playbook` section; the story flows Projects → Contact.
2. `components/Playbook/` (`PlaybookGrid.tsx`, `PrincipleCategory.tsx`) is deleted.
3. `public/data/playbook.json` is deleted, along with `PlaybookFileSchema`,
   `PlaybookCategorySchema`, `PrincipleSchema` in `lib/utils/validation.ts` and the
   `PlaybookFile`/`PlaybookCategory`/`Principle` types in `lib/types/portfolio.ts`. Nothing else read
   these — same reasoning as the `skills.json` removal in ADR 0020: a schema and loader that survive
   their only consumer are a fetch for data nobody renders.
4. `ContentProvider`'s `playbook` loader and context slot are removed.
5. `LoadingState.tsx`'s `PlaybookSkeleton` is removed; nothing else referenced it.
6. `next.config.ts`'s `/playbook` legacy redirect now targets `/` rather than `/#playbook` — the
   anchor it pointed at no longer exists, so it follows the precedent already set for `/about` (ADR
   0016 folded About into the hero, and its redirect goes to `/`, not to a stranded anchor).
7. `public/data/navbar.json` and `public/data/routes.json` drop their Playbook entries. Both files
   are otherwise unused by any rendering code (`navbar.json` has no reader at all; `routes.json` is
   loaded by `ContentProvider` but not consulted by any component), so this is bookkeeping, not a
   behavior change.

`lib/scripts/migrate-content.ts`'s `playbook.json` template entry is left alone — it is a standalone,
unused migration script, out of scope for a chapter removal.

## Consequences

**Positive**

- The story is one chapter shorter and matches what was asked for: Projects leads straight into
  Contact.
- No dead code path: the component, its content file, its schemas, and its loader are gone together,
  so nothing references the others by name and drifts silently unused.
- The `/playbook` redirect still resolves somewhere sensible for old bookmarks and search results,
  consistent with how `/about` was handled.

**Negative**

- The six-category principle content (Architecture, Cloud, Security, Backend, DevOps, Engineering
  Principles) is gone from the site entirely, not archived. Recovering it means pulling
  `playbook.json` and the two components out of git history, not flipping a flag.
- `navbar.json` and `routes.json` remain generally out of sync with the live page (both still list
  an `/about` entry, for instance, which ADR 0016 already removed as a live section) — this change
  only removes the Playbook line from each, it does not bring either file back into alignment with
  the actual story.

## Alternatives rejected

- **Hide the chapter behind a feature flag, as dark mode was in ADR 0019**: that pattern exists for
  a chapter still being validated, not one a visitor has asked to see gone. Keeping the code and
  content live behind a flag would leave exactly the dead-weight this removal was meant to clear.
- **Redirect `/playbook` to `/#projects` or `/#contact` instead of `/`**: both imply the visitor
  meant to land inside a still-existing chapter. `/` matches the `/about` precedent and does not
  guess at which neighboring chapter the visitor wanted.
