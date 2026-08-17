# Phase 0 Research: pnpm Migration

## 1. Peer-dependency handling: pnpm equivalent of `--legacy-peer-deps`

- **Decision**: No install flag is needed. Plain `pnpm install` / `pnpm install
  --frozen-lockfile` replaces `npm install --legacy-peer-deps` everywhere.
- **Rationale**: pnpm's `strict-peer-dependencies` setting defaults to `false` —
  commands only *warn* on missing or conflicting peer dependencies, they never fail
  because of them (that's npm 7+'s default behavior, which is what
  `--legacy-peer-deps` was added to opt out of in ADR 0007). `auto-install-peers`
  also defaults to `true`, so pnpm additionally auto-installs any missing
  non-optional peer dependency it can resolve unambiguously. The React 19 /
  `@testing-library/react` peer mismatch that ADR 0007 exists for will still print
  a warning under pnpm, but the install will succeed without any extra
  configuration.
- **Alternatives considered**: An explicit `.npmrc` with
  `strict-peer-dependencies=false` was considered for parity/documentation clarity,
  but rejected — it would only be restating pnpm's own default, adding a file for
  no behavioral effect (KISS, Principle I).

## 2. Pinning the pnpm version

- **Decision**: Add a `"packageManager": "pnpm@11.22.0"` field to `package.json`
  (Corepack's standard pinning mechanism). No separate `.npmrc` version pin.
- **Rationale**: `11.22.0` is pnpm's current published `latest` on the npm
  registry at the time of this plan. Corepack (bundled with Node 22, the version
  already pinned in CI) reads `packageManager` and transparently fetches/uses that
  exact pnpm version for every `pnpm` invocation — local, CI, and Vercel — so
  "works on my machine" version drift can't happen. This is the mechanism pnpm's
  own docs recommend over a global `npm install -g pnpm`.
- **Alternatives considered**: Leaving the version unpinned (whatever `pnpm` the
  environment happens to have) was rejected — it reintroduces exactly the kind of
  drift a lockfile-based migration is trying to remove, and Vercel/CI would each
  resolve their own default independently.

## 3. GitHub Actions CI

- **Decision**: Add a `pnpm/action-setup@v4` step (no explicit `version:` input —
  it reads the pin from `package.json`'s `packageManager` field) before
  `actions/setup-node@v4`, and change `actions/setup-node@v4`'s `cache: npm` to
  `cache: pnpm`. Replace `npm ci --legacy-peer-deps` with
  `pnpm install --frozen-lockfile`.
- **Rationale**: `actions/setup-node`'s built-in pnpm caching requires `pnpm` to
  already be on `PATH` when it runs, which is exactly what `pnpm/action-setup` (the
  action pnpm's own docs point CI users to) provides. `--frozen-lockfile` is pnpm's
  equivalent of `npm ci`: install exactly what the lockfile says, fail instead of
  silently updating it if `package.json` and `pnpm-lock.yaml` have drifted.
- **Alternatives considered**: Manually installing pnpm via `npm install -g pnpm`
  in a `run:` step was rejected — it bypasses the `packageManager` pin from
  decision #2 and reintroduces the version-drift problem that decision solved.

## 4. Vercel production deploys

- **Decision**: Change `vercel.json`'s `installCommand` from
  `"npm install --legacy-peer-deps"` to `"pnpm install"`.
- **Rationale**: Vercel supports pnpm natively (auto-detected from a
  `pnpm-lock.yaml` in the repo root) and also honors Corepack's `packageManager`
  field, so it will use the exact pinned pnpm version from decision #2 without any
  further configuration. Keeping an explicit `installCommand` (rather than deleting
  it and relying purely on auto-detection) preserves the existing pattern the repo
  already uses — an explicit, reviewable command in version control — and keeps
  Principle IV's Deployment entry naming a concrete command, not "whatever Vercel
  infers."
- **Alternatives considered**: Removing `installCommand` entirely and trusting
  Vercel's auto-detection was considered simpler, but rejected — an explicit
  command in `vercel.json` is what the constitution's Deployment entry currently
  documents, and removing it would leave that entry pointing at nothing concrete
  to amend it *to*.

## 5. Constitution impact

- **Decision**: This migration requires a constitution amendment, not just an ADR.
- **Rationale**: Principle IV (NON-NEGOTIABLE Technology Stack) explicitly states,
  under **Deployment**: *"Installs use `--legacy-peer-deps` in every environment
  until the blocking peer ranges are published (ADR 0007)."* Changing the install
  mechanism is a literal substitution of a Principle IV clause. The Governance
  section is explicit: *"Adding, removing, or replacing anything in Principle IV
  requires both an ADR recording the decision and an amendment to this file, in
  the same PR."* There is no PR in this workflow (explicit user instruction,
  recorded in the spec's Assumptions), so the amendment and the new ADR land in
  the same batch of commits on `main` instead — satisfying the same intent
  (decision and governing-document update travel together) under the workflow
  deviation already agreed for this feature.
- **Alternatives considered**: Treating this as "just tooling, not a stack
  substitution" and skipping the amendment was rejected — the constitution names
  the exact npm flag being replaced, so this is the precise case Principle IV's
  amendment rule was written for.

## 6. Documentation surfaces to update

- **Decision**: `README.md` (Quick Start commands table, Deployment section) and
  `CONTRIBUTING.md` (setup steps, pre-push checklist, any ADR-writing guidance that
  shows an `npm` command as example text) get every `npm` command replaced with its
  pnpm equivalent. `docs/adr/README.md` gets one new line in its index for the new
  ADR — its own body is otherwise about governance, not commands, and is not
  otherwise touched.
- **Rationale**: These are the files a new contributor or the site owner reads to
  set up or work in the project (spec User Story 2); `docs/adr/README.md` is an
  index, not a runbook, so FR-003's "reference an npm command" scope doesn't reach
  its own prose, only its table row for the new ADR (FR-008).
- **Alternatives considered**: None — this follows directly from FR-003/FR-008.
