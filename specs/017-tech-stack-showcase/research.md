# Phase 0 Research: Technologies Chapter

Every "NEEDS CLARIFICATION" that the Technical Context would otherwise carry is
resolved below. Nothing in this document is left open for the implementer to
decide by taste.

---

## R-001: Where do durations come from?

**Decision**: `public/data/technologies.json` stores no numbers. Durations are
computed at render time from `public/data/experiences.json` by a pure module,
`lib/utils/techDuration.ts`.

**Rationale**: FR-004 and SC-004 require that 100% of displayed durations trace
to a dated role. A hand-authored `years: 7` satisfies that only until someone
edits it; a computed one cannot be wrong without `experiences.json` also being
wrong. It also keeps "Present" honest — a role ending in `Present` grows by one
month every month, which a baked-in number would not. `experiences.json` is
already loaded by `ContentProvider`, so this costs no extra fetch.

**Alternatives considered**:
- *Hand-authored durations in `technologies.json`*: simplest to render, but
  re-creates exactly the untraceable-claims problem that ADR 0020 removed the
  old skills formation for. Rejected.
- *Build-time generation script writing durations into `technologies.json`*:
  keeps the render trivial, but adds a generated artifact that can silently
  drift from its source if the script is not re-run, and adds a build step the
  project does not currently have (`lib/scripts/` holds a one-off migration,
  not a pipeline). Rejected; the computation is a dozen lines of arithmetic.

---

## R-002: How is a technology matched to a role?

**Decision**: each entry in `technologies.json` carries an explicit
`matches: string[]` — the literal strings as they appear in the `technologies`
arrays of `experiences.json`. Matching is exact string equality after trimming,
case-insensitive. No fuzzy matching, no substring matching.

**Rationale**: the real data needs it. `experiences.json` contains `Spring` and
`Spring Boot` as separate strings, `CSS` and `CSS3`, `Angular.js`, `React.js`,
`HTML5`. A display name of "Spring" that substring-matched would swallow
"Spring Boot"; one that exact-matched only its own name would lose real months.
An explicit alias list makes the join visible in the content file, where the
person editing content can see it, rather than hidden in code.

**Alternatives considered**:
- *Normalise names in `experiences.json` instead*: rewrites existing evidence to
  suit a new chapter, and `experiences.json` copy is CV text. Rejected.
- *Fuzzy/substring matching*: silently wrong in exactly the cases above, and
  invisible when it goes wrong. Rejected.

**Guard**: an integration test asserts every string in every entry's `matches`
appears in at least one role's `technologies` array, and that every entry
resolves to a non-empty set of roles. An orphaned alias fails CI rather than
rendering a technology with zero months.

---

## R-003: How are overlapping periods handled?

**Decision**: union of intervals in whole months, not a sum. Each matched role
contributes the half-open month interval `[start, end)`; intervals are merged
before totalling. Adjacent intervals (one role ending the month before the next
begins) merge into one continuous span.

**Rationale**: spec Assumptions require "sum their real time spans rather than
double-count overlapping periods". The owner's real history is sequential and
near-contiguous — AWS spans `08/2018 → Present` across three consecutive roles
— so a naive sum happens to give nearly the right answer today, but would
double-count the moment a parallel/part-time role is added. Union is the same
amount of code and cannot become wrong.

**Display**: months are rendered as years with one decimal place, or as a
`< 1 yr` label below twelve months. Rounding is always *down* to the displayed
precision — an overstated duration is the specific failure this chapter exists
to avoid.

---

## R-004: How is `dateText` parsed?

**Decision**: a single parser in `lib/utils/techDuration.ts` accepting
`MM/YYYY – MM/YYYY` and `MM/YYYY – Present`. The separator in the real data is
an en dash (U+2013) surrounded by spaces; the parser accepts en dash, em dash,
or hyphen, and tolerates extra whitespace. `Present` (case-insensitive)
resolves to the current month, evaluated once per render.

**Rationale**: `ExperienceSchema.dateText` is currently only `z.string().min(5).max(30)`,
so the format is a convention, not a guarantee. Tightening the Zod schema to a
regex is tempting but would be a breaking change to an existing content file's
contract and is out of this feature's scope.

**Failure behaviour**: an unparseable `dateText` contributes zero months and is
reported via `console.error`, and the affected technology renders *without* a
duration claim rather than with a wrong one (spec Edge Cases). A unit test
covers the unparseable case; an integration test asserts every current entry in
`experiences.json` parses, so a future malformed edit fails CI.

---

## R-005: How is proficiency level derived?

**Decision**: derived, never authored. Three levels, computed from total months
plus recency:

| Level | Condition |
|---|---|
| Daily driver | still in use — appears in the most recent role, whose range ends in `Present` |
| Production | ≥ 24 total months, but not currently in use |
| Working knowledge | < 24 total months |

Thresholds live as named constants in `lib/utils/techDuration.ts` with a comment
explaining that they are a presentation rule, not a claim about skill.

**Rationale**: the spec explicitly permits implementation to define the levels
and thresholds, and explicitly notes proficiency is not a recorded field. Making
it derived keeps the chapter's "everything here is computed from dated history"
property whole — a hand-authored level would be the one unverifiable claim in a
chapter whose entire argument is verifiability.

**Alternatives considered**: a hand-authored `level` field in the content file —
rejected for the reason above. Level names borrowed from the reference prototype
because they describe usage rather than seniority.

---

## R-006: Rendering the duration bar without an interpolated inline style

**Decision**: the per-row duration indicator renders as a fixed row of discrete
year cells (`MAX_YEARS` segments, filled up to the technology's whole-year
count) using literal Tailwind classes — the same device the reference
prototype already uses for its "Experience depth" strip — rather than a
continuous bar sized by `style={{ width: \`${pct}%\` }}`.

**Rationale**: this is the one place the reference prototype conflicts with the
constitution. "Technology & Quality Constraints" permits inline `style` *only*
for values exported by a shared token module, because Tailwind cannot see an
interpolated class string. A percentage width is not a token, so copying the
prototype's bar would be a constitution violation on its first line. Discrete
cells need no interpolated value at all: each cell is either filled or not, both
states are literal class strings, and the segmentation reinforces the chapter's
point (these are counted years, not a vibe).

**Alternatives considered**:
- *Framer Motion `animate={{ width }}`*: Framer sets the style itself, so it is
  arguably within the animation library's own domain rather than a hand-written
  inline style — but it turns a static bar into an animated one for no reason
  and leaves the rule's interpretation ambiguous. Rejected; not worth spending
  an ADR's ambiguity budget on a progress bar.
- *A lookup map of twelfth-width classes (`w-1/12` … `w-full`)*: compliant and
  continuous-looking, but quantises to twelfths anyway, so it buys nothing over
  discrete cells while adding a map to maintain. Rejected.

---

## R-007: Where does the chapter sit in the page order?

**Decision**: between the `PrincipleBand` and the `#education` section in
`app/page.tsx` — i.e. fourth of six chapters, order becomes:
hero → skills (Selected Work) → career → *(principle band)* → **technologies** →
education → projects → contact.

**Rationale**: FR-008 forbids top-of-page placement and visual dominance. Mid-
page is the structural opposite of dominant. The chapter's numbers are derived
from the career timeline, so it reads as that chapter's evidence; the principle
band already acts as the pivot that closes the career act, and technologies
opens the credentials run (technologies → education) that follows it. It does
not move, resize, or reorder any existing chapter, per the spec's additive
assumption.

**Alternatives considered**:
- *Immediately after `#skills`*: puts two evidence chapters back to back and
  pushes the career narrative down — closer to the top than "not the highlight"
  supports. Rejected.
- *Between career and the principle band*: inserts detail between a chapter and
  the statement that closes it. Rejected.

---

## R-008: How is "not the most visually dominant chapter" enforced?

**Decision**: four concrete rules, testable rather than aesthetic:

1. Heading uses the same scale as `ThreeSystems` (`text-3xl sm:text-4xl`), never
   larger, and no gradient text treatment.
2. No `ChapterGradientOverlay` wash. Only `#skills` and `#career` carry one; the
   later chapters (`#education`, `#projects`, `#contact`) do not, and this
   chapter joins the later group.
3. Standard `chapter-scrim px-4 py-16 sm:px-6 lg:px-8` section shell and
   `mx-auto max-w-6xl` column — identical to the existing chapters, no custom
   spacing.
4. No `shadow-glow` on the chapter container. (It may be used on the single
   selected row, as an interaction affordance rather than chapter-level
   emphasis.)

**Rationale**: FR-008 and SC-006 are qualitative; without these written as rules
they cannot be reviewed or tested. Rules 1 and 2 are directly assertable in the
integration test (`story-page.test.tsx`).

---

## R-009: Where does the Claude Code / spec-driven sentence live?

**Decision**: one sentence, stored as a `builtWithNote` string field in
`technologies.json` (Zod-bounded, 40–220 chars), rendered as the last line of
the chapter's intro paragraph block at body-copy size — same typography as the
rest of the chapter's supporting text. No badge, no banner, no callout box.

**Rationale**: FR-005 wants it clearly readable and exactly once; the spec's
"more noticeable but not the highlight" reading is "its own sentence, ordinary
weight". Keeping the copy in the content file rather than hard-coded in JSX
matches every other piece of prose on this site (ADR 0001) and lets it be edited
without a code change.

---

## R-010: The "This Portfolio" project entry (FR-006) — a real gap

**Decision**: tighten the existing `bodyText` of the "This Portfolio,
Spec-Driven" entry in `public/data/projects.json` so it names **Claude Code**
explicitly, and add `Claude Code` to its `tags`. Do not change its position in
the array, its `image`, its links, or anything that affects its rank or size in
the gallery.

**Rationale**: FR-006 says the entry "MUST continue to state that it was built
using Claude Code and spec-driven development" — but the current copy states
only spec-driven development. The words "Claude Code" do not appear anywhere in
`projects.json` today. This is a genuine gap, not a confirmation.

**Constraint the implementer must respect**: `ProjectSchema.bodyText` is
`z.string().min(100).max(500)` and the current text is **495 characters**. There
are five characters of headroom. Adding "Claude Code" therefore requires
*replacing* words, not appending. The same edit should correct "ADRs (21 and
counting)" — the repo has 22 accepted ADRs today and this feature adds a 23rd,
so prefer a form that does not need updating every feature. `tags` is capped at
8 and currently holds 6, so adding a tag is safe.

---

## R-011: Loading and error states

**Decision**: follow `ThreeSystems` exactly — read from `useContent()`, render
`<ProjectsSkeleton />` while loading, and a single red failure line if the
content errored or is null. The chapter needs *two* content states
(`technologies` and `experiences`) and must treat either one loading as loading,
and either one failed as failed, since a duration cannot be computed without
both.

**Rationale**: consistency with the established pattern beats a bespoke partial-
render. A technologies list with every duration missing because
`experiences.json` failed would be worse than an honest failure line.

---

## R-012: Motion

**Decision**: Framer Motion only. Entrance uses a staggered fade/rise on the
list rows and the detail panel (the reference prototype's `Reveal`, expressed
with `motion.div` + `whileInView`), and the detail panel's content change uses a
short cross-fade. Reduced motion is read once via `prefersReducedMotion()` from
`lib/utils/animations.ts` and collapses every transition to zero duration.

**Rationale**: nothing here is scroll-*sequenced* (no timeline scrubbing), so
GSAP/ScrollTrigger is the wrong domain and would also need cleanup handling for
no benefit. `rough-notation` is for annotation marks over text and has no role
here. No fourth library is needed, so Principle IV is untouched.
