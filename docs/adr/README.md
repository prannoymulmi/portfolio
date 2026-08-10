# Architecture Decision Records

Short records of the significant design decisions taken while building this
portfolio. Format follows Michael Nygard's template — Context, Decision,
Consequences — so future changes can be judged against the trade-offs that
were on the table at the time.

## Index

| ID | Title | Status |
|----|-------|--------|
| [0001](0001-json-files-over-cms.md) | JSON files over a CMS/database | Accepted |
| [0002](0002-nextjs-app-router.md) | Next.js App Router | Accepted — route structure superseded by [0012](0012-single-page-story.md) |
| [0003](0003-client-content-loading-with-zod.md) | Client-side content loading with Zod validation | Accepted — fetch policy amended 2026-08-10 |
| [0004](0004-football-pitch-metaphor.md) | Football pitch metaphor for career + skills | Accepted — extended by [0013](0013-hero-player-card.md) |
| [0005](0005-gsap-and-framer-motion.md) | GSAP for scroll-driven, Framer for component motion | Accepted — amended by [0009](0009-rough-notation-third-animation-library.md) |
| [0006](0006-tailwind-v4.md) | Tailwind CSS v4 with `@theme inline` | Accepted — dark-mode trigger superseded by [0011](0011-class-based-dark-mode.md) |
| [0007](0007-react-19-legacy-peer-deps.md) | React 19 with `--legacy-peer-deps` | Accepted |
| [0008](0008-file-based-seo-conventions.md) | File-based `sitemap.ts` / `robots.ts` | Accepted — route list amended by [0012](0012-single-page-story.md) |
| [0009](0009-rough-notation-third-animation-library.md) | RoughJS (via rough-notation) as a third animation library | Accepted |
| [0010](0010-next-themes-for-theme-state.md) | next-themes for theme state | Accepted |
| [0011](0011-class-based-dark-mode.md) | Class-based dark mode over the OS media query | Accepted |
| [0012](0012-single-page-story.md) | One scrolling story instead of per-page routes | Accepted |
| [0013](0013-hero-player-card.md) | The hero is a football player card over a sunset photo | Accepted |

Nothing here is fully superseded yet. Where a later ADR overturned part of an
earlier one, the earlier record keeps its decision and carries a dated note at
the top pointing at the replacement — the trade-offs it weighed are still the
reason the surviving parts look the way they do.

## Writing a new ADR

1. Copy any existing ADR as a template.
2. Number sequentially (`0014-...`).
3. Status = Proposed → Accepted → Superseded (link the replacement).
   If only part of an ADR is overturned, leave it Accepted and add an
   amendment or supersession note at the top naming what changed.
4. Add a row to the index above.
