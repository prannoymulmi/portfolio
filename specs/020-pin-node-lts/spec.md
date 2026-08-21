# Feature Specification: Pin Node Version to LTS

**Feature Branch**: `feat/pin-node-lts`

**Created**: 2026-08-21

**Status**: Draft

**Input**: User description: "pin the node version to LTS have a .nvmrc and also in githhub use the same version to build it."

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
   it names a single, current Node.js LTS version.

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

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST contain a `.nvmrc` file at the project
  root naming a single current Node.js LTS release.
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

### Key Entities

- **`.nvmrc`**: A single-line file at the repository root naming the
  pinned Node.js version; the source of truth this feature introduces.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor can determine the exact required Node version
  by reading one file (`.nvmrc`), with no cross-referencing needed against
  CI configuration or documentation.
- **SC-002**: Changing the project's target Node version requires editing
  exactly one file to take effect everywhere (locally and in every CI job).
- **SC-003**: Zero CI jobs use a Node version that differs from `.nvmrc`'s
  contents, verified on every push and pull request.

## Assumptions

- "LTS" means the current Active LTS release published on nodejs.org at
  the time this feature is implemented; the exact version number is an
  implementation detail resolved at build time, not fixed by this spec.
- The existing CI workflow (`.github/workflows/ci.yml`) and its four Node
  setup steps are the only place, besides the README, where the Node
  version is currently duplicated as a literal.
- No change to the actual Node major version is required by this feature
  beyond what's needed to align on a single current LTS; if the
  repository's current pin (Node 22, per the existing README/CI literal)
  is already an LTS release, this feature may keep that version rather
  than force an upgrade — the point is the single source of truth, not
  necessarily a version bump.
- `nvm` is assumed as the reference version manager for `.nvmrc`
  consumption (the de facto standard for this file format), but no new
  tooling dependency is introduced for contributors who use a different
  manager or none at all.
