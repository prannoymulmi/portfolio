# ADR 0002: Next.js App Router

- **Status**: Accepted
- **Date**: 2026-08-09

## Context

Portfolio needs multiple routes (home, about, career, skills, projects,
education, playbook, contact), SEO-friendly rendering, image optimization,
and a deployment target that supports zero-config hosting.

Options weighed:

1. **Next.js App Router** (v16, current default)
2. **Next.js Pages Router** (legacy, still supported)
3. **Vite + React Router** — client-only SPA
4. **Astro** — content-first, ships zero JS by default

## Decision

Use the Next.js App Router with the `(routes)` directory pattern. Deploy
to Vercel.

## Consequences

**Positive**

- Server Components by default reduce the JS shipped for static pages
  (about, education, playbook cards) even though we still fetch JSON
  client-side.
- File-based routing keeps route definitions co-located with page
  components — no separate router config to drift.
- `metadata` exports per page satisfy T100/T101 without a custom head
  component.
- File-based `sitemap.ts` / `robots.ts` (see ADR-0008) come free.
- Vercel deploy is one connect-repo click; preview URLs for every PR.

**Negative**

- App Router's client/server component split is a learning cliff. Every
  interactive component needs `'use client'`, and mixing them wrong
  produces cryptic errors.
- Next.js is a heavy dependency for a portfolio — a Vite SPA would be
  smaller. Trade-off accepted for the routing + image + SEO wins.

## Alternatives rejected

- **Pages Router**: functional but deprecated pathway; new features
  (streaming, server components) land in App Router first.
- **Vite SPA**: no SSR, worse SEO, would need react-helmet or similar
  for per-page meta.
- **Astro**: better for content-heavy static sites, but the football-pitch
  animations need heavy client-side JS anyway, so Astro's zero-JS win
  gets eaten immediately.
