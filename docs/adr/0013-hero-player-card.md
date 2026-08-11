# ADR 0013: The hero is a football player card over a sunset photo

- **Status**: Accepted, extended by [ADR 0015](0015-photograph-as-page-surface.md),
  amended by [ADR 0018](0018-collectible-card-anatomy.md)
- **Date**: 2026-08-10
- **Extends**: [ADR 0004](0004-football-pitch-metaphor.md) — carries the
  football metaphor into the hero, which previously sat outside it.

> **Extension note**: the backdrop introduced here now sits behind the whole
> story, pinned and served through the image optimizer, per
> [ADR 0015](0015-photograph-as-page-surface.md). The card, the years-only stat
> rule, and the palette below are unchanged.

> **Amendment note, 2026-08-11**: the card anatomy specified below — the stat
> pills, the star rating and the soft-skill bars — was replaced by
> [ADR 0018](0018-collectible-card-anatomy.md), which also moved the card's
> colour out of `palette.ts` and into themed tokens, resolving the inline-style
> negative recorded under Consequences. **The years-only rule survives**: ADR
> 0018 keeps the reference's rating block but prints a count of years in it,
> upholding the alternative rejected below rather than reversing it. What ADR
> 0018 gives up — the per-area counts, and the soft-skill bars introduced here
> as the bounded answer to a composite rating — is recorded in that ADR.

## Context

[ADR 0004](0004-football-pitch-metaphor.md) committed the career and skills
sections to a football metaphor, but the hero — the first thing anyone sees —
was a plain portrait frame beside a stack of role text. The section carrying
the most weight carried none of the site's identity, and read like every other
engineer's hero.

Two further constraints shaped the design:

- The role phrases already draw hand-lettered marks
  ([ADR 0009](0009-rough-notation-third-animation-library.md)), so whatever
  sits beside them has to hold its own against three saturated bars.
- Any figure shown on a player card is a claim. FIFA-style cards lead with an
  overall 0–100 rating, which for a person is invented data.

## Decision

Rebuild the hero as a collectible-style **player card** (`PlayerCard`) over a
photographic backdrop:

- **Card anatomy follows the football-card convention**: title bar with the job
  title, portrait, stat pills, an honours rail (AWS certification badge,
  country flags), and a name banner with a star rating.
- **Every *counted* figure on the card is a count of years** — total career
  years in the title block, years per area in the pills. No invented composite
  score.
- **The two judgements are marked as judgements.** The star rating and the
  three soft-skill bars (`card.softSkills`, drawn by `SkillBars`) cover the
  part of the job years can't count. They are held to whole steps out of five
  and sit under a "Self-rated" label, so the card never presents an opinion
  with the precision of a measurement. A short `card.blurb` in small type runs
  beside them, the way the reference card's copy block does.
- **Card content is editable content, not markup.** `PlayerCardSchema` in
  `lib/utils/validation.ts` validates a `card` object in `home.json`, so the
  job title, the year counts and the rating are edited like any other content
  (ADR 0001).
- **The backdrop is a photograph** (`public/images/normal.jpg`), parallaxed by
  `HeroParallax` and dimmed in dark mode so it reads as a low ember rather than
  disappearing.
- **`components/Hero/palette.ts` is the single source for hero colour.** The
  three annotation bars, the card body and the card accent are all sampled from
  that photo, and each exported constant records why it is the value it is.

## Consequences

**Positive**

- The metaphor now starts at the top of the page instead of arriving three
  sections in, and the card is the one cool object on a warm page — it reads as
  the subject rather than as decoration.
- Years are checkable. A reader can disagree with a rating; they cannot
  misread "9 yrs".
- Colour decisions live in one annotated module, so re-cutting the palette is
  one file. Every bar carries `CREAM` text and clears 7:1, keeping the headline
  AAA at display size in both themes.
- Card figures change without a code edit, same workflow as the rest of the
  content.

**Negative**

- **Palette colours are applied as inline `style`, not Tailwind classes.**
  Tailwind scans class strings as literal text, so a class built by
  interpolation never reaches the stylesheet. This is in tension with the
  constitution's "no inline styles" rule; the exception is confined to values
  that come from `palette.ts`, and `WARM_INK` is deliberately mirrored as a
  literal in the classes that need it.
- **The palette is tuned to one photograph.** Swapping the backdrop means
  re-sampling all six constants; the values are not a general brand palette.
- A full-bleed photo sits on the LCP path. It is served from `public/` with a
  long-lived cache header, but it is still the heaviest asset on first paint.
- The card layout fits about three stat pills. A fourth crowds them, so the
  schema caps the list rather than letting content break the design.

## Alternatives rejected

- **A FIFA-style overall rating (e.g. "87 OVR")**: the most recognisable part
  of the reference, and entirely fabricated. Rejected on honesty — the card
  should not state a number nobody computed. The soft-skill bars are the
  bounded version of the same idea: five steps, no number printed, and labelled
  as self-rated rather than passed off as a score.
- **Keeping the plain portrait frame**: safe, and leaves the site's most
  valuable section saying nothing that the résumé does not already say.
- **A CSS gradient backdrop instead of the photo**: cheaper on the LCP path,
  but the gradient is the generic choice the redesign existed to get away from,
  and the palette loses the thing it was sampled from.
