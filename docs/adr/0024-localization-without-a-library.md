# ADR 0024: Localization without an i18n library

- **Status**: Accepted
- **Date**: 2026-08-19
- **Amends**: Principle IV of the [constitution](../../.specify/memory/constitution.md),
  v1.5.0 → v1.6.0, in this PR. The Content bullet's literal `public/data/` becomes
  `public/data/<locale>/`, and a new Localization bullet names the locale state
  owner the way the Theming bullet already names `next-themes` — so a future
  hand-rolled duplicate, or a message framework arriving quietly as a
  dependency, both need an amendment rather than a commit.
- **Extends**: [ADR 0003](0003-client-content-loading-with-zod.md) — the fetch
  path gains a locale segment and a whole-file fallback. The client-side,
  Zod-validated loading model itself is unchanged.
- **Constrained by**: [ADR 0012](0012-single-page-story.md) — one scrolling
  story at `/`; sections are anchors, not routes.

## Context

The site owner asked for a German version of the site with a button to toggle
between languages, English as the default, and enough structure that a third
language could be added later without a rework.

The default answer to that request in a Next.js App Router project is
`next-intl`. It is the App-Router-native option, it is actively maintained, and
choosing it would be defensible without further argument. What makes this worth
an ADR is that *both* answers change the fixed stack. Adding `next-intl` is a
new dependency; not adding it still moves where authored content lives, from
`public/data/*.json` to `public/data/<locale>/*.json`, and introduces a second
cross-cutting piece of client state alongside theme. There is no version of
this feature that leaves Principle IV alone, so the cheaper-looking option had
to be argued rather than assumed.

The relevant facts about the site, counted rather than estimated:

- **112 UI chrome strings**, across eleven groups (`nav`, `hero`, `work`,
  `career`, `technologies`, `education`, `projects`, `contact`, `footer`,
  `errors`, `a11y`). Everything longer than a label — bios, project
  descriptions, achievement bullets — is authored content in JSON, not strings
  in code.
- **Two locales**, both LTR, both Latin script, both with the same
  one/other plural rule.
- **One locale-sensitive number in the entire codebase**: `formatDuration` in
  `lib/utils/techDuration.ts`, which renders `3.5 yrs` and needs to render
  `3,5 J.` in German.
- **Zero dates formatted from a `Date`**. `experiences[].dateText` is authored
  literal text (`"09/2020 – Present"`) and is a locale-invariant field —
  `parseDateText` reads it, nothing formats it.
- **One translator, who is the site owner**, reviewing German in the PR. No
  handoff, no TMS, no XLIFF, no extraction tooling.

## Decision

No i18n library. The site localizes itself with React Context, per-locale
content directories, and two JSON dictionaries. `package.json` gains nothing.

### Why not `next-intl`

`next-intl` is routing-first, and this site does not route. Its supported
setups resolve a locale per request in middleware and serve it from a
locale-prefixed pathname (`/en`, `/de`) or a per-locale domain. That is the
right model for a site made of pages. This site is one page: ADR 0012 fixed the
structure as a single scrolling story where every section is an anchor, and the
spec for this feature independently assumed the toggle switches content in
place on the same URL, because that is what "a button to toggle" means.

Adopting `next-intl` therefore forces a choice between two bad outcomes.
Take the prefixed routes, and ADR 0012 is overturned for a reason that has
nothing to do with why it was written; every anchor doubles (`/de#career`
alongside `/#career`), `sitemap.ts` and `robots.ts` ([ADR 0008](0008-file-based-seo-conventions.md))
grow a second set of entries, the legacy redirects need a matrix rather than a
list, and the middleware runs on every request to a site that has one. Or keep
the single URL and drive the locale from client state, which means paying for a
framework and then using the part of it the framework is least built around —
the message catalogue — while routing off the parts that justify it.

The second outcome is the one that would actually have been implemented, and it
is worth naming plainly: it would leave a dependency in the tree whose primary
value proposition is switched off.

### Why the message-formatting case is weak here

The strongest argument for any i18n library is ICU message formatting —
plurals, gender, ordinals, embedded number and date formats, all in one
translator-editable string. Against the counts above, that argument does not
reach.

German and English share the same plural categories, so `{count, plural, ...}`
buys nothing a second dictionary key does not. There is one number to format,
and `Intl.NumberFormat` is in the platform — the same standard library ICU
tooling ultimately delegates to — so `formatDuration(months, locale)` gets its
German decimal comma from one built-in call. There are no dates to format,
because dates are authored as text. There is no RTL, so no bidirectional
layout, no logical-property sweep, no mirrored icons. And with the translator
and the developer being the same person reviewing one PR, the extraction and
handoff tooling that makes a library pay for itself on a real product has no
workflow to serve.

What remains is string interpolation: a handful of templates like
`"Technologies used at {company}"`. That is `lib/i18n/format.ts`, about eight
lines, pure and unit-tested. Unknown placeholders are left intact rather than
thrown on — visibly wrong in development, not fatal in production.

### What is added instead

- **`components/Common/LocaleProvider.tsx`** owns the active locale: a Context
  over `useState<Locale>('en')`, a mount effect that reads
  `localStorage['locale']` through an `isLocale()` guard inside a `try`, a
  writer on every toggle, and an effect setting `document.documentElement.lang`.
  Server render and hydration render both say `en`, so nothing mismatches;
  `<html>` already carries `suppressHydrationWarning` for `next-themes`.
  Anything unreadable, unrecognised, or absent resolves to English.
- **`lib/i18n/locales.ts`** is the registry, and the only extension point.
  Adding a third language is one entry in `SUPPORTED_LOCALES`, one
  `public/data/<code>/` directory, one `ui.<code>.json`. No component changes.
- **`public/data/<locale>/*.json`** holds authored content, validated against
  the same, unmodified Zod schemas in `lib/utils/validation.ts` that the
  single-locale files validate against today. Adding a locale never touches a
  schema. Fallback is **whole-file**: a missing or invalid `de/projects.json`
  serves `en/projects.json` entirely. Deep-merging a German overlay onto
  English would need array-merge semantics across entries of differing length
  and would let a half-translated file ship looking finished — Principle I
  forbids the first, and the second is the failure mode this feature exists to
  avoid.
- **`lib/i18n/ui.en.json` / `ui.de.json`**, statically imported and bundled,
  validated by one shared schema in `lib/i18n/uiSchema.ts` and held to exact
  key parity by `tests/unit/i18n/ui-parity.test.ts`. Access is always direct
  property access (`ui.nav.jumpTo`), never `ui[key]` or `t('nav.jumpTo')` —
  dynamic lookup would bypass both guarantees.
- **Three pure modules stop emitting English.** `lib/utils/techDuration.ts`
  (proficiency levels), `components/Education/grade.ts` (grade bands) and
  `components/Career/chapters.ts` (pitch positions) return locale-invariant
  keys that components map through the dictionary. No component branches on a
  language.

This is the appropriately sized solution for a two-locale personal site. It
would be the wrong solution for ten locales with outside translators, and the
list above is short enough that swapping it for a library later is a
mechanical change across the ~30 components calling `useUi()` for 112
dictionary keys, not an architectural one.

### Why JSON dictionaries rather than typed TypeScript modules

A closely related question, and the same theme: the plan originally called for
`ui.en.ts` / `ui.de.ts` with `satisfies Ui`, so a missing German key would be a
compile error. That was set aside for JSON validated by a Zod schema plus a
key-parity test.

The trade is real and small. A `satisfies` check fails in `pnpm type-check`; the
parity test fails in `pnpm test`. CI blocks merge on both, so the enforcement
strength is unchanged in practice — it moves to the gate that Principle II
(NON-NEGOTIABLE) already requires writing a test for. What is bought is one
content format across the whole site: every string a visitor reads lives in a
`.json` file, whether it is a nav label or a bio paragraph, with no
object-literal syntax to trip over. The parity test also catches two things
`satisfies` does not — a *surplus* key in a translation, and an empty-string
leaf that type-checks perfectly and renders as nothing.

The bundling behaviour is identical either way. Both files are statically
imported at build time, not fetched, because the site's chrome has no loading
skeleton and a runtime fetch would risk painting empty labels.

## Consequences

**Positive**

- **Zero new dependencies.** The install footprint, the bundle, and the peer
  graph are unchanged.
- **One URL.** `sitemap.ts`, `robots.ts`, the legacy redirects, every in-page
  anchor and every external link into a section keep working untouched. ADR
  0012 is not overturned.
- **Adding a third language is three additive things** — a registry entry, a
  content directory, a dictionary file — and zero component edits. That is the
  extensibility the owner asked for, and it is verifiable by review rather than
  promised.
- **The content schemas did not change.** A locale is a directory, not a shape.
- **The cost is measurable and small**: two bundled dictionaries, measured at
  roughly 1.9 KB (`ui.en.json`) and 2.2 KB (`ui.de.json`) gzipped, plus one
  extra content fetch per file when the visitor switches locale.

**Negative**

- **A test is the only thing between a missing German key and a blank label.**
  Delete `tests/unit/i18n/ui-parity.test.ts` and the completeness guarantee
  leaves with it, silently. A `satisfies` check could not be deleted without
  someone noticing the type going unused.
- **Nothing stops a future component from hard-coding an English string.** The
  grep-based `no-locale-branching` test catches locale *branching*, not
  untranslated literals. Every component added after this feature is one
  forgotten `useUi()` away from a mixed-language section, and no gate will say
  so.
- **German is invisible to search.** No German URL exists, so there is no
  `hreflang`, `openGraph.locale` stays `en_US`, and the JSON-LD in
  `StructuredData.tsx` stays English. The German site is for a human who
  arrives and clicks; it will not be found by a German-language query. That is
  the accepted price of the single-URL model, not an oversight.
- **Revisiting this is a rewrite, not an install.** If the site ever needs ICU
  plurals, gendered strings, locale-aware date formatting, or a real translator
  workflow, adopting a library means changing every one of the ~30 components
  calling `useUi()` and probably reintroducing the routing question. The bet is
  that a personal portfolio in two languages never needs those. If it does,
  this record is the argument to re-open.
- **Two string homes with two loading models.** Chrome strings are bundled
  imports; authored content is a runtime fetch. `contracts/ui-dictionary.md`
  draws the line — anything a visitor reads that is not authored prose is
  chrome — but the line has to be remembered, and the first person to put a bio
  paragraph in `ui.de.json` will not get an error.
- **A partially translated section falls back entirely, not partially.** By
  design: loud beats plausible. It does mean a German file with one untranslated
  bullet must either be finished or removed; there is no middle setting.
- **One frame of English chrome** for a returning German visitor, before the
  mount effect runs. A pre-paint script could fix the `lang` attribute a frame
  earlier but not the React text, which flips after hydration regardless.

## Alternatives rejected

- **`next-intl`**: the default answer, and the one this ADR exists to argue
  against. Routing-first — locale-prefixed pathnames and per-request middleware
  — which collides head-on with ADR 0012's single scrolling story and with the
  spec's own "same URL, one button" requirement. Using it without its routing
  leaves a dependency whose main value is switched off.
- **`react-i18next` / `i18next`**: routing-agnostic, so it clears the ADR 0012
  objection, but it brings a `t('nav.jumpTo')` key-string API with no
  completeness guarantee at all without extra tooling — strictly worse than the
  parity test on the one axis that matters here — plus a backend/detector plugin
  ecosystem for problems this site does not have.
- **A second `next-themes` instance with `attribute="lang"`**: reuses a
  dependency already in the stack, and injects a second pre-paint blocking
  script for a concern that is not a theme. Principle IV names `next-themes` as
  the *theme* state owner specifically; borrowing it for language would make
  that entry mean something it does not say.
- **A `?lang=de` query parameter as the source of truth**: re-introduces a
  URL-shaped concern the spec's assumptions explicitly ruled out, and would
  make every in-page anchor responsible for carrying the parameter forward.
  `useSearchParams` also opts its subtree out of static rendering unless wrapped
  in Suspense — the same trap documented in
  [ADR 0019](0019-dark-mode-behind-an-experiment-flag.md), and this state is read
  from chrome that renders everywhere.
- **Browser-language detection** (`navigator.language` / `Accept-Language`):
  rejected on the same principle the Theming bullet already states — nothing may
  serve a visitor a preference they did not explicitly ask for. English until
  the visitor says otherwise.
- **Typed TypeScript dictionaries with `satisfies Ui`**: the stronger
  completeness gate on paper, and genuinely close. Traded for one content format
  across the whole site, and for a test that also catches surplus keys and empty
  strings, given CI blocks merge on either gate.
- **A runtime machine-translation widget**: no content work at all, and the
  worst possible outcome — unreviewable German over a portfolio whose entire
  purpose is that its author wrote it.
