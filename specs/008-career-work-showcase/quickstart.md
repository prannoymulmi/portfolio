# Quickstart: Career & Work Showcase

Validation guide once implemented. See [data-model.md](./data-model.md) for field shapes and
[research.md](./research.md) for why each approach was chosen.

## Prerequisites

- `npm install --legacy-peer-deps` (constitution, ADR 0007)
- `public/data/projects.json` has `year`/`role`/`metric` backfilled on at least the first three
  entries; `public/data/principle.json` exists with a real `statement`/`supporting`

## Setup

```sh
npm run dev
```

## Automated validation

```sh
npm test -- ThreeSystems
npm test -- CareerPitch
npm test -- PrincipleBand
npm test -- career-in-story
npm test -- backdrop-coverage
```

Expected coverage:
- `ThreeSystems`: renders exactly three systems from `projects.json`, each with title/role/metric
  when present, omits the year badge when `year` is absent
- `CareerPitch`: clicking a pitch position shows that chapter's detail; "play in order" steps
  chronologically and can be paused; positions and chronological order match sorted `dateText`
- `PrincipleBand`: renders the statement/supporting text; background transform is non-zero with
  motion allowed, zero under `prefers-reduced-motion` (mirrors `HeroParallax.test.tsx`'s pattern)
- `career-in-story`: rewritten to assert against the new pitch/detail structure instead of the
  deleted `MilestoneCard` expand/collapse
- `backdrop-coverage`: extended to confirm the new chapters' overlays are positioned images, not
  `bg-gradient-to-br` utilities, and that `Backdrop.tsx` itself is still untouched

## Manual validation (visual — jsdom has no compositing, per ADR 0015's own caveat)

1. **Skills section is gone**: scroll past the opening; confirm no "Frameworks & Technologies" list
   or SVG-pitch-with-scattered-dots appears anywhere — matches spec **FR-001**
2. **Three systems, full detail**: confirm the replacement section shows three systems with
   year (if present)/role/metric/stack/description — matches **FR-002**, **SC-001**
3. **Mobile parity, Work**: at a narrow viewport, confirm all three systems and every field are
   still present, not summarised — matches **FR-003**
4. **Pitch navigation**: click at least three different pitch positions; confirm each shows its own
   company/role/years/built/achievements/tech with no page reload — matches **FR-004**, **SC-002**
5. **Play in order**: press play; confirm chapters step chronologically and pause holds — **FR-005**
6. **Plain timeline still exists**: toggle to the non-interactive view; confirm no pitch, no player
   marker, no play/pause control appears — matches **FR-006**
7. **Mobile parity, Career**: at a narrow viewport, confirm the pitch and chapter detail are both
   present and usable by touch — matches **FR-007**, **SC-003**
8. **Principle band motion**: scroll through the new section at normal speed; confirm the background
   visibly moves at a different rate than the text — matches **FR-009**, User Story 3
9. **Reduced motion**: enable OS-level reduced motion, reload, confirm the principle band shows no
   parallax and the statement is fully readable — matches **SC-004**
10. **Surface untouched**: scroll the entire page; confirm the pinned photograph is still the only
    full-bleed background, and no chapter (including the two new/reworked ones) shows an opaque or
    gradient background of its own — matches **FR-010**, **SC-006**

## Performance check

```sh
npm run build && npm run start
```

Run Lighthouse against the production build; confirm score ≥90 — **SC-005**.

## Governance check

Confirm `docs/adr/0020-<slug>.md` exists and is referenced from `docs/adr/README.md`'s index, per
the Constitution Check in [plan.md](./plan.md).
