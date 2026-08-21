# Phase 0 Research: Pin Node Version to LTS

## Decision 1: Which Node version to pin

**Decision**: Node 24.

**Rationale**: Node 24 is the current Active LTS release (entered LTS
October 2025) and is also the newest version Vercel's Functions/deployment
runtime supports — its Project Settings "Node.js Version" dropdown lists only
20.x, 22.x, and 24.x (24.x is the default), confirmed against Vercel's
"Supported Node.js versions" doc during this planning phase. Since the
constitution fixes deployment as GitHub → Vercel, whatever gets pinned has to
be deployable there or the pin is fiction for production.

**Alternatives considered**:
- **Node 26**: The originally requested version, and the answer originally
  recorded during `/speckit-clarify` — it graduates to Active LTS in October
  2026 (~6 weeks out from the spec date), so "pin to LTS" was read loosely as
  "pin to the next LTS." Rejected once Vercel's runtime ceiling surfaced:
  Vercel does not offer 26.x as a Functions runtime at all. The only Node 26
  support in Vercel's changelog is for Vercel *Sandboxes*, a separate
  ephemeral code-execution product unrelated to this site's actual
  deployment target. Pinning `.nvmrc`/CI to 26 while Vercel stays on 24 would
  keep exactly the version split this feature exists to remove — worse, it
  moves the split to production, the one environment where drift matters
  most.
- **Node 22 (status quo)**: Already in Maintenance LTS (past Active), and
  older than what Vercel defaults new projects to. No reason to prefer it
  over 24 now that a version bump is happening anyway.

## Decision 2: How CI reads the pinned version

**Decision**: `actions/setup-node@v4`'s `node-version-file: '.nvmrc'` input,
replacing the `strategy.matrix.node-version: [22]` + `node-version:
${{ matrix.node-version }}` pattern in all four jobs
(lint-and-type-check, test, build, e2e).

**Rationale**: `setup-node` has supported `node-version-file` since v3;
`.nvmrc` is one of its explicitly documented accepted formats. This is a
built-in feature of an action already in the workflow — no new action, no new
dependency. The existing `matrix: node-version: [22]` was already a
single-entry matrix (this project never tested more than one Node version
concurrently), so replacing it with a direct file read is also a
simplification per Principle I (KISS): a matrix strategy exists to vary a
value across multiple runs, and there was never more than one value here.

**Alternatives considered**:
- **Keep the matrix, source its single entry from a script/env var reading
  `.nvmrc`**: adds a shell step and output-passing between steps for no
  behavioral gain over `node-version-file`, which does the same file read
  natively. Rejected as unnecessary complexity.
- **`node-version: '24'` hardcoded in the workflow, `.nvmrc` as documentation
  only**: this is the status quo's actual failure mode — two literals that
  must be hand-synced. Rejected; it doesn't satisfy FR-002/FR-004.

## Decision 3: How Vercel's production runtime stays in sync

**Decision**: Add `"engines": { "node": "24.x" }` to `package.json`.

**Rationale**: Per Vercel's docs, `package.json`'s `engines.node` field
overrides whatever is manually selected in Project Settings' Node.js Version
dropdown — so it becomes the git-tracked, PR-reviewable source of truth for
Vercel's runtime, rather than a manual dashboard click that leaves no diff
and can drift silently. This exactly mirrors how this repo already pins
pnpm's version via `package.json`'s `packageManager` field instead of a
Vercel dashboard setting (ADR 0022) — same mechanism, same reasoning,
applied to Node instead of the package manager.

**Alternatives considered**:
- **Set Node 24 once in Vercel's Project Settings dashboard, touch nothing in
  `package.json`**: works today, but is invisible to `git log`/PR review and
  would need a manual dashboard visit (easy to forget) every time `.nvmrc`
  changes. Rejected — it reintroduces exactly the "which environment is
  actually on which version" uncertainty this feature exists to remove.
  `engines.node` costs one line and closes that gap.
- **Generate `package.json`'s `engines.node` from `.nvmrc` via a pre-commit
  or build script**: real single-source-of-truth, but is automation for a
  value that changes roughly once a year — over-engineering per Principle I.
  Two hand-edited literals plus an ADR note that they must move together is
  simpler and sufficient at this scale.

## Decision 4: `.nvmrc` content format

**Decision**: Major version only — `24`.

**Rationale**: Matches this repo's existing convention (README currently
says "Node 22.x", CI matrix currently says `22`) — nobody has been pinning
exact patch versions here, and nvm/`setup-node` both resolve a major-only
`.nvmrc` to the latest matching installed/available version. Full semver
pinning (e.g. `24.4.1`) would be stricter but is a bigger behavior change
than this feature asked for and isn't how the project already treats Node
versions.

**Alternatives considered**:
- **Exact patch pin (`24.4.1`)**: More reproducible, but requires bumping
  `.nvmrc` on every patch release to get security fixes, which cuts against
  Vercel's own approach ("Vercel automatically rolls out minor and patch
  updates when needed, such as to fix a security issue" — Vercel only
  exposes major-version selection). Rejected as inconsistent with the
  platform this pins against.
- **`lts/*` (floating alias)**: Rejected outright — the user asked to *pin*
  the version; a floating alias is the opposite of a pin and would silently
  change Node major versions across an LTS boundary without a commit.
