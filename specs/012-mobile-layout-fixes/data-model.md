# Phase 1 Data Model: Mobile Layout Fixes

**Feature**: [spec.md](./spec.md) | **Date**: 2026-08-14

## This feature has no data model change

Stated explicitly rather than padded out, because "no change" is itself the
finding a reader of this file needs.

- No new entity, field, or relationship.
- No change to `public/data/*.json` or to the Zod schemas in
  `lib/utils/validation.ts`.
- No change to the `CareerChapter` type or to the `toChapters` derivation in
  `components/Career/chapters.ts`.
- No new persisted or client state. The overflow and navigation fixes are
  presentational; the career panel change is a reordering of nodes that are
  already rendered.

## The one thing that does change

**Career Chapter Panel — presentation order.** The same fields, rendered in a
different sequence.

| Position | Before (as of 2026-08-14) | After |
|---|---|---|
| 1 | Chapter number · position label | Chapter number · position label |
| 2 | Company | Company |
| 3 | Role | Role |
| 4 | What I built | **Date range** |
| 5 | Achievements | What I built |
| 6 | Technologies | Achievements |
| 7 | **Date range** | Technologies |

Source of each field, all pre-existing on `CareerChapter`: `order`,
`position`, `company`, `role`, `years`, `builtSummary`, `achievements`,
`tech`. The date is `years`, a display string such as `11/2020 – 03/2025` —
it is not parsed, compared, or formatted by this feature, and it keeps its
existing `font-mono-ui` treatment and `aria-hidden` calendar mark.

**Conditional rendering is unchanged.** `builtSummary` and `achievements`
still render only when present; `tech` still falls back to `DEFAULT_TECH`
when empty (spec 011 FR-012). The date has no condition on it today and gains
none, which is what makes FR-012 of *this* spec hold for free: with no
summary, position 4 is simply followed by whatever section comes next.

## Validation rules

None added. The existing content validation is untouched, and no new
invariant is introduced beyond the two the tests assert (see
[research.md](./research.md) R5): exactly one date line per panel, rendered
ahead of the summary.
