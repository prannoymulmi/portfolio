# ADR 0008: File-based `sitemap.ts` / `robots.ts`

- **Status**: Accepted
- **Date**: 2026-08-09

## Context

Portfolio needs `sitemap.xml` and `robots.txt` so search engines can crawl
every route. Next.js App Router offers three ways:

1. **Static files** in `public/sitemap.xml` and `public/robots.txt` —
   hand-maintained, drift when new routes are added.
2. **File-based conventions** (`app/sitemap.ts`, `app/robots.ts`) — TS
   functions that return typed metadata; Next generates the response.
3. **API routes / route handlers** returning the correct MIME.

## Decision

Use Next.js's file-based conventions: `app/sitemap.ts` exporting a default
function returning `MetadataRoute.Sitemap`, and `app/robots.ts` for
`MetadataRoute.Robots`. Base URL is read from `NEXT_PUBLIC_SITE_URL` with
a production default.

## Consequences

**Positive**

- Adding a route only requires appending its path to the `routes` array in
  `sitemap.ts` — much harder to forget than editing a separate XML file.
- Types (`MetadataRoute.Sitemap`) make invalid entries a compile error.
- Env-driven base URL means preview deploys don't leak the production
  domain into sitemap URLs (avoids Google indexing preview builds).
- No new file formats to reason about; both files are plain TypeScript.

**Negative**

- Sitemap route list is still manual. A more clever implementation would
  walk the `app/(routes)/*` tree — future improvement if the route
  count grows.
- No dynamic priority based on last-modified per page (all routes get
  the same `lastModified` = build time). Fine for a portfolio; would
  matter more for a blog.

## Alternatives rejected

- **Static files**: silently stale the moment a new route ships.
- **Route handlers**: extra ceremony (setting `Content-Type`, hand-writing
  XML) for what the file-based convention gives for free.
