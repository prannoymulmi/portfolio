# Phase 1 Data Model: Technologies Chapter

Two kinds of entity are involved: what is **stored** (a new content file, plus
one existing file read as the source of truth for dates) and what is **derived**
at render time (never persisted, never hand-authored).

---

## Stored: `public/data/technologies.json`

### `TechnologiesFile`

| Field | Type | Rules |
|---|---|---|
| `intro` | `string` | 40–240 chars. The chapter's supporting paragraph. |
| `builtWithNote` | `string` | 40–220 chars. The single Claude Code / spec-driven sentence (FR-005). Must mention both "Claude Code" and spec-driven development — asserted by test, not by Zod. |
| `categories` | `string[]` | 2–8 entries, each 3–24 chars, unique. Display order of the filter row. An "All" option is rendered by the component and is NOT stored here. (Bound raised from 6 to 8 when Observability and Security were added.) |
| `technologies` | `Technology[]` | 4–40 entries. |

### `Technology`

| Field | Type | Rules |
|---|---|---|
| `name` | `string` | 1–24 chars. Display name; unique across the file. Used as the selection key. |
| `category` | `string` | Must be a member of `categories`. Cross-field rule — enforce with a Zod `superRefine` on the file schema, not on the entry schema. |
| `matches` | `string[]` | 1–6 entries. Literal strings as they appear in `experiences.json` `technologies` arrays. Case-insensitive exact match after trim (research R-002). |
| `sinceByEmployer` | `Record<string, string>` (optional) | Keyed by a role's `subtitle` (employer), compared **trimmed** — `experiences.json` subtitles are not guaranteed to be trim-clean (AViV's carries a trailing space). Value is `"MM/YYYY"`, validated by regex. Additive escape hatch for when a technology started partway through an otherwise fully-matched, still-relevant role (e.g. threat modeling began partway through an ongoing role) — added post-implementation, see docs/adr/0023 amendment. |
| `note` | `string` | 40–160 chars. Where/how it was used. Prose, must be consistent with `workDescription` in the roles it matches. |

**Invariants** (enforced by tests, since Zod cannot see across files):
- Every string in every `matches` array appears in at least one role's
  `technologies` array in `experiences.json`.
- Every `Technology` resolves to at least one role, so no entry can render with
  zero months.
- `name` values are unique; `matches` values are globally unique (no two
  technologies claim the same source string).

**Deliberately absent fields**: `years`, `months`, `level`, `roles`. All four
are derived. Adding any of them to the file is the failure mode this design
exists to prevent (research R-001, R-005). `sinceByEmployer` is not an
exception to this: it never states a duration, only clamps which portion of
one matched role's own dated range counts — the number itself is still
entirely computed.

---

## Read-only source of truth: `public/data/experiences.json`

Unchanged by this feature. `Experience.dateText` (format `MM/YYYY – MM/YYYY`
or `MM/YYYY – Present`) and `Experience.technologies` are the only fields this
feature reads; `subtitle` (employer) and `title` (role) are read for the detail
panel's "where it was used" line.

The existing `ExperienceSchema` is **not** tightened in this feature — see
research R-004. The parser tolerates the format's variation and reports failure
loudly instead.

---

## Derived at render time (`lib/utils/techDuration.ts`)

### `MonthInterval`

`{ start: number; end: number }` — months since epoch, half-open `[start, end)`.
`end` for a `Present` role is the current month, evaluated once per render.

### `TechnologyUsage` (the view model the components consume)

| Field | Type | Derivation |
|---|---|---|
| `name`, `category`, `note` | `string` | Passed through from `Technology`. |
| `totalMonths` | `number \| null` | Sum of the **union** of matched roles' intervals (research R-003). `null` when no matched role has a parsable `dateText` — the row then renders no duration claim rather than `0`. |
| `level` | `'Daily driver' \| 'Production' \| 'Working knowledge' \| null` | R-005 thresholds. `null` when `totalMonths` is `null`. |
| `isCurrent` | `boolean` | True when any matched role's range ends in `Present`. |
| `roles` | `{ title: string; employer: string; dateText: string }[]` | The matched roles, most recent first. Feeds the detail panel's traceability line (User Story 3). |

### Pure functions to implement and unit-test

| Function | Contract |
|---|---|
| `parseDateText(dateText: string): MonthInterval \| null` | Accepts en dash / em dash / hyphen separators, extra whitespace, and case-insensitive `Present`. Returns `null` (not a throw) on anything else. |
| `unionMonths(intervals: MonthInterval[]): number` | Merges overlapping *and* adjacent intervals before totalling. Order-independent. |
| `deriveLevel(totalMonths: number, isCurrent: boolean): Level` | Pure lookup against named threshold constants. |
| `formatDuration(totalMonths: number \| null): string \| null` | `null` in → `null` out. `< 12` months → `"< 1 yr"`. Otherwise years to one decimal, **rounded down**. |
| `buildUsage(file: TechnologiesFile, experiences: Experience[]): TechnologyUsage[]` | The composition. For each matched role, if `Technology.sinceByEmployer` has a key equal to that role's `subtitle` (trimmed), the role's interval start is clamped to `max(roleStart, parsedSinceMonth)` before it is unioned with the technology's other matched roles — every other role and technology is unaffected. Also omits any technology whose resulting `totalMonths` is `null` or under twelve. Deterministic ordering: category order first (per `categories`), then `totalMonths` descending, then `name` ascending, so a tie never reorders between renders. |

---

## Component state (not persisted)

| State | Owner | Initial value |
|---|---|---|
| `activeCategory` | `TechnologiesChapter` | `'All'` |
| `activeTechName` | `TechnologiesChapter` | The first entry of the full derived list (deterministic per the ordering rule above), so the detail panel is never empty on first paint (SC-001: no interaction required). |

**Transitions**:
- Selecting a category filters the list. If the currently active technology is
  filtered out, `activeTechName` moves to the first entry of the filtered list —
  it must never point at a hidden row, and must never become empty.
- Hover, focus, and click on a row all set `activeTechName` to that row. Touch
  devices get the same result from tap because `click` fires there (FR-003,
  Edge Case 3).
- Selecting `'All'` restores the full list; the active technology is preserved.

---

## Type and schema locations

- `Technology`, `TechnologiesFile` → `lib/types/portfolio.ts`, beside the
  existing content types.
- `TechnologySchema`, `TechnologiesFileSchema` → `lib/utils/validation.ts`.
- `TechnologyUsage`, `MonthInterval`, `Level` → `lib/utils/techDuration.ts`
  (derived types live with the derivation, not with the content types).
- Registration → `ContentProvider` adds
  `const technologies = useContentLoader('technologies.json', TechnologiesFileSchema)`
  and exposes it on the context, matching the seven existing entries.
