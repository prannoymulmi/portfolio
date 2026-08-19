# Phase 0 Research: German Language Toggle & Hero Location Tag

All unknowns from the Technical Context are resolved below. No
`NEEDS CLARIFICATION` markers remain.

## R-001 — Locale state owner

**Decision**: hand-rolled `LocaleProvider` (React Context + `useState` +
`localStorage`).

**Rationale**: `next-themes` is theme-specific by design (Principle IV names
it as the *theme* state owner); running a second instance with
`attribute="lang"` would inject a second pre-paint script for an unrelated
concern. `next-intl` is routing-first, which contradicts ADR 0012 (one
scrolling story, sections are anchors) and the spec's own assumption that
the toggle switches content in place on the same URL. The provider holds
`useState<Locale>('en')` and reads `localStorage` in a mount effect,
matching the `mounted` pattern already used in `HamburgerMenu`, so the
server render and the client's hydration render both say `'en'` and no
hydration mismatch occurs.

**Alternatives considered**: second `next-themes` instance (rejected —
theme-scoped by constitution); `next-intl` (rejected — routing model
conflicts with ADR 0012); URL query param as the source of truth (rejected
— re-introduces a URL-shaped concern the spec's assumptions explicitly
ruled out).

## R-002 — Storage of translated content

**Decision**: `public/data/<locale>/<file>.json`.

**Rationale**: Adding a third language becomes `mkdir public/data/fr` + one
registry entry, satisfying FR-007/SC-004 cleanly. The alternative (sibling
suffix files, e.g. `home.de.json`) avoids moving existing files but makes
the default locale structurally special — only `en` lacks a suffix — which
weakens the "adding a language touches nothing else" guarantee.

**Alternatives considered**: suffix-per-file (`home.de.json`) — rejected,
asymmetric default; single JSON with nested per-locale keys — rejected,
defeats Zod's per-file schema boundaries and would require a schema shape
change for every content type.

**Accepted cost**: one `git mv` of 10 files and one test-path update in
`tests/integration/content-sources.test.ts`.

## R-003 — Fallback semantics (FR-006)

**Decision**: whole-file fallback. If `/data/de/x.json` 404s or fails Zod
validation, load `/data/en/x.json` instead — the entire file, not a
per-field merge.

**Rationale**: Deep-merging a German overlay onto English for per-field
fallback requires array-merge semantics (element-wise vs. replace,
differing array lengths across `experiences[]`) — exactly the kind of
clever-trick complexity Principle I (NON-NEGOTIABLE, KISS) forbids. It would
also let a half-translated file ship looking finished instead of visibly
falling back.

**Consequence**: a German file must be complete for its section, or absent
entirely. Enforced by `tests/integration/locale-parity.test.ts`.

**Alternatives considered**: per-field deep merge — rejected, complexity and
silent partial-translation risk.

## R-004 — UI chrome strings

**Decision**: JSON dictionaries in `lib/i18n/` (`ui.en.json`, `ui.de.json`),
validated by one shared Zod schema (`lib/i18n/uiSchema.ts`, every leaf
`z.string()`), with completeness enforced by a dedicated key-parity test
(`tests/unit/i18n/ui-parity.test.ts`) rather than by the TypeScript
compiler.

**Rationale**: keeps chrome strings in the same format as authored content
(JSON everywhere, one editing mental model, no `.ts` object-literal syntax
for a non-developer editor to trip over). The completeness guarantee moves
from `pnpm type-check` to `pnpm test`: the parity test recursively flattens
`ui.en.json`'s keys, asserts every other locale file has the exact same key
set (no missing, no extra) and that every leaf is a non-empty string. CI
already blocks merge on test failure (Development Workflow, constitution),
so this is not a weaker gate in practice — it is the same enforcement
strength, relocated to the gate the constitution's Test-First principle
(NON-NEGOTIABLE) already requires writing for new functionality anyway.
JSON files here are statically imported at build time (`import uiEn from
'./ui.en.json'`), not fetched over the network at runtime, so the
first-paint risk that would apply to *fetched* JSON (empty labels before a
request resolves, since chrome has no loading skeleton today) does not
apply — bundling behaviour is the same as it would be for a TS object
literal.

**Access pattern**: direct property access (`ui.nav.jumpTo`), never dynamic
key lookup (`ui[someVar]` or `t('nav.jumpTo')`) — dynamic lookup would
bypass the schema/parity guarantees the same way it would bypass a
TypeScript `satisfies` check.

**Interpolation**: `format(template, vars)` in `lib/i18n/format.ts` (~8
lines, pure, unit-tested), e.g.
`format('Technologies used at {company}', { company })`.

**Alternatives considered**: typed TypeScript dictionaries (`ui.en.ts` /
`ui.de.ts` with `satisfies Ui`) — gives compile-time rather than test-time
completeness checking, which is marginally stronger in theory (fails
`pnpm type-check` instead of `pnpm test`) but was set aside in favour of
keeping every content format in the project as JSON, for consistency and
editability, since CI enforces both gates equally; `t()` key-string lookup
(i18next-style) — rejected regardless of file format, no completeness
guarantee at all without additional tooling, and Principle I disfavors the
indirection when direct property access is equally simple.

## R-005 — Locale-invariant fields

Fields that MUST be byte-identical across every locale's content file (not
translated):

- `experiences[].dateText`
- `experiences[].subtitle` (company legal names — also the join key for
  `sinceByEmployer` per ADR 0023)
- `experiences[].technologies[]`
- `technologies[].name`
- `technologies[].matches[]`
- `technologies[].sinceByEmployer`
- every `id`
- every `route` / `href` / `url`
- every `image` / `imageSource` / `icon.src`
- `project.year`
- `education.url` / `education.media`

`technologies.categories[]` and `technology.category` are translatable but
must stay internally consistent within a single locale's file — the
existing `superRefine` validation already enforces that and needs no
change.

## R-006 — Derived English strings

Three modules currently leak English through logic rather than data, and
must change or FR-003/SC-002 fail:

- **`lib/utils/techDuration.ts`**: `formatDuration` currently returns
  `'< 1 yr'` / `'3.5 yrs'`. Becomes `formatDuration(months, locale, labels)`
  using `Intl.NumberFormat(locale)` for the German decimal comma. `type
  Level = 'Daily driver' | 'Production' | 'Working knowledge'` stays as an
  invariant key, mapped through `ui.technologies.levels[level]` at render
  time — components never branch on locale directly.
- **`components/Education/grade.ts`**: `gradeBadgeLabel` currently returns
  `'Very Good' | 'Good' | 'Satisfactory' | 'Sufficient'`. Becomes a key
  (`'veryGood' | 'good' | 'satisfactory' | 'sufficient'` or passthrough for
  numeric grades); `EducationSection` maps the key through the dictionary.
  Its existing comma-decimal handling for German-style grades like `"1,9"`
  is already correct and is kept as-is.
- **`components/Career/chapters.ts`**: `position` values (`'Goalkeeper'`,
  `'Striker'`, …) appear on the pitch visualisation and in `CareerPitch`'s
  `aria-label` — become keys mapped through `ui.career.positions`.
  `experiences[].workType` (a Zod enum) is likewise an invariant key mapped
  through `ui.career.workTypes`.
- **`"Present"` in `dateText`**: matched case-insensitively by
  `DATE_RANGE_PATTERN` in `techDuration.ts`. Kept as the literal `"Present"`
  in the data (so parsing logic is untouched) and rendered through a
  display transform that substitutes `ui.career.present` (`"Heute"`) only
  at the point of display.

## R-007 — `<html lang>`

**Decision**: `LocaleProvider` sets `document.documentElement.lang = locale`
in an effect. `app/layout.tsx` keeps a server-rendered `lang="en"`; `<html>`
already carries `suppressHydrationWarning` (for `next-themes`), so this adds
no new hydration warning.

**Rejected**: an inline pre-paint script to set `lang` before first paint —
it could fix the attribute a frame earlier but cannot fix the React text
content, which flips after hydration regardless of when `lang` updates; not
worth the extra script under Principle I. Accepted trade-off: a returning
German-preferring visitor sees English chrome for roughly one frame before
the effect runs. Content itself is unaffected because it is already fetched
client-side behind loading skeletons today.

## R-008 — Server-rendered landmark labels

**Decision**: introduce a small client component `Chapter.tsx`
(`<Chapter id label className>`) that wraps each `<section>` landmark so its
`aria-label` can read from `useUi()`.

**Rationale**: `app/page.tsx` is a server component (it exports `metadata`)
and currently hard-codes seven `aria-label`s directly in JSX. It cannot call
a client hook. Converting the whole page to a client component would lose
the static `metadata` export; leaving the labels English would violate
SC-002 for screen-reader users. A thin client wrapper isolates the one
piece that needs client-side locale awareness without moving the rest of
the page.

**Alternatives considered**: convert `page.tsx` to a client component —
rejected, loses `metadata`; leave landmark labels English — rejected,
violates SC-002.

## R-009 — Content cache key

`useContentLoader`'s module-level `contentCache` is currently keyed by
`fileName` alone. It must be re-keyed to `` `${locale}/${fileName}` `` (or
equivalent), or switching to German would silently serve already-cached
English data. Flagged explicitly here because this failure mode is silent —
no error, just stale-language content — and easy to miss in review.

## R-010 — Toggle semantics

**Decision**: the toggle button advances to the next entry in
`SUPPORTED_LOCALES` and wraps around — one interaction satisfies SC-001
with two locales, and remains one interaction if a third language is added
later (no component change required, per FR-007). The visible label shows
the *next* locale's short code (e.g. `DE` while English is active); the
`aria-label` is a full sentence naming both the current and target language
(FR-010).

## R-011 — No browser-language detection

Per the spec's Assumptions and the constitution's Theming-bullet posture
("nothing may serve a visitor a preference they did not ask for"),
`navigator.language` / `Accept-Language` is never read to choose the
initial locale. The site always starts in English until the visitor
explicitly toggles.
