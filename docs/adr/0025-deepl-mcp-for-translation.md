# ADR 0025: DeepL MCP as the translation tool for German content

- **Status**: Accepted
- **Date**: 2026-08-20
- **Extends**: [ADR 0024](0024-localization-without-a-library.md) — that ADR
  fixed the localization *architecture* (no library, per-locale content
  directories, one translator reviewing German in the PR) and explicitly
  rejected a runtime machine-translation widget on the grounds that it would
  ship "unreviewable German." This ADR is about *how the translator produces
  the German text* within that already-decided architecture; it does not
  reopen 0024's decision.

## Context

The site owner asked that the German strings in `lib/i18n/ui.de.json` and
`public/data/de/*.json` be produced using the DeepL MCP server rather than by
the coding agent translating from its own knowledge, and asked for that choice
to be recorded as an ADR.

ADR 0024 already settled the shape of the problem: 112 UI chrome strings plus
the translatable fields across ten content JSON files, one human translator
(the site owner) reviewing German in the PR, English as the sole fallback.
What it left open was the *mechanism* the translator uses to produce a first
draft. Two mechanisms were tried directly, on this exact content, before this
decision was written:

- **Raw DeepL output, no review step.** Every English string was sent to
  DeepL (`translate-text`, batched, with `context` and `customInstructions`
  set) and applied verbatim. This reliably mistranslated the site's
  domain-specific vocabulary — the football metaphor ADR 0004 built the
  Career section on, in particular:

  | Source string | Raw DeepL output | Problem |
  |---|---|---|
  | `career.pitch` ("Pitch") | *Tonhöhe* | acoustic pitch, not a football pitch |
  | `career.positions.leftBack` | *Zurück zu* | read as "back to" (nav phrasing), not a position |
  | `career.positions.rightWing` | *Rechte* | incomplete |
  | `career.eyebrow` ("Career match") | *Berufseignung* | "job suitability", not the football-match sense |
  | `technologies.levels.dailyDriver` | *Alltagsworte* | nonsense ("everyday words") |
  | `footer.connect` | *Weiter zu* | wrong; unrelated to "connect" |
  | `hero.portraitAlt` ("{name}, portrait") | *{name}, Hochformat* | page-orientation sense, not a person's portrait |

  One string also lost structural integrity: DeepL's word reordering moved
  part of a sentence's translation outside the sentinel markers used to split
  a batched response back into per-string results, corrupting
  `career.technologiesUsedAt`.

- **DeepL output plus a review pass, still without any glossary.** Re-running
  the same batches with an explicit list of pinned terms in `context` and
  `customInstructions` (`Pitch=Spielfeld`, `Left back=Linksverteidiger`,
  `Career match=Karriere-Spieltag`, the four German school grading terms, and
  so on) fixed every error in the table above. A second, smaller pass of
  defects remained and needed a human fix regardless of prompting: a dropped
  letter (`speifikationsgetriebenen`), a relative-pronoun gender/number
  mismatch, one bullet that mixed a participle and a finite verb into a
  non-sentence, three technology notes that switched to first-person where
  every sibling note in the same enumerated list was impersonal, and one note
  that drifted from the list's shared past tense into a present-tense
  passive.

Two structural facts about the DeepL MCP server as currently configured also
shaped the decision:

- **No glossary-write tool is exposed.** `list-glossaries` and
  `get-glossary-info` are available; there is no `create-glossary` call in
  this MCP surface. Term pinning has to happen through `context` and
  `customInstructions` on every call, not through a persisted DeepL glossary
  resource.
- **Batched array translation returns one concatenated string, not an
  array.** `translate-text` accepts `text` as a string array and translates
  each entry independently, but the value that comes back through this MCP
  server is a single flattened string with no separators between entries.
  Recovering per-string results requires wrapping each input in a caller-owned
  sentinel (`§N§ ... §N§`) and splitting on that after the call — and even
  then, reordering inside a translated sentence can push content outside the
  sentinel pair, as the `technologiesUsedAt` case showed.

## Decision

DeepL MCP (`mcp__deepl__translate-text`) is the translation tool used to
produce German drafts for `lib/i18n/ui.de.json` and `public/data/de/*.json`,
but its output is never applied unreviewed. The workflow is:

1. Extract the translatable English strings — the field set ADR 0024 and the
   feature's task list already established (invariant fields: company legal
   names, technology names/`matches`, `dateText`, URLs, image paths, IDs,
   route metadata — copied through, never sent to DeepL).
2. Protect interpolation placeholders (`{name}`, `{company}`, …) before
   translation by substituting an inert token, and restore the original
   placeholder text after — DeepL will otherwise translate a placeholder's
   contents (`{name}` → `{Name}`), which silently breaks string
   interpolation at render time.
3. Call DeepL with `context` describing the content's domain (the football
   metaphor, the CV/resume register, the a11y/UI-chrome nature of a string)
   and `customInstructions` pinning the site's established terms for
   anything short, ambiguous, or already fixed by a previous translation on
   this site (football positions, skill-level labels, the German grading
   scale, "spec-driven development" → *spezifikationsgetriebene Entwicklung*).
4. Review the output against the field the coding agent knows independently
   from context: does it match a term already shipped elsewhere on the site
   for the same source string, is it grammatically well-formed German, does
   it preserve the register (tense, person, formality) of the other items in
   the same enumerated list. Fix only what fails that check — a demonstrable
   error or an internal inconsistency — not stylistic word choices that are
   merely different from a prior draft.
5. Run `pnpm type-check` and the i18n test suite
   (`tests/unit/i18n/ui-parity.test.ts` and friends) to confirm every German
   file still matches its English counterpart's shape before the change is
   considered done.

This keeps ADR 0024's "one translator reviewing German in the PR" model
intact — DeepL produces the first draft the translator reviews, it does not
replace the review.

## Consequences

**Positive**

- Translation work no longer depends on the coding agent's own bilingual
  judgment for the bulk of the text — most strings, especially plain
  narrative sentences, come back from DeepL correct on the first or second
  pass, and the review step is targeted at the specific failure modes
  (ambiguous short words, domain jargon, register drift) rather than a
  line-by-line re-derivation.
- The term-pinning list built for this pass (football positions, skill
  levels, grading terms, "spec-driven development") is reusable
  `customInstructions` text for the next content change, not a one-off.
- The concrete failure modes are now documented in one place, so a future
  translation pass does not have to rediscover them by shipping the same
  mistakes.

**Negative**

- DeepL calls still require a review step; this is not a way to make German
  content changes require zero judgment. A contributor who applies DeepL
  output verbatim, skipping step 4, can reintroduce exactly the errors table
  in Context.
- Batched translation requires the sentinel-wrapping workaround in point 2
  above, which is more machinery than a plain array-in, array-out call would
  need, and it has one known failure mode (content displaced outside a
  sentinel by word reordering) that step 4's review has to catch.
- No persisted glossary means term pins are re-typed into `context` /
  `customInstructions` on every call rather than configured once — if this
  MCP server later exposes glossary creation, migrating the pinned-term list
  from prompt text to a real DeepL glossary would be worth doing.

## Alternatives rejected

- **Coding agent translates from its own knowledge, DeepL unused**: this was
  the status quo before this ADR — the German copy already in the tree, in
  fact, was produced this way, and it is not obviously worse than the
  reviewed-DeepL draft; several places it was better (the football
  terminology, register consistency). But it does not answer the site
  owner's request, and DeepL plus a review pass reaches parity on quality
  while giving the review step a concrete, external baseline to check
  against rather than the coding agent checking its own unaided output.
- **Raw DeepL output, no review**: rejected — demonstrated wrong translations
  above, some of them (`Zurück zu` for "Left back", a corrupted sentence)
  bad enough to be user-visible defects on a live site, not just a stylistic
  downgrade. This is the exact "unreviewable German" failure mode ADR 0024
  already rejected for a runtime MT widget; doing it as a one-time build
  step instead of at runtime does not fix the underlying problem.
- **A DeepL Glossary resource**: the ideal way to pin terms, but no
  glossary-creation tool is exposed by this MCP server today (Context). Left
  as a future improvement rather than blocking this change on tooling that
  does not exist yet.
