# Quickstart: Validating the pnpm Migration

No `contracts/` directory: this feature has no external API, CLI, or UI surface —
it's a build-tooling swap. Validation is "does everything that worked under npm
still work, now under pnpm."

## Prerequisites

- Node 22 (matches CI's pinned version)
- Corepack available (`corepack --version`; bundled with Node ≥ 16.9, may need
  `corepack enable` once per machine)

## 1. Clean local install (User Story 1)

```sh
rm -rf node_modules package-lock.json
corepack use pnpm@11.22.0    # or just `pnpm install` once packageManager is pinned
pnpm install
```

**Expected**: install completes with no undocumented flags. A peer-dependency
warning for `@testing-library/react` vs. React 19 may print (research.md #1) —
that is expected and does not fail the install.

## 2. Every existing script still works (User Story 1, FR-006)

```sh
pnpm run dev            # starts on http://localhost:3000, Ctrl-C to stop
pnpm run build
pnpm run type-check
pnpm run lint
pnpm test
pnpm run validate:json
```

**Expected**: identical behavior/output to the npm-invoked versions.

## 3. Docs match reality (User Story 2, FR-003)

```sh
grep -rn "npm install\|npm run\|npm test\|npm start" README.md CONTRIBUTING.md
```

**Expected**: no matches (aside from historical/changelog text, if any).

## 4. CI passes (FR-004, SC-004)

Push the change and check `.github/workflows/ci.yml`'s run in the GitHub Actions
tab.

**Expected**: install, type-check, lint, and test jobs all pass using the pnpm
steps.

## 5. Production build matches (FR-010, SC-004)

After the change lands on `main`, check the resulting Vercel production deploy
(triggered automatically per the constitution's Deploy workflow).

**Expected**: build succeeds using `vercel.json`'s updated `installCommand`.

## 6. Disk-space check (SC-002 — qualitative, per Clarifications)

```sh
du -sh node_modules   # after step 1's pnpm install

# for comparison, on a scratch copy of the repo at the pre-migration commit:
rm -rf node_modules && npm install --legacy-peer-deps && du -sh node_modules
```

**Expected**: the pnpm `node_modules` is smaller than the npm one. No specific
percentage required.

## 7. ADR and constitution amendment exist (User Story 3, FR-007, FR-008)

```sh
ls docs/adr/ | tail -3          # new ADR present, numbered after 0021
grep -n "pnpm\|npm" docs/adr/README.md   # new ADR listed in the index
git log -1 --stat .specify/memory/constitution.md   # amendment committed
```

**Expected**: new ADR file exists and is indexed; constitution's Principle IV
Deployment bullet no longer names `--legacy-peer-deps`/npm, and its version/SYNC
IMPACT REPORT reflect the amendment.
