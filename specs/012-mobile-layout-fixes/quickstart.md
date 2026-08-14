# Quickstart: Validating Mobile Layout Fixes

**Feature**: [spec.md](./spec.md) | **Date**: 2026-08-14

Two halves, because the project's test environment can see structure but not
geometry (see [research.md](./research.md) R4). Run both before handoff.

---

## 1. Automated — structure

```bash
npm test                                        # whole suite
npm test -- tests/integration/mobile-overflow.test.tsx
npm test -- tests/unit/components/ChapterDetail.test.tsx
npm run lint
npm run type-check
```

Expected, per SC-006:

- `mobile-overflow.test.tsx` — every chapter section hosting an oversized
  decorative element carries a horizontal containment utility, and no global
  `overflow-x: hidden` guard exists on `html`/`body` in `app/globals.css` or
  `app/layout.tsx`.
- `ChapterDetail.test.tsx` — the date renders before the "What I built"
  label, both for a full chapter and for one with no summary.
- The whole suite is green. If a pre-existing test fails, it is a regression
  from this feature until proven otherwise — the career panel's existing
  tests do not assert ordering today, so nothing there should break.

These tests cannot tell you the page stopped scrolling sideways. Only Part 2
can.

---

## 2. Manual — geometry (SC-007)

```bash
npm run dev     # http://localhost:3000
```

Use the browser's device toolbar (Chrome DevTools: Cmd+Shift+M; Safari:
Develop → Enter Responsive Design Mode). At each width below, set the
viewport, then reload — some overflow only appears after a fresh layout.

### The measurement

In the browser console, at each width:

```js
document.documentElement.scrollWidth - document.documentElement.clientWidth
// Expected: 0
```

To find a culprit if it is not 0:

```js
[...document.querySelectorAll('*')]
  .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
  .map((el) => [el.tagName, el.className]);
```

### The matrix (SC-001, SC-002)

| Width | Portrait | Landscape | Notes |
|---|---|---|---|
| 320px | [ ] | — | Narrowest supported; watch headings and technology tags |
| 360px | [ ] | — | |
| 375px | [ ] | [ ] | Also run the 200% zoom check here |
| 390px | [ ] | — | |
| 414px | [ ] | — | |
| 430px | [ ] | — | |
| 768px | [ ] | [ ] | Upper bound of the spec's "mobile" range |

At 375px additionally set browser zoom to 200% and re-run the measurement.

Repeat the whole matrix in **both themes**. The dark design sits behind the
experiment flag, so reach it at
`http://localhost:3000/?experiment=true` and use the theme toggle in the bar.

### Scroll-behaviour checks (SC-003, User Story 2)

At 375px, scroll from the very top to the footer and confirm at each chapter
boundary:

- [ ] The navigation bar is still pinned at the top and fully visible.
- [ ] Its left and right gutters are unchanged from the previous sample, and
      match the chapters' gutters.
- [ ] The bar never slides sideways relative to the content beneath it.
- [ ] The progress hairline on the bar's bottom edge advances with the
      scroll and is full at the bottom of the page.
- [ ] Tapping a section link in the hamburger menu still scrolls smoothly to
      that anchor (FR-004 — the containment choice must not have broken it).
- [ ] The pinned backdrop photograph is still pinned, not scrolling with the
      content (FR-004, ADR 0015).

### Menu transit check (User Story 1, scenario 3)

- [ ] Open the hamburger menu, scroll it, follow a link, and reopen it.
      During and after each step, re-run the `scrollWidth - clientWidth`
      measurement — still 0.

### Content-integrity checks (FR-003, SC-005)

- [ ] No text is cut off mid-word or clipped at either edge at any width.
- [ ] The contact chapter's glow still reads as a soft, wide wash behind the
      heading — not a narrower blob, and with no hard vertical edge where it
      meets the section boundary.
- [ ] The chapter gradient washes and the hero's gradient layers still cover
      the full width of their chapters.
- [ ] Compare against the pre-fix build if anything looks doubtful:
      `git stash` your changes, reload, look, `git stash pop`.

### Career panel check (User Story 3, SC-004)

At any width, in the career chapter:

- [ ] In the interactive pitch view, select each chapter in turn. For every
      one, the date appears above the "What I built" summary.
- [ ] No chapter shows a date at the foot of the panel, and none shows two.
- [ ] The date keeps its calendar mark and monospaced styling.
- [ ] Switch to the plain list view — it is unchanged, dates still in the
      left rail.

---

## 3. Recording the result

SC-007 requires each manual check to be recorded as passed. Paste the
completed matrix and checkboxes into the implementation's handoff notes or
the pull request description — the value is the record that they were run at
every width, not just at the one the developer happened to have open.

## If a check fails

- **Still scrolls sideways** → use the culprit-finding snippet above; the
  fix is containment at that element's *section*, never a global guard
  (research R2).
- **Navigation bar still desyncs after overflow is zero** → research R3's
  prediction was wrong. Look for a `transform`, `filter` or `contain` on an
  ancestor of `StoryProgressNav`, any of which makes that ancestor the
  containing block for a sticky child. Escalate to the architect before
  changing the bar's positioning scheme.
- **A blurred element gained a hard edge** → containment was applied too far
  in; move it out to the full-width section (research R2, "Where to apply
  it").
