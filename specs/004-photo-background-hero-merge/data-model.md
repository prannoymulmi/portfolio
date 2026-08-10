# Phase 1 Data Model: One photo backdrop, a shorter opening, social links in the nav

**Feature**: `004-photo-background-hero-merge` | **Date**: 2026-08-10

Content is JSON in `public/data/`, fetched client-side and validated against Zod schemas in
`lib/utils/validation.ts` before any component sees it (ADR 0001, ADR 0003). Types are
inferred from the same schemas, so a schema change is a type change.

---

## Entity: Home content (`public/data/home.json`) — MODIFIED

The opening's content. Gains the two fields the retired About content used to own.

| Field | Type | Rules | Status |
|-------|------|-------|--------|
| `name` | string | 1–100 chars | unchanged |
| `intro` | string | 20–200 chars | unchanged |
| `roles` | string[] | 2–5 entries, each 3–40 chars | unchanged |
| `card` | PlayerCard | see below | unchanged |
| `bio` | string | **40–240 chars** | **NEW** |
| `imageSource` | string, optional | path or URL to the portrait | **MOVED** from About |

### `bio` rules and rationale

- **240-char ceiling** encodes FR-014's "≤2 sentences and ≤40 words". At an average 6
  characters per word, 40 words lands near 240 characters; the ceiling is the enforceable
  proxy for a word count Zod cannot express naturally.
- **40-char floor** stops the field being emptied to a fragment while still counting as
  present.
- The old `AboutSchema.about` was `min(100).max(500)`. The old text cannot be reused
  unchanged — it is longer than the new ceiling, and it states "10+ years", which
  contradicts the card's `yearsExperience: 9`. FR-015b forbids carrying that over.

### `imageSource` note

Unset in the content today, which is why the player card currently renders
`ProfilePicturePlaceholder` rather than a photograph. Moving the field must preserve that
behaviour: absent → placeholder, present → image. The move is a relocation, not a
behaviour change.

---

## Entity: About content (`public/data/about.json`) — DELETED

| Field | Fate |
|-------|------|
| `about` | Rewritten shorter and moved to `Home.bio` |
| `imageSource` | Moved to `Home.imageSource` |

`AboutSchema`, the `About` TypeScript type, and the `about` entry in `ContentProvider` are
all removed. One fewer network request per visit.

---

## Entity: Social content (`public/data/social.json`) — UNCHANGED

No schema change. The feature only changes how these entries are *rendered*.

| Field | Type | Rules |
|-------|------|-------|
| `social[]` | array | 1–5 entries |
| `social[].network` | string | display name; now also selects the glyph |
| `social[].href` | string | destination URL |

**New coupling**: `network` becomes a lookup key for an icon, matched case-insensitively.
Today's values are `LinkedIn` and `GitHub`. An unmatched value must still render as a
readable labelled link (FR-011) — the schema stays permissive, so the *component* owns the
fallback, not the validator.

---

## Entity: PlayerCard — UNCHANGED

Listed only because `yearsExperience: 9` is now the authority for a figure that also
appears in prose. FR-015b makes the two agree; nothing in the schema enforces it, so it is
a content-review rule and a test assertion, not a validation rule.

---

## Non-content entities

These have no persisted representation — they exist as component state and are recorded
here because the spec names them.

- **Backdrop**: one pinned photographic layer for the whole document. Not data; a single
  element in the root layout. Its only variable is opacity, which is a function of
  appearance (full in light, 18–22% in dark).
- **Foreground drift**: a scroll-offset-derived transform applied to the player card and
  role bars. Derived state, reset to zero under reduced motion.

---

## Migration

One-time, hand-applied — there is no migration tooling and only one content author.

1. Write `bio` into `home.json`: a ≤240-char rewrite of the old about text, stating 9
   years.
2. Copy `imageSource` into `home.json` if it is ever set (it is not today).
3. Delete `public/data/about.json`.
4. Update `HomeSchema`, delete `AboutSchema`, update `lib/types/portfolio.ts`.
5. Drop the `about` loader from `ContentProvider`.

Steps 3–5 must land together: a deleted file with a live loader produces a failed fetch and
a console error on every visit.
