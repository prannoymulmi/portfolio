# Editing portfolio content

All portfolio content lives per locale under `public/data/<locale>/*.json`
(`public/data/en/` is the English set and the universal fallback; see
"Adding a language" below for `public/data/de/` and beyond — ADR 0024). Edit
a file, save, refresh the browser — no rebuild needed (the JSON is served
with a 5-minute CDN cache; see `next.config.ts`).

There is no standalone `validate:json` script in this repo today —
`package.json`'s `validate:json` entry points at
`lib/scripts/validate-json.js`, which does not exist (the only file in
`lib/scripts/` is `migrate-content.ts`). The closest thing to "validate
before pushing" today is `pnpm test`, which runs `tests/unit/validation.test.ts`
against the real shipped JSON, plus `tests/integration/content-sources.test.ts`
and `tests/integration/locale-parity.test.ts` for the per-locale content set.
A dedicated CLI validator is a separate, unfiled gap — not something this
feature adds.

Every file is also validated at runtime against a Zod schema in
`lib/utils/validation.ts`. If a field is missing or wrong-typed the
section will render "Failed to load …" and log a specific error to the
browser console — check there first when something disappears.

## Files at a glance

| File | Renders | Type source |
|---|---|---|
| `home.json` | Hero (name + rotating roles) | `Home` |
| `experiences.json` | Career journey milestones | `ExperiencesFile` |
| `education.json` | Education & certifications | `EducationFile` |
| `projects.json` | Project gallery | `ProjectsFile` |
| `navbar.json` | Top nav links | `NavbarConfig` |
| `social.json` | Social links (footer + about page) | `SocialFile` |
| `routes.json` | Reserved / not currently rendered | `RoutesFile` |

`about.json` and `skills.json` no longer exist — About folded into the Hero
biography (ADR 0016) and Skills was replaced by the Work showcase (ADR 0020).
Paths above are relative to a locale directory, e.g. `public/data/en/home.json`.

Full type definitions: `lib/types/portfolio.ts`.

## Common edits

### Add a new job

`public/data/en/experiences.json` — prepend to `experiences` (most recent first):

```json
{
  "title": "Staff Engineer",
  "subtitle": "Company Name",
  "workType": "Full-time",
  "workDescription": [
    "Led migration of legacy monolith to service-oriented architecture.",
    "Mentored three engineers to senior."
  ],
  "dateText": "2025-01",
  "technologies": ["Kubernetes", "Go", "Postgres"]
}
```

`dateText` is parsed with `new Date()` for sorting — ISO `YYYY-MM` works
best. `workType` must be one of `Full-time | Part-time | Contract | Freelance`.

### Add a project

`public/data/en/projects.json` — append to `projects`:

```json
{
  "title": "Project Name",
  "bodyText": "One paragraph describing the problem, your approach, and the outcome. Aim for 2-4 sentences — the card truncates after ~3 lines.",
  "image": "/images/projects/project-name.png",
  "tags": ["TypeScript", "AWS", "Terraform"],
  "links": [
    { "text": "View Case Study", "route": "/case-studies/project-name" },
    { "text": "GitHub", "route": "https://github.com/..." }
  ]
}
```

Link text must be at least 5 characters (Zod min length). If the route
starts with `http`, the card opens it in a new tab with safe rel attrs.

### Change navbar links

`public/data/en/navbar.json` — order in the `sections` array is display order.
Set `"type": "link"` for external URLs (opens in a new tab).

## Images

Put images under `public/images/`. Reference them by absolute path
(`/images/foo.png`). Next.js Image component optimizes them automatically
(AVIF/WebP, responsive sizes). Cache TTL is one year — rename the file
to bust caches.

## When the site says "Failed to load …"

1. Open browser DevTools console. Zod error messages include the field
   path and expected type.
2. Common causes:
   - Missing required field (e.g. new object without `title`).
   - Wrong type (`"tags": "TypeScript"` instead of `["TypeScript"]`).
   - String too short (see min lengths in `lib/utils/validation.ts`).
3. Fix the JSON, refresh. No restart needed.

## Adding a language

The content set and the UI chrome dictionary are both per-locale (ADR
0024). Adding a new language is three additive steps — no component,
content loader, or Zod schema change is required (FR-007,
contracts/locale-content-set.md §Extension rule):

1. Add one entry to `SUPPORTED_LOCALES` in `lib/i18n/locales.ts`
   (`{ code, label, shortLabel, htmlLang }`). This is also the single line
   that makes the language toggle appear — it renders nothing while fewer
   than two locales are registered.
2. Create `public/data/<code>/` and add as many of the ten content files
   (`home.json`, `experiences.json`, `education.json`, `projects.json`,
   `systems.json`, `principle.json`, `routes.json`, `social.json`,
   `technologies.json`, `navbar.json`) as you have translations for. You
   don't need all ten on day one.
3. Create `lib/i18n/ui.<code>.json` — a full translation of every key in
   `lib/i18n/ui.en.json` (same shape, no missing or extra keys).

**Whole-file English fallback**: `public/data/en/` is the universal
fallback and must always ship all ten files. For any `(locale, file)` pair,
if the new locale's file is missing, 404s, or fails Zod validation, the
loader fetches the whole English file instead — never a per-field merge.
A locale directory can therefore ship a partial set of files on day one;
whatever it doesn't have falls back to English, whole-file, chapter by
chapter.

**Locale-invariant fields**: some fields must be copied byte-for-byte from
the English file, not translated, because other code keys off them —
`id` (and any field used as a join key or DOM anchor), `dateText`
(including the literal `"Present"`), `subtitle` (also the
`sinceByEmployer` join key), every `technologies[]` array, `name` and
`matches[]` in `technologies.json`, `year`, and every `route`/`href`/`url`/
`image`/`imageSource`/`icon.src`/`education.url`/`education.media` field.
See contracts/locale-content-set.md's full table before translating a new
locale's copy of `experiences.json` or `technologies.json` in particular —
a "helpfully" translated technology name silently breaks the cross-file
join between the two.

**Grade text in `education.json`'s `cardDetailedText`**: a numeric grade
("1.9 Grade") is parsed by `components/Education/grade.ts` into a
qualitative badge ("Good") — it looks for a numeric token at the *start* of
the string. A natural translation that puts the word first ("Note 1,9"
instead of "1,9 Note") silently stops matching: the whole string falls
back to showing as a raw, untranslated passthrough label instead of a
badge. This exact mistake shipped in `de/education.json` for a while. The
raw text is never shown once it does parse (it only ever surfaces as the
translated badge label plus the grade in parentheses, e.g. "Gut (1,9)"),
so word order here doesn't need to read naturally — only
`grade.ts`'s `gradeValue`/`gradeBadgeLabel` need to parse it. A
non-numeric classification like "Distinction"/"Auszeichnung" has no such
constraint; it always renders verbatim.

**No third language ships today.** `SUPPORTED_LOCALES` holds `en` and `de`
only. The steps above are the extension path for a future contributor, not
a promise of what currently exists. The parity tests
(`tests/unit/i18n/ui-parity.test.ts` for the dictionary,
`tests/integration/locale-parity.test.ts` for the content set) are what
will tell that contributor whether their new locale is complete — run
`pnpm test` after adding one.

## Adding a new content type

Rarely needed, but if you do:

1. Add the JSON file to `public/data/en/` (and any other locale directory
   that has a translation — see "Adding a language" above).
2. Define types in `lib/types/portfolio.ts`.
3. Define a Zod schema in `lib/utils/validation.ts`.
4. Add a `useContentLoader` call in `components/Common/ContentProvider.tsx`
   and expose it on the context.
5. Consume via `useContent()` in whichever component needs it.
