# Architecture Decision Records

Short records of the significant design decisions taken while building this
portfolio. Format follows Michael Nygard's template — Context, Decision,
Consequences — so future changes can be judged against the trade-offs that
were on the table at the time.

## Index

| ID | Title | Status |
|----|-------|--------|
| [0001](0001-json-files-over-cms.md) | JSON files over a CMS/database | Accepted |
| [0002](0002-nextjs-app-router.md) | Next.js App Router | Accepted |
| [0003](0003-client-content-loading-with-zod.md) | Client-side content loading with Zod validation | Accepted |
| [0004](0004-football-pitch-metaphor.md) | Football pitch metaphor for career + skills | Accepted |
| [0005](0005-gsap-and-framer-motion.md) | GSAP for scroll-driven, Framer for component motion | Accepted |
| [0006](0006-tailwind-v4.md) | Tailwind CSS v4 with `@theme inline` | Accepted |
| [0007](0007-react-19-legacy-peer-deps.md) | React 19 with `--legacy-peer-deps` | Accepted |
| [0008](0008-file-based-seo-conventions.md) | File-based `sitemap.ts` / `robots.ts` | Accepted |

## Writing a new ADR

1. Copy any existing ADR as a template.
2. Number sequentially (`0009-...`).
3. Status = Proposed → Accepted → Superseded (link the replacement).
4. Add a row to the index above.
