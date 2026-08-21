# Quickstart: Validate the Node Version Pin

Prerequisites: `nvm` installed locally; `gh` authenticated for checking CI;
push access to the feature branch for triggering a Vercel preview.

## 1. Local pin resolves correctly (User Story 1)

```sh
cd portfolio
nvm use
node -v
```

**Expected**: `nvm use` switches to Node 24.x with no extra flags; `node -v`
prints a `v24.x.x` version. No error about a missing or ambiguous version.

## 2. CI reads the same version, no hardcoded literal remains (User Story 2)

```sh
grep -n "node-version" .github/workflows/ci.yml
```

**Expected**: every match is `node-version-file: '.nvmrc'` — no
`strategy: matrix: node-version:` block and no bare `node-version: '24'`
literal anywhere in the file.

Then, on a pushed commit / open PR:

```sh
gh run list --branch feat/pin-node-lts --limit 5
gh run view <run-id> --log | grep -i "Node.js"
```

**Expected**: all four jobs (lint-and-type-check, test, build, e2e) log
`Node.js version: 24.x.x` (or equivalent `setup-node` output) — same version
across all four.

## 3. Vercel production runtime matches (FR-007, SC-004)

After the PR's Vercel preview deploy completes:

```sh
gh pr view --json statusCheckRollup | grep -i vercel
```

Open the preview deployment's build logs in the Vercel dashboard (or via
`vercel inspect <deployment-url> --logs` if the CLI is set up) and check the
reported Node version in the build step header.

**Expected**: the build log shows Node 24.x, matching `.nvmrc` and CI. No
manual Project Settings override was needed — `package.json`'s
`engines.node` drove it.

## 4. Single source of truth, no README drift (User Story 3, SC-001/SC-002)

```sh
grep -rn "Node 2[0-9]" README.md .github/workflows/ci.yml
```

**Expected**: the only literal version numbers left are in `.nvmrc` and
`package.json`'s `engines.node` — `README.md` references `.nvmrc` by name
rather than restating a version number, and `.github/workflows/ci.yml` has
none at all.

## Rollback check

Bump `.nvmrc` to a different (still Vercel-supported) major, e.g. `22`, on a
scratch branch and re-run step 2. All four CI jobs should pick up 22 with no
other file edited — confirms FR-004 without needing a real version change.
