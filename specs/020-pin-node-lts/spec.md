# Feature Specification: Pin Node Version to LTS

**Feature Branch**: `feat/pin-node-lts`

**Created**: 2026-08-21

**Status**: Draft

**Input**: User description: "pin the node version to LTS have a .nvmrc and also in githhub use the same version to build it."

## Clarifications

### Session 2026-08-21

- Q: Should this feature upgrade the pinned Node version to whatever is currently Active LTS, or keep the existing Node 22 pin as-is? → A: Pin to Node 26 instead — a third option raised mid-session. Node 26 is currently in its "Current" release phase (not yet LTS) but graduates to Active LTS in October 2026, about six weeks from the spec date. The choice is deliberate early adoption, not a strict LTS pin, and MUST be recorded in an ADR explaining why a soon-to-be-LTS release was chosen over Node 24 (the release actually in Active LTS today).
- Q: (Superseded during `/speckit-plan` research) Node 26 turned out not to be viable — Vercel's Functions/deployment runtime (the project's actual production target, per constitution Principle IV's Deployment bullet) only offers 20.x/22.x/24.x in Project Settings; Node 26 support announced in Vercel's changelog is for the unrelated Vercel Sandboxes product. Pinning `.nvmrc`/CI to 26 while Vercel stays on 24 would recreate the exact version split this feature exists to remove. → A: Pin to **Node 24** (current Active LTS, and Vercel's default/latest available runtime) everywhere — local, CI, and Vercel now resolve to the same version with no split. The ADR requirement (FR-006) stays, but now records why 24 was chosen and why 26 was rejected, rather than justifying a pre-LTS pin.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent local Node version (Priority: P1)

A contributor clones the repository and runs a version manager (e.g. `nvm use`)
to pick up the project's intended Node version automatically, instead of
guessing from a comment in the README or from whatever Node happens to be
installed on their machine.

**Why this priority**: Without a machine-readable pin, contributors drift onto
different Node versions, causing "works on my machine" bugs that are expensive
to diagnose. This is the foundational piece the CI story depends on.

**Independent Test**: Can be fully tested by running `nvm use` (or equivalent)
in the repository root and confirming it switches to the pinned Node version
without any additional flags or lookups.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** a contributor runs
   `nvm use` in the project root, **Then** their shell switches to the Node
   version declared in `.nvmrc` with no further input.
2. **Given** the `.nvmrc` file, **When** its contents are inspected, **Then**
   it names Node.js 24 — the current Active LTS release and the latest
   version Vercel's production runtime supports, recorded in an ADR.

---

### User Story 2 - CI builds on the same version as local dev (Priority: P1)

The GitHub Actions workflow that lints, type-checks, tests, builds, and
runs end-to-end tests reads the Node version from the same place a local
contributor does, so CI can never silently drift from what's pinned for
local development.

**Why this priority**: The user explicitly asked for CI to "use the same
version to build it" — this is the other half of the pin and the part that
actually prevents version drift from reaching production, since CI gates
every merge.

**Independent Test**: Can be fully tested by changing `.nvmrc` to a
different valid Node version, pushing a commit, and confirming every CI job
(lint-and-type-check, test, build, e2e) picks up the new version without any
edit to the workflow file itself.

**Acceptance Scenarios**:

1. **Given** the `.github/workflows/ci.yml` workflow, **When** any job sets
   up Node.js, **Then** the version installed matches the version declared
   in `.nvmrc`, sourced from that file rather than a separately hardcoded
   number.
2. **Given** a future change to `.nvmrc`'s pinned version, **When** the next
   CI run starts, **Then** every job uses the updated version automatically,
   with no other file requiring an edit for the version number itself.

---

### User Story 3 - Single source of truth for the pinned version (Priority: P2)

Anyone updating the project's Node version — including the docs that tell a
new contributor what to install — only has to change one file.

**Why this priority**: Prevents the pin from silently re-fragmenting across
`.nvmrc`, the CI workflow, and the README the way the version number is
currently duplicated (hardcoded in both the README and four separate CI
job matrices).

**Independent Test**: Can be fully tested by searching the repository for
the Node major version number outside `.nvmrc` and confirming no other file
hardcodes it as a literal that must be kept in sync by hand.

**Acceptance Scenarios**:

1. **Given** the README's quickstart instructions, **When** they reference
   the required Node version, **Then** they point to `.nvmrc` rather than
   restating the version number as a separate literal.

---

### Edge Cases

- What happens when the pinned LTS version reaches end-of-life? Out of
  scope for this feature — bumping `.nvmrc` to the next LTS is a future,
  separate change; this feature only establishes the single-source-of-truth
  mechanism.
- What happens if a contributor doesn't have a Node version manager
  installed? They fall back to whatever Node they have; `.nvmrc` is a
  convention consumed by version managers and CI, not an enforced runtime
  check on the contributor's machine.
- What happens if `.nvmrc` is ever edited to an invalid or non-existent
  Node version? The CI Node setup step fails fast on that job, surfacing
  the mistake before it reaches `main`.
- What happens if a future `.nvmrc` bump names a version Vercel's runtime
  doesn't yet support (as happened with Node 26 during this feature's own
  planning)? Out of scope to prevent automatically; the ADR this feature
  adds documents the constraint so the next bump checks Vercel's supported
  list first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST contain a `.nvmrc` file at the project
  root naming Node.js 24.
- **FR-002**: Every job in `.github/workflows/ci.yml` that sets up Node.js
  (lint-and-type-check, test, build, e2e) MUST source its Node version from
  `.nvmrc` rather than a hardcoded version number in the workflow file.
- **FR-003**: All CI jobs MUST resolve to the same Node version as each
  other and as `.nvmrc` for a given commit — no job may pin a different
  version.
- **FR-004**: Updating the Node version MUST require editing only
  `.nvmrc`; no workflow file may need its own version literal changed to
  pick up a new pinned version.
- **FR-005**: The README's quickstart instructions MUST reference `.nvmrc`
  as the source of the required Node version instead of restating the
  version number as independent text.
- **FR-006**: The decision to pin Node 24 — and to reject Node 26, which was
  the initially requested version until Vercel's production runtime ceiling
  ruled it out — MUST be recorded as an ADR stating the rationale, per the
  project's convention of recording non-obvious tooling decisions.
- **FR-007**: The pinned version MUST also be the version Vercel's
  production deployment runs, not just local dev and CI — a Vercel Project
  Settings Node.js version that differs from `.nvmrc` would recreate the
  fragmentation this feature exists to remove.

### Key Entities

- **`.nvmrc`**: A single-line file at the repository root naming the
  pinned Node.js version; the source of truth for local tooling and CI.
- **`package.json` `engines.node`**: A git-tracked semver range that pins
  Vercel's production runtime version, mirroring `.nvmrc`'s major version —
  the same pattern this repo already uses for pnpm (`packageManager`
  field, ADR 0022).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor can determine the exact required Node version
  by reading one file (`.nvmrc`), with no cross-referencing needed against
  CI configuration or documentation.
- **SC-002**: Changing the project's target Node version requires editing
  only git-tracked version-declaration files (`.nvmrc` and `package.json`'s
  `engines.node`) — no untracked, manual step (e.g. a Vercel dashboard
  click) is required to keep any environment in sync.
- **SC-003**: Zero CI jobs use a Node version that differs from `.nvmrc`'s
  contents, verified on every push and pull request.
- **SC-004**: Vercel's production deployment runs the same Node major
  version as `.nvmrc` and CI — zero version drift between build-time and
  production environments.

## Assumptions

- The pinned version is Node 24 — the current Active LTS release and the
  latest version available on Vercel's Functions/deployment runtime (its
  Project Settings dropdown offers only 20.x/22.x/24.x as of this spec's
  planning phase). Node 26 was considered first but rejected once this
  ceiling surfaced; the rationale for both is recorded in an ADR per FR-006.
- Vercel's Node.js Version project setting is treated as part of what
  "the same version everywhere" means (FR-007), alongside `.nvmrc` and CI —
  not just local dev and CI as originally scoped.
- The existing CI workflow (`.github/workflows/ci.yml`) and its four Node
  setup steps are the only place, besides the README, where the Node
  version is currently duplicated as a literal (previously Node 22).
- This feature does change the Node major version in use (Node 22 → Node
  24), unlike a pure consolidation — the version bump and the
  single-source-of-truth mechanism land together.
- `nvm` is assumed as the reference version manager for `.nvmrc`
  consumption (the de facto standard for this file format), but no new
  tooling dependency is introduced for contributors who use a different
  manager or none at all.
