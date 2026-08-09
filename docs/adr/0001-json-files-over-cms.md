# ADR 0001: JSON files over a CMS/database

- **Status**: Accepted
- **Date**: 2026-08-09

## Context

Portfolio content changes rarely (a few times a year: new job, new project,
tweaked bio). Options considered for the content store:

1. **Headless CMS** (Sanity, Contentful, Payload) — full editor UI, live
   previews, requires an account and API keys.
2. **Markdown + frontmatter** in the repo — familiar, but forces custom
   parsing for the multi-list shapes we need (skills grouped by category,
   experiences with tech arrays, playbook categories with principles).
3. **JSON files** in `public/data/` served as static assets — no build step,
   no auth, Zod handles validation.

## Decision

Store all content as JSON files under `public/data/`, load client-side via
`useContentLoader`, and validate every payload against a Zod schema before
handing it to components.

## Consequences

**Positive**

- Zero infrastructure: no CMS to run, no DB to back up.
- Editing content is a git commit — reviewable, revertable, auditable.
- Types flow from the same schema used at runtime, so a JSON edit that
  breaks a component surfaces at load, not silently in prod.
- Public JSON means recruiters could theoretically scrape it — but that's
  the point of a portfolio.

**Negative**

- No preview UI. Editors need to know JSON structure (mitigated by the
  content-editing guide in `docs/content-editing.md` and Zod's error
  messages).
- Every page loads content on the client. Initial paint is a skeleton, not
  the final text — acceptable for a portfolio, would not be for SEO-critical
  landing pages.
- All content is public. No draft/private posts. Not a concern for a
  résumé site.

## Alternatives rejected

- **Sanity**: overkill for a solo-editor site; adds a monthly cost tier
  once content grows past the free plan.
- **Markdown**: schema-in-frontmatter is fragile for structured lists
  (skills, experiences, playbook categories all have nested arrays).
