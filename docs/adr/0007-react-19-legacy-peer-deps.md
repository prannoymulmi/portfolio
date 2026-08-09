# ADR 0007: React 19 with `--legacy-peer-deps`

- **Status**: Accepted
- **Date**: 2026-08-09

## Context

Next.js 16 ships against React 19. Several dev-only dependencies
(`@testing-library/react@14`, `react-hook-form@7`) still declare React
17/18 as peer deps and haven't updated their peer ranges yet.

npm 9+ enforces peer deps strictly by default, so `npm install` fails on
these mismatches. Options:

1. Downgrade to React 18 / Next.js 15.
2. Wait for the ecosystem to update.
3. Pass `--legacy-peer-deps` on install (npm's opt-out that mirrors
   pre-npm-7 behavior).
4. Move to pnpm (permissive by default via `resolution-mode`).

## Decision

Use React 19 + Next.js 16 today and pass `--legacy-peer-deps` on install.

- Local: developers run `npm install --legacy-peer-deps`.
- CI: `.github/workflows/ci.yml` uses `npm ci --legacy-peer-deps`.
- Vercel: `vercel.json` pins `installCommand` to the same.

## Consequences

**Positive**

- Stay on the latest React (compiler auto-memoization, better hydration)
  and Next.js (Turbopack, App Router improvements).
- Same install command in every environment, so nobody debugs a
  "works locally, fails in CI" peer dep issue.
- Skipping the peer check does **not** downgrade any actual dependency
  — it just silences npm's protest. Runtime behavior is unchanged.

**Negative**

- Anyone running plain `npm install` gets a wall of red. Mitigated by
  documenting the flag in the README quickstart and pinning it in
  `vercel.json`.
- If a dep genuinely requires an older React API, we'd only find out at
  runtime. Testing catches most of this; the tradeoff is acceptable for
  a solo-maintained portfolio.

## Alternatives rejected

- **Downgrade**: giving up React 19's compiler and Next 16's App Router
  improvements to appease a peer range issue that will be fixed upstream
  soon. Wrong trade.
- **Wait**: kicks a solvable install-time issue into a hold on the whole
  project.
- **pnpm**: fixes the peer-dep pain but adds a lockfile migration and
  changes CI setup. Not worth the churn for a portfolio.

## Revisit when

`@testing-library/react` or other blockers publish React 19 peer ranges.
Remove the flag from `vercel.json`, CI, and the README in one commit.
