# ADR 0009: RoughJS (via rough-notation) as a third animation library

- **Status**: Accepted
- **Date**: 2026-08-10
- **Amends**: [ADR 0005](0005-gsap-and-framer-motion.md) — raises its two-library ceiling to three

## Context

The hero is being rebuilt around hand-drawn annotations: the role phrases
("Software Engineer", "AI enthusiast", "Security Nerd") get marker-style
marks scrawled over them — highlight, circle, underline — that draw on as
the page loads.

ADR 0005 deliberately settled on exactly two animation libraries and named
bundle size (~40KB gzipped) as the accepted cost, with the rule "scroll →
GSAP, interaction → Framer". The project constitution's Principle IV then
fixes that stack as non-negotiable, changeable only by amendment.

The effect requested here fits neither existing library's domain. It is not
scroll-sequenced and it is not component interaction motion — it is
*generated path geometry* that looks hand-drawn: seeded-random stroke
jitter, multi-pass sketchy outlines, five distinct mark types.

## Decision

Adopt **`rough-notation` 0.5.1** (which bundles a trimmed RoughJS) as a
third rendering/animation library, and amend ADR 0005's ceiling from two
libraries to three.

The domain boundary becomes:

- **GSAP + ScrollTrigger** — scroll-driven, timeline-scrubbed motion
- **Framer Motion** — component entrance/exit and interaction motion
- **RoughJS (rough-notation)** — hand-drawn annotation marks over text

Each library has one stated domain and no overlap. Adding a fourth requires
another amendment.

Usage is confined to a single wrapper component,
`components/Common/RoughAnnotation.tsx`, so the dependency is swappable
without touching the hero.

## Consequences

**Positive**

- Delivers the exact requested effect. RoughJS exists to make vector shapes
  look hand-sketched; this is its purpose, not a workaround.
- ~9KB gzipped, no external runtime dependencies.
- Isolated behind one wrapper — a future swap touches one file.
- Reuses the project's existing `prefersReducedMotion()` helper rather than
  introducing a third reduced-motion detection path.

**Negative**

- Three animation libraries in the bundle, ~49KB gz combined. The ceiling
  ADR 0005 set has moved once; it will be easier to argue for moving again.
  Mitigated by requiring an amendment each time and by giving every library
  a non-overlapping domain.
- A third mental model for contributors. The domain rule above is the
  mitigation — if the answer isn't "scroll", "interaction", or "hand-drawn
  mark", none of the three is the right tool.
- Annotations are drawn client-side after measuring layout, so they cannot
  be server-rendered. The underlying text always renders regardless, so
  this degrades to plain text rather than to nothing.

## Alternatives rejected

- **Hand-rolled CSS/SVG**: a CSS highlight is trivial, but a credible
  hand-drawn circle or box means reimplementing RoughJS's path roughening —
  seeded randomisation, multi-pass stroke offsetting, per-mark geometry.
  Dozens of lines of exactly the "clever tricks" Principle I forbids, to
  reproduce a solved problem.
- **Framer Motion**: animates values and transforms, not generated path
  geometry. The rough paths would still need authoring by hand; Framer
  would only animate their reveal.
- **GSAP DrawSVGPlugin**: a paid Club GreenSock plugin, and it still
  requires hand-authored rough paths. Rejected on both cost and the same
  underlying geometry problem.
