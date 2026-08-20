# ADR 0027: `builtWithNote` becomes locale-optional

- **Status**: Accepted
- **Date**: 2026-08-20
- **Extends**: [ADR 0024](0024-localization-without-a-library.md) — a second
  case of a field that legitimately differs in *presence*, not just
  wording, between locales; the first was `home.json`'s `contactNote`.

## Context

`technologies.json`'s `builtWithNote` is the one-sentence credit line under
the Technologies chapter's heading, naming Claude Code and spec-driven
development ("This site itself was designed and built with Claude Code,
using spec-driven development..."). It was a required field
(`z.string().min(40).max(220)`) present, translated, in both
`public/data/en/technologies.json` and `public/data/de/technologies.json`.

The site owner asked for the German sentence removed, without asking for
the English one to change. Unlike [ADR 0026](0026-hero-drops-the-biography-paragraph.md)'s
`bio` (which had no counterpart anywhere else once removed), this leaves
the two locales genuinely different: English still credits Claude Code in
this paragraph, German does not. That is the request, not an oversight —
confirmed explicitly, having offered "both languages" as the alternative.

## Decision

Make `builtWithNote` optional rather than required:

- `TechnologiesFileSchema` (`lib/utils/validation.ts`): `.optional()` added.
- `TechnologiesFile` type (`lib/types/portfolio.ts`): `builtWithNote?: string`.
- `public/data/de/technologies.json`: the key removed entirely (not emptied
  — an empty string would still fail the schema's `min(40)` were the field
  present but blank; removing the key is what "optional" means here).
- `public/data/en/technologies.json`: unchanged, keeps the sentence.
- `TechnologiesChapter.tsx`: the paragraph now renders conditionally
  (`{builtWithNote && <p>...}`), the same pattern `ContactSection.tsx`
  already uses for `contactNote` — nothing rendered rather than an empty
  paragraph, and no fallback to the English sentence (ADR 0024's
  whole-file-fallback rule applies to a missing *file*, not an
  intentionally-absent optional field within one that loaded fine).

## Consequences

**Positive**

- Delivers exactly what was asked without forcing English to change too, or
  inventing German replacement text nobody requested.
- Reuses an already-proven pattern (`contactNote`) rather than a new kind of
  per-locale field.

**Negative**

- **The two languages now say structurally different things** about how the
  site itself was built — a visitor comparing locales side by side would
  notice the credit line missing in German specifically. This is the
  explicit trade-off of the decision, not a side effect of it.
- One more field joins `contactNote` as "optional, no fallback" — a future
  content field that legitimately varies by locale should follow this same
  shape rather than inventing a third pattern.

## Alternatives rejected

- **Remove from both locales**: offered to the site owner as the
  consistent alternative (matching how ADR 0026 handled `bio`); declined —
  German only was the explicit choice.
- **Leave `builtWithNote` required and put empty-ish filler text in the
  German file**: defeats the point of removing the sentence, and the
  schema's `min(40)` floor would reject anything short enough to not read
  as a translated version of the same claim anyway.
