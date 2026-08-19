# ADR 0003: Client-side content loading with Zod validation

- **Status**: Accepted, fetch policy amended 2026-08-10
- **Date**: 2026-08-09

> **Amendment (2026-08-19) — per-locale paths and whole-file English fallback**:
> [ADR 0024](0024-localization-without-a-library.md) adds a locale segment to
> the fetch path (`public/data/<locale>/<file>.json`) and, on a 404 or a Zod
> validation failure for a non-English locale, falls back to the whole
> English file rather than merging fields. The client-side, Zod-validated
> loading model this ADR decided is otherwise unchanged.
>
> **Amendment (2026-08-10) — freshness beats caching**: the loader originally
> fetched with `cache: 'force-cache'`, which reuses a cached response even after
> it has gone stale, so an edited JSON file never appeared on a normal hard
> refresh (only in a fresh cache such as incognito). `useContentLoader` now uses
> `cache: 'no-store'`: these files are small and edited often, so freshness
> matters more than the caching win. The 5-minute `Cache-Control` header in
> `next.config.ts` still bounds how long a CDN or intermediary may hold them.
> The session-level `Map` cache is unchanged — each file is still fetched once
> per visit.

## Context

Given ADR-0001 (JSON files) and ADR-0002 (Next.js App Router), we still had
to pick where the JSON gets read and how it's validated:

1. **Read at build time** (import the JSON in Server Components). Type-safe
   but requires a rebuild for every content change.
2. **Read on the server per request** (RSC + `fetch` at request time). Same
   effect as build-time for a static site.
3. **Read in the browser** via `useContentLoader` hook + React Context.
   Allows editing JSON without redeploying (short cache TTL in
   `next.config.ts`).

For validation:

- Rely on TypeScript types only (compile-time, no runtime check).
- Use Zod (or similar) for runtime schema validation.

## Decision

- Load JSON in the browser through `ContentProvider` (`useContentLoader` +
  in-memory `Map` cache per session).
- Validate every response against a Zod schema in `lib/utils/validation.ts`
  before setting state. Invalid JSON surfaces as an `Error` to the caller.

## Consequences

**Positive**

- JSON edits go live on the next load, bounded only by the CDN cache TTL
  (5 min in `next.config.ts`) — no rebuild, no deploy.
- Zod catches schema drift at load time with a specific field/path in the
  error message, so a bad edit doesn't just render nothing — it logs a
  useful reason.
- Session cache (`Map`) means we fetch each JSON file once per session,
  not once per component.
- Same schema drives both runtime validation and (via `z.infer`) the
  TypeScript types, so they can't drift apart.

**Negative**

- Initial render shows skeletons; content pops in a beat later. Would be
  wrong for a landing page; fine for a portfolio.
- Zod adds ~12KB gzipped. Acceptable given the safety it buys.
- SEO crawlers see the skeleton if they don't execute JS. Modern
  crawlers (Google) do, but we lean on server-rendered `<meta>` tags
  from `metadata` exports so preview cards still work.

## Alternatives rejected

- **Build-time import**: content changes require a rebuild + redeploy.
  Kills the "edit JSON, refresh page" workflow that keeps this project
  low-friction.
- **No runtime validation**: types would lie the moment JSON drifted.
  The class of bug that produces (silent undefined fields → crashes deep
  in components) is exactly what Zod catches early.
