# ADR 0004: Football pitch metaphor for career + skills

- **Status**: Accepted, extended by [ADR 0013](0013-hero-player-card.md)
- **Date**: 2026-08-09

> **Extension note**: the metaphor now also carries the hero, which
> [ADR 0013](0013-hero-player-card.md) rebuilt as a football player card. The
> two pitch-based sections below are unchanged: `SVGPitch` still backs both
> `CareerJourney` and `SkillsFormation`.

## Context

A portfolio needs a hook. Generic "timeline + tag cloud" layouts blur
together — recruiters skim thousands of them a year. Options:

1. **Standard resume layout**: safe, forgettable.
2. **Terminal/IDE aesthetic**: overdone in the SWE portfolio space.
3. **Domain metaphor** tied to the owner's identity (football / cricket /
   music / cycling / etc.).

Owner is a football fan; football pitches map surprisingly well to two
structures the portfolio already needs: a **temporal path** (career
journey) and a **role-based grouping** (skills).

## Decision

Use an SVG football pitch (`SVGPitch`) as the shared canvas for two
sections:

- **Career**: an animated `#10` jersey moves along the pitch as the user
  scrolls, with milestone cards synced below. GSAP `ScrollTrigger` drives
  the position.
- **Skills**: a 4-3-3 formation places skill categories at defender /
  midfielder / attacker positions. Click a position → drawer with details.

Both fall back gracefully:

- Career has a Timeline toggle for users who prefer linear reading.
- Skills stacks vertically on mobile (viewport < 768px).

## Consequences

**Positive**

- Memorable — the pitch shows up in recruiter conversations.
- The visual metaphor doubles as an implicit personality signal
  (footy fan) without needing a separate "hobbies" section.
- Two independent sections share one `SVGPitch` component, so pitch
  styling stays consistent.

**Negative**

- Alienates viewers who don't know football (very few, but real). The
  Timeline toggle exists so the metaphor is not a hard gate on the
  content.
- Requires more JS than a plain list (GSAP + Framer Motion). Weighed
  against the memorability win — worth it for a portfolio, would not
  be for a landing page.
- The formation layout only fits ~10 skill categories cleanly. Growth
  beyond that needs a different layout or a cycling animation.

## Alternatives rejected

- **Standard resume**: the safe choice, but this site's job is to make
  a hiring manager forward it to a colleague, and safe doesn't do that.
- **Terminal aesthetic**: too on-the-nose for backend/cloud roles;
  makes the site look like every other engineer's portfolio.
