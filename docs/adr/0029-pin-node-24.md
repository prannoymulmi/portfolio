# ADR 0029: Pin Node.js to 24 via .nvmrc and package.json engines

- **Status**: Accepted
- **Date**: 2026-08-21

## Context

The project's Node.js version was duplicated by hand in five places: a
comment in `README.md`'s quickstart ("Requires Node 22.x"), and a
`strategy.matrix.node-version: [22]` block repeated in all four
`.github/workflows/ci.yml` jobs (lint-and-type-check, test, build, e2e).
Nothing enforced these literals staying in sync with each other, or with
whatever Vercel's production runtime was actually set to.

The site owner asked to pin the version via `.nvmrc` and have GitHub Actions
build against the same value. During `/speckit-clarify`, the first answer
was Node 26 — not yet Active LTS (it graduates in October 2026, about six
weeks out from this decision) but requested as deliberate early adoption
ahead of that graduation.

That answer didn't survive `/speckit-plan`. Vercel is this project's
deployment target (constitution Principle IV, Deployment). Checking Vercel's
own "Supported Node.js versions" documentation showed its Functions/
deployment runtime — the actual thing that serves production traffic —
only offers Node 20.x, 22.x, or 24.x in Project Settings, with 24.x as the
default. Node 26 does appear in Vercel's changelog, but only for **Vercel
Sandboxes**, an unrelated ephemeral code-execution product, not the
Functions runtime this Next.js site deploys to. Pinning `.nvmrc` and CI to
26 while Vercel stayed on 24 would have recreated the exact version split
this change exists to remove — and moved it to the one environment where
drift matters most.

## Decision

Pin Node 24 — the current Active LTS release, and the newest version
Vercel's Functions runtime actually supports — in two git-tracked places:

- **`.nvmrc`** (new, repository root): `24`, major version only. Consumed
  locally via `nvm use`, and in CI via `actions/setup-node@v4`'s
  `node-version-file: '.nvmrc'` input, which replaces the single-entry
  `strategy.matrix.node-version: [22]` block (and its
  `node-version: ${{ matrix.node-version }}` reference) in all four CI jobs.
  A matrix strategy for exactly one value added indirection with no benefit.
- **`package.json`'s `engines.node`**: `"24.x"`. Per Vercel's docs, this
  field overrides whatever is set in Project Settings' Node.js Version
  dropdown, making Vercel's runtime version git-tracked and PR-reviewable
  instead of a manual, undiffed dashboard click — the same pattern this
  repo already uses for pnpm's version via the `packageManager` field
  (ADR 0022).
- **`README.md`**'s quickstart comment now points at `.nvmrc` instead of
  restating a version number.

Two literals (`.nvmrc`, `engines.node`) remain rather than one, because
`nvm`/`setup-node` and Vercel expect different formats (a bare major vs. a
semver range) and no single file satisfies both. A generation script to
derive one from the other was considered and rejected as over-engineering
for a value that changes roughly once a year (constitution Principle I,
KISS) — the two are kept in sync by convention, recorded here.

## Consequences

**Positive**

- Local dev, CI, and Vercel production all resolve to the same Node major
  version, closing the drift this change set out to remove.
- Updating the version going forward means editing two small, git-tracked
  files instead of five scattered literals across three files — and a diff
  reviewer sees both changes in the same PR.
- The CI workflow loses four now-pointless single-entry `strategy.matrix`
  blocks.

**Negative**

- Two literals, not one — `.nvmrc` and `engines.node` must be bumped
  together by hand. A future bump that only updates one would silently
  reintroduce a split between tooling/CI and Vercel.
- The next version bump must check Vercel's supported-version list first,
  the way this one did — Vercel's Functions runtime lags behind Node's own
  release cadence, and a `.nvmrc` bump to an unsupported version would
  deploy fine locally and in CI while failing or misbehaving on Vercel.

## Alternatives rejected

- **Node 26** (the version originally requested): rejected once Vercel's
  20.x/22.x/24.x runtime ceiling surfaced — see Context above. Would have
  kept a real version split between CI and production.
- **Set Vercel's Node version only via its Project Settings dashboard, skip
  `engines.node`**: works today but is invisible to `git log`/PR review and
  requires remembering a manual dashboard visit on every future `.nvmrc`
  bump — reintroduces the untracked-drift problem this ADR exists to close.
- **Generate `package.json`'s `engines.node` from `.nvmrc` via a build or
  pre-commit script**: genuinely removes the two-literal duplication, but is
  automation for a value that changes about once a year. Rejected as
  over-engineering relative to a documented convention (Principle I).
- **Exact patch pin (e.g. `24.4.1`) instead of major-only**: more
  reproducible, but Vercel itself only exposes major-version selection and
  auto-rolls minor/patch updates for security fixes — pinning tighter than
  the platform this targets would fight that behavior for no benefit.
