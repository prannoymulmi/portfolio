# ADR 0018: The hero card takes the collectible anatomy, and its colour becomes themed tokens

- **Status**: Accepted
- **Date**: 2026-08-11
- **Amends**: [ADR 0013](0013-hero-player-card.md) — replaces the card anatomy it
  specified, retires two of its elements, and resolves the inline-style negative it
  recorded. ADR 0013's text stands; see the note added there.

## Context

[ADR 0013](0013-hero-player-card.md) made the hero a player card: a deep-navy rectangle
with a title bar, three year-count stat pills, a portrait, an honours rail and a name
banner with a star rating. It was recognisably *a* card.

A rendered mock then set a much more specific target — a shield-shaped collectible in
warm ivory and gold foil, with a figure block, a position mark, a meta column, a cut-out
portrait bleeding past the frame, a name in condensed caps, five achievement rows and a
crest. Three constraints shaped how much of it could be built:

- ADR 0013 recorded a **known negative**: the card's colours are applied as inline
  `style`, because Tailwind scans class strings as literal text. An inline style cannot
  carry a `dark:` variant, so the card was the same navy in both themes. A two-edition
  card could not be built on that foundation.
- ADR 0013 **rejected a FIFA-style overall rating** in as many words: *"the card should
  not state a number nobody computed."* The mock leads with "91 OVR" in the largest
  position on the card.
- The mock's anatomy has **no slot** for the stat pills, the star rating or the
  soft-skill bars.

## Decision

### The anatomy is replaced

`PlayerCard` becomes the mock's arrangement, decomposed one component per region:
`CardFrame`, `FigureBlock`, `MetaColumn`, `HonoursList`, `CardCrest`, plus `CardIcons`
for the seven glyphs and `FoilSheen` for the one motion treatment.

The shield outline is a rounded rectangle plus a separate crown element, **not** a single
clipped SVG path. The card's height follows its content so it can stretch taller than the
mock's proportion on a narrow screen, and an SVG `clipPath` in `objectBoundingBox` units
distorts every corner radius as the aspect ratio changes.

### The figure block prints years, not a rating

The block keeps the mock's position, display size and weight, and prints the career total
with a `YRS` label. **ADR 0013's rule is upheld rather than amended.** This is the one
element of the mock the card deliberately does not reproduce, and it means the most
prominent number on the card is checkable.

### Card colour moves to themed tokens

Six custom properties — `--card-ground`, `--card-edge`, `--card-ink`, `--card-accent`,
`--card-foil`, `--card-foil-lite` — are declared under `:root` in `app/globals.css`,
re-declared under `.dark`, and exposed through `@theme inline` as `--color-card-*`. The
card consumes them as ordinary utilities (`bg-card-ground`, `text-card-ink`). There is not
one `dark:` variant or colour literal in the card tree.

This resolves ADR 0013's inline-style negative for the card. `components/Hero/palette.ts`
survives for the annotation bars, which are one colour in both themes.

The dark edition is a **black parallel** — the convention card sets use for rare
printings, where the stock goes black and the foil is warmed rather than dimmed. The same
three hue families, changed in value, not swapped.

### Colour is chosen against measurement

Two values deliberately differ from the mock, because measuring them showed they had to:

- The accent sampled off the mock (`#9A3B1E`) measures **6.02:1** on the ivory ground —
  AA, but short of the 7:1 that display-size type needs, and the position mark is
  display-size. It is darkened to `#822F16` for **7.68:1**.
- The light foil measures **3.79:1**. That clears WCAG 1.4.11's 3:1 for meaningful
  boundaries, so it is sound as a frame and rule colour, but it **must never carry text**.
  `tests/unit/card-contrast.test.ts` asserts this so nobody later sets a label in gold.

### The content contract changes

`PlayerCardSchema` gains `positionAbbrev`, `location` and `achievements`; it loses
`rating`, `stats`, `softSkills` and `blurb`. `achievements` is capped at five with at most
one `emphasis` row, both enforced in Zod, so content that would break the layout fails
loudly at load instead of quietly reshaping the card.

### One motion treatment

A sheen travelling the foil, in Framer Motion — interaction motion is its declared domain,
so no fourth library question arises. It gates on `prefersReducedMotion()` and renders
nothing when set. It cannot rely on the global `prefers-reduced-motion` rule in
`globals.css`, which collapses durations to `0.01ms`: applied to a travelling highlight
that does not remove it, it freezes it at its end position.

## What this gives up

Recorded deliberately, because the amendment would otherwise read as pure gain:

- **The per-area year counts are gone.** `stats` carried Backend 9 / Cloud 6 / Security 4
  — checkable figures, exactly the kind ADR 0013 was built around. The achievement rows
  carry evidence of a different kind: specific things done, unquantified.
- **The soft-skill bars are gone**, and they were not decoration. ADR 0013 introduced them
  as *"the bounded version of the same idea"* as the composite rating it rejected — five
  steps, no number printed, labelled as self-rated. Retiring them removes the card's only
  account of the part of the job years cannot count. The honours list is a different
  claim, not a replacement for that one.
- **The portrait is framed, not cut out.** The mock's figure stands past the frame. No
  background-removed asset exists, and producing one from the studio photograph was tried
  and failed: the grey backdrop spans `#494952`–`#959A9D`, and the subject's white shirt
  and black jacket sit inside that same range, so no threshold separates them. Flood-fill
  either leaves a halo around the hair or eats the face. The card ships with the framed
  fallback and reads as inspired-by rather than matching the mock in that one respect.
- **A display font is now on the LCP path.** One weight of Oswald, Latin-subset, ~20KB.
  Geist has no condensed cut and the compression is most of what makes the name banner
  read as a card rather than a heading, so the cost is accepted and measured.

## Consequences

**Positive**

- Both editions are defined side by side in one file, six values apart, which makes "does
  the dark edition preserve hue identity" a reviewable question rather than an opinion.
- The card's most prominent figure is checkable, and the honesty rule ADR 0013 set
  survives contact with a mock that violates it.
- Colour errors fail a test now. The mock's own accent would have shipped below AAA.
- Content still edits without code, and now fails loudly when it would break the layout.

**Negative**

- The content contract is breaking in both directions. A `home.json` written for either
  card fails against the other, which is why schema, types, content and components had to
  land together rather than as separate commits.
- The card is much taller than its predecessor, and tallest exactly where vertical space
  is scarcest. The pitch and its two calls to action stay ahead of it in source order
  (feature 005), and no `order-*` utility may be introduced.
- The 14px floor means the card is not a scale model of the mock at phone width. It
  stretches, and its outline proportion drifts. Legibility was chosen over proportion.

## Alternatives rejected

- **Reproducing "91 OVR" as drawn.** Would need this ADR to supersede ADR 0013's honesty
  rule rather than uphold it. Rejected: the card would print a number with no source, and
  the block's shape carries the design just as well with a real figure in it.
- **Paired `dark:` utilities instead of tokens.** Around forty paired classes, with the
  two editions scattered across the markup instead of adjacent in one file. Kept as the
  fallback if the token approach is ever rejected on review.
- **Keeping the stat pills or the soft-skill bars alongside the new anatomy.** Deviates
  from the mock by an element and makes an already dense card denser. Considered and
  declined explicitly, which is why the loss is recorded above rather than glossed.
- **An icon dependency for the seven glyphs.** ADR 0014 scopes `react-icons` to brand
  marks in one file; widening it needs a constitution amendment, and seven simple shapes
  do not justify one.
