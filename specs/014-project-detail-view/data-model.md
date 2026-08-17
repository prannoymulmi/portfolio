# Phase 1 Data Model: Featured Project Detail View

No schema or content change. This feature adds a UI layer over data that
already exists; it is documented here for completeness, not because anything
in `lib/types/portfolio.ts` or `lib/utils/validation.ts` changes.

## Entity: Project (existing, unchanged)

Source: `lib/types/portfolio.ts` (`Project` interface), validated by
`ProjectSchema` in `lib/utils/validation.ts`, populated from
`public/data/projects.json`.

| Field | Type | Used by this feature |
|---|---|---|
| `id?` | `string` | Identifies which project's modal is open (`selectedProjectId`) |
| `title` | `string` | Modal heading, `aria-labelledby` target |
| `bodyText` | `string` | Rendered in full in the modal (no `line-clamp`) — this is the field that is truncated today and the feature's core fix |
| `links` | `ProjectLink[]` | Modal's "View on GitHub" link resolves from this array (first `route` containing `github.com`, else `links[0]`) |
| `tags` | `string[]` | Rendered in the modal same as on the card (no truncation to 3 — full list, since the modal has room) |
| `role?` | `string` | Rendered if present; omitted if absent (existing optional-field convention, spec Edge Cases) |
| `metric?` | `string` | Rendered if present; omitted if absent |
| `image?` | `string` | Rendered if present, same as the card |
| `year?` | `string` | Not used by the projects gallery today (showcase-only field per existing code comment); stays unused here too |

No new entity, no new field, no schema version change.

## State: Modal open/closed

Not a persisted entity — client-only UI state already present in
`ProjectGallery`:

- `selectedProjectId: string | null` (existing state, renamed in intent but
  not in code: was "which card is highlighted," becomes "which card's modal,
  if any, is open"). `null` means no modal is open.

## Derived value: GitHub profile link

A constant, not a fetched or entity value:
`https://github.com/prannoymulmi` — the root of the GitHub URLs already
present in `projects.json`'s per-project `links` entries.
