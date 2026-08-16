# Phase 1 Data Model: Modernize Education & Certification Grade Display

**No data file changes.** FR-005 makes this feature presentation-only:
`public/data/education.json` and `EducationSchema` in `lib/utils/validation.ts`
are read and verified, never modified. This document records the two entities
from the spec so the mapping's inputs and outputs are pinned down before code.

## Education Entry (existing — unchanged)

Validated by `EducationSchema`. Attributes relevant to this feature:

| Field | Type | Notes |
|---|---|---|
| `cardTitle` | `string` (10–100) | Qualification name — the row heading. |
| `cardSubtitle` | `string` (5–50) | Awarding institution. |
| `cardDetailedText` | `string`, optional | **The badge's only source.** Free-form; the schema places no numeric or enum constraint on it, and this feature adds none. |
| `media` | object, optional | Certification badge image; unrelated to the grade badge. |
| `url` | URL, optional | Drives the "Learn more" pill whose styling the badge reuses. |

Live values of `cardDetailedText` across the four entries:

| Entry | Value | Badge renders |
|---|---|---|
| MSc. Cybersecurity — University of Essex | `"Distinction"` | `Distinction` |
| B.Sc. Information Engineering — HAW Hamburg | `"1.9 Grade"` | `Good` |
| AWS Solutions Architect – Professional | *(absent)* | no badge |
| AWS Solutions Architect – Associate | *(absent)* | no badge |

## Grade Band Mapping (new — presentation only, not stored)

A fixed lookup applied at render time by `gradeBadgeLabel` in
`components/Education/grade.ts`. It exists in code only; nothing about it is
written to, or read from, `education.json`.

| Numeric grade | English label |
|---|---|
| 1.0 – 1.5 | Very Good |
| 1.6 – 2.5 | Good |
| 2.6 – 3.5 | Satisfactory |
| 3.6 – 4.0 | Sufficient |

Implemented as an ascending upper-bound chain, which closes the gaps the table's
phrasing leaves open (research R3).

## `gradeBadgeLabel` behaviour contract

Signature: `(value: string | undefined) => string | null`

| Input | Output | Rendered |
|---|---|---|
| `undefined` | `null` | no badge |
| `""` / `"   "` | `null` | no badge (spec edge case) |
| `"Distinction"` | `"Distinction"` | badge, value as-is |
| `"1.9"` | `"Good"` | badge, mapped |
| `"1.9 Grade"` | `"Good"` | badge, mapped — the live value (research R4) |
| `"1,9"` | `"Good"` | badge, mapped |
| `"1.5"` | `"Very Good"` | boundary |
| `"2.5"` | `"Good"` | boundary |
| `"2.6"` | `"Satisfactory"` | boundary |
| `"4.0"` | `"Sufficient"` | boundary |
| `"5.0"` | `"5.0"` | badge, value as-is — outside the mapped scale |

`null` is the single signal for "render nothing", so the component holds one
condition rather than separately checking for absence and for blankness.

## State and validation

No component state, no derived store, no new Zod rule. The mapping is a pure
synchronous call during render. The badge is non-interactive text and adds no
ARIA beyond its own content.
