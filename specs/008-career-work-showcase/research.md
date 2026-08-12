# Phase 0 Research: Career & Work Showcase

The spec left no `[NEEDS CLARIFICATION]` markers. Research here confirms the technical approach
against the existing codebase and the `showcase/` reference prototype.

## Decision: Derive career-chapter fields, don't extend the Experience schema

**Decision**: `CareerPitch` computes company (`experience.subtitle`), role (`experience.title`),
years (`experience.dateText`), achievements (`experience.workDescription`), and tech
(`experience.technologies`) directly from the existing `Experience` type. Chronological order comes
from parsing `dateText`. Pitch position comes from a fixed formation list assigned by sorted index,
not stored per-experience.

**Rationale**: Every field the reference's `CareerMatch` component needs already exists on
`Experience` except pitch x/y and chronological `order` — and both of those are derivable, not
inherently descriptive data. Storing them in JSON would require someone to hand-maintain pitch
coordinates in sync with a growing experience list; computing them means a new job just slots in.
This keeps the content schema stable and avoids a content-authoring dependency blocking
implementation.

**Alternatives considered**:
- **Add `x`, `y`, `order`, `position` fields to `Experience`**: rejected — turns a content update
  (adding a job) into a coordinate-geometry exercise, and the reference prototype's own hand-placed
  coordinates were tuned to exactly six players; a real list won't stay at six.
- **Auto-layout via a physics/force simulation**: rejected as over-engineering (Principle I, KISS)
  — a fixed formation-style layout (reusing the same defender/midfielder/attacker slot pattern
  `SkillsFormation` already had, before deletion) is simple, deterministic, and already proven in
  this codebase.

## Decision: Extend `Project` with optional `year`/`role`/`metric`, backfilled from existing text

**Decision**: `Project` gains three optional fields. `metric` is backfilled from a number already
present in each project's existing `bodyText` (e.g. "99.99% uptime", already written) rather than
inventing new figures. `role` is inferred from context already in `bodyText` (e.g. "Led
cross-functional team of 8" → "Tech Lead"). `year` is left absent for now — the component omits the
year badge when absent rather than guess at a date not in the source data; a future content pass can
add it.

**Rationale**: `ProjectsFileSchema` already caps `items` at 10 and validates before use (ADR 0003);
adding optional fields is backward compatible with every other consumer of `Project` (the existing
Projects gallery chapter is untouched — it doesn't read the new fields, so nothing breaks there).
Sourcing `metric` from text the project's own author already wrote avoids fabricating credentials.

**Alternatives considered**:
- **Require all three fields, block on real authored content**: rejected — would stall
  implementation on a copywriting task unrelated to the mechanism being built; optional fields with
  graceful omission let the component ship correctly today and improve later.
- **Compute metric/role via free-text parsing at render time**: rejected — fragile, and turns display
  logic into content-guessing logic; a stored field the content author can hand-correct is simpler.

## Decision: Reuse `SVGPitch`, extend rather than replace

**Decision**: `CareerPitch` renders inside the existing `components/Career/SVGPitch.tsx`, passing
the reference's build-up-route polyline and player markers as `children` — the same composition
`SkillsFormation` already used for its (now-deleted) dot markers.

**Rationale**: `SVGPitch` already provides a spec-accurate, accessible (`role="presentation"`,
`aria-label`), responsive pitch background. Rebuilding it would duplicate working code for no gain.

**Alternatives considered**: A from-scratch pitch matching the reference's simpler CSS-only pitch
lines (no grass-green fill, thin border-based markings) — rejected; the existing `SVGPitch` reads
as more "football pitch," which is closer to what `SkillPosition`'s dots and this project's own
prior football-metaphor work already established as house style.

## Decision: Gradient overlays as a static, low-opacity image inside the existing scrim

**Decision**: `ChapterGradientOverlay` renders a single `next/image` (one of `mesh-soft.png` /
`mesh-soft-flip.png`) absolutely positioned inside a chapter's existing `chapter-scrim` wrapper, at a
low fixed opacity, with a `dark:opacity-0` cutoff — the same contrast-safety rule
`specs/007-parallax-gradient-scroll` established for the Hero's gradients (three of the four source
images are bright washes that would otherwise dilute dark-mode text contrast below AA). No drift, no
parallax — static, because these sections aren't the opening and don't need a foreground depth cue,
only the visual texture "take the gradient background from there" asked for.

**Rationale**: Reuses a proven, tested pattern instead of inventing a second one. Keeps
`backdrop-coverage.test.tsx`'s existing assertions valid (no `bg-gradient-to-br`, scrim count still
equals chapter count outside the Hero) since the overlay is a positioned image, not a background
utility class.

**Alternatives considered**:
- **`bg-mesh-soft`-style full CSS background per section (the reference's actual approach)**:
  rejected outright — this is precisely the "opaque per-chapter background" ADR 0015 replaced with
  the single pinned photograph, and the constitution forbids reintroducing it without an amendment.
- **Reuse `HeroGradientLayers` directly**: rejected — that component drifts four layers via
  `HeroDrift`, built for the opening's foreground depth cue. These sections need one static texture
  layer, not four parallaxing ones; a shared, simpler component avoids over-fitting Career/Work to
  Hero-specific behaviour they don't need.

## Decision: Principle band parallax reuses `HeroDrift`'s scroll-linked transform pattern

**Decision**: `PrincipleBand` uses the same `useScroll`/`useTransform` primitives as `HeroDrift`,
applied to one background image and its text at two different transform magnitudes, with the same
read-before-first-paint `prefers-reduced-motion` handling.

**Rationale**: This is the one section in this feature that genuinely needs motion (background moves
slower than text while scrolling past it, per spec User Story 3) — reusing the established,
already-tested pattern is simpler than the reference's raw `requestAnimationFrame` + manual
`getBoundingClientRect` scroll listener, which duplicates what Framer Motion's `useScroll` already
does.

**Alternatives considered**: Porting the reference's raw scroll-listener implementation verbatim —
rejected; this codebase has a working, tested abstraction for exactly this need already.
