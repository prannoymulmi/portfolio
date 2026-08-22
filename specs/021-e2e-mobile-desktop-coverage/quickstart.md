# Quickstart: Verify E2E Coverage for Major Flows, Desktop & Mobile

Manual verification once implementation lands. References `spec.md`
requirement IDs (FR-xxx, SC-xxx) rather than repeating them. Assumes the 019
setup is already in place — if this is a fresh clone, run `pnpm install` and
`npx playwright install chromium` first.

## Running the suite

```sh
pnpm run test:e2e                      # both viewport projects, 13 executions
pnpm run test:e2e --project=desktop    # desktop only  (6 executions)
pnpm run test:e2e --project=mobile     # mobile only   (7 executions)
pnpm run test:e2e --project=mobile tests/e2e/mobile   # the one mobile-only spec
pnpm run test:e2e --ui                 # pick a project/test interactively
```

No dev server needs to be running first — the `webServer` block starts one and
reuses an already-running `pnpm run dev` if there is one (019's contract,
unchanged by this feature).

## Desktop coverage (US1)

1. Run `pnpm run test:e2e --project=desktop`. Confirm six specs run and pass,
   each reported with a `[desktop]` prefix. (SC-001)
2. Confirm the run covers, as separate named tests: hero content load, locale
   toggle EN ↔ DE and back, project detail modal open + close, career chapter
   navigation, contact links, and the hamburger menu open + close — the last of
   these runs here too, because the control renders at desktop width.
   (FR-001 – FR-004, FR-006)
3. Open each new spec file. Confirm every assertion is an auto-waiting
   Playwright assertion and that no `page.waitForTimeout(...)` appears
   anywhere. (FR-008)
   ```sh
   grep -rn "waitForTimeout" tests/e2e/   # must return nothing
   ```
4. Confirm no spec reads `PLAYWRIGHT_BASE_URL`, `process.env`, or
   `test.info().project.name`. (FR-009, contracts/viewport-project-contract.md)
   ```sh
   grep -rn "process.env\|project.name" tests/e2e/   # must return nothing
   ```
5. Break one flow deliberately (e.g. change the expected `mailto:` prefix) and
   re-run. Confirm exactly one test fails and its name identifies the flow —
   not a single test reporting an ambiguous multi-flow failure. Revert.
   (spec Edge Case 3)

## Mobile coverage (US2)

1. Run `pnpm run test:e2e --project=mobile`. Confirm seven specs run and pass,
   each reported with a `[mobile]` prefix — the same six flows as desktop
   (hero, locale, modal, career, contact, hamburger menu), plus the
   mobile-only horizontal-overflow guard. (SC-002)
2. Confirm the mobile project's viewport is `< 1024px` and the desktop
   project's is `>= 1024px` in `playwright.config.ts`, matching the site's own
   breakpoint in `components/Hero/useHeroScrollBlur.ts`. (FR-005)
3. Open `tests/e2e/hamburger-menu.spec.ts` — note it is at the **top level**,
   not under `mobile/`, so both projects run it (amended 2026-08-22). Confirm
   it opens the menu, asserts the navigation panel's section links are visible,
   closes it, and asserts they are gone; and confirm it passes under **both**
   `--project=desktop` and `--project=mobile`. Confirm it does **not** assert
   the panel's width or that the panel covers the viewport — that is the one
   claim that differs between the two widths (`max-w-xs` vs `sm:max-w-sm`).
   (FR-006)
   ```sh
   pnpm run test:e2e tests/e2e/hamburger-menu.spec.ts   # 2 passes, one per project
   ```
4. Open the overflow test. Confirm it compares
   `documentElement.scrollWidth` against `clientWidth` after load *and* after
   scrolling down the page (the contact chapter's decorative glow is the
   historical offender). (FR-007)
5. Confirm nothing under `tests/e2e/mobile/` is picked up by the desktop
   project, and that the directory holds exactly one spec:
   ```sh
   pnpm run test:e2e --project=desktop --list | grep -c mobile/   # must be 0
   ls tests/e2e/mobile/*.spec.ts   # exactly one: no-horizontal-overflow.spec.ts
   ```
6. Confirm no test resizes the viewport mid-run:
   ```sh
   grep -rn "setViewportSize" tests/e2e/   # must return nothing
   ```

## Coverage document (US3)

1. Open `docs/testing-pyramid.md`. Confirm the new coverage section sits inside
   this existing document — there is no second testing-strategy file.
   (FR-013, spec Clarifications)
   ```sh
   ls docs/*.md   # testing-pyramid.md and content-editing.md only
   ```
2. Confirm it contains **two** tables: one for viewport-agnostic tests (six
   rows, run by both projects — including the hamburger menu) and one for
   mobile-specific tests (one row, the horizontal-overflow guard). Confirm no
   footnote claims the hamburger test is mobile-scoped. (FR-012)
3. Confirm every row names what the test verifies, which viewport(s) it runs
   under, and links to the test file. (FR-011)
4. Verify every link resolves to a real path (FR-014). From the repo root:
   ```sh
   grep -o '(\.\./tests/e2e/[^)]*)' docs/testing-pyramid.md \
     | tr -d '()' | sed 's|^\.\./||' | while read -r f; do
         test -f "$f" && echo "OK   $f" || echo "DEAD $f"
       done
   ```
   Every line must read `OK`.
5. Verify completeness both ways (SC-004) — every spec file appears in exactly
   one table, and every linked file exists:
   ```sh
   find tests/e2e -name '*.spec.ts' | sed 's|^|../|' | sort > /tmp/on-disk.txt
   grep -o '(\.\./tests/e2e/[^)]*)' docs/testing-pyramid.md | tr -d '()' | sort > /tmp/in-doc.txt
   diff /tmp/on-disk.txt /tmp/in-doc.txt   # must be empty, and in-doc must have no duplicates
   ```
6. Hand the document to someone unfamiliar with the codebase. Confirm they can
   say what the e2e suite covers and open the file behind any given check in
   under a minute. (SC-003)

## CI (no change expected)

1. Push to a PR and mark it ready for review. Confirm the `E2E Tests` check
   still appears under that exact name — the job was not renamed, split, or
   matrixed, so `main`'s branch protection rule needs no edit. (research D4)
2. Confirm the CI log shows both `[desktop]` and `[mobile]` results from the
   single `pnpm run test:e2e` step, running against the PR's Vercel preview
   URL — not localhost. (FR-009)

## Automated checks

```sh
pnpm type-check
pnpm lint
pnpm test               # unit + integration — must be unaffected by this feature
pnpm run test:e2e       # both viewport projects
```

See `contracts/viewport-project-contract.md` for the project-name and
file-placement guarantees these checks depend on, and
`specs/019-playwright-e2e-tests/contracts/e2e-target-contract.md` for the
target-selection contract they inherit.
