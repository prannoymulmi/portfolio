# Phase 1 Data Model: German Language Toggle & Hero Location Tag

## Locale

Registry defined in `lib/i18n/locales.ts`:

```ts
export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' },
  { code: 'de', label: 'Deutsch',  shortLabel: 'DE', htmlLang: 'de' },
] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number]['code'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'locale';
export function isLocale(value: unknown): value is Locale;   // guards FR-005
```

**Fields**:
- `code` — URL/directory/`lang` value, lowercase ISO 639-1 (e.g. `en`, `de`).
- `label` — endonym, shown as part of the toggle's accessible name.
- `shortLabel` — 2-character visible glyph on the toggle button.
- `htmlLang` — value written to `document.documentElement.lang`.

The registry array is the single extension point: adding a language is one
new entry here, one new content directory, and one new `ui.<code>.ts`
module (FR-007).

## Language Preference

- **Storage**: browser-scoped, `localStorage['locale']`.
- **Value**: a `Locale` code (`'en'` or `'de'`).
- **Read**: once on mount, guarded through `isLocale()`. Anything
  unrecognised, unreadable, or absent resolves to `DEFAULT_LOCALE` (FR-005).
- **Write**: on every toggle activation.
- **Never** read during server rendering or the client's first (hydration)
  render — both always resolve to `DEFAULT_LOCALE` to avoid a hydration
  mismatch (see research.md R-001).

## Translated Content Set

One directory per locale: `public/data/<code>/`, containing the same 10
filenames that exist today (`home`, `experiences`, `education`, `projects`,
`systems`, `principle`, `routes`, `social`, `technologies`, `navbar`).

- **Schema**: unchanged. Every locale's file validates against the exact
  same Zod schema in `lib/utils/validation.ts` as the current single-locale
  files do today.
- **Resolution order per file**: fetch `<code>/<file>` → on HTTP 404 or Zod
  validation failure, fetch `en/<file>` instead and log the fallback once.
- **Completeness rule**: `en/` MUST be complete (every file present and
  valid) since it is the universal fallback. Any other locale MAY omit
  individual files — a missing German file yields English content for that
  section only, not a broken page (FR-006).
- **Locale-invariant fields**: see research.md R-005 for the full list of
  fields that must be byte-identical across every locale's file (IDs,
  URLs, image paths, technology names, date text, etc.).

## UI Dictionary

`lib/i18n/ui.<code>.json` — a nested object grouped by page area: `nav`,
`hero`, `work`, `career`, `technologies`, `education`, `projects`,
`contact`, `footer`, `errors`, `a11y`.

- **Leaf type**: `string`, enforced by `lib/i18n/uiSchema.ts` (a Zod schema
  shared by every locale file). Leaves containing `{name}`-style
  placeholders are resolved through `format()` (`lib/i18n/format.ts`) at
  the call site.
- **Contract**: `ui.en.json` is the source of truth for the key set.
  `tests/unit/i18n/ui-parity.test.ts` recursively flattens its keys and
  asserts every other locale's file has the identical key set (no missing,
  no extra) and every leaf validates as a non-empty string against
  `uiSchema.ts`. This test runs in CI, which blocks merge on failure, same
  as any other test.
- **Access**: always direct property access (`ui.nav.jumpTo`) — never
  dynamic key lookup (`ui[someVar]`), which would bypass the schema/parity
  guarantees.
- **Loading**: statically imported at build time (not fetched), so both
  locales are bundled and there is no first-paint gap for chrome text.

## Derived-value keys (new invariants)

String-literal unions used purely as dictionary keys — components read
them and map through `useUi()`, never branching on locale directly:

- `Level` (`'dailyDriver' | 'production' | 'workingKnowledge'`)
- `WorkType` (existing Zod enum values, unchanged as data, mapped for
  display through `ui.career.workTypes`)
- `CareerPosition` (`'goalkeeper' | 'striker' | ...`, replacing the current
  English literal values in `components/Career/chapters.ts`)
- `GradeBand` (`'veryGood' | 'good' | 'satisfactory' | 'sufficient'`, with a
  passthrough case for raw numeric grades)

## Relationships

```
LocaleProvider (owns active Locale)
   │
   ├── read by → ContentProvider → useContentLoader(locale, fileName)
   │                                   │
   │                                   ├── fetch public/data/<locale>/<file>.json
   │                                   └── on 404/invalid → fallback to public/data/en/<file>.json
   │
   └── read by → useUi() → returns ui.<locale> (or ui.en if locale has no dictionary)
                              │
                              └── consumed by every component that renders visitor-facing text
```
