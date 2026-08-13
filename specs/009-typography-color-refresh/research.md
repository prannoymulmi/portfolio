# Phase 0 Research: Typography & Color Refresh

**Feature**: `009-typography-color-refresh` | **Date**: 2026-08-13

Two things were unresolved from the spec: whether the exact oklch values the user supplied
actually clear the WCAG AA floors the spec (FR-006) requires once composited the way the site
actually composites them, and how the new fonts should be loaded without regressing the
Lighthouse/CLS floor the constitution already holds the site to. Both are resolved below with
measurements, following the same method ADR 0015 and ADR 0020 used (sample or convert, don't
guess).

---

## R1: Do the given color tokens clear WCAG AA on every surface FR-006 names?

**Method**: converted each oklch value to sRGB via the OKLab matrices (same math the browser
uses for `oklch()`), computed WCAG relative luminance per token, and checked contrast against
(a) the bare background, (b) a card/panel tint composited over the pinned photograph's darkest
sampled region (L=0.293, from ADR 0015's sampling of `normal.jpg` — unchanged by this feature),
and (c) solid primary/accent fills, per the clarification that extended FR-006 to button/badge
text.

**Measured** (sRGB hex / relative luminance):

| Token | sRGB | Rel. luminance |
|---|---|---|
| background | `#fff9ee` | 0.9518 |
| foreground | `#35190a` | 0.0147 |
| primary | `#f65600` | 0.2625 |
| primary-foreground | `#fffbf3` | 0.9673 |
| accent | `#fd9f07` | 0.4569 |
| muted-foreground | `#7f5944` | 0.1207 |
| card | `#fffdf6` | 0.9816 |

**Contrast results**:

| Pair | Ratio | AA (4.5:1)? |
|---|---|---|
| foreground vs background | 15.47:1 | Pass |
| muted-foreground vs background | 5.87:1 | Pass |
| foreground vs card/panel over photo (42% alpha, ADR 0015's existing opacity) | 9.77:1 | Pass |
| muted-foreground vs card/panel over photo (42% alpha) | 3.70:1 | **Fail** |
| foreground vs bare photo, no panel (worst-case direct placement) | 5.30:1 | Pass (thin margin) |
| muted-foreground vs bare photo, no panel | 2.01:1 | **Fail** |
| **primary-foreground vs primary fill** (button/badge text, as literally named) | **3.26:1** | **Fail** |
| foreground vs primary fill | 4.83:1 | Pass (thin margin) |
| **primary-foreground vs accent fill** | **2.01:1** | **Fail** |
| foreground vs accent fill | 7.83:1 | Pass |
| primary (as text color) vs background — e.g. `text-primary` accents | 3.21:1 | Fails normal-text AA; clears the 3:1 WCAG large-text/non-text floor only |

**Finding**: two of the token *pairings* implied by the names don't survive contact with the
site's actual compositing, even though every individual value is exactly what the user specified:

1. **`primary-foreground` fails against both `primary` and `accent` fills** (3.26:1 and 2.01:1).
   Pairing "foreground" tokens with their same-named fill by convention doesn't hold here — the
   near-white `primary-foreground` is too close in lightness to the mid-tone orange/amber fills.
2. **`muted-foreground` is not photo-safe.** It clears AA against the bare cream background
   (5.87:1) but fails against both the card/panel-over-photo composite (3.70:1) and the bare
   photo (2.01:1) — the same failure mode ADR 0015 already documented for `gray-600`/`gray-700`.

Neither finding changes any oklch *value* the user gave; both are about which named token gets
applied to which surface, which the spec (FR-006, added by clarification) already requires to be
verified rather than assumed.

### Decision

- **Text on solid primary/accent fills uses `foreground`, not `primary-foreground`.**
  `foreground` clears AA against both fills (4.83:1, 7.83:1); `primary-foreground` does not.
  `primary-foreground` is retained as a token (the user asked for it, and it may suit large
  display-scale use, icon fills, or non-text contexts where the 3:1 floor applies) but is not the
  default body/label text color on a primary or accent surface.
- **Text placed directly on the photo/scrim (not inside a card/panel) uses `foreground`, never
  `muted-foreground`** — this generalizes the existing `text-on-photo` token (currently
  `gray-900`/`gray-100`) to the new palette rather than replacing it with a token that fails.
  `muted-foreground` remains available for de-emphasized text on the bare background or inside an
  opaque-enough card, where it measures 5.87:1.
- **`text-primary` accents are reserved for large-scale or non-text use** (headline words, big
  stat numbers, icons, underlines/borders) where the 3:1 large-text/UI-component floor applies,
  not for body-sized copy — 3.21:1 fails the 4.5:1 bar FR-006 sets for body copy, labels, and
  captions.
- **The card/panel tint keeps ADR 0015's existing 42% opacity.** At that opacity the new `card`
  tint composited over the photo's darkest region still clears AA for `foreground` (9.77:1); no
  research supports changing the opacity for this feature.

### Alternatives considered

- **Darken `primary-foreground` or `muted-foreground` until they pass everywhere**: rejected —
  the user supplied these values explicitly; changing a value they gave is a bigger step than
  choosing which existing, already-passing token (`foreground`) covers the surfaces the named
  token can't. If a future design pass wants a literal near-white button label, that's a new
  value decision for that pass, not a substitution made silently here.
- **Add a new `accent-foreground` / `on-primary` token**: unnecessary — `foreground` already
  clears AA on both fills, so introducing a tenth token for the same result adds a name to track
  without adding contrast margin.

---

## R2: How should Space Grotesk and JetBrains Mono be loaded?

**Context**: the site currently loads Geist and Geist Mono via `next/font/google` in
`app/layout.tsx`, exposing them as `--font-geist-sans` / `--font-geist-mono`, consumed by
`@theme inline` as `--font-sans` / `--font-mono`. The constitution requires no CLS/FOIT
regression and a Lighthouse floor of ≥90; the spec's FR-008 requires the same for this swap
explicitly.

### Decision

Load both replacement faces the same way, through `next/font/google`, which self-hosts the
font files at build time (no runtime request to Google, no render-blocking `@import`) and sets
`font-display: swap` by default:

- `Space_Grotesk` at weights `["400","500","600","700"]`, variable name `--font-display`.
- `JetBrains_Mono` at weights `["400","500"]`, variable name `--font-mono-ui`.
- Both subset to `latin` (matches the existing Geist configuration; the site has no
  non-Latin content).
- `@theme inline` maps `--font-display` and `--font-mono-ui` through as the spec names them,
  replacing the `--font-sans` / `--font-mono` mapping so `font-display`/`font-mono-ui` (or
  equivalently the existing `font-sans`/`font-mono` utility names, remapped) resolve to the new
  faces everywhere `font-sans`/`font-mono` is used today (7 files).
- A system-font fallback stack (`ui-sans-serif, system-ui, sans-serif` for display;
  `ui-monospace, monospace` for mono) renders during the swap window, matching the fallback
  pattern `next/font` already generates automatically via its adjusted-metrics fallback — no
  manual fallback-metric tuning needed.

### Alternatives considered

- **`@font-face` + self-hosted static files without `next/font`**: `next/font/google` already
  provides this (download-at-build, self-host, no external request) with less code and adjusted
  fallback metrics generated automatically; hand-rolling it would duplicate what the framework
  already does for the existing Geist setup.
- **A `<link>` to Google Fonts' CDN**: rejected — adds a render-blocking external request and
  loses the automatic fallback-metric CLS mitigation `next/font` provides; also contradicts the
  self-hosting the site already uses for Geist.

---

## Summary of resolved unknowns

| Unknown | Resolution |
|---|---|
| Do the given oklch values pass AA everywhere FR-006 requires? | Yes, once `foreground` (not `primary-foreground`) is used as text on primary/accent fills and as the photo-safe text color; documented in R1. |
| How to load Space Grotesk / JetBrains Mono without CLS/FOIT regression? | `next/font/google`, same pattern as the existing Geist setup, mapped to `--font-display` / `--font-mono-ui`. |
