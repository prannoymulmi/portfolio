# Quickstart: Typography & Color Refresh

Validates the acceptance scenarios in `spec.md` against a running build. Contrast against the
pinned photograph can't be asserted in jsdom (same limitation ADR 0015 recorded), so part of this
is a manual sweep — same pattern `specs/004-photo-background-hero-merge/quickstart.md` already
uses.

## Prerequisites

- `npm install` (root project; `--legacy-peer-deps` per ADR 0007)
- `npm run dev`, open `http://localhost:3000`
- Browser DevTools with a contrast checker (e.g. the Elements panel's color picker), or the
  browser's built-in accessibility inspector

## Automated checks

```sh
npm run type-check
npm run lint
npm test
```

Expect: no new failures. `tests/unit/components/*.test.tsx` for every touched component
(`Hero`, `HeroGradientLayers`, `HeroParallax`, `HeroPortrait`, `CareerPitch`, `Footer`,
`SocialIcons`, `ThemeToggle`, `ThreeSystems`, `PrincipleBand`, `ContactSection`, `CvLink`,
`EmailLink`, `RoughAnnotation`, `StoryProgressNav`, `ValueProp`, `ChapterGradientOverlay`,
`Backdrop`) still passes — FR-010/SC-005 require behavior to be unchanged, so existing
interaction assertions are the regression gate.

## Manual validation

### 1. Typefaces load site-wide (User Story 1, FR-001/002)

1. Load `/` with DevTools' Network tab open, filtered to `Font`.
2. Confirm two font families download: Space Grotesk (weights 400/500/600/700) and JetBrains
   Mono (weights 400/500) — self-hosted (same origin, not `fonts.gstatic.com`).
3. Scroll from Hero to Contact. In each chapter, inspect a heading and a body paragraph:
   `font-family` computes to the Space Grotesk stack. Inspect an uppercase label/eyebrow/tag:
   `font-family` computes to the JetBrains Mono stack.

### 2. Colors apply across all 8 chapters (User Story 1, FR-003/009, SC-001)

Scroll through Hero → Work → parallax principle band → Career → Education → Projects →
Skills/playbook → Contact. For each: background reads cream/warm-white, body text reads the
warm dark-brown foreground, no chapter still shows the previous default gray/blue palette.

### 3. Labels and accents are consistent (User Story 2, FR-002/005, SC-004)

Pick one label/tag/eyebrow and one primary CTA/highlighted metric in each chapter. Confirm the
label uses the mono treatment and the CTA/metric uses the same primary or accent color, in every
chapter — no chapter using a different weight, case, or hue for the same role.

### 4. Contrast holds on every surface (User Story 3, FR-006, SC-002)

Using a contrast checker on the rendered (not source) color:

| Surface | Text | Expect |
|---|---|---|
| Bare background | `foreground` body copy | ≥ 4.5:1 |
| Bare background | `muted-foreground` caption | ≥ 4.5:1 |
| Card/panel over the pinned photo (any chapter using `chapter-panel`) | body copy | ≥ 4.5:1 |
| Directly on the photo/scrim, no panel (e.g. Hero copy) | body copy | ≥ 4.5:1 — must read `foreground`, not `muted-foreground` (research R1) |
| A primary-filled button/CTA | its label | ≥ 4.5:1 — must read `foreground`, not `primary-foreground` (research R1) |
| An accent-filled badge/metric | its label | ≥ 4.5:1 — must read `foreground` |

If any row shows `primary-foreground` as body-sized text on a `primary`/`accent` fill, or
`muted-foreground` on the photo/scrim, that's the exact failure research R1 predicted — flag it
before shipping.

### 5. Font loading doesn't regress CLS/Lighthouse (FR-008, SC-003)

1. DevTools Performance panel, record a hard-refresh load of `/`.
2. Confirm no visible flash of invisible text; fallback text should be visible immediately with
   `next/font`'s adjusted-metrics fallback, then swap without a visible reflow.
3. `npm run build && npm start`, run Lighthouse against the production build: Performance ≥ 90
   (constitution floor), CLS contribution from fonts negligible.

### 6. Existing interactions are unchanged (FR-010, SC-005)

- Career: click through players on the pitch; the pass animation, card reveal, and "Play in
  order" / timeline flow all behave exactly as before — only their colors/type changed.
- Scroll-triggered motion (Hero parallax, `StoryProgressNav`, `PrincipleBand`) still animates,
  still respects `prefers-reduced-motion` (toggle it in DevTools' Rendering tab and confirm
  motion stops).
- Experimental dark theme: visit `/?experiment=true`, toggle the theme control, confirm it still
  works (FR-007) — its colors are unchanged by this feature.

## Sign-off

All six checks pass → feature meets its acceptance scenarios. Any manual-check failure blocks
merge, same as ADR 0015's precedent for contrast checks jsdom can't cover.
