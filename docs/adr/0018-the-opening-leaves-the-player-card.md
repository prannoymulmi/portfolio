# ADR 0018: The opening leaves the player card for a cut-out portrait

- **Status**: Accepted
- **Date**: 2026-08-12
- **Supersedes**: [ADR 0013](0013-hero-player-card.md) in part — the card itself,
  its stat rules and its palette. The photographic backdrop that ADR 0013
  introduced survives untouched, as extended by
  [ADR 0015](0015-photograph-as-page-surface.md).
- **Amends**: [ADR 0004](0004-football-pitch-metaphor.md) — the football metaphor
  no longer reaches the opening. It continues to govern the career and skills
  chapters.

## Context

[ADR 0013](0013-hero-player-card.md) rebuilt the opening as a collectible-style
football player card, on the reasoning that the section carrying the most weight
carried none of the site's identity. That reasoning was sound and the execution
did what it set out to do.

The objection is not to how the card looked. It is to a stylised game card being
the first thing a visitor meets — a form that asks to be decoded before it says
who the site belongs to. That is a judgement about the site's front door, and no
amount of restyling addresses it.

Three constraints shaped what replaced it:

1. **Principle IV of the constitution named the card.** The stack entry read
   "The football metaphor extends to the hero player card (ADR 0004, ADR 0013)",
   and Principle IV is NON-NEGOTIABLE. Removing the card is therefore not a
   styling change; Governance requires an ADR *and* a constitution amendment in
   the same pull request.
2. **The source portrait could not simply be dropped onto the page.**
   `hero_pic.png` is a studio shot on a grey paper sweep, fully opaque —
   `hasAlpha: no`. The grey is picture data, not empty space.
3. **The card carried the page's only `<h1>`.** Its name banner was the
   document's sole heading, and the only place the owner's name appeared in the
   opening.

## Decision

Replace the card with a background-removed portrait, blended into the page
surface by its own alpha channel.

- **The portrait is a derived asset**, `public/images/hero_portrait.png`,
  committed alongside the studio original. The original is retained purely so
  the cut-out can be regenerated if the treatment changes; nothing renders it.

- **The separation is content-aware, not positional.** A CSS mask fades by
  location and cannot tell a cheek from the paper behind it — and the grey sits
  *around the subject's head*, mid-frame, where any mask reaching it also erases
  the face. `mix-blend-mode` fails for a different reason: it keys on
  brightness, and the subject holds both the lightest pixels in the frame (a
  white t-shirt) and the darkest (black hair and jacket), so `multiply`
  dissolves the shirt and `screen` dissolves the hair.

- **The asset's edge pixels are colour-corrected.** Segmentation alone leaves
  partially-transparent pixels storing a subject/backdrop blend, which composites
  as a light halo on a dark surface — invisible in light mode, obvious in dark.
  The correction inverts the blend the camera performed,
  `F = (C − B·(1−α)) / α`, estimating the local backdrop `B` by filling known
  background colours inward beneath the soft edge.

- **The blend needs no per-theme treatment.** Transparency is transparency, so
  the sunset backdrop and the near-black dark theme both show through the same
  asset. The only styling is a downward mask dissolving the lower edge, where
  the photograph crops mid-torso.

- **The `<h1>` moves into the opening's text column**, above the role phrases,
  set in the same mono micro-caps as the CV line. Without this the page would
  have had no heading at all.

- **The card's data is deleted, not relocated.** The year counts, star rating,
  soft-skill bars, certification badge and country flags leave `home.json`, its
  schema and its types. The career and skills chapters carry their own figures
  and are unaffected.

## Consequences

- **The constitution changes with this ADR** — Principle IV drops the hero card
  and records the portrait's surface rule instead. Version 1.2.0 → 1.3.0.

- **Six components are deleted**: `PlayerCard`, `SkillBars`, `StarRating`,
  `AwsBadge`, `Flags`, and `ProfilePicturePlaceholder`. The last goes because the
  fallback for a missing portrait is now a text-only opening, not a placeholder
  graphic.

- **One consistency guard is lost with no replacement.** A test asserted that the
  years claimed in `bio` matched `card.yearsExperience` — a check that existed
  because the retired About copy had once said "10+ years" while the card said 9.
  With the card gone the biography is the only place a year count appears, so
  there is nothing left to compare it against. Recorded here because the guard's
  absence is invisible in the diff.

- **The blend is not machine-testable.** jsdom does not rasterise. Tests assert
  that the right asset is referenced and the mask utility applied; that no grey
  shows and no halo appears is verified by eye. If a halo ever does appear,
  suspect the wrong file before suspecting the CSS.

- **The drift strength halves**, 56 → 28. The card had a hard edge that could
  travel any distance; a dissolved edge sliding against a pinned backdrop reads
  as a moving seam.

## Alternatives considered

- **Restyle the card rather than remove it.** Rejected: the objection is to the
  form, not its finish.

- **Keep the card below the fold, or on desktop only.** Rejected as the worst of
  both — the maintenance cost of the card, without the coherence of committing
  to either choice.

- **Relocate the card's figures to credential chips and a statistics strip**, as
  the reference design shows. Offered and declined. The self-rated numbers were
  the part of the card the owner was least attached to, and moving them would
  have preserved the claim-making the card was built to constrain.

- **Fade the rectangular image at its edges with CSS and accept some visible
  grey.** Rejected: it fails on its own terms, since the grey that matters is
  the grey around the head, which no edge fade reaches.

- **Add a rim light matching the reference composite.** Deferred, not rejected.
  It is two treatments to tune, no requirement asks for it, and the cut-out
  reads cleanly against both surfaces without it.
