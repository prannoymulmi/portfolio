# Contract: `public/data/technologies.json`

The site exposes no external API. Its interface contracts are (a) the content
files an author edits and (b) the chapter's interaction surface. This document
covers (a); see `chapter.ui.md` for (b).

## Shape

```jsonc
{
  "intro": "string, 40-240 chars",
  "builtWithNote": "string, 40-220 chars, names Claude Code and spec-driven development",
  "categories": ["string, 3-24 chars", "..."],   // 2-8, unique, display order
  "technologies": [
    {
      "name": "string, 1-24 chars, unique",
      "category": "string, must be a member of categories",
      "matches": ["exact string from experiences.json technologies[]"], // 1-6
      "sinceByEmployer": { "role subtitle, compared trimmed": "MM/YYYY" }, // optional
      "note": "string, 40-160 chars"
    }
  ]                                              // 4-40 entries
}
```

## Rules the author must obey

1. **`matches` are literal.** Copy the string exactly as it appears in
   `public/data/experiences.json`. The real data distinguishes `Spring` from
   `Spring Boot`, `CSS` from `CSS3`, and writes `Angular.js` / `React.js` /
   `Node.js` with suffixes. Matching is exact after trim, case-insensitive.
2. **No numbers.** There is no `years`, `months`, or `level` field. Durations
   and levels are computed from `experiences.json` and cannot be overridden.
   A technology with no matching role is a build failure, not a zero.
3. **No orphan aliases.** Every string in `matches` must exist in at least one
   role. CI fails otherwise.
4. **`note` must be supportable.** It describes where the technology was used
   and should be consistent with the `workDescription` of the roles it matches.
5. **`category` must exist in `categories`.** The filter row renders
   `categories` in file order with an `All` option prepended by the component.
6. **`sinceByEmployer` is an escape hatch, not a duration.** Use it only when a
   technology started partway through an otherwise fully-matched, still-dated
   role (e.g. threat modeling began partway through an ongoing role) — never
   to hand-tune a number. Keys are a role's `subtitle`, compared trimmed
   (`experiences.json` subtitles are not guaranteed to be trim-clean); values
   are `"MM/YYYY"`. It only clamps that one role's contribution forward; every
   other matched role for the same technology unions in untouched
   (docs/adr/0023 amendment).

## Failure modes and what the visitor sees

| Condition | Behaviour |
|---|---|
| File missing or fails Zod validation | Chapter renders the standard failure line, matching `ThreeSystems`. |
| `experiences.json` fails to load | Same failure line — durations cannot be computed without it. |
| A matched role's `dateText` is unparseable | That role contributes zero months; `console.error` names the role. If *no* matched role parses, the technology renders **without** a duration and without a level, never with `0`. |
| A category filter yields one entry | Renders normally; the layout must not collapse or break (spec Edge Cases). |

## Related existing file: `public/data/projects.json`

The "This Portfolio, Spec-Driven" entry is edited by this feature to name Claude
Code explicitly (FR-006). Constraints:
- `bodyText` is `min(100).max(500)` and currently **495** characters — words must
  be replaced, not appended.
- `tags` is capped at 8 and currently holds 6 — `Claude Code` may be added.
- The entry's index in the `projects` array, its links, and its image MUST NOT
  change (FR-006: no reordering or elevation).
