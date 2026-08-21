# Data Model: Pin Node Version to LTS

This feature has no application data model — no entities, records, or
runtime state. It introduces two git-tracked *configuration declarations*
that together determine which Node.js version each environment runs.

## `.nvmrc`

| Field | Value |
|---|---|
| Location | Repository root |
| Format | Single line, major version number only |
| Content (this feature) | `24` |
| Consumed by | `nvm use` (local dev), `actions/setup-node`'s `node-version-file` input (CI) |
| Validation | None enforced by tooling beyond "nvm/setup-node can resolve it" — an invalid value fails the CI job's setup step (Edge Case, spec.md) |

## `package.json` → `engines.node`

| Field | Value |
|---|---|
| Location | `package.json`, top-level `engines` object |
| Format | Semver range string |
| Content (this feature) | `"24.x"` |
| Consumed by | Vercel's build system (overrides Project Settings' Node.js Version dropdown per Vercel docs) |
| Relationship to `.nvmrc` | Same major version, expressed in each consumer's expected format (`nvm`/`setup-node` read a bare major or full version; Vercel's `engines.node` expects a semver range). Not auto-derived from `.nvmrc` — see research.md Decision 3 for why generation was rejected as over-engineering at this scale. Kept in sync by convention, documented in the ADR (FR-006). |

## Relationship diagram

```text
.nvmrc (24)  ──consumed by──▶  nvm (local dev)
             ──consumed by──▶  actions/setup-node node-version-file (CI: 4 jobs)

package.json engines.node (24.x)  ──consumed by──▶  Vercel build (production + previews)
```

No entity has a lifecycle, state transitions, or relationships to other data
— this table exists only to satisfy the plan template's Phase 1 output
requirement for a feature whose "entities" are configuration files.
