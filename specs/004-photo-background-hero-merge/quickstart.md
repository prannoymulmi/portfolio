# Quickstart: Validating the backdrop, the shorter opening, and the nav icons

**Feature**: `004-photo-background-hero-merge` | **Date**: 2026-08-10

How to prove this feature works. Details live in [contracts/](contracts/) and
[data-model.md](data-model.md) — this is the run guide.

## Prerequisites

```bash
npm install --legacy-peer-deps   # the flag is required — see ADR 0007
npm run dev                      # http://localhost:3000
```

The icon package is added during Story 2:

```bash
npm install @icons-pack/react-simple-icons --legacy-peer-deps
```

## Automated checks

```bash
npm run type-check
npm run lint
npm test
npm run build          # confirms the production bundle and image pipeline
```

All four must pass. `npm test` should show the About-related suites **removed**, not
skipped.

---

## Story 1 — one backdrop

1. Open `/` and scroll top to bottom. The photograph is behind every chapter, continuous,
   with no seam or restart at a boundary.
2. Scroll again watching the horizon line in the photo: it must not move. Only the content
   moves.
3. Toggle to dark appearance. The photograph is still there, dimmed to a low ember — not
   gone, not at full strength.
4. **Contrast, by hand** (this is the one that matters — jsdom cannot check it):
   open DevTools, and with the colour picker sample body text at the **top, middle and
   bottom** of each of the 7 chapters, in both appearances. Every reading ≥ 4.5:1.
   The floors are in [contracts/navigation-contract.md](contracts/navigation-contract.md);
   the short version is that `text-gray-700` fails over this photo and `text-gray-900`
   passes.
5. Confirm no chapter reintroduced an opaque panel — the photo should be visible through
   all of them, not just the first.

**Weight check** (SC-007 depends on it):

```bash
npm run build && npm start
```

In DevTools → Network, hard-reload `/` and find the backdrop request. It must be a
generated AVIF/WebP variant well under ~200 KB — **not** a 1.73 MB `normal.jpg`. Seeing the
raw JPEG means the image is still going through CSS rather than the optimizer, and
Lighthouse will fail.

Then run Lighthouse on the production build: performance ≥ 90, accessibility 100.

## Story 2 — social icons

1. From the middle of the career chapter, without scrolling anywhere else, click the
   LinkedIn icon → the correct profile opens in a new tab. Repeat for GitHub.
2. Tab through the nav with the keyboard: each icon takes focus, shows a visible focus
   ring, and is announced with its destination name.
3. Narrow the window to **320px**. Both icons and the theme toggle stay put; the chapter
   list scrolls horizontally beneath them rather than pushing them off.
4. **Fallback**: temporarily add `{"network": "Mastodon", "href": "https://example.com"}`
   to `public/data/social.json`. It renders as a readable labelled link, not a blank gap.
   Remove it afterwards.
5. **Resilience**: temporarily rename `public/data/social.json`. The nav still shows its
   chapter links, progress bar and theme toggle. Restore it.

## Story 3 — the shorter opening

1. The opening shows the biography under the intro line. Count it: ≤ 2 sentences, ≤ 40
   words.
2. Read the biography and the player card together — **both must say 9 years**. The old
   copy said "10+", and nothing in validation will catch that.
3. There is no About chapter, and the nav lists 7 entries with no "About".
4. Every nav entry jumps to a section that exists — click all 7.
5. On a phone width, the opening with the biography added does not overflow and does not
   need more than one extra screen of scrolling.
6. Visit `/about` → lands on `/`, not a dead anchor at the top of the page.

**Content validation:**

Note `npm run validate:json` is broken and always has been — it points at
`lib/scripts/validate-json.js`, which does not exist in this repo. Validation happens at
load instead, so check it there: paste 300 characters into `bio` and reload. The opening must
show its error state with a Zod message naming `bio` — a silent blank means validation is
not wired up.

## Reduced motion

```
macOS: System Settings → Accessibility → Display → Reduce motion
```

With it on, reload and scroll: nothing drifts, and the opening's layout is identical to
where the moving version rests. A visible jump when the setting changes means the drift is
altering layout rather than transform.

## Governance check

The change is not complete without these — the constitution requires them in the same
change, not a follow-up:

- `docs/adr/0014-*.md` — the icon dependency, with rejected alternatives
- `docs/adr/0015-*.md` — the photograph as the page surface, and the About retirement
- `.specify/memory/constitution.md` at **1.2.0**, Principle IV listing the icon set
- `docs/adr/README.md` index updated with both

```bash
grep -n "Version" .specify/memory/constitution.md | tail -1   # expect 1.2.0
```
