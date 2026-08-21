# Implementation Plan: Pin Node Version to LTS

**Branch**: `feat/pin-node-lts` | **Date**: 2026-08-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/020-pin-node-lts/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Pin the project's Node.js version in one git-tracked place instead of the four
hardcoded CI matrix entries and one README literal it's currently duplicated
across. `.nvmrc` becomes the source of truth for local dev and CI (via
`actions/setup-node`'s `node-version-file` input); `package.json`'s
`engines.node` mirrors it for Vercel's production runtime, the same pattern
already used for pnpm (ADR 0022). The version lands on Node 24 — the current
Active LTS and the newest release Vercel's Functions runtime actually
supports — not Node 26 as first requested, because Vercel's deployment
runtime only offers 20.x/22.x/24.x (confirmed against Vercel's docs during
this planning phase); Node 26 is available on Vercel *Sandboxes*, an
unrelated ephemeral-execution product, not on the Functions/deployment
runtime this site's production traffic runs on. This reversal and its
reasoning are recorded in an ADR per FR-006.

## Technical Context

**Language/Version**: N/A — this feature has no application code; it's a
Node.js *version declaration* consumed by tooling (nvm, `setup-node`, Vercel).

**Primary Dependencies**: None added. `actions/setup-node@v4` (already in
`.github/workflows/ci.yml`) already supports `node-version-file`.

**Storage**: N/A

**Testing**: No new test suite. Validated by running CI on this branch (all
four jobs must resolve Node 24 from `.nvmrc`) and by checking Vercel's build
log / `process.version` on the resulting preview deploy (quickstart.md).

**Target Platform**: Local dev machines (via `nvm`), GitHub Actions
`ubuntu-latest` runners, Vercel's Functions/deployment runtime.

**Project Type**: Existing Next.js web app — this feature only touches
tooling/CI/docs, no `src`/`app` changes.

**Performance Goals**: N/A

**Constraints**: The pinned version MUST be one Vercel's Functions runtime
actually offers (20.x/22.x/24.x per Vercel docs, checked 2026-08-21) —
this ruled out the originally-requested Node 26.

**Scale/Scope**: 5 files touched: `.nvmrc` (new), `package.json`
(`engines.node` added), `.github/workflows/ci.yml` (4 jobs: matrix removed,
`node-version-file` added), `README.md` (quickstart pointer), one new ADR
in `docs/adr/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle IV (Technology Stack, NON-NEGOTIABLE)**: Not implicated. The
  Deployment bullet names pnpm's install pin but is silent on Node version —
  adding a Node version pin doesn't substitute or extend anything the stack
  list already names, so no amendment is required. ✅ PASS
- **Principle VI (Recorded Decisions)**: A Node-version pin plus a Vercel
  runtime-ceiling discovery is exactly the kind of non-obvious tooling
  decision this repo already writes ADRs for (see ADR 0022, pnpm). The spec's
  FR-006 already requires one. ✅ PASS (ADR planned, see Phase 1)
- **Principle I (KISS)**: Considered and rejected a `.nvmrc` → `package.json`
  sync script — two hand-edited, git-tracked literals kept in sync by a
  one-line ADR convention is simpler than automation for a value that
  changes roughly once a year. ✅ PASS
- **Principle III (Atomic Commits)**: This feature touches 5 files across
  one cohesive change (a version pin); acceptable as a single commit per the
  constitution's "genuinely one unit of work" exception. ✅ PASS
- No other principle is implicated (no UI, no styling, no animation, no
  content/data model, no test framework change).

**Result**: No violations. No Complexity Tracking entries needed.

**Post-Phase 1 re-check**: research.md and data-model.md introduce a second
git-tracked literal (`package.json engines.node`) beyond `.nvmrc`. Re-checked
against Principle I (KISS) — accepted as the minimum needed for genuine
Vercel parity (research.md Decision 3); a generation script was considered
and rejected as over-engineering. No new principle implicated. ✅ PASS,
unchanged from the pre-Phase-0 check.

## Project Structure

### Documentation (this feature)

```text
specs/020-pin-node-lts/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` — this feature exposes no API, CLI, or UI contract; it's a
build/deploy tooling configuration change.

### Source Code (repository root)

```text
.nvmrc                         # NEW — single line, Node major version
package.json                   # engines.node added
.github/workflows/ci.yml       # 4 jobs: strategy.matrix.node-version removed,
                                # node-version-file: '.nvmrc' added to each
                                # actions/setup-node step
README.md                      # Quickstart Node requirement now points to .nvmrc
docs/adr/0029-*.md             # NEW — records the Node 24 decision + Node 26 rejection
docs/adr/README.md             # Index row added for the new ADR
```

**Structure Decision**: No new source directories — this is a configuration
and documentation change against the existing repository root, CI workflow,
and ADR log. Single project structure (no frontend/backend split applies).

## Complexity Tracking

*No violations — table not needed.*
