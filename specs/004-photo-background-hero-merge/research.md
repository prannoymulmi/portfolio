# Phase 0 Research: One photo backdrop, a shorter opening, social links in the nav

**Feature**: `004-photo-background-hero-merge` | **Date**: 2026-08-10

Four unknowns blocked the design: whether the photograph can carry text at all, what the
photograph costs to serve page-wide, which icon package to adopt, and which animation
library owns the foreground drift. All four are resolved below with measurements rather
than estimates.

---

## R1: Can text sit on the photograph and still pass WCAG AA?

**Method**: downsampled `public/images/normal.jpg` to a 32×20 grid (640 samples) and
computed WCAG relative luminance per sample.

**Measured luminance distribution**:

| min | p05 | p25 | median | p75 | p95 | max |
|-----|-----|-----|--------|-----|-----|-----|
| 0.293 | 0.347 | 0.503 | 0.626 | 0.706 | 0.776 | 0.830 |

**Finding**: the photograph has no dark regions at all. Its darkest sample (0.293) is
brighter than mid-grey. This inverts the assumption the spec was written under — the risk
is not dark text disappearing, it is *light* text and mid-grey text failing.

Contrast of the existing text colours against the photograph's **darkest** region:

| Text colour | Luminance | Contrast vs L=0.293 | AA body (4.5:1) |
|-------------|-----------|---------------------|-----------------|
| `gray-900` `#111827` | 0.0092 | **5.79:1** | Pass |
| `gray-700` `#374151` | 0.0519 | **3.37:1** | **Fail** |
| `gray-600` `#4B5563` | 0.0782 | 2.68:1 | **Fail** |

### Decision

Light appearance needs **no scrim to pass AA**, provided body text is `gray-900` or
darker. Since several chapters currently use `gray-700`/`gray-600` for body copy, two
things are required together:

1. Darken body text over the backdrop to `gray-900`.
2. Keep a **white scrim at 35–45% opacity** per chapter — not for AA (the numbers pass
   without it) but because a photograph with fine detail hurts *legibility* even when
   contrast passes, and it buys headroom if the photograph is ever swapped.

A 22% white scrim is the mathematical floor that would rescue `gray-700`; 35–45% is
chosen for margin and readability, and still leaves the photograph clearly visible.

**Dark appearance** is the binding constraint. With `gray-100` text (L≈0.83) on
`gray-900`, the photograph's brightest region (0.830) may be composited at no more than
**~41% opacity** before body text drops below 4.5:1. The opening currently uses
`dark:opacity-40` — right at the edge. Set the page-wide backdrop to **18–22%** in dark
appearance, matching what the retired SVG accent used, for real margin.

### Alternatives considered

- **Per-chapter scrim tuned to the region of photo behind it**: better fidelity, but the
  backdrop is fixed and the chapter scrolls over it, so there is no stable "region behind
  this chapter" to tune against. Rejected as unimplementable.
- **Blur the backdrop**: solves legibility, but destroys the photograph as an image and
  costs a repaint on scroll.

---

## R2: What does the photograph cost to serve page-wide?

**Measured**: `public/images/normal.jpg` is **5600×3550, 1.73 MB**. It is referenced today
through CSS `background-image: url(...)`, which means **Next's image optimizer never
touches it** — every visitor downloads the full 1.73 MB original, at any viewport size.

Today that cost is already paid for the opening. Making it the page-wide backdrop does not
add a second download, but it does move it decisively onto the LCP path, and SC-007
requires Lighthouse ≥ 90.

### Decision

Render the backdrop through the framework's image component (`fill` + `priority` +
`sizes="100vw"`) inside the existing fixed layer, instead of a CSS `background-image`.
`next.config.ts` already requests AVIF and WebP, so this yields responsive, modern-format
variants of an asset that is currently served raw. Expected: **1.73 MB → under 200 KB** on
a typical viewport.

Deleting `public/images/background.svg` (**557 KB**, FR-006) is a further saving, so the
feature should reduce total page weight despite showing more photograph.

### Alternatives considered

- **Hand-downscale the JPEG and keep CSS**: one-time win, but re-introduces the same trap
  the moment the photo is replaced, and serves one size to every device.
- **`background-attachment: fixed`**: the obvious CSS route for a pinned backdrop, but it
  is unreliable and janky on iOS Safari. The repo already avoids it — the retired SVG
  accent used a `fixed inset-0 -z-10` element instead. Keep that pattern.

---

## R3: Which icon package?

The clarification session chose to take a dependency (spec FR-008a). Candidates, checked
against the npm registry today:

| Package | Version | React 19 peer | Unpacked | Brand marks? |
|---------|---------|---------------|----------|--------------|
| `@icons-pack/react-simple-icons` | 13.13.0 | `^16.13 \|\| ^17 \|\| ^18 \|\| ^19` | 26 MB | Yes — Simple Icons set |
| `react-icons` | 5.7.0 | `*` | 88 MB | Yes — many sets incl. Simple Icons |
| `lucide-react` | 1.31.0 | `^16.5.1 … ^19.0.0` | — | **No** — lucide carries no brand logos |
| `simple-icons` | 16.28.0 | n/a (not React) | — | Yes, raw path data only |

### Decision

Adopt **`@icons-pack/react-simple-icons`**.

- Per-icon named exports (`SiLinkedin`, `SiGithub`) — only the two glyphs used reach the
  bundle, satisfying FR-008b.
- Declares React 19 in its peer range, so it adds **no new peer conflict**; the install
  still needs `--legacy-peer-deps` for the pre-existing reason in ADR 0007.
- MIT-licensed package wrapping CC0-licensed icon data.
- A third of react-icons' install footprint, and scoped to brand marks rather than a
  general icon set nobody asked for.

**Licensing note for the ADR**: Simple Icons' *data* is CC0, but the marks themselves are
trademarks of LinkedIn and GitHub. Using them as links to those profiles is nominative
use — which is what this feature does. Worth stating in the ADR so nobody later reuses
them decoratively.

### Alternatives considered

- **`lucide-react`**: ruled out on fact, not preference — lucide removed brand logos, so
  it cannot render a LinkedIn or GitHub mark at all.
- **`react-icons`**: works and tree-shakes, but pulls an 88 MB install to render two
  glyphs and declares `react: "*"`, which asserts nothing about React 19 compatibility.
- **Hand-committed SVG paths**: rejected by the user in clarification. Would have avoided
  the governance work entirely.

---

## R4: Which library drives the foreground drift?

Constitution Principle IV fixes three animation libraries with non-overlapping domains:
GSAP for scroll-sequenced motion, Framer Motion for component/interaction motion,
rough-notation for annotation marks.

Scroll-linked drift looks like GSAP's domain by that rule. But ADR 0005 names
`HeroParallax` explicitly as a **Framer** component, and the existing implementation uses
Framer's `useScroll` + `useTransform`. `StoryProgressNav` does the same for its progress
bar.

### Decision

Keep the drift in **Framer Motion**, extending the existing `HeroParallax` component
rather than introducing GSAP into the opening.

The domain rule is about *timeline-scrubbed sequences* — GSAP's ScrollTrigger earns its
place on the career pitch, where scroll position drives a multi-step timeline. A single
value mapped from scroll offset to a transform is Framer's `useTransform`, and switching
libraries for it would mean loading GSAP in the initial bundle, which ADR 0012's lazy
imports deliberately avoid.

**No constitution change is needed for this** — it stays inside ADR 0005's stated split,
which named hero parallax as Framer's example.

Reduced motion: `HeroParallax` already reads `prefers-reduced-motion` and maps the
transform range to `[0, 0]`. FR-007b (no layout shift when off) is satisfied by that
approach, since the element keeps its normal flow position and only its transform changes.

### Alternatives considered

- **GSAP ScrollTrigger for the drift**: a stricter reading of the domain rule, at the cost
  of pulling GSAP into the first load for one transform. Rejected on bundle cost.
- **CSS `animation-timeline: scroll()`**: no JS at all and genuinely elegant, but browser
  support is still uneven and it would be a fourth motion mechanism, which Principle IV
  forbids without an amendment.
