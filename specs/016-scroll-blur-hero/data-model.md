# Phase 1 Data Model: Scroll-Progressive Hero Blur

## Entities

**None.** This feature has no data entities.

The specification says so explicitly under Key Entities ("Not applicable — this feature has no
data entities; it is a purely visual scroll-driven effect"), and the design confirms it: nothing
is fetched, stored, validated, serialised or persisted. The constitution's content rule (JSON in
`public/data/` validated with Zod) is not engaged — the hero's existing content still arrives
through `ContentProvider`, and this feature neither reads nor changes it.

This file exists to record that absence deliberately, so a later reader does not assume the
artifact was skipped by accident.

## Runtime state

For completeness, the only state the feature holds is ephemeral and component-local. It is not a
data model, but it is the full list of things that vary at runtime.

| Name | Type | Owner | Lifetime | Notes |
|---|---|---|---|---|
| `reducedMotion` | `boolean` | `useHeroScrollBlur` | Read once on first render, held for the component's life | From `prefersReducedMotion()` in `lib/utils/animations.ts`. Never re-read (see research R5). |
| `progress` | `number` in `[0, 1]` | GSAP `ScrollTrigger` | Recomputed by ScrollTrigger on every scroll tick and refresh | Not stored in React state — reading it into state would re-render the hero on every frame. |
| `filter` | inline style string on the hero `<section>` | The DOM | Written per scroll tick, cleared on cleanup | `blur(Npx)` while progress > 0; absent entirely at progress 0. |

None of the above is shared between components, survives a reload, or crosses a network
boundary. There are no relationships, no validation rules beyond the clamp in `blurPxAt`, and no
state machine.

## Contracts

No `contracts/` directory is generated for this feature, and this is intentional rather than an
omission. The feature exposes no external interface: no HTTP endpoint, no CLI command, no public
package API, no file format, no schema. It is a visual effect internal to one React component in
a single-page application. The only interface any other engineer touches is the hook signature,
which is recorded in `research.md` (R9) alongside the reasoning for its shape.
