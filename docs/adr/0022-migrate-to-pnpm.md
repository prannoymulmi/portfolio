# ADR 0022: Migrate to pnpm

- **Status**: Accepted
- **Date**: 2026-08-17
- **Related**: [ADR 0007](0007-react-19-legacy-peer-deps.md) — this ADR supersedes
  0007's install-command guidance specifically (the `--legacy-peer-deps` flag and
  the npm commands it was pinned to); 0007's own text and reasoning stand as the
  historical record of why that flag existed.

## Context

The project installed dependencies with `npm install --legacy-peer-deps`
everywhere — local dev, CI (`.github/workflows/ci.yml`), and production
(`vercel.json`'s `installCommand`) — per ADR 0007. That flag exists because
`@testing-library/react@14` and `react-hook-form@7` still declare React 17/18 peer
ranges, and npm 7+ fails the install outright on a peer mismatch unless told not
to.

The site owner asked to move to pnpm: it is more disk-efficient (a single
content-addressable store shared across projects on one machine, instead of each
project duplicating every package in its own `node_modules`) and is the more
current tooling choice for a project pinned to Next.js 16 / React 19. ADR 0007
itself listed "move to pnpm" as a rejected alternative at the time, on the grounds
that a lockfile migration and CI change weren't worth the churn for a solo
portfolio; the site owner has since decided that trade-off is worth taking.

## Decision

Replace npm with pnpm as the package manager for the main portfolio project
(`showcase/` is a separate bun-based project and is unaffected — FR-009).

- `package.json` gains a `"packageManager": "pnpm@11.22.0"` field (Corepack's
  pinning mechanism), so every environment resolves the same pnpm version without
  a separate global install.
- `package-lock.json` is deleted; `pnpm-lock.yaml` is committed in its place,
  generated from the existing `package.json` with no dependency version changes.
- No install flag is needed for the peer-dependency mismatch ADR 0007 addressed.
  pnpm's `strict-peer-dependencies` setting defaults to `false` — it warns on the
  React 19 / `@testing-library/react` peer mismatch, it does not fail the install.
  No `.npmrc` is added to restate that default; it would have no behavioral effect.
- CI (`.github/workflows/ci.yml`) adds a `pnpm/action-setup@v4` step, switches
  `actions/setup-node@v4`'s cache from `npm` to `pnpm`, and replaces
  `npm ci --legacy-peer-deps` with `pnpm install --frozen-lockfile`. Every
  `npm run <script>` step becomes `pnpm run <script>`.
- Production deploy (`vercel.json`) changes `installCommand` from
  `"npm install --legacy-peer-deps"` to `"pnpm install"`.
- `README.md` and `CONTRIBUTING.md` have every `npm` command shown replaced with
  its pnpm equivalent.

## Consequences

**Positive**

- Local `node_modules` installs use pnpm's shared, hard-linked store instead of
  npm's per-project duplication — a smaller on-disk footprint for this project,
  and larger savings across every other pnpm project on the same machine.
- The React 19 peer-dependency workaround no longer needs an explicit flag in
  three separate places (local docs, CI, `vercel.json`) — pnpm's default behavior
  covers it, removing one thing that could drift out of sync between environments.
- Corepack's `packageManager` pin means local, CI, and Vercel all resolve the
  identical pnpm version, closing off a class of "works on my machine" drift.

**Negative**

- One more lockfile format for contributors to be aware of; a stray
  `npm install` after this change would regenerate a stray `package-lock.json`
  that no longer matches the package manager actually in use (mitigated by
  deleting `package-lock.json` outright, so nothing but pnpm's lockfile exists to
  install against).
- CI and Vercel configuration both had to change together with the lockfile swap
  — this is not a change that can land partially without breaking one of the two
  pipelines.
- ADR 0007's `--legacy-peer-deps` guidance is now historical rather than
  operative; anyone reading only ADR 0007 without noticing this ADR's superseding
  note would follow install instructions that no longer match the repository.

## Alternatives rejected

- **Keep npm, keep `--legacy-peer-deps`**: this was ADR 0007's original decision
  and remains functionally fine, but does not deliver the disk-space or
  tooling-currency motivation behind this request.
- **Add an explicit `.npmrc` with `strict-peer-dependencies=false`**: considered
  for documentation clarity, but rejected — it would only restate pnpm's own
  default with no behavioral effect (Constitution Principle I, KISS).
