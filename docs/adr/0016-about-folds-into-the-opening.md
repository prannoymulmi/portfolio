# ADR 0016: The About chapter folds into the opening

- **Status**: Accepted — `bio` itself removed by [ADR 0026](0026-hero-drops-the-biography-paragraph.md)
  (2026-08-20); everything else here (imageSource moving to home.json, the
  `/about` redirect, `about.json`'s deletion) stands.
- **Date**: 2026-08-10
- **Amends**: [ADR 0012](0012-single-page-story.md) — the story is now seven chapters,
  not eight.

## Context

The story opened with a hero and then immediately spent a chapter on a biography. The
opening already carried a name, three role phrases and a player card stating nine years of
experience; the chapter after it restated the same person in prose.

Two things made this more than a tidy-up:

1. **The About chapter owned content other components read.** `about.json` held both the
   biography and `imageSource`, the portrait reference the *player card* renders. Removing
   the chapter naively would have taken the card's portrait field with it.
2. **The two disagreed.** The About copy claimed "10+ years" while the card said 9. Nobody
   had noticed, because nothing compares them.

The chapter was also the only place the LinkedIn and GitHub links lived, which is why
[ADR 0014](0014-icon-set-dependency.md)'s nav icons had to land first.

## Decision

Retire the About chapter and move what it carried into the opening's own content.

- **`bio` joins `home.json`**, bounded at 40–240 characters. 240 is the enforceable proxy
  for the specified "2 sentences, 40 words" — Zod cannot count words, and at roughly six
  characters a word the two ceilings land in the same place.
- **`imageSource` moves to `home.json`** too, keeping its optional/placeholder behaviour.
- **`about.json`, `AboutSchema`, the `About` type and the `about` loader are deleted**
  together. A deleted file with a live loader 404s on every visit.
- **`/about` redirects to `/`**, not to `/#about`. The anchor no longer exists, and a
  missing anchor fails silently — the browser simply stays at the top.
- **The years figure is now asserted against real content**: a test extracts the number
  from `bio` and compares it to `card.yearsExperience`.

## Consequences

**Positive**

- One fewer chapter and one fewer network request per visit.
- The person is introduced on the first screen rather than after a scroll.
- The contradiction is fixed and cannot silently return: the test fails if the prose and
  the card disagree.
- Content is grouped by where it renders. Everything the opening shows is in `home.json`.

**Negative**

- **The biography is much shorter**, and the long-form version is gone rather than moved.
  That is the intent, but detail was lost, not relocated.
- **The years rule is a test, not a schema rule.** Zod validates one file at a time and
  cannot express "this prose agrees with that number". The test is the only guard, and it
  only checks the shipped content, not arbitrary edits.
- **`min(40)` on `bio` means it cannot be emptied.** An author wanting no biography has to
  change the schema — deliberate, since the opening's layout assumes the paragraph exists.
- Writing the biography is now constrained by what the intro already says. The first draft
  restated the intro almost verbatim, and only a test failure caught it.

## Alternatives rejected

- **Keep `about.json` for `imageSource` alone**: a whole content file, schema, type and
  network request for one optional string that belongs to the card.
- **Shorten the existing About text in place**: `AboutSchema.about` was `min(100)`, so the
  old field could not hold a two-sentence biography without a schema change anyway — and
  the chapter would still exist.
- **Redirect `/about` to `/#hero`**: works, but names an anchor for the first thing on the
  page, which `/` already reaches.
