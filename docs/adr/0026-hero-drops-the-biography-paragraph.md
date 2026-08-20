# ADR 0026: The hero drops the biography paragraph

- **Status**: Accepted
- **Date**: 2026-08-20
- **Amends**: [ADR 0016](0016-about-folds-into-the-opening.md) — `bio` is no
  longer part of `home.json`; the schema's `min(40)` floor that made it
  un-emptyable is gone with it.

## Context

ADR 0016 moved the About chapter's biography into `home.json`'s `bio` field,
bounded at 40–240 characters, and rendered directly under the intro line in
the hero. That ADR's own Consequences section named the constraint this
decision reverses:

> **`min(40)` on `bio` means it cannot be emptied.** An author wanting no
> biography has to change the schema — deliberate, since the opening's
> layout assumes the paragraph exists.

The site owner asked for the paragraph — "9 years in, I've led teams,
mentored engineers, and taken platforms from design into production.
Backend architecture and security are where I do my best work." (and its
German translation) — removed, with no replacement text. Per ADR 0016's own
note, that requires exactly the schema change it flagged.

## Decision

Remove `bio` entirely rather than replace its content:

- `bio` deleted from `HomeSchema` (`lib/utils/validation.ts`), the `Home`
  type (`lib/types/portfolio.ts`), and both `public/data/en/home.json` and
  `public/data/de/home.json`.
- The `<p>{bio}</p>` paragraph removed from `Hero.tsx`, along with its
  surrounding comments that referenced it (`HeroPortrait.tsx`,
  `HeroGradientLayers.tsx`, `ContactSection.tsx` all had comments naming
  "bio" as part of the hero's content shape).
- No replacement field or paragraph. The hero now reads: name (in the
  nav wordmark), role phrases, the intro line, location, then the CV/work
  CTAs — one fewer paragraph between the intro and the location tag.

## Consequences

**Positive**

- Matches what was asked: the sentence is gone, in both languages, not
  replaced with different wording that would need its own review.
- The hero is shorter without losing information the intro doesn't already
  carry in shorter form — the intro line already states what the person
  builds and cares about.
- Removes a `min(40)` constraint ADR 0016 had already flagged as the thing
  blocking exactly this kind of change.

**Negative**

- The "9 years in, I've led teams..." framing — leadership and mentoring,
  specifically — no longer appears anywhere on the page. It doesn't
  reappear elsewhere; this is a deletion, not a relocation (the same
  trade-off ADR 0016 made when it shortened the original About chapter's
  prose).
- A future request to add a biography-style paragraph back means re-adding
  the schema field and the render, not just editing content — the same
  "deliberate friction" ADR 0016 built in, now re-established from the
  removed side rather than the present one.

## Alternatives rejected

- **Replace with different bio text** (offered to the site owner as the
  alternative to this decision): rejected in favor of removing the
  paragraph outright — the site owner's explicit choice, not a case of no
  reasonable text existing.
- **Make `bio` optional instead of deleting it**: would have worked for
  this specific ask (an absent field renders no paragraph) without a type
  change, but leaves an unused, indefinitely-optional field in the schema
  for content that no longer exists anywhere — dead surface for a future
  editor to wonder about. Deleting it is the same effort and leaves nothing
  behind.
