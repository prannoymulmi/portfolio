# Contract: Locale Content Set

Internal contract (no public API — this is a single-page portfolio site).
Governs the shape and rules for `public/data/<locale>/*.json`.

## File list (fixed, per locale)

```
public/data/<locale>/home.json
public/data/<locale>/experiences.json
public/data/<locale>/education.json
public/data/<locale>/projects.json
public/data/<locale>/systems.json
public/data/<locale>/principle.json
public/data/<locale>/routes.json
public/data/<locale>/social.json
public/data/<locale>/technologies.json
public/data/<locale>/navbar.json
```

## Schema rule

Every locale's file MUST validate against the **same, unmodified** Zod
schema in `lib/utils/validation.ts` that the single-locale files validate
against today. Adding a locale never requires a schema change.

## Completeness rule

- `public/data/en/` is the universal fallback and MUST contain all 10
  files, each independently valid.
- Any other locale directory MAY omit any subset of the 10 files.

## Fallback rule (FR-006)

For a given `(locale, file)` request:
1. Fetch `public/data/<locale>/<file>.json`.
2. If the request 404s, or the response fails Zod validation, fetch
   `public/data/en/<file>.json` instead.
3. Log the fallback once (not on every re-render).
4. Never partially merge the two files — fallback is whole-file only (see
   research.md R-003).

## Locale-invariant fields

The following fields MUST be byte-identical across every locale's copy of
a file — they are not translated:

| File | Invariant fields |
|---|---|
| `experiences.json` | `id`, `dateText`, `subtitle`, `technologies[]`, `route`/`href`/`url` fields, `image`/`imageSource`/`icon.src` fields |
| `technologies.json` | `name`, `matches[]`, `sinceByEmployer` |
| `projects.json` | `id`, `year`, `route`/`href`/`url` fields, image fields |
| `education.json` | `id`, `url`, `media` |
| all files | any `id` used as a join key or DOM anchor |

## Parity invariants (enforced by `tests/integration/locale-parity.test.ts`)

For every non-English locale that ships a file:
- Array-valued top-level content (`experiences`, `education`, `projects`,
  `systems`, `technologies`) has the **same length** as the English file.
- Every locale-invariant field (table above) has the **same value** as the
  English file, entry-for-entry (matched by `id`).
- Every value in `technologies[].matches[]` is present in that same
  locale's `experiences[].technologies[]` — this cross-file join must hold
  independently per locale, since a "helpfully" translated technology name
  in one file silently breaks the join in the other.

## Extension rule (FR-007)

Adding a new language means: create `public/data/<newcode>/` with as many
of the 10 files as desired, and add one entry to `SUPPORTED_LOCALES` in
`lib/i18n/locales.ts`. No component, loader, or schema changes required.
