# ADR 0015: The photograph is the page surface

- **Status**: Accepted
- **Date**: 2026-08-10
- **Extends**: [ADR 0013](0013-hero-player-card.md) — promotes the hero's backdrop
  to the surface the whole story sits on.

## Context

[ADR 0013](0013-hero-player-card.md) put a sunset photograph behind the opening. Every
other chapter painted its own near-white gradient, so the page read as one photographic
panel followed by seven flat ones, with the decorative SVG accent from feature `002`
layered behind all of them.

Making one surface out of it raised three questions that could not be answered by taste.

**Can text sit on it at all?** Sampling `public/images/normal.jpg` on a 32×20 grid gives a
relative luminance range of **0.293 – 0.830**, median 0.626. The photograph has no dark
regions. That inverts the intuition the work started with: dark text is safe, and *light*
text in dark appearance is the constraint.

| Text colour | Luminance | Contrast vs the photo's darkest region |
|-------------|-----------|----------------------------------------|
| `gray-900` | 0.0092 | **5.79:1** — passes AA |
| `gray-700` | 0.0519 | **3.37:1** — fails AA |
| `gray-600` | 0.0782 | 2.68:1 — fails AA |

**What does it cost?** The file is **5600×3550, 1.73 MB**, and was referenced through CSS
`background-image` — which the image optimizer never touches. Every visitor was already
downloading all of it, at every viewport size, to see the opening.

**Does it still move?** The opening parallaxed its own copy of the photograph. A backdrop
that moves cannot also be the continuous surface seven chapters share.

## Decision

**One pinned photographic layer for the whole document**, rendered by
`components/Common/Backdrop.tsx` and mounted once in the root layout.

- **Pinned, not parallaxed.** A `fixed inset-0 -z-10` element, not
  `background-attachment: fixed`, which is unreliable on iOS Safari.
- **Served through `next/image`** with `fill`, `sizes="100vw"` and `preload`, so the
  asset is responsive and format-optimized instead of shipped raw. Note `priority` is
  deprecated in Next 16; `preload` replaces it.
- **Chapters carry a scrim, not a background.** One `chapter-scrim` utility in
  `app/globals.css` — white at 42% in light, near-black at 55% in dark.
- **Body copy over the scrim uses a `text-on-photo` token**, `gray-900` in light and
  `gray-100` in dark, replacing the `gray-600`/`gray-700` that measured below AA.
- **Dark appearance holds the photograph at 20%.** The measured ceiling before body text
  drops below 4.5:1 is ~41%; the opening previously sat at 40%, right on the edge.
- **The depth cue moves to the foreground.** `HeroDrift` drifts the player card and the
  role bars at different strengths against the now-static photograph.
- **`public/images/background.svg` is deleted** (557 KB) — two backdrops would fight.

## Consequences

**Positive**

- The story reads as one surface. There is no boundary for a seam to appear at.
- **Page weight falls.** The optimizer replaces a 1.73 MB original with responsive
  AVIF/WebP variants, and 557 KB of SVG accent goes with it — so showing far more
  photograph costs less than showing less of it did.
- The contrast floor is now a measured number in a comment, not a judgement. Anyone
  changing the scrim can check their change against it.
- Reduced motion is cleaner than before: the drift reads `prefers-reduced-motion` during
  the first render rather than in an effect, so there is no frame of movement before it
  switches off.

**Negative**

- **The palette is now tuned to one photograph twice over** — ADR 0013 sampled the hero
  colours from it, and the scrim and text tokens are derived from its luminance range.
  Swapping the photo means re-deriving both. The measurement method is written down so
  that is a repeatable job rather than guesswork.
- **A bright photograph constrains dark appearance permanently.** Dark mode can never show
  it at full strength without failing AA. It is present at 20% as a low ember, which is a
  compromise, not the ideal.
- **Contrast cannot be asserted in tests.** jsdom has no compositing, so
  `specs/004-photo-background-hero-merge/quickstart.md` carries a manual sweep at the top,
  middle and bottom of every chapter. A manual gate is weaker than a test, and this is the
  feature's main risk.
- The footer keeps its own opaque surface, so the photograph stops at it. Deliberate — the
  footer is page furniture, not a chapter — but it is a visible edge.

## Alternatives rejected

- **Keep the parallax on the backdrop**: the movement that reads as depth against one
  section's boundary reads as a drifting seam when there are seven. It also requires the
  image to be oversized enough never to run out.
- **Per-chapter scrims tuned to the photo region behind them**: there is no such region —
  the backdrop is fixed and the chapters scroll over it, so nothing stable is behind any
  chapter to tune against.
- **Blur the backdrop**: fixes legibility outright, destroys the photograph as an image,
  and costs a repaint.
- **Hand-downscale the JPEG and keep the CSS background**: a one-time win that re-arms the
  same trap the next time the photo is replaced, and still serves one size to every device.
