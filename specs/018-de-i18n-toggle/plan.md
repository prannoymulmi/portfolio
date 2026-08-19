# Implementation Plan: German Language Toggle & Hero Location Tag

**Branch**: `feat/de-i18n-toggle` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-de-i18n-toggle/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a language toggle (English default, German second) that switches all
visitor-facing text in place on `/` without a reload, persists per-browser,
and updates `<html lang>`; and add a "Hamburg, Germany" / "Hamburg,
Deutschland" location tag with an inline location-pin SVG to the Hero.

Technical approach: a hand-rolled `LocaleProvider` (React Context +
`localStorage`) sits above `ContentProvider` and owns the active locale.
Authored content moves to per-locale directories `public/data/en/*.json` and
`public/data/de/*.json`; `useContentLoader` becomes locale-aware and falls
back to the English file whole when a locale file is absent or fails
validation. UI chrome strings are extracted from JSX into typed dictionaries
`lib/i18n/ui.en.ts` / `ui.de.ts`, selected by locale, with `satisfies Ui`
making a missing German key a compile error. Three pure modules that
currently emit English (`lib/utils/techDuration.ts` `formatDuration`/`Level`,
`components/Education/grade.ts`, `components/Career/chapters.ts` positions)
are refactored to return locale-invariant keys that components map through
the dictionary. No new dependency.

## Technical Context

**Language/Version**: TypeScript strict, React 19.2.8, Next.js 16.3.0 App Router

**Primary Dependencies**: Zod ^3 (content validation), Framer Motion ^11,
Tailwind v4, `next-themes` ^0.4.6 (untouched). **No new dependency.**

**Storage**: JSON under `public/data/<locale>/`, fetched client-side,
Zod-validated (ADR 0001/0003/0017). Locale preference: `localStorage` key
`locale`.

**Testing**: Jest + RTL; `tests/unit/`, `tests/integration/`;
`moduleNameMapper` `^@/(.*)$`.

**Target Platform**: modern browsers, mobile → desktop, Vercel.

**Project Type**: single-page Next.js web app (ADR 0012).

**Performance Goals**: Lighthouse ≥ 90. One extra fetch per content file per
locale switch (cached by `locale/fileName`); chrome dictionaries are
bundled, adding ~4–6 KB gzipped per locale.

**Constraints**: no `/de` routes; motion helpers unchanged; Tailwind-only;
toggle must be one interaction (SC-001); English is the only fallback
(FR-005); hydration render must agree with server (locale `'en'` on first
client pass).

**Scale/Scope**: 1 new provider, 1 toggle, 1 Hero tag, 2 chrome dictionaries
(~80 keys), 10 JSON files × 2 locales, 3 pure-module refactors, ~20
components touched for string extraction, 1 ADR, 1 constitution amendment,
1 doc update.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.5.0.

| Principle | Status | Notes |
|---|---|---|
| I. KISS (NON-NEGOTIABLE) | PASS | Whole-file English fallback, not per-field deep-merge (R-003). Property-access dictionary, not `t('a.b.c')` lookup. |
| II. Test-First (NON-NEGOTIABLE) | PASS (obligation) | New: locale persistence, fallback, `<html lang>`, toggle a11y, cross-locale parity, locale-aware `formatDuration`/`gradeBadgeLabel`. |
| III. Atomic Commits | PASS (obligation) | See Ordered implementation steps below; string-extraction passes legitimately exceed 5 files as one unit of work. |
| IV. Technology Stack (NON-NEGOTIABLE) | FLAGGED — amendment recommended, not forced | No new dependency. Content storage moves `public/data/*.json` → `public/data/<locale>/*.json`; a new cross-cutting state owner (locale) appears alongside theme. See Decision 1/2 below. |
| V. Token Efficiency | PASS | |
| VI. Recorded Decisions | ACTION REQUIRED | Feature changes how content is stored/loaded/validated → **ADR 0024** required, landing in the same PR as implementation, with a row added to `docs/adr/README.md` in the same commit. Next free number confirmed: 0023 is the highest existing. |

**Sub-gates**:
- `react-icons` (ADR 0014): PASS — Hero location pin and the toggle glyph are inline SVG, following the precedent already set in `components/Navigation/HamburgerMenu.tsx` (`SECTION_ICON_PATHS`) and `components/Common/ThemeToggle.tsx`.
- No CSS-in-JS, Tailwind utilities only: PASS.
- `next-themes` owns *theme* state (ADR 0010): PASS — untouched. A locale provider is not a theme hook; the "no hand-rolled theme hook" ban is theme-scoped.
- Single-page story (ADR 0012): PASS — no `/de` routes, toggle switches in place on `/`.
- ADR 0017 "one content source": PASS, but `tests/integration/content-sources.test.ts` hard-asserts `['public/data/social.json']` and will break on the directory move — must be updated in the same commit.

No unjustified NON-NEGOTIABLE violation. No ERROR. No new dependency required or proposed. Complexity Tracking is empty.

### Decisions — final (confirmed with the user before `/speckit-tasks`)

1. **Hand-rolled i18n, no library — DECIDED.** `next-intl` is routing-first and contradicts ADR 0012 and the spec's own "same URL" assumption. The only plural/number-formatted string in the codebase (`formatDuration`) is reachable with platform `Intl.NumberFormat`. No ICU, RTL, or extraction-tooling need at ~80 chrome strings.
2. **Constitution amendment, same PR as ADR 0024 — DECIDED (required consequence of #1).** The Content bullet's literal `public/data/` path changes, and a new cross-cutting client-state owner (locale) should be named the way Theming already names `next-themes`, to forbid a future hand-rolled duplicate. This isn't a separate optional choice — Governance already requires an ADR + amendment together whenever Principle IV changes, and choosing hand-rolled localization is what triggers that. Proposed bullet: *"**Localization**: a hand-rolled `LocaleProvider` owns the active locale, persisted per-browser; English is the default and the fallback. Authored content lives per-locale under `public/data/<locale>/`, Zod-validated as before; UI chrome strings live as JSON dictionaries in `lib/i18n/`, validated by a shared schema and a key-parity test. No i18n library — a fourth-party message framework requires an amendment (ADR 0024)."* Version bump v1.5.0 → v1.6.0.
3. **UI chrome strings as JSON, validated by a Zod schema + a key-parity test — DECIDED.** `lib/i18n/ui.en.json` / `ui.de.json`, one schema (`lib/i18n/uiSchema.ts`, all leaves `z.string()`) shared by every locale, and `tests/unit/i18n/ui-parity.test.ts` recursively diffs every locale's key set against `ui.en.json` and fails on any missing/extra key or non-string leaf. This keeps chrome strings in the same format as authored content (one format across the whole site, easier to edit, no TS ceremony) and moves the completeness guarantee from `pnpm type-check` to `pnpm test` — which CI already blocks merge on, so the enforcement strength is unchanged in practice, just relocated to the gate the constitution's Test-First principle already mandates writing anyway. JSON files are statically imported (bundled at build), not fetched at runtime, so the "chrome has no loading skeleton" risk from research.md R-004 still doesn't apply.
4. **PR shape: one combined PR — DECIDED.** Everything (locale infrastructure, English extraction, `public/data/en/` + `public/data/de/`, chrome dictionaries for both locales, ADR 0024, constitution amendment, and the visible toggle) ships in a single PR rather than stacked. `/speckit-tasks` should still order tasks infrastructure-first, content-second internally (so partial progress is always in a working state), but they land as one review unit, not two PRs.
5. **SEO/metadata stay English-only.** No German URL exists, so no `hreflang`; `openGraph.locale` stays `en_US`. Record as a consequence in ADR 0024.
6. **One toggle placement is enough.** `StoryProgressNav.tsx`'s control cluster has no responsive hiding — visible at every width — so placing `LocaleToggle` there alone satisfies FR-002's nav + mobile-menu-equivalent requirement without a duplicate control.

## Project Structure

### Documentation (this feature)

```text
specs/018-de-i18n-toggle/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Single Next.js App Router project (matches the existing repository layout;
no new top-level project is introduced).

```text
app/
├── layout.tsx                     # MODIFIED: LocaleProvider above ErrorBoundary
└── page.tsx                       # MODIFIED: sections wrapped in <Chapter> for localized aria-label

components/
├── Common/
│   ├── LocaleProvider.tsx         # NEW: locale state, persistence, <html lang>
│   ├── LocaleToggle.tsx           # NEW: one-click cycle through SUPPORTED_LOCALES
│   ├── Chapter.tsx                # NEW: client <section> wrapper w/ localized aria-label
│   ├── ContentProvider.tsx        # MODIFIED: passes locale to loaders
│   └── ErrorBoundary.tsx          # MODIFIED: fallback UI extracted to a client fn component
├── Hero/
│   └── LocationTag.tsx            # NEW: inline pin SVG + "Hamburg, Germany"
├── Navigation/
│   └── StoryProgressNav.tsx       # MODIFIED: LocaleToggle in the control cluster
└── (≈20 others)                   # MODIFIED: literals → useUi()

lib/
├── i18n/
│   ├── locales.ts                 # NEW: SUPPORTED_LOCALES registry, Locale type, storage key
│   ├── uiSchema.ts                # NEW: Zod schema for the UI dictionary shape; Ui = z.infer<...>
│   ├── ui.en.json                 # NEW: source-of-truth dictionary
│   ├── ui.de.json                 # NEW: validated against the same schema + parity test
│   └── format.ts                  # NEW: format(template, vars) placeholder substitution
├── hooks/useContentLoader.ts      # MODIFIED: locale-aware path + cache key + EN fallback
├── utils/techDuration.ts          # MODIFIED: Level stays a key; formatDuration takes locale
└── types/portfolio.ts             # unchanged shapes

components/Education/grade.ts      # MODIFIED: returns a band key, not an English label
components/Career/chapters.ts      # MODIFIED: position becomes a key; DEFAULT_TECH invariant

public/data/
├── en/*.json                      # MOVED (git mv) from public/data/*.json
└── de/*.json                      # NEW

tests/
├── unit/i18n/{localeProvider,localeToggle,format,ui-parity}.test.tsx   # NEW
├── unit/education/grade.test.ts                              # MODIFIED (keys)
├── unit/technologies/techDuration.test.ts                    # MODIFIED (locale param)
├── integration/locale-switch.test.tsx                        # NEW
├── integration/locale-parity.test.ts                         # NEW
└── integration/content-sources.test.ts                       # MODIFIED (paths + per-locale loop)

docs/
├── adr/0024-localization-without-a-library.md   # NEW (with implementation)
├── adr/README.md                                # MODIFIED
└── content-editing.md                           # MODIFIED (per-locale directories)

.specify/memory/constitution.md                   # MODIFIED (v1.6.0, Localization bullet)
```

**Structure Decision**: Single-project structure (matches Next.js App Router
convention already in use — no `frontend`/`backend` split, no new top-level
project). All new modules live under the existing `components/`, `lib/`, and
`public/data/` trees; tests follow the existing `tests/unit/` +
`tests/integration/` split.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No unjustified violations. The Constitution Check above flags two items that
require action (an ADR and a constitution amendment) rather than a rejected
alternative — both are addressed by Decisions 1–3 and executed in Ordered
implementation step 14, not worked around.
