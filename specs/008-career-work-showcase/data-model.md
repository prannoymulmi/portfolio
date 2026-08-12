# Phase 1 Data Model: Career & Work Showcase

## Project (extended)

`lib/types/portfolio.ts` — three new optional fields on the existing `Project` interface:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `year` | `string?` | Display year for the system entry (e.g. `"2025"`) | Omit entirely when unknown — component must not render a placeholder date |
| `role` | `string?` | The site owner's role on this system (e.g. `"Tech lead"`) | Omit when unknown |
| `metric` | `string?` | One headline metric already substantiated elsewhere in `bodyText` (e.g. `"99.99% uptime"`) | Should be traceable to a number already present in that project's `bodyText` — not a new, unverified figure |

All existing `Project` fields (`title`, `bodyText`, `image?`, `links`, `tags`) are unchanged.
`ProjectSchema` in `lib/utils/validation.ts` gets matching optional Zod fields
(`z.string().optional()` for each). Existing consumers (the unrelated Projects gallery chapter)
ignore the new fields — no breaking change.

## System (derived, not stored)

The "Three systems" section shows the **first three entries** of `projects.json`, unchanged from
however that file is ordered — no new selection/ranking logic. Each rendered `SystemCard` reads
`title`, `bodyText`, `tags` (as the tech stack), `year`, `role`, `metric` directly off `Project`.

## Career Chapter (derived, not stored)

Not a new type — a view-level shape computed from the existing `Experience[]` at render time in
`CareerPitch.tsx`:

| Field | Source | Notes |
|-------|--------|-------|
| `company` | `experience.subtitle` | |
| `role` | `experience.title` | |
| `years` | `experience.dateText` | Also the sort key for chronological `order` |
| `built` | `experience.workDescription[0]` | First bullet stands in for the reference's one-line "what I built" |
| `achievements` | `experience.workDescription` | Full list, same field `MilestoneCard` already used |
| `tech` | `experience.technologies` | Falls back to an empty list if absent (existing field is already optional) |
| `order` | Computed | Index after sorting all experiences by parsed `dateText`, earliest = 1 |
| `position` | Computed | Assigned from a fixed formation slot list by sorted index, cycling if there are more chapters than slots — same approach `SkillsFormation`'s `FORMATION_LAYOUT` used before deletion |
| `x`, `y` | Computed | Pitch coordinates paired with `position`, from the same fixed slot list |

No `Experience` type or schema change. No JSON content change required for Career.

## Principle (new)

`public/data/principle.json`, following the existing one-file-per-chapter convention:

```json
{
  "statement": "…",
  "supporting": "…"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `statement` | `string` | The single engineering-principle quote (required — the section has nothing to show without it) |
| `supporting` | `string` | One short supporting line beneath the statement (required) |

New `PrincipleFile` type in `lib/types/portfolio.ts`, new `PrincipleFileSchema` in
`lib/utils/validation.ts`, loaded through the existing `useContent()`/`ContentProvider` pattern like
every other content file — no new loading mechanism.

## Chapter Gradient Overlay (component prop shape, not persisted data)

| Field | Type | Description |
|-------|------|-------------|
| `src` | `'/images/mesh-soft.png' \| '/images/mesh-soft-flip.png'` | Which of the two existing assets to use |
| `opacityClassName` | `string` | Literal Tailwind class (e.g. `'opacity-20 dark:opacity-0'`) — never interpolated, per the constitution's Tailwind class-scanning constraint |
