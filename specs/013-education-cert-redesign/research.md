# Phase 0 Research: Modernize Education & Certification Grade Display

The spec arrived with three clarifications already resolved (wording, colour
tone, and the "Good" vs "Very Good" band question), so the unknowns here are few.
One genuine design decision remained, plus two verifications and one risk found
while reading the data.

## R1 — Where the grade-band mapping lives

**Question**: FR-006 requires a numeric German grade to render as its English
qualitative label. Should that mapping be an inline helper in
`EducationSection.tsx`, a separate colocated module, or a shared utility in
`lib/utils/`?

**Decision**: a colocated pure module, `components/Education/grade.ts`, exporting
a single function `gradeBadgeLabel(value: string): string | null`.

**Rationale**: Principle II decides it. The mapping has more edge cases than it
first appears — a trailing word in the data (R4), band boundaries, values outside
the scale, whitespace-only input — and each deserves a one-line table assertion.
A helper defined inside a `'use client'` component can only be reached through
`render()`, which turns those assertions into DOM queries and couples arithmetic
tests to markup that this very feature is changing. A separate module makes the
band table testable in isolation and leaves the component purely presentational.

`lib/utils/` is rejected: a German university grading scale is not a general
utility, it has exactly one caller, and `lib/utils/` is where genuinely shared
concerns (validation, animation helpers) live. Colocation has direct precedent in
this repo — `components/Career/chapters.ts` with `tests/unit/career/chapters.test.ts`,
and `components/Hero/palette.ts`.

**Alternatives considered**:

- *Inline `const GRADE_BANDS` and a helper above the component.* Fewer files, and
  for a mapping with no edge cases it would be the right call. Rejected because
  the edge cases are real and testing them through the DOM is the more expensive
  option over the life of the file, not the cheaper one.
- *Add a `gradeLabel` field to `education.json`.* Would remove the mapping from
  code entirely. Rejected outright: FR-005 forbids altering, renaming or adding
  fields to the data file, and it would put a derived value in storage where it
  can drift from the number it was derived from.

## R2 — Detecting "is this value a numeric grade"

**Question**: how to distinguish `"1.9 Grade"` from `"Distinction"` reliably.

**Decision**: match a leading numeric token, do not attempt to parse the whole
string. A regex of the shape `^\s*([0-5])(?:[.,](\d{1,2}))?\b` extracts the
number; if it matches and the parsed value falls within `1.0 … 4.0` inclusive,
return the band label. Otherwise return the trimmed original string. Return
`null` when the input is empty or whitespace-only, so the caller renders no badge.

**Rationale**: three properties matter and this rule has all three.

1. `Number("1.9 Grade")` is `NaN`, so the obvious `Number.isFinite(Number(v))`
   check fails on the one value in the live data this requirement exists for
   (R4). Anchoring to a *leading* token handles it.
2. `"Distinction"` cannot match a leading-digit pattern, so non-numeric
   classifications pass through untouched with no allow-list to maintain.
3. Accepting a comma decimal (`"1,9"`) costs one character in the character class
   and covers the German-locale way of writing the same grade.

Restricting the mapping to `1.0 … 4.0` means a `5.0` fail grade, or any future
out-of-scale value, renders as-is rather than being forced into "Sufficient" —
the function declines to guess rather than asserting something false.

## R3 — Band boundaries have gaps; how to close them

**Question**: the spec's bands are 1.0–1.5, 1.6–2.5, 2.6–3.5, 3.6–4.0. A value of
1.55 belongs to none of them.

**Decision**: implement as an ascending upper-bound chain — `<= 1.5` → "Very
Good", `<= 2.5` → "Good", `<= 3.5` → "Satisfactory", `<= 4.0` → "Sufficient" —
rather than as four two-sided range checks.

**Rationale**: German grades are awarded in tenths, so the gaps are unreachable in
practice and the spec's phrasing is the conventional way of writing the scale.
But a two-sided chain would need a fifth "none matched" branch that no test can
reach and no reader can justify, and an unreachable branch is a maintenance
hazard. The upper-bound chain is total over `1.0 … 4.0`, needs no fallback, and
reads in the same order as the spec's table. Boundary values (`1.5`, `2.5`,
`3.5`, `4.0`) must each be a test case, since the chain is where an off-by-one
would land.

## R4 — What the data actually says (verification, and a correction)

**Finding**: `public/data/education.json` stores `"cardDetailedText": "1.9 Grade"`,
not `"1.9"` as the spec's FR-006 example implies. The other graded entry is
`"Distinction"`; the two AWS certifications have no `cardDetailedText` at all.

**Consequence**: any detection rule tested only against the spec's literal `"1.9"`
would pass its unit tests and still render "1.9 Grade" on the page. R2's
leading-token rule is chosen specifically to handle this, and
`tests/unit/education/grade.test.ts` must assert the literal live value
`"1.9 Grade"` alongside the spec's `"1.9"`.

## R5 — Contrast on the photographic surface (verification)

**Finding**: FR-003 needs no new measurement, because reusing the "Learn more"
pill's classes inherits an already-measured pairing. The badge's text colour is
`text-on-photo`, which resolves to `--on-photo`; in `app/globals.css` that is
`var(--foreground)` in light — documented at 5.30:1 against the bare photo at its
darkest region and 9.77:1 through the panel — and `#f3f4f6` in dark, documented
at roughly 10:1. Both clear WCAG AA. The `.dark` block redefines `--on-photo` and
`--border` directly, so the badge needs **zero** `dark:` utilities and cannot
introduce a hand-written `.dark` selector.

**Note, not a blocker**: `--border` is `oklch(0.42 0.07 48 / 14%)` in light — a
very faint hairline over photographic detail. This is a legibility-of-decoration
question, not a WCAG text-contrast one (AA applies to the label, which passes),
and the existing "Learn more" pill already lives with exactly this. FR-002
requires matching that tone, so the badge matches it. Raising the border weight
would be a separate, section-wide change.

## R6 — Motion

**Decision**: add none.

**Rationale**: FR-008 makes entrance motion optional and constrains it if added.
The badge is a four-to-eleven character label inside a row that already animates
as part of the page; animating it individually adds a `prefers-reduced-motion`
code path, a Framer Motion import and a test surface in exchange for no stated
requirement. Principle I settles it. If motion is wanted later, the constrained
route is Framer Motion (component entrance is its domain per ADR 0005/0009) with
the existing `prefersReducedMotion` helper from `lib/utils/animations.ts` — never
a new detection path.

## R7 — Mobile layout for a long future value

**Decision**: no `whitespace-nowrap`. The badge is `inline-flex` with
`max-w-full`, so an unexpectedly long value (the spec's "First Class Honours with
Distinction" edge case) wraps to a second line and grows the pill's height rather
than pushing the row past the viewport.

**Rationale**: FR-007 forbids overflow at mobile widths, and `whitespace-nowrap`
on a pill trades a wrap for exactly that overflow. A taller two-line pill is
mildly imperfect; a horizontally scrolling page is a regression of the kind
`specs/012-mobile-layout-fixes` was opened to remove. The real values in the data
are short enough that this never triggers today.

## Risks and open questions

- **`app/data/education.json` is a stale, unserved duplicate.** It lacks the
  `"Distinction"` value entirely and carries a different date string than the
  served copy. The site reads only `public/data/`, so this file has no effect on
  what renders — but it is the same drift hazard that
  `tests/integration/content-sources.test.ts` was written to prevent for
  `social.json`, and its single-source assertion currently covers only that file.
  **Confirm with the user before acting.** Deleting `app/data/*.json` and
  extending that test to `education.json`, `experiences.json` and `projects.json`
  is the right fix, but it is a separate unit of work under Principle III and
  outside this feature's scope.
- **A UK-style classification written numerically would be mis-mapped.** A future
  `"2.1"` (upper second) matches R2's numeric rule and would render "Good" from
  the German table. Not a problem for the current data, and not worth solving
  speculatively — but it is the reason the mapping stays a small, replaceable
  pure function rather than being inlined and forgotten.
- **No existing test covers `EducationSection`.** Constitution Principle II makes
  adding one part of this feature's definition of done, not a follow-up.
