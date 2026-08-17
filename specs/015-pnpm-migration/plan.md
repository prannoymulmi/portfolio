# Implementation Plan: pnpm Migration

**Branch**: `main` (worked directly on main, no feature branch — see spec Assumptions) | **Date**: 2026-08-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/015-pnpm-migration/spec.md`

## Summary

Replace npm with pnpm as the package manager for the main portfolio project:
commit a `pnpm-lock.yaml` in place of `package-lock.json`, pin the pnpm version via
`package.json`'s `packageManager` field, update CI (`.github/workflows/ci.yml`) and
production deploy (`vercel.json`) to install via pnpm, update every doc that
currently shows an `npm` command (`README.md`, `CONTRIBUTING.md`), and record the
decision as both a new ADR and — because it substitutes a clause of Principle IV —
a constitution amendment. No application code, dependency versions, or deployed
site behavior changes.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode) / Node 22 — unchanged

**Primary Dependencies**: Unchanged (Next.js 16, React 19, Tailwind v4, etc. — see
`package.json`); only the *manager* installing them changes

**Storage**: N/A

**Testing**: Jest 29 + React Testing Library — unchanged, invoked via `pnpm test`
instead of `npm test`

**Target Platform**: Vercel (production/preview), GitHub Actions `ubuntu-latest`
(CI), local dev (Node 22+)

**Project Type**: Single Next.js web app (existing structure; no new
apps/packages)

**Performance Goals**: N/A (build tooling; no runtime performance change)

**Constraints**: Every existing `package.json` script must behave identically
under pnpm (FR-006); the React 19 peer-dependency install must keep succeeding
without a flag (FR-005, research.md #1); production and CI installs must both move
together, not just local dev (FR-004, FR-010)

**Scale/Scope**: One repository, ~25 direct dependencies, 3 config files (
`package.json`, `.github/workflows/ci.yml`, `vercel.json`), 2 docs (`README.md`,
`CONTRIBUTING.md`), 1 new ADR, 1 constitution amendment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies? | Assessment |
|---|---|---|
| I. KISS & Maintainability | Yes | Swap is mechanical (config + docs), no new abstractions. Pass. |
| II. Test-First | Yes | No new application behavior to test; the existing 252-test suite is the regression check, run via `pnpm test` before this lands. Pass. |
| III. Atomic Commits | Yes | Release step must split into separable commits (lockfile swap, CI, vercel.json, docs, ADR+amendment) rather than one five-plus-file commit — see tasks.md. |
| IV. Technology Stack (NON-NEGOTIABLE) | **Yes — substitution** | The Deployment bullet names `--legacy-peer-deps`/npm explicitly (ADR 0007). This migration replaces that clause. Governance requires an ADR **and** a constitution amendment together for any Principle IV change — both are in scope (FR-007, and the new constitution-amendment task in tasks.md). Not a violation to justify away; it's the designed path for changing Principle IV. |
| V. Token Efficiency | N/A | No AI-prompt-authoring change involved. |
| VI. Recorded Decisions (ADRs) | Yes | This is exactly the class of decision Principle VI requires an ADR for (dependency/tooling change). FR-007/FR-008 cover it. |
| Development Workflow (branching/PR) | **Deviation, pre-approved** | Normal workflow is feature branch + PR + review. User explicitly directed this feature to be specified and implemented directly on `main` with no PR (GitHub PRs reported broken). Recorded in spec Assumptions; not re-litigated here. |

**Gate result**: PASS. The one Principle IV substitution is handled by doing what
Governance requires (ADR + amendment together), not by bypassing it — tracked in
Complexity Tracking below for visibility, not as a rejected alternative.

## Project Structure

### Documentation (this feature)

```text
specs/015-pnpm-migration/
├── plan.md              # This file
├── research.md           # Phase 0 output
├── data-model.md          # Phase 1 output
├── quickstart.md          # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

No `contracts/` directory: the feature has no external API, CLI, or UI surface to
contract — see quickstart.md's note.

### Source Code (repository root)

No source directory changes. This feature touches only:

```text
package.json              # + packageManager field
package-lock.json          # deleted
pnpm-lock.yaml             # new, committed
.github/workflows/ci.yml   # install/cache steps → pnpm
vercel.json                # installCommand → pnpm
README.md                  # commands + Deployment section
CONTRIBUTING.md            # commands
docs/adr/README.md         # + index row for the new ADR
docs/adr/00NN-*.md          # new ADR (NN = next after 0021)
.specify/memory/constitution.md   # Principle IV Deployment bullet + version bump
```

**Structure Decision**: Existing single-project Next.js layout is unchanged.
Everything in scope is configuration, documentation, or governance records at the
repo root — no `src/`, `app/`, or `components/` changes.

## Complexity Tracking

> Not a rule violation requiring a simpler-alternative justification — recorded
> here because it touches a NON-NEGOTIABLE principle and Governance requires the
> paper trail to be visible at plan time, not discovered at review time.

| Item | Why Needed | Handled By |
|---|---|---|
| Constitution amendment to Principle IV (Deployment bullet) | Principle IV names the exact npm flag (`--legacy-peer-deps`) this migration replaces; Governance forbids changing anything in Principle IV without an amendment landing alongside the ADR | New task in tasks.md: amend `.specify/memory/constitution.md` in the same batch of work as the new ADR, per Governance's own rule — adapted from "same PR" to "same batch of commits on `main`" per the pre-approved no-PR deviation |
