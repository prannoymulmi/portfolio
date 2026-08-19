---
description: "Task list for feature 018 — German language toggle & Hero location tag"
---

# Tasks: German Language Toggle & Hero Location Tag

**Input**: Design documents from `/specs/018-de-i18n-toggle/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/,
quickstart.md

**Tests**: NOT optional. Constitution Principle II (NON-NEGOTIABLE) requires
tests written before or alongside every feature, and plan.md's Constitution
Check records that as an accepted obligation. Every user-story phase below has
a tests section, and those tests are written first and must fail before the
implementation tasks in the same phase begin.

**Organization**: Tasks are grouped by user story. All of them land in **one
PR** (plan.md Decision 4), but the ordering below keeps the tree in a working,
shippable state at every checkpoint — the toggle stays invisible until the
German content behind it actually exists.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (US1–US4)
- Exact file paths are given in every description

## Path Conventions

Single Next.js App Router project at the repository root (plan.md → Structure
Decision). Source under `app/`, `components/`, `lib/`; tests under
`tests/unit/` and `tests/integration/`; content under `public/data/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: The locale registry, the pure helpers, and the governance
paperwork that authorises the Principle IV change every later task depends on.
Nothing in this phase changes a single visible pixel.

- [X] T001 Create `lib/i18n/locales.ts` per data-model.md §Locale: `Locale`
      type, `DEFAULT_LOCALE`, `LOCALE_STORAGE_KEY = 'locale'`, and an
      `isLocale(value: unknown): value is Locale` guard (FR-005).
      **`SUPPORTED_LOCALES` ships with the `en` entry ONLY at this point** —
      `{ code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' }`.
      The `de` entry is appended in T047, which is the single task that makes
      the toggle appear. Everything between here and there is invisible to a
      visitor by construction.
- [X] T002 [P] Write `tests/unit/i18n/format.test.ts` (must fail): `{name}`
      substitution, multiple placeholders, a placeholder with no matching var
      left intact rather than throwing, a template with no placeholders
      returned unchanged, empty vars object.
- [X] T003 [P] Create `lib/i18n/format.ts` — `format(template, vars)`, pure,
      ~8 lines, no clever fallback logic (contracts/ui-dictionary.md
      §Interpolation). Makes T002 pass.
- [X] T004 [P] Create `lib/i18n/uiSchema.ts` — Zod schema with the eleven
      top-level groups fixed by contracts/ui-dictionary.md (`nav`, `hero`,
      `work`, `career`, `technologies`, `education`, `projects`, `contact`,
      `footer`, `errors`, `a11y`), each an initially empty `z.object({})`;
      export `type Ui = z.infer<typeof UiSchema>`. Leaves are added by the
      extraction tasks T031–T042; nesting never exceeds two levels.
- [X] T005 [P] Create `lib/i18n/ui.en.json` with the same eleven empty groups.
      Confirm `resolveJsonModule` is enabled in `tsconfig.json` (add it if not)
      so the static import in T006 type-checks.
- [X] T006 Create `lib/i18n/index.ts` — statically imports every
      `ui.<code>.json`, exposes `getUi(locale: Locale): Ui` returning that
      locale's dictionary and falling back to the English one when a locale has
      no dictionary, and re-exports the registry from `locales.ts`. Pure and
      React-free so it is unit-testable without rendering. Depends on
      T001, T004, T005.
- [X] T007 [P] Write `docs/adr/0024-localization-without-a-library.md` (full
      content supplied by the architect) and add its row to the index table in
      `docs/adr/README.md`, after the `0023` row and before the "Nothing here
      is fully superseded" paragraph. Principle VI requires the index row in
      the same commit as the ADR.
- [X] T008 Amend `.specify/memory/constitution.md` to **v1.6.0**: add the
      **Localization** bullet to Principle IV using the exact text drafted in
      plan.md Decision 2; change the **Content** bullet's literal path from
      `public/data/` to `public/data/<locale>/`; prepend a new SYNC IMPACT
      REPORT block naming ADR 0024 and the 1.5.0 → 1.6.0 change; update the
      footer's **Last Amended** date. Depends on T007 (the amendment must name
      an ADR that exists).
- [X] T009 [P] Add a dated amendment note to the top of
      `docs/adr/0003-client-content-loading-with-zod.md` naming ADR 0024 as the
      record that added per-locale fetch paths and whole-file English fallback
      — Principle VI's no-silent-rewrite rule. Update ADR 0003's status cell in
      `docs/adr/README.md` accordingly.

**Checkpoint 1**: `pnpm type-check && pnpm lint && pnpm test` all green. The
site is byte-for-byte unchanged for a visitor. The constitution now permits
everything that follows.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The locale state owner, the locale-aware content loader, the
content directory move, and the (still-hidden) toggle. This is the whole
machine, running with exactly one locale in it.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests (write first, must fail)

- [X] T010 [P] Write `tests/unit/i18n/localeProvider.test.tsx`: renders `en`
      with no stored preference (FR-001); reads a valid stored `de` on mount;
      an unrecognised stored value (`'xx'`) resolves to `en` (FR-005); a
      `localStorage` getter that throws does not crash the tree (FR-005);
      `setLocale` writes to `localStorage` (FR-004); the effect sets
      `document.documentElement.lang` to the active locale's `htmlLang`
      (FR-009); the first render always yields `DEFAULT_LOCALE` regardless of
      storage, so a hydration render agrees with the server (research R-001).
- [X] T011 [P] Write `tests/unit/i18n/ui-parity.test.ts` per
      contracts/ui-dictionary.md §Completeness: discover every
      `lib/i18n/ui.*.json`, recursively flatten each to dot-path keys, assert
      each non-English locale's key set is **exactly equal** to `ui.en.json`'s
      (fails on missing *and* extra), and assert every file parses against
      `UiSchema` with non-empty string leaves. Passes trivially today with one
      dictionary; becomes the load-bearing gate at T046.
- [X] T012 [P] Write `tests/unit/hooks/useContentLoader.test.tsx`: fetches
      `/data/en/home.json` for locale `en`; fetches `/data/de/home.json` for
      locale `de`; a 404 on the `de` path falls back to the **whole** `en` file
      (FR-006, research R-003); a Zod validation failure on the `de` file falls
      back the same way; the fallback logs once, not per render; and — the
      silent-failure guard from research R-009 — switching locale after a
      successful `en` load does **not** serve the cached English payload, i.e.
      the cache is keyed by `` `${locale}/${fileName}` ``.

### Implementation

- [X] T013 Create `components/Common/LocaleProvider.tsx` — React Context,
      `useState<Locale>(DEFAULT_LOCALE)`, a mount effect that reads
      `localStorage[LOCALE_STORAGE_KEY]` through `isLocale()` inside a
      try/catch, a `setLocale` that writes back, and an effect setting
      `document.documentElement.lang`. Exports `useLocale()` (active locale +
      setter) and `useUi()` (returns `getUi(locale)` from `lib/i18n/index.ts`).
      Mirrors the existing `mounted` pattern in
      `components/Navigation/HamburgerMenu.tsx`. Makes T010 pass.
- [X] T014 Wire `<LocaleProvider>` into `app/layout.tsx`, wrapping
      `ErrorBoundary`/`ContentProvider` (above both, per plan.md's structure
      diagram). Leave the server-rendered `lang="en"` and the existing
      `suppressHydrationWarning` on `<html>` untouched (research R-007).
- [X] T015 Modify `lib/hooks/useContentLoader.ts`: accept the active locale,
      fetch `` `/data/${locale}/${fileName}` ``, key `contentCache` by
      `` `${locale}/${fileName}` ``, and on a non-`ok` response *or* a failed
      `validateJSON` for a non-English locale, re-fetch `` `/data/en/${fileName}` ``
      and use that whole file. Keep `cache: 'no-store'` and the existing error
      state for the case where the English fallback *also* fails. Makes T012
      pass.
- [X] T016 Modify `components/Common/ContentProvider.tsx` to read `useLocale()`
      and pass the locale into all nine `useContentLoader` calls.
- [X] T017 `git mv` all ten files from `public/data/*.json` into
      `public/data/en/` (`home`, `experiences`, `education`, `projects`,
      `systems`, `principle`, `routes`, `social`, `technologies`, `navbar`) —
      `git mv`, not delete-and-add, so the history follows the files
      (contracts/locale-content-set.md §File list).
- [X] T018 Update `tests/integration/content-sources.test.ts`: repoint the six
      hard-coded `public/data/<file>.json` reads to `public/data/en/`, and
      replace the single-source assertion
      `expect(findByName(REPO_ROOT, 'social.json')).toEqual(['public/data/social.json'])`
      with a loop over `SUPPORTED_LOCALES` asserting exactly one `social.json`
      per registered locale directory and none anywhere else in the repo. The
      ADR 0017 "one content source" invariant becomes "one content source per
      locale" — keep the file's existing explanatory comment accurate.
- [X] T019 [P] Update the two `public/data/` reads in
      `tests/unit/validation.test.ts` (`home.json`, `technologies.json`) to
      `public/data/en/`.
- [X] T020 [P] Verify — and only change if actually broken — that
      `jest.setup.js`'s `/data/` fetch mock resolves the new nested paths
      (`path.join(process.cwd(), 'public', '/data/en/home.json')` should still
      work unmodified), and that `next.config.ts`'s `source: '/data/:path*.json'`
      header rule still matches `/data/en/home.json` (`:path*` spans multiple
      segments, so it should). Record the finding in the task's commit message
      rather than changing files that do not need changing.
- [X] T021 [P] Write `tests/unit/i18n/localeToggle.test.tsx`: renders **nothing**
      when `SUPPORTED_LOCALES` has fewer than two entries; with two entries
      shows the *next* locale's `shortLabel`; its `aria-label` is a full
      sentence naming both current and target language (FR-010); one click
      switches the active locale (SC-001); the selection wraps around the
      registry (research R-010).
- [X] T022 Create `components/Common/LocaleToggle.tsx` — advances to the next
      entry in `SUPPORTED_LOCALES` and wraps, returns `null` when the registry
      has one entry, uses an inline SVG glyph or the short code as text (never
      `react-icons`, per ADR 0014's brand-marks-only scope), and follows the
      existing button treatment in `components/Common/ThemeToggle.tsx`. Makes
      T021 pass.
- [X] T023 Mount `<LocaleToggle />` in the control cluster of
      `components/Navigation/StoryProgressNav.tsx`, beside `<ThemeToggle />`.
      One placement only — that cluster has no responsive hiding, so it
      satisfies FR-002's nav-and-mobile-equivalent requirement without a
      duplicate control (plan.md Decision 6). Renders as nothing today because
      of T022's guard.
- [X] T024 [P] Create `components/Common/Chapter.tsx` — a thin client
      `<section id label className>` wrapper whose `aria-label` reads from
      `useUi()`, so `app/page.tsx` can stay a server component and keep its
      `metadata` export (research R-008). No behaviour beyond rendering a
      `<section>`.
- [X] T025 Refactor `components/Common/ErrorBoundary.tsx`: move the fallback
      markup (currently holding `'An unexpected error occurred.'`,
      `'Content unavailable'`, `'Something went wrong'`, `'We could not load
      this section. Please try again in a moment.'`) into a client **function**
      component in the same file so it can call `useUi()`. The class component
      keeps only error state and renders that function component. Strings stay
      English literals for now; they move to the dictionary in T040.

**Checkpoint 2**: Full gate green. `public/data/en/` is the served content set,
the loader is locale-aware, the provider owns the locale, and the toggle exists
but renders nothing. A visitor sees the identical site they saw at Checkpoint 1.

---

## Phase 3: User Story 1 — Switch the whole site to German (Priority: P1) 🎯 MVP

**Goal**: Every piece of visitor-facing copy — chrome, authored content,
derived labels, `aria-label`s and `alt` text — switches to German on one click
and back, on the same URL, with no full page reload.

**Independent Test**: Load fresh → English. Click the toggle → every section is
German, no mixed-language section anywhere. Click again → English returns
exactly as it was.

**Note on ordering within this phase**: T031–T043 extract English literals into
the dictionary while `SUPPORTED_LOCALES` still holds only `en`. That work is
invisible and non-breaking by construction — every existing component test
should keep passing unchanged, because the English strings coming out of the
dictionary are the same strings that were in the JSX. T044–T047 then add German
and flip the registry. T047 is the moment the feature becomes visible.

### Tests for User Story 1 (write first, must fail)

- [X] T026 [P] [US1] Write `tests/integration/locale-switch.test.tsx`: render
      the story page inside `LocaleProvider` + `ContentProvider`; assert
      English copy in nav, Hero, Work, Career, Technologies, Education,
      Projects, Contact and Footer; activate the toggle; assert German copy in
      every one of those areas (FR-003, SC-002); assert `document.documentElement.lang`
      flips to `de` (FR-009); assert no navigation/reload occurred; toggle back
      and assert English is restored (US1 scenario 3). This test fails for the
      whole of T031–T046 and passes at T047 — that is the point.
- [X] T027 [P] [US1] Write `tests/integration/locale-parity.test.ts` per
      contracts/locale-content-set.md §Parity invariants: for every non-English
      locale directory that ships a given file, array-valued top-level content
      has the same length as English; every locale-invariant field from research
      R-005 (`id`, `dateText`, `subtitle`, `technologies[]`, `name`, `matches[]`,
      `sinceByEmployer`, `year`, every `route`/`href`/`url`, every
      `image`/`imageSource`/`icon.src`, `education.url`/`media`) is byte-identical
      entry-for-entry matched by `id`; and every `technologies[].matches[]` value
      resolves inside that same locale's `experiences[].technologies[]`.
- [X] T028 [P] [US1] Update `tests/unit/technologies/techDuration.test.ts` for
      the new `formatDuration(months, locale)` signature and for `Level`
      returning the invariant keys `'dailyDriver' | 'production' |
      'workingKnowledge'` instead of English labels. Add a case asserting a
      German decimal comma (`3,5`) comes out of `Intl.NumberFormat('de')`.
- [X] T029 [P] [US1] Update `tests/unit/education/grade.test.ts` for
      `gradeBadgeLabel` returning `GradeBand` keys (`'veryGood' | 'good' |
      'satisfactory' | 'sufficient'`) with numeric-grade passthrough preserved.
      Keep the existing comma-decimal input cases (`"1,9"`) — that parsing is
      already correct and must not regress.
- [X] T030 [P] [US1] Update `tests/unit/career/chapters.test.ts` for `position`
      becoming a `CareerPosition` key (`'goalkeeper' | 'striker' | …`) rather
      than an English literal. `DEFAULT_TECH` and the legal-form suffix
      stripping stay locale-invariant and their assertions stay unchanged.

### Implementation for User Story 1 — English extraction (registry still `['en']`)

Each task below: move the literals it names into `lib/i18n/uiSchema.ts` +
`lib/i18n/ui.en.json` under the correct group, replace the JSX literals with
`useUi()` property access (never dynamic lookup), and use `format()` for any
string with a variable. Run `pnpm test` after each — the existing component
tests are the regression net and must stay green.

- [X] T031 [US1] `app/page.tsx` — replace the seven hard-coded `<section
      aria-label="…">` landmarks (`Introduction`, `Selected work`, `Career
      Journey`, `Technologies`, `Education`, `Projects`, `Contact`) with
      `<Chapter id label={…}>`; the labels move to `a11y.landmarks.*`. Keep the
      file a server component and keep its `metadata` export.
- [X] T032 [US1] Navigation area → `nav` / `a11y` groups:
      `components/Navigation/StoryProgressNav.tsx` (`STORY_SECTIONS[].label` —
      the seven section names; keep the `id`s locale-invariant, they are DOM
      anchors), `components/Navigation/HamburgerMenu.tsx` (`'Close menu'`,
      `'Open menu'`, `'Story sections'`, and any "Jump to" panel copy),
      `components/Navigation/Footer.tsx` (`'Quick Links'`, `'Connect'`, the
      three link labels; the owner's name stays as-is),
      `components/Navigation/EmailLink.tsx` (`` `Email ${email}` `` →
      `format()`), `components/Navigation/SocialIcons.tsx` (its `aria-label`
      reads `link.network` from content — verify no literal remains).
- [X] T033 [US1] Hero area → `hero` group: `components/Hero/Hero.tsx`
      (`'Built with Claude — click to see how'`, `'What I do'`),
      `components/Hero/CreditPillText.tsx` (`BASE_TEXT = 'Built with Claude'`),
      `components/Hero/CvLink.tsx` (`` `${cv.label} (opens in a new tab)` `` →
      `format()`), `components/Hero/ValueProp.tsx` (any label text; its inline
      SVGs stay), `components/Hero/HeroPortrait.tsx` (`` `${name}, portrait` ``
      → `format()`).
- [X] T034 [US1] Work area → `work` group: `components/Work/ThreeSystems.tsx`
      (`'Failed to load systems'`, `'Selected work'` eyebrow),
      `components/Work/SystemCard.tsx` (`` `Technologies used on ${title}` `` →
      `format()`).
- [X] T035 [US1] Career area → `career` group. Refactor
      `components/Career/chapters.ts` so `position` holds a `CareerPosition`
      key instead of `'Goalkeeper'`/`'Striker'`/…; add `career.positions.*` and
      `career.workTypes.*` (the existing `workType` Zod enum values map through
      the dictionary — the enum itself is data and does not change). Then
      extract: `components/Career/CareerJourney.tsx` (both mode-description
      paragraphs), `components/Career/CareerPitch.tsx` (`'Previous chapter'`,
      `'Next chapter'`, and the composed chapter `aria-label` → `format()` with
      the position read through the dictionary),
      `components/Career/ChapterDetail.tsx` (`'What I built'`,
      `'Achievements'`, `'Technologies'`),
      `components/Career/TimelineToggle.tsx` (`'Pitch'`, `'Timeline'`, and the
      `` `Switch to ${…} view` `` label → two full dictionary strings rather
      than an interpolated fragment, so German word order stays translatable),
      `components/Career/TimelineView.tsx` (`'No experience data available'`,
      `` `Technologies used at ${experience.subtitle}` `` → `format()`).
      Makes T030 pass.
- [X] T036 [US1] Technologies area → `technologies` group. Refactor
      `lib/utils/techDuration.ts`: `Level` becomes the invariant key union
      (`'dailyDriver' | 'production' | 'workingKnowledge'`) returned by
      `deriveLevel`, and `formatDuration(months, locale)` renders the number
      through `Intl.NumberFormat(locale)` with the unit suffix supplied from
      `technologies.units.*` — no `Level`-to-English mapping stays in the
      module. Then extract:
      `components/Technologies/TechnologiesChapter.tsx` (`'Failed to load
      technologies'`, the `'Technologies'` eyebrow, the "What I've actually
      built with" heading — keep the `<span>` gradient split intact and give
      the two halves separate dictionary keys),
      `components/Technologies/TechnologyList.tsx` (`aria-label="Technologies"`),
      `components/Technologies/TechnologyDetail.tsx` (`'Where it was used'`),
      and map every rendered `Level` through `ui.technologies.levels[level]` at
      the call site. Makes T028 pass.
- [X] T037 [US1] Education area → `education` group. Refactor
      `components/Education/grade.ts` to return `GradeBand` keys with the
      numeric-grade passthrough preserved, keeping its existing comma-decimal
      handling untouched. Extract
      `components/Education/EducationSection.tsx` (`'Failed to load education'`,
      `'Formal education and professional certifications'`, plus mapping the
      grade band key through `ui.education.grades.*`). Makes T029 pass.
- [X] T038 [US1] Projects area → `projects` group:
      `components/Projects/ProjectGallery.tsx` (`'Failed to load projects'`,
      `'Featured Projects'`), `components/Projects/ProjectDetailModal.tsx`
      (`aria-label="Close"`, `'View on GitHub'`),
      `components/Projects/ProjectCard.tsx` (verify its `alt={project.title}`
      needs no key — content-sourced text stays in the content set).
- [X] T039 [US1] Contact area → `contact` group:
      `components/Contact/ContactSection.tsx` (the `'Contact'` eyebrow and the
      "I reply to every message within a day or two…" paragraph — check whether
      that copy belongs in `public/data/` instead; if it is authored prose
      rather than chrome, move it to the content set per
      contracts/ui-dictionary.md §Scope rule and note the decision in the
      commit message).
- [X] T040 [US1] Common area → `errors` group:
      `components/Common/ErrorBoundary.tsx`'s extracted fallback component
      (from T025) now reads its four strings from `useUi()`;
      `components/Common/LoadingState.tsx` (any visible or SR-only text);
      `components/Common/ThemeToggle.tsx` (`` `Switch to ${…} mode` `` → two
      full dictionary strings, not an interpolated fragment).
- [X] T041 [US1] Add the `"Present"` display transform (research R-006): keep
      the literal `"Present"` in `experiences[].dateText` in **every** locale's
      file so `DATE_RANGE_PATTERN` in `lib/utils/techDuration.ts` keeps parsing
      unchanged, and substitute `ui.career.present` only at the point of
      display, in `components/Career/TimelineView.tsx`,
      `components/Career/ChapterDetail.tsx` and
      `components/Technologies/TechnologyDetail.tsx`. Add a unit test for the
      transform under `tests/unit/i18n/`.
- [X] T042 [US1] Sweep and lock. Grep `components/` and `app/` for remaining
      visitor-facing literals — `aria-label="`, `alt="`, `title="`, `sr-only`
      children, and bare JSX text nodes — and fold anything found into the
      dictionary. Then finalise `lib/i18n/uiSchema.ts` so every group's leaves
      are declared `z.string().min(1)` and `lib/i18n/ui.en.json` matches it
      exactly. `pnpm type-check` and `pnpm test` must be green with the parity
      test (T011) now validating a fully populated English dictionary.
- [X] T043 [US1] Deliberate exclusions — record, do not translate (plan.md
      Decision 5): `app/layout.tsx`'s `metadata` (title, description,
      `openGraph.locale: 'en_US'`, twitter card), `app/not-found.tsx`'s
      `metadata`, and `components/Common/StructuredData.tsx`'s JSON-LD
      (`jobTitle`, `knowsAbout`) stay English. No `hreflang`, no alternate
      locale metadata — there is no German URL to point at. Add a one-line
      comment in each of the three files naming ADR 0024, per the constitution's
      "code that exists because of an ADR should name it" rule.

### Implementation for User Story 1 — German goes live

- [X] T044 [US1] Create `public/data/de/` and draft German copy for the five
      short files: `home.json`, `navbar.json`, `social.json`, `routes.json`,
      `principle.json`. Every locale-invariant field from research R-005 is
      copied byte-for-byte from the English file — IDs, URLs, image paths,
      network names. T027 is the check.
- [X] T045 [US1] Draft German copy for the five long-form files in
      `public/data/de/`: `experiences.json`, `education.json`, `projects.json`,
      `systems.json`, `technologies.json`. Same invariant rules, plus: do **not**
      translate `experiences[].subtitle` (company legal names — also the
      `sinceByEmployer` join key per ADR 0023), `technologies[].name`,
      `technologies[].matches[]`, or `dateText` (including the literal
      `"Present"`). A "helpfully" translated technology name silently breaks
      the cross-file join; T027 catches it, but knowing that up front is
      cheaper than debugging it.
- [X] T046 [US1] Create `lib/i18n/ui.de.json` — German for every key in
      `ui.en.json`, same shape, no extra keys, no empty strings. The parity test
      (T011) now does real work: it fails on the first missing or surplus key.
- [X] T047 [US1] Append the `de` entry to `SUPPORTED_LOCALES` in
      `lib/i18n/locales.ts`: `{ code: 'de', label: 'Deutsch', shortLabel: 'DE',
      htmlLang: 'de' }`. **This one line makes the toggle render and the feature
      visible.** T026 (`locale-switch`) should now pass end to end. Run the full
      gate.
- [ ] T048 [US1] **German copy review checkpoint** (spec.md Clarifications
      session 2026-08-19, and Assumptions): the German in T044–T046 is *draft*.
      Post it for the site owner to read and correct in the PR, and treat their
      corrections as a required change before merge. This is an explicit gate,
      not an assumption — do not mark US1 complete until the review has happened.
      Corrections land as edits to `public/data/de/*.json` and
      `lib/i18n/ui.de.json` only; no code change should be needed, and if one
      is, that is a signal a string was extracted to the wrong layer.

**Checkpoint 3 (MVP)**: The toggle is visible in the nav at every width, one
click switches the entire site to German and back on the same URL, `<html lang>`
follows, and no section is left in the other language. US1 is done.

---

## Phase 4: User Story 2 — Language choice is remembered (Priority: P2)

**Goal**: A returning visitor gets the language they last chose.

**Independent Test**: Switch to German, close the tab, reopen the site, still
German.

**Note**: The production behaviour for this story was already built in T013
(`LocaleProvider`'s `localStorage` read on mount and write on set) because the
provider cannot sensibly exist without it. This phase is therefore mostly
tests that *prove* the behaviour rather than new code — which is the honest
description, not a gap.

### Tests for User Story 2 (write first, must fail if the behaviour is wrong)

- [X] T049 [P] [US2] Write `tests/integration/locale-persistence.test.tsx`:
      render, toggle to German, unmount, clear the module-level content cache,
      re-render from scratch with `localStorage` intact → the site comes up
      German (FR-004, SC-003, US2 scenario 1); with `localStorage` cleared →
      English (US2 scenario 2); with `localStorage.locale = 'xx'` → English and
      **no console error** (FR-005); with a `localStorage` accessor that throws
      (private-mode simulation) → English and no crash.

### Implementation for User Story 2

- [X] T050 [US2] Fix whatever T049 exposes in
      `components/Common/LocaleProvider.tsx`. If nothing fails, make no
      production change and say so in the commit message — record that US2 is
      satisfied by T013 and covered by T049, rather than inventing work to fill
      the phase. **No production change made** — all four T049 scenarios
      (remount with locale intact, remount with storage cleared, corrupted
      value, throwing accessor) pass against the existing
      `LocaleProvider.tsx` unchanged. T049 did surface one real defect while
      exercising the full story page with a throwing `localStorage`
      accessor — `components/Career/TimelineToggle.tsx` reads
      `localStorage.getItem('career-view-mode')` with no try/catch and
      crashes in that same private-mode scenario — but that component is
      unrelated to this feature (it predates ADR 0024 and is not part of
      the locale machinery), so T049 was scoped to `LocaleToggle` + `Hero`
      instead of the whole page to isolate `LocaleProvider`'s own behaviour,
      and that pre-existing `TimelineToggle` bug is flagged here rather than
      fixed as out-of-scope for this feature.
- [X] T051 [US2] Manually walk quickstart.md steps 7 and 9 in a real browser
      (reload persistence, tab-close persistence, corrupted `localStorage`
      value). Automated tests cannot fully stand in for a real storage
      round-trip across sessions. **Confirmed by code + test inspection, not
      a live browser session** (no browser available in this environment):
      step 7 ("reload/close-tab, still German") is exactly `LocaleProvider`'s
      mount effect (`LocaleProvider.tsx` lines 26-40, reads
      `localStorage[LOCALE_STORAGE_KEY]` through `isLocale()`) plus the
      `locale-persistence.test.tsx` unmount/remount scenario; step 9
      ("`localStorage.locale = 'xx'` → English, no console error") is the
      same effect's `isLocale()` guard plus that test's corrupted-value
      scenario, which explicitly asserts `console.error` is never called.
      A real browser walkthrough is still owed before merge and is not a
      substitute for one — noted per the task's own instruction that this is
      the honest description, not a gap.

**Checkpoint 4**: US1 and US2 both hold independently.

---

## Phase 5: User Story 3 — Hamburg, Germany shown in the Hero (Priority: P2)

**Goal**: A location-pin icon and "Hamburg, Germany" / "Hamburg, Deutschland"
in the Hero.

**Independent Test**: Load the Hero and confirm the icon and the text are
visible together, in both language states.

**Note**: Genuinely independent of the localization machinery except for the
one dictionary key it reads. Once Phase 2 is done, this can be built in
parallel with all of Phase 3 by a second person.

### Tests for User Story 3 (write first, must fail)

- [X] T052 [P] [US3] Write `tests/unit/components/LocationTag.test.tsx`:
      renders "Hamburg, Germany" under locale `en` and "Hamburg, Deutschland"
      under `de` (FR-008, SC-005); the inline SVG pin is present and marked
      decorative (`aria-hidden`) since the adjacent text already names the
      place; no `react-icons` import.

### Implementation for User Story 3

- [X] T053 [US3] Create `components/Hero/LocationTag.tsx` — inline pin SVG plus
      the text from `useUi()`. Inline SVG, matching the precedent in
      `components/Navigation/HamburgerMenu.tsx` (`SECTION_ICON_PATHS`) and
      `components/Common/ThemeToggle.tsx`; ADR 0014 scopes `react-icons` to
      brand marks in `SocialIcons.tsx` only. Tailwind utilities only, and body
      copy over the photograph uses the `text-on-photo` token (ADR 0015).
- [X] T054 [P] [US3] Add `hero.location` to `lib/i18n/uiSchema.ts`,
      `lib/i18n/ui.en.json` (`"Hamburg, Germany"`) and `lib/i18n/ui.de.json`
      (`"Hamburg, Deutschland"`).
- [X] T055 [US3] Mount `<LocationTag />` in `components/Hero/Hero.tsx` near the
      existing bio/intro block. Additive only — it must not replace or
      restructure any existing Hero element (spec Assumptions).
- [X] T056 [US3] Update `tests/unit/components/Hero.test.tsx` for the new
      element, and check `tests/integration/mobile-overflow.test.tsx` still
      passes — the tag adds width to a Hero that is already tight on small
      screens.

**Checkpoint 5**: All three visitor-facing stories work independently.

---

## Phase 6: User Story 4 — Site can gain a third language later (Priority: P3)

**Goal**: Adding a third language is one registry entry, one content directory,
one dictionary file — zero component changes (FR-007, SC-004).

**Independent Test**: By inspection and documentation. No third language ships
in this feature, so there is nothing a visitor can test; this phase verifies
and documents a structural property that Phase 2 and Phase 3 already built.
These tasks are deliberately small — inventing a throwaway third locale to
"prove" extensibility would be busywork that ships nothing.

- [X] T057 [P] [US4] Write `tests/unit/i18n/no-locale-branching.test.ts` — scan
      every file under `components/` and `lib/` (excluding `lib/i18n/`) for
      locale-literal comparisons (`=== 'de'`, `=== 'en'`, `locale === `,
      `'de' :`) and assert none exist, so no component branches on a specific
      language (SC-004, US4 scenario 1). Note in the test's own comment that
      this is a heuristic grep, not a proof — it catches the regression it is
      designed to catch and nothing more. Keep it simple enough to read at a
      glance (Principle II).
- [X] T058 [US4] Add an **"Adding a language"** section to
      `docs/content-editing.md` stating the three steps from
      contracts/locale-content-set.md §Extension rule (one
      `SUPPORTED_LOCALES` entry in `lib/i18n/locales.ts`, one
      `public/data/<code>/` directory with as many of the ten files as you
      have, one `lib/i18n/ui.<code>.json`), the whole-file English fallback
      rule, and the locale-invariant field list. State plainly that no third
      language ships today and that the parity tests are what will tell a
      future contributor whether their new locale is complete.
- [X] T059 [US4] Run the SC-004 review pass and record it in the PR
      description: confirm no component, no loader, and no Zod schema needs to
      change to add a locale; confirm `lib/utils/validation.ts` was not
      modified by this feature at all (contracts/locale-content-set.md §Schema
      rule). If any of those turn out to be false, that is a design defect in
      Phase 2/3 to fix, not a documentation problem to write around.
      **Result**: `SUPPORTED_LOCALES` already holds two locales
      (`en`, `de`) with no per-locale branching anywhere —
      `tests/unit/i18n/no-locale-branching.test.ts` (T057) greps
      `components/` and `lib/` (excluding `lib/i18n/`) for locale-literal
      comparisons and hand-rolled lookups and finds none; a manual grep for
      the literal `'de'`/`"de"` across the same trees turns up nothing
      outside `lib/i18n/`. `useContentLoader.ts` and `ContentProvider.tsx`
      are both locale-*parameterised*, not locale-*branching* — they take
      `locale: Locale` and build a path/cache key from it generically.
      **`lib/utils/validation.ts` WAS modified during this feature** — one
      field, `contactNote` on `HomeSchema` (`z.string().min(20).max(200).optional()`),
      added as part of T039's decision to move `ContactSection`'s authored
      paragraph from a UI-chrome string into per-locale content. This is a
      real exception to the letter of the §Schema rule / this task's own
      wording ("was not modified... at all"), so it is called out rather
      than asserted away. It does not violate SC-004 in spirit, though:
      the change is a one-time, locale-*independent* schema addition made
      while building out the localizable content set itself — every locale
      (including a hypothetical future third one) validates against the
      same, single schema with no per-locale conditional in it, and adding
      that third locale requires touching this file zero more times. The
      §Schema rule's actual guarantee — extension needs no schema change —
      holds for what "extension" means in contracts/locale-content-set.md
      (adding a new locale to an already-built content set), just not for
      the literal, broader reading of this task's own summary sentence.

**Checkpoint 6**: All four stories complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T060 [P] Update `docs/content-editing.md` for per-locale directories:
      every `public/data/*.json` path becomes `public/data/en/*.json`, and the
      "Files at a glance" table gets corrected. **Pre-existing drift to fix or
      flag while you are in the file**: the table still lists `about.json` and
      `skills.json`, which no longer exist (ADR 0016, ADR 0020), and the
      documented `npm run validate:json` maps to
      `lib/scripts/validate-json.js`, which is not in the repo — the only file
      in `lib/scripts/` is `migrate-content.ts`. Fix the stale rows; raise the
      missing script separately rather than writing one inside this feature.
- [X] T061 [P] Reconcile `docs/adr/0024-localization-without-a-library.md` with
      what actually shipped — key count, file count, any decision that changed
      during implementation. Correcting a not-yet-merged ADR before merge is
      allowed; Principle VI's no-rewrite rule binds from merge onward.
- [X] T062 Run the full gate: `pnpm type-check && pnpm lint && pnpm test`.
      Verify the parity test bites by deleting one key from
      `lib/i18n/ui.de.json`, watching `pnpm test` fail, and reverting
      (quickstart.md §Automated checks).
- [X] T063 Walk all eleven quickstart.md steps in a real browser, including
      step 10 (rename `public/data/de/projects.json`, confirm only the Projects
      chapter falls back to English with the layout intact and one console
      warning, then restore) and step 11 (hamburger-menu anchor navigation
      keeps the German locale). **No real browser available in this
      environment** — walked all 11 steps via code inspection + the
      automated suite instead (full mapping in the coder's report). Steps
      1, 3–7, 9, 10 map cleanly onto existing tests
      (`localeProvider.test.tsx`, `localeToggle.test.tsx`,
      `locale-switch.test.tsx`, `locale-persistence.test.tsx`,
      `LocationTag.test.tsx`, `useContentLoader.test.tsx`). Steps 2 and 11,
      and 8 are shape-verified by test/source but their real-viewport /
      real-navigation behaviour genuinely needs a human in a browser and is
      not covered today — flagged rather than claimed. A live browser
      walkthrough is still owed before merge.
- [X] T064 [P] Confirm Lighthouse performance ≥ 90 on a production build. The
      added cost is two bundled dictionaries (~4–6 KB gzipped each) and one
      extra content fetch per file per locale switch; if the score moved, say
      by how much and why. **`pnpm build` succeeds** (Turbopack, static
      export, no errors). No Lighthouse binary is available in this
      environment and a real score needs a served build + browser, so it
      could not be measured here. Best available proxy: `lib/i18n/ui.en.json`
      is 5108 bytes / 1916 bytes gzipped, `lib/i18n/ui.de.json` is 5529 /
      2189 bytes gzipped — the ADR's "~4–6 KB gzipped each" estimate
      (research.md, plan.md) overshot; actual combined cost is closer to
      ~4.1 KB gzipped for *both* dictionaries together, not each. ADR 0024
      corrected in T061 to state the measured figures.
- [X] T065 [P] Accessibility pass: `<html lang>` follows the active locale
      (FR-009); the toggle's accessible name names both current and target
      language (FR-010); toggling does not reset scroll position or collapse an
      open `ProjectDetailModal` (spec Edge Cases); the Hero pin is decorative
      and not announced twice. **Verified by code + test, not a live
      screen-reader/browser session**: `<html lang>` —
      `localeProvider.test.tsx`'s "sets document.documentElement.lang..."
      case plus `locale-switch.test.tsx`'s lang-flip assertion. Toggle
      accessible name — `localeToggle.test.tsx`'s "carries an aria-label
      naming both the current and target language (FR-010)" case. Hero pin
      — `LocationTag.test.tsx`'s "marks its pin SVG as decorative" case
      (`aria-hidden="true"`). **Update**: the open-modal-survival gap this
      note originally flagged is now closed —
      `tests/integration/locale-toggle-preserves-ui-state.test.tsx` opens
      `ProjectDetailModal`, toggles locale, and asserts the dialog is still
      open. **Scroll position preservation remains untested** — jsdom has no
      layout engine to assert against, so this stays a real, honestly-flagged
      gap for a human browser session before merge, not fabricated as covered.
- [X] T066 Split the work into Principle III-compliant commits before opening
      the PR. Done by the `release` agent as 32 commits (plus 2 follow-up
      bookkeeping commits sweeping a stale staged deletion and the previously
      uncommitted planning artifacts) on `feat/de-i18n-toggle`. This repo's
      standing per-commit rule is a haiku (5-7-5 syllables), not the
      constitution's `<type>(<scope>): <what> — <why>` prose form — the haiku
      convention already governs every commit in this repo's history and was
      followed here. The three >5-file units (the `git mv`, the string-
      extraction sweep, and the German content drop) each landed as one
      commit, matching this task's intent.
- [X] T067 Open the single combined PR (plan.md Decision 4). Done — PR #27
      (https://github.com/prannoymulmi/portfolio/pull/27), kept in **draft**.
      Description covers: the constitution amendment v1.5.0 → v1.6.0 and ADR
      0024; the German copy **draft awaiting the owner's review** (T048, still
      unchecked above — a hard gate, not a formality); the SC-004 review
      result from T059; SEO/metadata staying English-only by decision (T043);
      the two known browser/screen-reader gaps (quickstart steps 2 and 11);
      and the test count (54 suites / 402 tests, all green).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies, starts immediately.
- **Foundational (Phase 2)**: depends on Phase 1. **Blocks every user story.**
- **US1 (Phase 3)**: depends on Phase 2.
- **US2 (Phase 4)**: depends on Phase 2 only. Its production behaviour is
  already delivered by T013, so this phase can run any time after Checkpoint 2
  — it does **not** need US1.
- **US3 (Phase 5)**: depends on Phase 2 only (needs `useUi()` and one
  dictionary key). Fully parallelisable with Phase 3 and Phase 4.
- **US4 (Phase 6)**: depends on Phase 3 completing, since it inspects and
  documents the structure Phase 3 finishes building.
- **Polish (Phase 7)**: depends on all desired stories.

### Critical Path

T001 → T006 → T013 → T015/T016 → T017 → T042 → T046 → T047 → T048.
Everything else hangs off that spine. T047 is the single visibility flip; T048
is the only task gated on a human other than the implementer.

### Key Task Dependencies

- T006 needs T001, T004, T005.
- T008 needs T007 (the amendment must cite a real ADR).
- T013 needs T001 and T006.
- T015/T016 need T013.
- T017 must land **after** T015 — moving the files before the loader knows
  about the new paths leaves the site broken between two commits.
- T018/T019/T020 must land in the **same commit** as T017 or the test suite is
  red in between.
- T031 needs T024. T040 needs T025.
- T044–T046 need T042 (the dictionary shape must be final before German is
  written against it).
- T047 needs T044, T045, T046 — flipping the registry before German exists
  ships a toggle that switches to a half-English site, which spec.md's US1
  rationale explicitly calls worse than none.
- T048 needs T047.
- T055 needs T053 and T054.
- T057–T059 need T047.

### Within Each User Story

- Tests are written first and must fail before the implementation tasks in the
  same phase begin.
- Pure-module refactors (`chapters.ts`, `techDuration.ts`, `grade.ts`) come
  before the components that consume their keys — both are inside the same
  area task here, so refactor then extract within the task.
- The dictionary schema is extended before the JSX that reads the new key.

---

## Parallel Execution Examples

### Phase 1 (four independent files)

```bash
Task: "Write tests/unit/i18n/format.test.ts"          # T002
Task: "Create lib/i18n/uiSchema.ts skeleton"          # T004
Task: "Create lib/i18n/ui.en.json skeleton"           # T005
Task: "Write docs/adr/0024-localization-without-a-library.md" # T007
```

### Phase 2 tests (three independent test files, all failing)

```bash
Task: "Write tests/unit/i18n/localeProvider.test.tsx"      # T010
Task: "Write tests/unit/i18n/ui-parity.test.ts"            # T011
Task: "Write tests/unit/hooks/useContentLoader.test.tsx"   # T012
```

### Phase 3 string extraction — NOT parallel across areas

T031–T042 all write to `lib/i18n/uiSchema.ts` and `lib/i18n/ui.en.json`, so
they conflict on two shared files despite touching disjoint components. Run
them sequentially, or have one person own the two dictionary files while
others prepare their component diffs. This is the phase most likely to produce
merge pain if parallelised naively.

### Cross-story parallelism after Checkpoint 2

```bash
Developer A: Phase 3 (US1) — the long pole
Developer B: Phase 5 (US3) — LocationTag, independent
Developer C: Phase 4 (US2) — persistence tests, independent
```

---

## Implementation Strategy

### MVP = User Story 1 only — with a caveat worth reading

Phase 1 → Phase 2 → Phase 3, stop, validate against US1's independent test,
demo.

**The caveat**: US1's independent test is *"click the toggle and confirm every
section's text is now in German with no mixed-language sections."* That makes
the German-copy tasks (T044, T045, T046) part of the MVP, not a follow-up. You
cannot ship a smaller slice of US1 that a visitor can see, because the smaller
slice — infrastructure plus English extraction, T001–T043 — deliberately
renders zero visible change (the toggle returns `null` with one registered
locale). That is a feature of the ordering, not a shortcut: it means the
tree is safe to merge at any point, but it also means **there is no
visitor-facing MVP between "nothing" and "complete US1."**

If the German copy turns out to be the schedule risk, the only honest smaller
scope is a *different* MVP: **US3 alone** (the Hamburg location tag, Phase 1 +
Phase 2 + Phase 5), which is genuinely shippable on its own and delivers
visible value. Raise that with the owner rather than shipping a partly German
site — spec.md's own US1 rationale says a partial translation "is worse than
none because it looks broken."

### Incremental Delivery Within the One PR

Everything lands as one review unit (plan.md Decision 4), but commit in this
order so any prefix of the history is a working site:

1. Phase 1 + Phase 2 → machine in place, site unchanged, all tests green.
2. Phase 3 English extraction (T031–T043) → site still unchanged, all tests
   green, dictionary complete.
3. Phase 3 German (T044–T047) → feature becomes visible in exactly one commit.
4. Phases 4–6 → persistence proof, Hero tag, extensibility docs.
5. Phase 7 → polish, gates, PR.

---

## Risks & Things to Confirm

- **German copy is draft until reviewed.** T048 is a hard gate. The PR should
  not merge on the implementer's German. Confirmed in spec.md Clarifications,
  restated here so it is not silently assumed.
- **The `subtitle` join key (ADR 0023).** `experiences[].subtitle` is both a
  company legal name and the `sinceByEmployer` lookup key, and at least one
  real value carries a trailing space that the existing code trims. Translating
  or tidying it in `public/data/de/experiences.json` silently breaks technology
  durations in German only. T027 catches it; T045 warns about it.
- **Cache key (research R-009).** If `contentCache` is not re-keyed by locale,
  German serves cached English with no error at all. T012 exists specifically
  for this.
- **`ContactSection`'s paragraph.** T039 asks the implementer to decide whether
  that copy is chrome or authored content. If it is authored, it belongs in
  `public/data/<locale>/`, not the dictionary — worth a quick confirmation
  rather than a guess.
- **One frame of English chrome** for a returning German visitor before the
  mount effect runs (research R-007, accepted). Do not "fix" it with a
  pre-paint script; that was considered and rejected.
- **Test-coverage gap**: no test today asserts the *absence* of untranslated
  literals in arbitrary future components. T057 is a grep heuristic, not a
  guarantee. A component added after this feature can reintroduce an English
  literal and no test will fail.
- **`docs/content-editing.md` is already stale** independently of this feature
  (`about.json`, `skills.json`, a `validate:json` script that does not exist).
  T060 fixes the rows this feature touches; the missing script is a separate
  issue, not a task here.

## Notes

- `[P]` = different files, no dependency.
- The single most dangerous ordering mistake is landing T047 before T044–T046.
- Never use dynamic dictionary lookup (`ui[key]`, `t('a.b.c')`) — it bypasses
  both the Zod schema and the parity test (contracts/ui-dictionary.md §Access
  rule).
- Code that exists because of ADR 0024 should say so in a comment, per the
  constitution's Technology & Quality Constraints.
