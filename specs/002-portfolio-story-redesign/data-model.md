# Phase 1 Data Model: Story-Driven Portfolio Redesign

This feature is an assembly/navigation change over existing content — it does not add a database or new persisted content types. The entities below are the conceptual/config shapes the implementation is organized around; they map directly onto the existing content files, not new schemas.

## StorySection

Represents one chapter of the single-page narrative.

| Field | Type | Notes |
|---|---|---|
| `id` | string | Anchor slug used as the section's `id` attribute and redirect/jump target (e.g., `"career"`) |
| `title` | string | Human-readable chapter name, used by `StoryProgressNav` and for accessibility labeling |
| `order` | number | Position in the reading sequence (fixed: hero → about → skills → career → education → projects → playbook → contact) |
| `component` | reference | The existing React component that renders this chapter's content (e.g., `CareerJourneyLazy`) — unchanged by this feature |
| `legacyRoute` | string \| null | The old standalone page path this chapter replaces, if any (e.g., `"/career"`); used to build the redirect map in [contracts/legacy-redirects.md](./contracts/legacy-redirects.md) |

Relationships: a `StorySection` is rendered once, in `order`, inside `app/page.tsx`; each `legacyRoute` (if present) has exactly one corresponding entry in the redirects contract.

## ProfilePicturePlaceholder

Represents the reserved visual slot for the owner's photo shown until a real image is supplied.

| Field | Type | Notes |
|---|---|---|
| `imageSource` | string \| undefined | Existing optional field on the `About` content type (`lib/types/portfolio.ts`); when set, the real photo renders |
| `variant` | `"initials"` \| `"silhouette"` | Which generic placeholder graphic to show when `imageSource` is absent |
| `altText` | string | Accessible label for the placeholder (e.g., `"Profile photo coming soon"`) |

Relationships: belongs to the `about` StorySection (and mirrored in the Hero/introduction area); driven entirely by the existing `about.json` content file — swapping in a real photo requires only setting `imageSource`, no code change.

## LegacyRouteRedirect

Represents one entry in the old-URL → new-anchor mapping declared in `next.config.ts`.

| Field | Type | Notes |
|---|---|---|
| `source` | string | The old standalone page path (e.g., `"/projects"`) |
| `destination` | string | The anchor on the unified story (e.g., `"/#projects"`) |
| `permanent` | boolean | Always `true` (308) — the old URL structure is retired for good, per the FR-009 clarification |

Relationships: one `LegacyRouteRedirect` per `StorySection.legacyRoute`. See [contracts/legacy-redirects.md](./contracts/legacy-redirects.md) for the full, concrete list.
