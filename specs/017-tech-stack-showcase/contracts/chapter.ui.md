# Contract: Technologies chapter UI

## Anchor and placement

- Section id: `technologies`. New anchor on the existing single page; no route,
  no redirect (ADR 0012 unaffected).
- Position in `app/page.tsx`: after `<PrincipleBand />`, before the
  `#education` section.
- `StoryProgressNav`'s `STORY_SECTIONS` gains `{ id: 'technologies', label: 'Technologies' }`
  between `career` and `education`, so the hamburger menu order matches the page
  order.
- `public/data/navbar.json` is **not** edited: its `sections` are path-style
  entries (`/skills`, `/about`) not used by `StoryProgressNav`. Confirm before
  touching it; adding an entry there would be a change with no rendered effect.

## Structure

```
section#technologies  (chapter-scrim, px-4 py-16 sm:px-6 lg:px-8)
└── div.mx-auto.max-w-6xl
    ├── label-mono eyebrow
    ├── h2                       (text-3xl sm:text-4xl — same scale as ThreeSystems)
    ├── p  intro                 (body copy)
    ├── p  builtWithNote         (body copy, same size — one sentence, no badge)
    ├── filter row               (All + one button per category)
    └── grid lg:grid-cols-[1.4fr_1fr]
        ├── technology list      (one button per technology)
        └── detail panel         (sticky on lg and up)
```

## Interaction

| Input | Result |
|---|---|
| Click/tap a category button | List narrows to that category in one interaction (SC-002). Active button is visually distinct and carries `aria-pressed="true"`. |
| Click/tap `All` | Full list restored. |
| Hover a technology row | Detail panel updates to that technology. |
| Focus a technology row (Tab) | Detail panel updates identically — hover is never required (FR-003, FR-009). |
| Click/tap a technology row | Detail panel updates identically (touch parity, Edge Case 3). |

## Accessibility

- Filters and technology rows are real `<button type="button">` elements, in DOM
  order, reachable by Tab with a visible focus ring.
- Category buttons use `aria-pressed`; the selected technology row uses
  `aria-current="true"`.
- The detail panel is `aria-live="polite"` so a screen-reader user hears the
  panel change when they focus a row, and is labelled by the technology name
  heading.
- The discrete year-cell strip is decorative and `aria-hidden="true"`; the
  duration is always available as text (e.g. `6.4 yrs`) next to the name.
- No information is conveyed by colour alone — level is a text label, not just a
  tone.

## Motion

- Framer Motion only. Staggered entrance on rows and panel; short cross-fade on
  panel content change.
- `prefersReducedMotion()` from `lib/utils/animations.ts` collapses all
  durations to zero. No new detection path.
- No GSAP (nothing is scroll-sequenced), no `rough-notation`, no fourth library.

## Visual-weight constraints (FR-008, testable)

1. `h2` scale equals `ThreeSystems`' (`text-3xl sm:text-4xl`); never larger.
2. No `ChapterGradientOverlay` in this section.
3. No gradient text treatment on the heading.
4. No `shadow-glow` on the section or its heading (permitted on the selected row
   only, as an interaction affordance).
