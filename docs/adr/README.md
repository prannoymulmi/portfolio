# Architecture Decision Records

Short records of the significant design decisions taken while building this
portfolio. Format follows Michael Nygard's template — Context, Decision,
Consequences — so future changes can be judged against the trade-offs that
were on the table at the time.

## Index

| ID | Title | Status |
|----|-------|--------|
| [0001](0001-json-files-over-cms.md) | JSON files over a CMS/database | Accepted — amended by [0017](0017-one-content-source-and-an-unhosted-cv.md) |
| [0002](0002-nextjs-app-router.md) | Next.js App Router | Accepted — route structure superseded by [0012](0012-single-page-story.md) |
| [0003](0003-client-content-loading-with-zod.md) | Client-side content loading with Zod validation | Accepted — fetch policy amended 2026-08-10; per-locale paths added by [0024](0024-localization-without-a-library.md) |
| [0004](0004-football-pitch-metaphor.md) | Football pitch metaphor for career + skills | Accepted — extended by [0013](0013-hero-player-card.md) |
| [0005](0005-gsap-and-framer-motion.md) | GSAP for scroll-driven, Framer for component motion | Accepted — amended by [0009](0009-rough-notation-third-animation-library.md) |
| [0006](0006-tailwind-v4.md) | Tailwind CSS v4 with `@theme inline` | Accepted — dark-mode trigger superseded by [0011](0011-class-based-dark-mode.md) |
| [0007](0007-react-19-legacy-peer-deps.md) | React 19 with `--legacy-peer-deps` | Accepted — install-command guidance superseded by [0022](0022-migrate-to-pnpm.md) |
| [0008](0008-file-based-seo-conventions.md) | File-based `sitemap.ts` / `robots.ts` | Accepted — route list amended by [0012](0012-single-page-story.md) |
| [0009](0009-rough-notation-third-animation-library.md) | RoughJS (via rough-notation) as a third animation library | Accepted |
| [0010](0010-next-themes-for-theme-state.md) | next-themes for theme state | Accepted |
| [0011](0011-class-based-dark-mode.md) | Class-based dark mode over the OS media query | Accepted — precedence amended by [0019](0019-dark-mode-behind-an-experiment-flag.md) |
| [0012](0012-single-page-story.md) | One scrolling story instead of per-page routes | Accepted |
| [0013](0013-hero-player-card.md) | The hero is a football player card over a sunset photo | Superseded in part by [0018](0018-the-opening-leaves-the-player-card.md) — extended by [0015](0015-photograph-as-page-surface.md) |
| [0014](0014-icon-set-dependency.md) | An icon set as a dependency | Accepted |
| [0015](0015-photograph-as-page-surface.md) | The photograph is the page surface | Accepted |
| [0016](0016-about-folds-into-the-opening.md) | The About chapter folds into the opening | Accepted — `bio` removed by [0026](0026-hero-drops-the-biography-paragraph.md) |
| [0017](0017-one-content-source-and-an-unhosted-cv.md) | One content source, and a CV the site does not host | Accepted — amends [0001](0001-json-files-over-cms.md) |
| [0018](0018-the-opening-leaves-the-player-card.md) | The opening leaves the player card for a cut-out portrait | Accepted — supersedes [0013](0013-hero-player-card.md) in part |
| [0019](0019-dark-mode-behind-an-experiment-flag.md) | Dark mode ships behind an experiment flag | Accepted — amends [0011](0011-class-based-dark-mode.md) in part |
| [0020](0020-work-showcase-replaces-skills-formation.md) | The work showcase replaces the skills formation, and gradients overlay the surface | Accepted — amends [0004](0004-football-pitch-metaphor.md) in part, extends [0015](0015-photograph-as-page-surface.md) |
| [0021](0021-technical-playbook-chapter-removed.md) | The Technical Playbook chapter is removed | Accepted — amends [0012](0012-single-page-story.md) |
| [0022](0022-migrate-to-pnpm.md) | Migrate to pnpm | Accepted — supersedes [0007](0007-react-19-legacy-peer-deps.md)'s install-command guidance |
| [0023](0023-technologies-derive-from-experiences.md) | The Technologies chapter derives durations from `experiences.json` rather than storing them | Accepted — extends [0020](0020-work-showcase-replaces-skills-formation.md) |
| [0024](0024-localization-without-a-library.md) | Localization without an i18n library | Accepted — extends [0003](0003-client-content-loading-with-zod.md) with per-locale content paths; amends the constitution's Principle IV (v1.6.0) |
| [0025](0025-deepl-mcp-for-translation.md) | DeepL MCP as the translation tool for German content | Accepted — extends [0024](0024-localization-without-a-library.md)'s translator-reviews-in-PR model with the mechanism the translator uses to draft German text |
| [0026](0026-hero-drops-the-biography-paragraph.md) | The hero drops the biography paragraph | Accepted — amends [0016](0016-about-folds-into-the-opening.md), removing the `bio` field it added |
| [0027](0027-builtwithnote-becomes-locale-optional.md) | `builtWithNote` becomes locale-optional | Accepted — extends [0024](0024-localization-without-a-library.md) with a second field that legitimately differs in presence, not just wording, between locales |
| [0028](0028-playwright-e2e-testing.md) | Playwright e2e testing against real Vercel previews, with a genuinely enforced merge gate | Accepted |

Nothing here is fully superseded. Where a later ADR overturned part of an
earlier one, the earlier record keeps its decision and carries a dated note at
the top pointing at the replacement — the trade-offs it weighed are still the
reason the surviving parts look the way they do.

[0013](0013-hero-player-card.md) is the furthest along: the player card it
specified is gone, but its backdrop survives and its argument about figures
beside a person is why the card's self-ratings were deleted outright rather
than relocated.

## Writing a new ADR

1. Copy any existing ADR as a template.
2. Number sequentially (`0014-...`).
3. Status = Proposed → Accepted → Superseded (link the replacement).
   If only part of an ADR is overturned, leave it Accepted and add an
   amendment or supersession note at the top naming what changed.
4. Add a row to the index above.
