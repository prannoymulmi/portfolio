# Feature Specification: pnpm Migration

**Feature Branch**: `main` (worked directly on main — no feature branch or PR for this change, per explicit request)

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "I want to move to pnpm and update all the readmes and add adr as it is more efficent saves huge disc space and is more mordern. I want to do this specify directly in main as github PR is broken do not create any PR"

## Clarifications

### Session 2026-08-17

- Q: Should the Vercel deployment's install command (`vercel.json`, and the matching line in README's Deployment section) be switched to pnpm as part of this migration, alongside CI? → A: Yes — update `vercel.json`'s `installCommand` to the pnpm equivalent, and update the matching line in README's Deployment section, so production build matches CI and local dev.
- Q: Does "saves huge disc space" need a specific numeric target to count as done, or is a qualitative check enough? → A: Qualitative check only — confirm `node_modules` is smaller after a fresh pnpm install than the npm install it replaces; no percentage target, since pnpm's biggest disk savings come from its shared store across multiple projects on one machine, not from a single repo in isolation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install dependencies the new way (Priority: P1)

A developer (including the site owner) clones the repository or pulls latest `main`
and needs to install dependencies before running the app. Today that means `npm
install --legacy-peer-deps`. After this change, a single documented pnpm command
installs everything correctly, using far less disk space than the npm install it
replaces, and every existing script (`dev`, `build`, `test`, `lint`, `type-check`,
`validate:json`) keeps working exactly as before, just invoked through pnpm.

**Why this priority**: Nothing else in the migration matters if dependency install
is broken — this is the critical path every other workflow (dev server, tests, CI)
depends on.

**Independent Test**: On a clean checkout, delete `node_modules`, run the documented
install command, and confirm the app starts and the full test suite passes.

**Acceptance Scenarios**:

1. **Given** a clean checkout of `main` with no `node_modules`, **When** a developer
   runs the documented install command, **Then** all dependencies install
   successfully without needing any undocumented flags.
2. **Given** dependencies are installed, **When** a developer runs each existing
   `package.json` script (`dev`, `build`, `test`, `lint`, `type-check`,
   `validate:json`), **Then** each behaves exactly as it did under npm.

---

### User Story 2 - Read accurate setup docs (Priority: P2)

A developer opens the repository's documentation (`README.md`, `CONTRIBUTING.md`,
and any other doc that currently tells a reader to run an `npm` command) to learn
how to set up and work in the project. Every command shown uses the new package
manager; no doc still tells a reader to run `npm install` or `npm run <script>`.

**Why this priority**: Docs that contradict the actual tooling send a new
contributor down a broken path on their very first command — this is the
migration's most visible surface after the install step itself.

**Independent Test**: Grep the repository's documentation files for `npm ` command
invocations and confirm none remain outside of historical/changelog text.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** a reader follows the Quick Start
   section of `README.md` verbatim, **Then** every command shown is a pnpm command
   and produces the documented result.
2. **Given** `CONTRIBUTING.md`'s setup and pre-push checklist, **When** a
   contributor follows it verbatim, **Then** every command shown is a pnpm command.

---

### User Story 3 - Understand why the switch happened (Priority: P3)

A future maintainer (or the site owner, months later) wants to know why the project
uses pnpm instead of npm, and finds a recorded architectural decision explaining the
rationale — efficiency and disk-space savings from pnpm's shared content-addressable
store versus npm's per-project duplication — without having to reconstruct it from
commit history.

**Why this priority**: Lower priority than the mechanics working, but the
constitution (Principle VI) requires architecturally significant decisions to be
recorded, and a package-manager switch touching every documented command and CI
step qualifies.

**Independent Test**: Open `docs/adr/README.md`, find the new ADR listed in the
index, open it, and confirm it states the decision, the rationale, and the
consequences (including the lockfile change).

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** a reader opens `docs/adr/`,
   **Then** a new ADR documents the move from npm to pnpm, its rationale, and its
   consequences.
2. **Given** the new ADR exists, **When** a reader opens `docs/adr/README.md`,
   **Then** the new ADR is listed in the index alongside the existing ones.

### Edge Cases

- What happens to the existing `package-lock.json`? It no longer reflects the
  package manager in use and MUST be removed once a `pnpm-lock.yaml` exists, so a
  future `npm install` cannot silently regenerate a stale, conflicting lockfile.
- The project currently requires `--legacy-peer-deps` for a React 19 peer-dependency
  conflict (recorded in ADR 0007). Switching package managers must not reintroduce
  that failure — the pnpm equivalent needs to be documented wherever the flag was.
- The CI workflow (`.github/workflows/ci.yml`) currently installs and runs scripts
  via npm. If it is not updated, automated builds and tests break silently on the
  next push even though local development looks fine.
- The production deployment (`vercel.json`'s `installCommand`) currently pins
  `npm install --legacy-peer-deps`. If it is not updated alongside CI, the live
  site's build runs npm against a repo with no `package-lock.json`, breaking the
  production build or silently resolving different dependency versions than what
  was tested.
- The `showcase/` subdirectory is a separate, independently-versioned project that
  already uses a different package manager (bun) and its own lockfile — it is not
  touched by this migration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST use pnpm as the package manager for installing and
  managing dependencies in the main portfolio project, replacing npm.
- **FR-002**: The repository MUST contain a committed `pnpm-lock.yaml` reflecting
  the current dependency tree, and MUST NOT contain `package-lock.json` once the
  migration is complete.
- **FR-003**: Every developer-facing documentation file that currently instructs a
  reader to run an `npm` command (`README.md`, `CONTRIBUTING.md`, and any other doc
  found to reference `npm install` / `npm run` / `npm test` / `npm start`) MUST be
  updated to show the equivalent pnpm command instead.
- **FR-004**: The CI workflow MUST install dependencies and run its scripts through
  pnpm so automated builds and tests continue to pass after the migration.
- **FR-005**: The documentation MUST carry forward a working pnpm-equivalent for the
  existing React 19 peer-dependency workaround (ADR 0007), so a reader following the
  docs does not hit the peer-dependency error npm's `--legacy-peer-deps` flag was
  added to avoid.
- **FR-006**: Every `package.json` script that exists today (`dev`, `build`,
  `start`, `type-check`, `lint`, `test`, `validate:json`) MUST continue to exist and
  behave the same way, invoked through pnpm instead of npm.
- **FR-007**: A new ADR MUST be added to `docs/adr/` recording the decision to move
  from npm to pnpm, including the rationale (disk-space efficiency via pnpm's
  shared package store, and adopting current tooling) and the consequences (lockfile
  change, CI change, contributor workflow change).
- **FR-008**: `docs/adr/README.md` MUST be updated to list the new ADR in its index.
- **FR-009**: The `showcase/` subdirectory's independent bun-based tooling MUST be
  left unchanged by this migration.
- **FR-010**: `vercel.json`'s `installCommand` MUST be updated to the pnpm
  equivalent of the current npm install command (including the peer-dependency
  workaround from FR-005), so the production build matches CI and local dev. The
  Deployment section of `README.md` MUST be updated to match.

### Key Entities

- **Lockfile**: The dependency-resolution record committed to the repository.
  Changes from npm's `package-lock.json` to pnpm's `pnpm-lock.yaml`; the old file is
  removed once the new one is in place.
- **ADR (Architecture Decision Record)**: A new entry in `docs/adr/` capturing the
  npm-to-pnpm decision, following the format of the existing 21 ADRs and added to
  the index in `docs/adr/README.md`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can go from a clean checkout to a running local dev
  server using only commands shown in the documentation, with zero undocumented
  flags or manual workarounds.
- **SC-002**: A fresh dependency install using pnpm produces a `node_modules`
  smaller than the npm install it replaces, checked qualitatively (before/after
  comparison) rather than against a numeric percentage target — pnpm's larger
  disk-space savings come from its shared store across multiple projects on one
  machine, not from a single repo installed in isolation.
- **SC-003**: 100% of documentation files that mention package-manager commands
  show pnpm commands, with zero remaining references to `npm install`, `npm run`,
  `npm test`, or `npm start` as instructions to follow (historical/changelog
  mentions excepted).
- **SC-004**: The CI pipeline completes successfully (install, lint, type-check,
  test, build) on the first run after the migration lands, and the next Vercel
  production deploy builds successfully using the updated install command.
- **SC-005**: A reader can find, within one click from the ADR index, a record
  explaining why the project uses pnpm instead of npm.

## Assumptions

- "Update all the READMEs" refers to every developer-facing documentation file in
  the main portfolio project that currently references npm commands: `README.md`
  and `CONTRIBUTING.md` at minimum, plus any other doc surfaced during
  implementation that references an `npm` command. `docs/adr/README.md` is updated
  only to add the new ADR entry, not for command references.
- The `showcase/` subdirectory is out of scope: it is a separate project with its
  own `package.json`, already on a different package manager (bun) with its own
  lockfile, unrelated to this repo's npm-vs-pnpm choice.
- This work is being done directly on `main` with no feature branch and no pull
  request, per explicit instruction (the site owner reports GitHub PRs are
  currently broken). This is a deliberate, one-off deviation from the project's
  normal branch-per-feature workflow, not a change to that workflow going forward.
- pnpm version pinning (e.g. via a `packageManager` field or `.npmrc`/`pnpm-workspace.yaml`
  settings) is an implementation detail to be decided during planning, not specified
  here.
- No behavior of the deployed site changes as a result of this migration — it is
  purely a development/build tooling change.
