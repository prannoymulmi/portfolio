# Phase 1 Data Model: Football Pitch Interaction Rework

No stored data changes. `public/data/experiences.json` and its Zod schema in
`lib/utils/validation.ts` are untouched; `lib/types/portfolio.ts`'s
`Experience` interface is untouched. Everything below is derived at runtime in
`components/Career/chapters.ts` (spec Assumptions, clarifications 2 and 3).

---

## 1. `CareerChapter` — changed shape

Existing fields (unchanged): `id`, `order`, `company`, `role`, `years`,
`position`, `x`, `y`.

| Field | Type | New? | Source | Requirement |
|---|---|---|---|---|
| `displayName` | `string` | new | `company` with parentheticals and trailing legal-form tokens stripped | FR-005, FR-013 |
| `abbreviation` | `string` | new | first word of `displayName`, first 4 chars, uppercased | FR-005, FR-013 |
| `builtSummary` | `string` | new | `workDescription[0]` | FR-008 |
| `achievements` | `string[]` | changed | `workDescription.slice(1)` (was the whole array) | FR-008, FR-009 |
| `tech` | `string[]` | changed | `technologies` when non-empty, else `DEFAULT_TECH` | FR-012 |

`company` stays on the chapter unchanged — the detail panel and the pill list
below the controls both show the full name; only the on-pitch label uses
`displayName`.

### Invariants

- `displayName` is never empty. If suffix stripping would consume the whole
  string, the trimmed original is kept.
- `abbreviation` is 1–4 characters, uppercase.
- `builtSummary` is always present: `workDescription` is schema-constrained to
  3–6 entries of 20–150 characters (`lib/utils/validation.ts:38`).
- `achievements` has `workDescription.length - 1` entries. Combined with
  `builtSummary`, every authored line still renders exactly once — nothing is
  truncated or hidden (FR-009).
- `tech` is never empty (FR-012).

---

## 2. Derivation rules

### `toDisplayName(company: string): string`

1. Remove every parenthetical group `(...)`.
2. Repeatedly strip a trailing legal-form token, case-insensitively, from the
   end: `GmbH`, `mbH`, `AG`, `SE`, `KG`, `Co`, `&`, `Ltd`, `Ltd.`, `Limited`,
   `Inc`, `Inc.`, `LLC`, `BV`, `NV`.
3. Collapse internal whitespace and trim.
4. If the result is empty, return `company.trim()`.

Step 2 repeats because `"Otto GmbH & Co KG"` needs four passes (`KG`, `Co`,
`&`, `GmbH`). A domain-style name (`"Clansweb.de"`) matches nothing and passes
through whole.

### `toAbbreviation(displayName: string): string`

`displayName.split(/\s+/)[0].slice(0, 4).toUpperCase()`.

### Worked results against the shipped data

`public/data/experiences.json`, ordered oldest-first as `toChapters` sorts it:

| order | `company` (raw `subtitle`) | `displayName` | `abbreviation` |
|---|---|---|---|
| 1 | `Clansweb.de` (04/2016 – 02/2017) | `Clansweb.de` | `CLAN` |
| 2 | `Lustita Limited` (03/2017 – 12/2017) | `Lustita` | `LUST` |
| 3 | `Novomind AG` (01/2018 – 08/2018) | `Novomind` | `NOVO` |
| 4 | `Otto GmbH & Co KG` (08/2018 – 10/2020) | `Otto` | `OTTO` |
| 5 | `AViV GmbH (Formerly Immowelt GmbH) ` (11/2020 – 03/2025) | `AViV` | `AVIV` |

Rows 4 and 5 are the two examples FR-013 states verbatim; the trailing space
on row 5's raw value is why step 3 trims.

These five rows are the unit test table (Principle II — the test reads as the
specification of the rule).

---

## 3. `DEFAULT_TECH` — fallback technologies

A module-level constant in `components/Career/chapters.ts`:

```ts
const DEFAULT_TECH = ['AWS', 'Java', 'Terraform', 'TypeScript'];
```

Applied when `experience.technologies` is absent or empty (FR-012,
clarification 2). Every entry in the shipped `experiences.json` currently
omits `technologies`, so all five chapters take this path today — which makes
the fallback the visible default, not a rare branch, and worth a rendering
test rather than only a unit test.

It is a code constant rather than a JSON field deliberately: it is site-wide
authored copy with no per-chapter variance, and adding it to the content file
would mean a Zod schema change (Principle IV, content rule).

---

## 4. Ball Marker — component state, not stored data

A single rendered element, not a persisted entity.

| Property | Value |
|---|---|
| Position | `{ cx: active.x, cy: toPitchY(active.y) }` — driven off the same `index` state the panel reads |
| Radius | fixed, visibly smaller than a player dot (players `r` 2.8 / 3.4 active) |
| Motion | Framer Motion `animate`; interrupt-driven retarget (research R1, FR-004) |
| Reduced motion | zero-duration transition via `prefersReducedMotion()` (research R2, FR-003) |
| Identity | exactly one instance in the DOM at any time (SC-002) |
| Accessibility | decorative — `pointer-events-none`, no `role`, excluded from the accessible tree |

There is no "previous position" stored anywhere: Framer Motion animates from
wherever the element currently is, which is also what makes the mid-flight
retarget requirement free.

---

## 5. Tip text

Static site-authored string rendered below the pitch (FR-007, spec
Assumptions: "static, site-authored text, not derived from chapter data").
Lives as a literal in `CareerPitch.tsx` alongside the other UI copy in that
file — one line, no data source, no translation layer in this project.

---

## 6. Panel section mapping

`ChapterDetail` restructured to the `components/Work/SystemCard.tsx` section
pattern (FR-008). Structure is adopted, colour treatment is not (spec
Assumptions).

| `SystemCard` element | `ChapterDetail` counterpart |
|---|---|
| `year` (mono, left rail) | `years` |
| `title` heading | `company` (full name, not `displayName`) |
| `role` (primary-tinted) | `role` |
| `bodyText` (body copy) | `builtSummary` under a "What I built" label |
| `tags` list (`label-mono` rounded-full bordered pills) | `tech` (with `DEFAULT_TECH` fallback) |
| — | `achievements` bulleted list, kept from today's panel |

Vertical rhythm tightens from the current panel's `p-7` / `mt-6` / `mt-4`
scale toward the showcase's tighter steps, which together with the summary
line moving out of the bulleted list is what delivers SC-003.
