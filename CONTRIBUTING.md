# Contributing

Solo-maintained portfolio, but the conventions below keep future-me
(and any collaborators) sane.

## Local setup

```bash
npm install --legacy-peer-deps    # React 19 peer-dep flag — see ADR 0007
npm run dev
```

## Before opening a PR

Run everything CI runs, locally:

```bash
npm run type-check
npm run lint
npm test
npm run build
```

All four must pass. CI will re-run them, but catching issues locally
saves a round-trip.

## Commit format

Small, self-contained commits. Message format:

```
<short summary in imperative mood>

<paragraph explaining the *why*, not just the what — the diff already
shows the what. What was the failure mode this addresses? What
constraint drove this shape? What alternative did you reject?>
```

Rules of thumb:
- One logical change per commit. If the summary needs "and", split it.
- The body is for reviewers who see this commit in `git log` three
  years from now. Explain the reasoning that isn't obvious from the code.
- No `Co-Authored-By` trailers unless asked.
- No `--no-verify`. If a hook fails, fix the underlying issue.

## PR flow

1. Push a branch (naming is free-form).
2. Vercel auto-deploys a preview. Verify the change there before merging.
3. Every PR runs the CI matrix above. Do not merge red.
4. Squash-merge into `main`. Production deploys automatically.

## When to write an ADR

Add a new record under [docs/adr/](docs/adr/README.md) when the change:

- Adds or removes a top-level dependency (a framework, an animation
  library, a CMS).
- Changes how content is stored, loaded, or validated.
- Alters the deployment target or CI pipeline in a load-bearing way.
- Rejects an alternative that a future maintainer would plausibly
  propose (i.e. captures a "we already tried that" decision).

Do **not** write an ADR for bug fixes, styling tweaks, dependency
version bumps, or content edits — the git history is enough.

Format: Michael Nygard's Context → Decision → Consequences. Include an
"Alternatives rejected" section so the reasoning against the paths not
taken is preserved.

## Editing content

Not a code change — edit the relevant JSON file in `public/data/` and
open a PR. See [docs/content-editing.md](docs/content-editing.md) for
the field-by-field reference.

Run `npm run validate:json` before pushing so a bad edit fails locally
instead of at build time.

## Testing conventions

- **Unit tests** (`tests/unit/`): one file per component, colocated by
  directory. Use `@testing-library/react` — assert against what a user
  sees, not implementation details.
- **Integration tests** (`tests/integration/`): cross-cutting behavior
  (navigation, error handling). Wrap in `<ContentProvider>` so the
  real JSON loader path is exercised — `jest.setup.js` mocks `fetch`
  to serve files from `public/data/`.
- Don't mock components you can render. Only mock external boundaries
  (fetch, `next/navigation`, IntersectionObserver).

## Accessibility bar

Every UI change should:
- Preserve keyboard navigation (tab reaches every interactive element,
  focus is visible).
- Respect `prefers-reduced-motion` (see `lib/utils/animations.ts`).
- Meet WCAG 2.1 AA contrast ratios in both themes.
- Include an `aria-label` on icon-only controls.
