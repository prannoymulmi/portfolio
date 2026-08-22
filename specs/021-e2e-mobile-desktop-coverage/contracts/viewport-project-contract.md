# Contract: e2e viewport projects

The interface between the Playwright test suite, the developer or CI process
that invokes it, and the coverage document that describes it — so all three
agree on what "desktop" and "mobile" mean without any test body restating it.

Companion to `specs/019-playwright-e2e-tests/contracts/e2e-target-contract.md`,
which owns *which URL* the suite points at. This one owns *at what width*.
The two are independent: every project runs against whichever target that
contract selects, and no test may branch on either (FR-009).

## Project names

| Project | Viewport | Breakpoint side | Runs |
|---|---|---|---|
| `desktop` | 1440 x 900 | `>= 1024px` — the site's `lg` desktop layout | `tests/e2e/*.spec.ts` only |
| `mobile` | 390 x 844 | `< 1024px` — the site's mobile layout | `tests/e2e/*.spec.ts` **and** `tests/e2e/mobile/*.spec.ts` |

**Consumers of these names**
- `playwright.config.ts` — defines them.
- A developer running one side: `pnpm run test:e2e --project=mobile`.
- The Playwright HTML/list report — prefixes every result with `[desktop]` or
  `[mobile]`, which is how a viewport-specific failure is identified.
- `docs/testing-pyramid.md`'s coverage tables — name them in the "runs under"
  column.

**Guarantee**: the names are lowercase, single-word, and stable. Renaming
either is a breaking change to the two consumers above and to any developer
muscle memory, so it requires updating the coverage document in the same
commit.

## File placement determines viewport scope

| Test file location | Executed by | Meaning |
|---|---|---|
| `tests/e2e/<flow>.spec.ts` | `desktop` **and** `mobile` | The flow exists and must behave the same at both widths |
| `tests/e2e/mobile/<flow>.spec.ts` | `mobile` only | The check only makes sense, or is only measurable, below `1024px`. This is a claim about the *check*, not about which viewport the author had in mind — a control that renders at both widths belongs at the top level even if it feels mobile-flavoured (research F6). As of 2026-08-22 exactly one file qualifies: `no-horizontal-overflow.spec.ts`. |

**Mechanism**: the `desktop` project carries `testIgnore: /mobile\//`. The
`mobile` project carries no ignore.

**Guarantee**: no test file needs to know which project is running it. A test
placed at the top level is written once and passes (or fails) twice; a test
placed under `mobile/` can safely assume a `< 1024px` viewport without
asserting it. Nothing calls `page.setViewportSize()`, and nothing reads
`test.info().project.name` to branch behavior — if a flow genuinely diverges
between the two widths, that is two test files, not one test with an `if`.

**Corollary for the coverage document**: the two tables required by FR-012 are
exactly these two locations. `ls tests/e2e/*.spec.ts` and
`ls tests/e2e/mobile/*.spec.ts` produce the two table bodies, which is what
makes SC-004 ("every file in exactly one table") verifiable without reading
any test source.

## What this contract does not cover

- **Device characteristics.** Neither project emulates touch, a mobile user
  agent, or a device pixel ratio. The site's responsive behavior is CSS width
  media queries only (`useHeroScrollBlur.ts`'s `(min-width: 1024px)` and
  Tailwind's `sm:`/`lg:` utilities). If a future flow genuinely depends on
  `hasTouch` — a `page.tap()`, a `pointer: coarse` media query — that is a new
  decision, recorded then, not assumed now.
- **Mid-test resizing.** Out of scope by the spec's own edge case, and load-
  bearing rather than incidental: `HamburgerMenu` closes its own panel on a
  `resize` event, so calling `page.setViewportSize()` inside the hamburger spec
  would silently destroy the state it is asserting. The hamburger spec instead
  runs *twice*, once per project, each launched directly at its width. A test
  that needs to observe a resize deliberately is a future, separately-scoped
  test.
- **Browser engines.** Both projects are Chromium, matching what CI installs
  (`npx playwright install --with-deps chromium`) and what ADR 0028 settled.
