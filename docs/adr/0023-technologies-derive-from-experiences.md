# ADR 0023: Technologies chapter derives durations from experiences.json

- **Status**: Accepted
- **Date**: 2026-08-18
- **Extends**: [ADR 0020](0020-work-showcase-replaces-skills-formation.md) — the Technologies
  chapter is the same evidence-backed pattern applied to a per-technology breakdown, and does not
  reintroduce the football-pitch skills formation that ADR removed.

## Context

The site owner asked for a chapter showing every technology they've professionally used, with a
category and "how long" for each — mirroring a reference prototype's `TechStack.tsx` — plus a
low-key mention that the site itself was built with Claude Code using spec-driven development.

The obvious content-file shape for "how long" is a hand-typed `years: 7.5` field beside each
technology name, matching how the reference prototype hardcoded its array. That is exactly the
untraceable-claims shape ADR 0020 removed the old skills formation for: `SkillsFormation` scattered
tool names across pitch positions with no evidence behind them, and this feature's own spec (FR-004,
SC-004) requires the opposite — every duration must trace to a dated role, and a technology with no
traceable history must not render a fabricated number.

A hand-authored duration also goes stale the moment it's written: a role ending in `Present` grows by
a month every month, and nobody edits `technologies.json` on a schedule to keep up.

## Decision

**`public/data/technologies.json` stores no numbers at all** — no `years`, `months`, or `level`
field. Each entry carries only what cannot be derived: `name`, `category`, an explicit `matches:
string[]` alias list (the literal strings as they appear in `experiences.json`'s `technologies`
arrays — e.g. `"Spring"` vs `"Spring Boot"`, `"CSS"` vs `"CSS3"`), and a short `note` on where it was
used.

**Duration, level, and role list are computed at render time** by a pure module,
`lib/utils/techDuration.ts`:

- `parseDateText` turns `experiences.json`'s `dateText` (`MM/YYYY – MM/YYYY` or `MM/YYYY – Present`,
  en dash / em dash / hyphen, case-insensitive `Present`) into a half-open month interval, returning
  `null` — not throwing — on anything unrecognised.
- `unionMonths` merges the matched roles' intervals (overlapping and adjacent) before totalling, so a
  technology used across sequential or concurrent roles sums its real span rather than
  double-counting.
- `deriveLevel` derives a proficiency label (`Daily driver` / `Production` / `Working knowledge`)
  from total months and current-use, against named threshold constants — a presentation rule, not a
  skill claim.
- `buildUsage` composes the above per technology and orders the result deterministically (category
  order, then duration descending, then name).

A technology whose matched roles all fail to parse renders with **no duration and no level at all**,
never a `0` — the failure is loud (`console.error` naming the role) rather than silently wrong.
`buildUsage` goes further and omits a technology from its result entirely whenever its computed
`totalMonths` is `null` or under twelve — the chapter's claim is real, evidenced depth, not a complete
inventory of everything ever touched, so a technology used for a few months at one contract does not
belong in the list at all, not merely without a number next to it.

**A technology can start partway through an otherwise fully-matched role**, via an optional,
additive `Technology.sinceByEmployer: Record<string, string>` field (added post-implementation, once
real data — threat modeling starting in 2024 partway through a role open since 2020 — needed it). Keys
are a role's `subtitle`, compared **trimmed** (a real `subtitle` in `experiences.json` carries a
trailing space); values are `"MM/YYYY"`. `buildUsage` clamps that one matched role's interval start to
`max(roleStart, parsedSinceMonth)` before unioning — every other matched role, and every other
technology, is unaffected. This was chosen over splitting the role into two career entries specifically
to avoid corrupting the career-chapter timeline with a duplicate job, and over a general "explicit
override interval" field because a single since-date is the actual shape of the real case and a wider
mechanism would be speculative generality with no second user today.

**Matching is exact, not fuzzy.** `matches` strings are compared to a role's `technologies` array
case-insensitively after trimming, with no substring or fuzzy matching — the real data needs the
distinction (`Spring` vs `Spring Boot` would otherwise collide). An integration test
(`tests/integration/content-sources.test.ts`) guards the invariants Zod cannot see across files:
every `matches` string exists in `experiences.json`, every technology resolves to at least one role,
no two technologies claim the same source string, and every `dateText` in `experiences.json` parses.

**The duration bar is a continuous, gradient-filled track without an interpolated `style={{ width }}`.**
The reference prototype's bar sets an inline percentage width, which the constitution's inline-style
rule does not permit — a percentage is not a shared token value. `barWidthClass` in
`lib/utils/techDuration.ts` instead indexes into a small, fixed, literal array of Tailwind
arbitrary-value width classes (`w-[0%]`, `w-[5%]` … `w-[100%]`, every one written out verbatim so
Tailwind's static scanner emits CSS for all of them), rounding a technology's share of `MAX_BAR_YEARS`
to the nearest 5% step. `TechnologyList` and `TechnologyDetail` both render the chosen class inside a
`bg-gradient-to-r` fill, giving the same continuous-bar visual as the reference with zero inline style
and zero runtime-interpolated class string. (An earlier iteration used discrete year-cell segments
instead, for the same constitutional reason; the lookup-table bar replaced it once feedback asked for
the reference's actual continuous-bar look.)

## Alternatives considered

- **Hand-authored durations in `technologies.json`.** Simplest to render, but re-creates the exact
  untraceable-claim problem ADR 0020 removed the skills formation for, and cannot express "Present"
  honestly.
- **Build-time generation script writing durations into `technologies.json`.** Keeps the render
  trivial, but adds a generated artifact that can silently drift from its source if the script isn't
  re-run, and the project has no build pipeline today (`lib/scripts/` holds a one-off migration, not
  a generator). The computation is a dozen lines of arithmetic — not worth a build step.
- **Fuzzy or substring matching between `technologies.json` and `experiences.json`.** Silently wrong
  in exactly the cases the real data has (`Spring` swallowing `Spring Boot`), and invisible when it
  goes wrong. Rejected in favour of an explicit, testable alias list.

## Consequences

- `technologies.json` is safe to hand-edit without risking a stale number — every duration updates
  itself the next time `experiences.json` is edited or a `Present` role's month rolls over.
- Adding a technology means adding an entry with a correct `matches` list; forgetting to match an
  existing role fails CI via the SC-004 integration guard rather than shipping a silently-zero
  technology.
- The chapter needs two content sources (`technologies` and `experiences`) to render at all, so it
  treats either failing to load as a full failure, matching `components/Work/ThreeSystems.tsx`'s
  loading/error convention.
- `sinceByEmployer` is optional and additive: existing entries with no such field are unaffected, and
  the field never states a duration itself — it only narrows which portion of one already-dated role
  counts, so the "every number is computed, none hand-authored" property this ADR exists for still
  holds.
- Adding `sinceByEmployer` widened `TechnologiesFileSchema.categories` from `max(6)` to `max(8)` (two
  new categories, Observability and Security, arrived in the same round of content corrections) — a
  bound increase, not a shape change.
