# ADR 0020: The work showcase replaces the skills formation, and gradients overlay the surface

- **Status**: Accepted
- **Date**: 2026-08-12
- **Amends**: [ADR 0004](0004-football-pitch-metaphor.md) — the pitch now carries the career
  chapters only; it no longer carries skills.
- **Extends**: [ADR 0015](0015-photograph-as-page-surface.md) — states the rule for decorative
  gradients over the shared photographic surface.

## Context

Three things arrived together, from a reference prototype built outside this repo
(`showcase/`, gitignored): a "three systems" work showcase, a pass-the-ball career pitch, and an
engineering-principle band. Each touched a decision already on record.

**The skills formation had stopped meaning anything.** `SkillsFormation` scattered every entry in
`skills.json` across a 4-3-3 by `allPositions[index % allPositions.length]` — so "Java" sat at left
back and "Docker" at right wing for no reason a visitor could recover. [ADR 0004](0004-football-pitch-metaphor.md)
adopted the pitch because position encodes meaning; an index modulo encodes arrival order in a JSON
file. The chapter also answered a question nobody asks — a tool name proves nothing on its own.

**The career pitch had the same problem from the other side.** It drove a single anonymous marker
down the pitch from scroll position via GSAP ScrollTrigger. The visitor could not choose a chapter,
only scroll past all of them, and the pitch showed one dot rather than the shape of a career.

**The reference painted per-chapter gradient backgrounds** (`bg-mesh-soft` on each section). That is
precisely what [ADR 0015](0015-photograph-as-page-surface.md) removed when it made one photograph
the surface of the whole story: seven flat panels behind one photographic one.

## Decision

**1. `components/Skills/` is deleted; `components/Work/ThreeSystems` takes the `#skills` anchor.**
The chapter now shows three systems with what was built, the stack, and one headline metric each.
The anchor id is kept though the label became "Selected Work" — the footer, the progress nav and any
external link all target `/#skills`.

**2. The skills content path goes with it.** `skills.json` (both copies), `SkillsFileSchema`, the
`Skill`/`SkillCategory`/`SkillsFile` types, `SkillsSkeleton`, and the `skills` loader in
`ContentProvider` are removed. Nothing read them once the component was gone, and a loader that
survives its only consumer is a fetch on every page load for data nobody renders.

**3. `Project` gains optional `year`, `role`, `metric`.** Optional, and absent renders nothing —
no placeholder. The showcase makes claims about real professional work, so a fabricated year or role
costs more than a gap in the layout. `metric` must be traceable to a figure already stated in that
project's own `bodyText`.

**4. The career pitch is click-driven, not scroll-driven.** `CareerPitch` derives chapter order and
pitch position from `experiences.json` at render time — no schema change, no hand-maintained
coordinates. Selection is component state, so it behaves identically under touch, keyboard and
reduced motion. `PlayerAnimation.tsx` and `MilestoneCard.tsx` are deleted, and **GSAP leaves this
chapter entirely**. The plain `TimelineView` stays as the non-metaphor fallback.

Sorting is by a year extracted from `dateText`. The previous `new Date(a.dateText)` returned
`Invalid Date` for ranges like `"11/2020 – Present"`, so every comparison was `NaN` and the sort
silently did nothing.

**5. Decorative gradients overlay the surface; they never replace it.**
`components/Common/ChapterGradientOverlay` renders a low-opacity `next/image` *inside* a chapter's
existing scrim, full-bleed, with a `dark:` cutoff. Stated generally, not only for these chapters:

- never a `bg-*` utility or CSS `background-image` — both paint over the photograph and bypass the
  image optimizer;
- full-bleed, never inset to a content column — a wash with visible left and right edges reads as a
  background panel, which is the thing ADR 0015 removed;
- always a `dark:` cutoff. The mesh sources measure 0.84–0.93 mean relative luminance on a 32×18
  sample grid (the method ADR 0015 used for the photograph); over the near-black dark scrim they
  lift it enough to drop body text below AA.

This rule was first applied by feature 007 for the opening's parallax layers and went unrecorded.
Recording it here closes that gap.

## Consequences

**Positive**

- The chapter that replaced the skills list answers a question a reader actually has.
- The career is navigable. Any chapter is one click from any other, and the pitch shows the shape of
  a career rather than one dot.
- **GSAP leaves the career chapter.** The only remaining scroll-linked motion is Framer Motion's, on
  the opening and the principle band.
- Mobile is no longer a degraded branch. The old design dropped to a flat button list under 768px;
  the pitch and the showcase now render the same content at every width.
- One content file fewer, one broken sort fewer.

**Negative**

- **Pitch positions are assigned by chronological index**, so adding a job re-seats everyone after
  it. The alternative — coordinates in `experiences.json` — makes adding a job a geometry exercise
  and was judged worse. Beyond seven chapters the formation cycles and two chapters share a
  position; that is a real limit, and the fix at that point is a bigger formation, not stored
  coordinates.
- **`projects.json` now serves two chapters** with different needs — the gallery and the showcase.
  The optional fields keep them compatible, but a future change to one has to consider the other.
- **`year` is absent on every current project**, because the source data carries no dates. The
  showcase renders no year badge at all until someone supplies real ones.
- The engineering-principle band is not in `STORY_SECTIONS`. Deliberate — it is a held statement, not
  a chapter — but it means the progress nav does not account for its scroll height.

## Alternatives rejected

- **Keep the skills chapter alongside the showcase**: two chapters answering "what can he do", one
  with evidence and one without. The list is the one to lose.
- **Per-chapter gradient backgrounds, as the reference has them**: forbidden by ADR 0015 without an
  amendment, and the reference has no photographic surface to conflict with. It was built without
  this constraint, not against it.
- **Store pitch coordinates per experience**: see Consequences.
- **Reuse `HeroGradientLayers` for these chapters**: it drifts four layers for the opening's
  foreground depth cue. A chapter mid-story needs the texture, not the parallax — and a second
  moving surface reads as the drifting seam ADR 0015 already rejected once.
