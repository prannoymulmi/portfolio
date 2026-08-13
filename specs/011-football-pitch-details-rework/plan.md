# Implementation Plan: Football Pitch Interaction Rework

**Branch**: `feat/football-pitch-rework` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-football-pitch-details-rework/spec.md`

## Summary

The career pitch keeps its orange active-player halo but loses the browser's
default focus outline that lands on top of it after a click; selection change
is carried by one small ball that travels from the old player to the new one
and settles. Every player gains an identity without interaction — its order
number, a derived company abbreviation beneath it, and a shortened company
display name on the field. A one-line tip sits below the pitch. The detail
panel is restructured to the Work showcase's section pattern (short "what I
built" summary, achievements, technology tags) at tighter vertical rhythm,
with a fixed fallback tag set for chapters that record no technologies.

Technical approach: all four changes live inside the existing
`components/Career/*` files plus one derivation module. The ball is a single
`motion.circle` whose `cx`/`cy` are animated by Framer Motion — already in the
stack, already the ratified owner of interaction motion — so a new selection
mid-flight retargets the same element rather than queueing. Display name and
abbreviation are pure string derivations added to `toChapters`, unit-testable
without rendering. Focus is handled with the project's existing
`focus-visible:outline-none` convention plus an SVG-drawn focus ring, because
Tailwind's `ring-*` utilities are box-shadow based and do not paint on SVG
children. No new dependency, no content-schema change, no new route.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16.3 App
Router

**Primary Dependencies**: framer-motion ^11 (already installed — interaction
motion domain per Principle IV), Tailwind CSS v4. No new dependency.

**Storage**: `public/data/experiences.json`, fetched client-side and validated
by `lib/utils/validation.ts`. Unchanged by this feature — every new field is
derived at runtime in `components/Career/chapters.ts`.

**Testing**: Jest + Testing Library (`npm test`). Existing coverage to extend:
`tests/unit/components/CareerPitch.test.tsx`. New unit coverage for the
display-name/abbreviation derivation.

**Target Platform**: Modern evergreen browsers; the site is a single scrolling
story at `/`, career section is the `#career` anchor.

**Project Type**: Web frontend (single Next.js app, no backend).

**Performance Goals**: Lighthouse performance ≥ 90 on production builds
(constitution). Ball travel animates two SVG attributes on one element —
target a single settling transition of roughly 450–600 ms, no layout thrash.

**Constraints**: `prefers-reduced-motion` must be honoured through the
existing `prefersReducedMotion` helper in `lib/utils/animations.ts`, not a new
detection path. Interactive SVG elements keep `role`/`aria-label`. Panel
rendered height must not exceed today's for the fullest chapter (SC-003).
Pitch stays SVG — no canvas (FR-011, Principle IV).

**Scale/Scope**: 5 career chapters in the shipped data (7 formation slots).
Four component/module files touched plus one stylesheet convention; no route,
schema, or data file changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gated against `.specify/memory/constitution.md` v1.4.0.

| Principle | Assessment | Verdict |
|---|---|---|
| I. KISS & Maintainability (NON-NEGOTIABLE) | Derivations are two small pure functions over a string; the ball is one element with two animated attributes; the panel is a re-layout of existing markup. No new abstraction layer, no state machine. | PASS |
| II. Test-First (NON-NEGOTIABLE) | Derivation functions are unit-tested directly (pure, no DOM). Rendering assertions (abbreviation present, tip present, fallback tags, ball element count) extend the existing `CareerPitch.test.tsx`. Tests written alongside, per `/speckit-tasks` ordering. | PASS |
| III. Atomic Commits | Four separable units of work — derivation + labels, focus/ball motion, panel restructure, tip — each within the five-file guidance. | PASS |
| IV. Technology Stack (NON-NEGOTIABLE) | **No new dependency**: the ball uses framer-motion, already ratified and already the owner of "component entrance, exit, and interaction motion"; selection is interaction motion, not scroll-sequenced, so it is not GSAP's domain. **Pitch stays SVG** (FR-011) — the Visualisation entry and ADR 0004's football metaphor are upheld, not extended. **Styling** stays Tailwind utilities; SVG paint values continue to use literal hex mirroring `--primary` (`#f65600`), the existing documented practice in `CareerPitch.tsx`/`SVGPitch.tsx`, because SVG presentation attributes do not reliably resolve CSS custom properties. **Content**: no JSON or Zod schema change — every added field is derived from existing `subtitle`/`workDescription`/`technologies` (spec Assumptions, clarification 2/3). **Structure**: no new route or anchor. | PASS |
| V. Token Efficiency | Planning artifacts reference existing files by path rather than restating their contents. | PASS |
| VI. Recorded Decisions (ADRs) | No ADR triggered. The change adds/removes no dependency, changes no URL or site structure, changes nothing about how content is stored, loaded, or validated, and commits the design to no new metaphor — it restyles inside the metaphor ADR 0004 already set and adopts the section pattern ADR 0020's showcase already established. | PASS |

Additional quality constraints checked: `prefers-reduced-motion` via the
existing helper (not a per-component media query) — satisfied by design R2;
accessible `aria-label`/`role` retained on every interactive SVG player
(FR-010); no `any` types introduced; no hand-written `.dark` selectors; no
GSAP ScrollTrigger instance created, so no cleanup obligation added.

**Initial gate result: PASS — no violations, Complexity Tracking not required.**

## Project Structure

### Documentation (this feature)

```text
specs/011-football-pitch-details-rework/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/          # Pre-existing spec checklists
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory: this feature exposes no API, no serialized payload,
and no cross-process interface. Its only "contract" is the `CareerChapter`
TypeScript shape, which is recorded in `data-model.md`.

### Source Code (repository root)

```text
components/
├── Career/
│   ├── CareerPitch.tsx      # players, labels, ball marker, focus handling, tip
│   ├── ChapterDetail.tsx    # panel restructured to the showcase section pattern
│   ├── chapters.ts          # CareerChapter shape + displayName/abbreviation/
│   │                        # builtSummary derivation + fallback tech list
│   └── SVGPitch.tsx         # unchanged (viewBox + markings)
└── Work/
    └── SystemCard.tsx       # read-only reference for the panel's section pattern

app/
└── globals.css              # focus-visible convention if a shared utility is warranted

lib/
├── types/portfolio.ts       # unchanged — no schema change
└── utils/animations.ts      # unchanged — prefersReducedMotion consumed as-is

tests/
└── unit/
    ├── components/CareerPitch.test.tsx   # extended
    └── career/chapters.test.ts           # new: derivation unit tests
```

**Structure Decision**: Single Next.js app, existing layout. All work is
confined to `components/Career/`, with `components/Work/SystemCard.tsx` and
`lib/utils/animations.ts` read from but not modified. No new directory is
introduced; the derivation helpers live next to the data they derive from in
`components/Career/chapters.ts` rather than in `lib/utils/`, because they are
meaningless outside the career chapter shape.

## Complexity Tracking

> Not applicable — Constitution Check passed with no violations at both gates.

## Post-Design Constitution Re-Check

Re-evaluated after Phase 0 and Phase 1.

- **Principle I**: research settled on the smallest option at every decision
  point — one `motion.circle` rather than a path/timeline (R1), the existing
  `prefersReducedMotion` helper rather than a new hook (R2), plain exported
  functions rather than a memoised derivation layer (R3). No new abstraction
  survived the design.
- **Principle II**: `data-model.md` fixes exact derivation inputs/outputs for
  all five shipped companies, so the unit tests are writable before the
  implementation; `quickstart.md` maps every acceptance scenario to a manual
  check.
- **Principle IV**: design introduces no library, no canvas, no schema field,
  no route. The fallback technologies list is a module-level constant in
  `chapters.ts`, not a JSON content change (data-model §3), keeping the
  content-source rule intact.
- **Principle VI**: still no ADR trigger. The one decision worth flagging for
  reviewers — the panel adopting the showcase's section structure — is a
  restatement of ADR 0020's existing pattern, not a new commitment.
- **Quality constraints**: R2 keeps reduced-motion on the shared helper; R4
  keeps focus styling on the project's existing `focus-visible:` convention
  and adds an SVG-drawn ring only because `ring-*` cannot paint on SVG
  children — a rendering fact, not a style-system exception.

**Post-design gate result: PASS — no new violations, Complexity Tracking
remains empty.**
