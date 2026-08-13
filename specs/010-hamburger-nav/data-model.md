# Phase 1 Data Model: Minimal Nav with Hamburger Sections

This feature relocates presentation only; it introduces no persisted data and
no schema change. The one entity from the spec is already fully modeled in
code today.

## Section link

Represents one entry in the site's fixed chapter list.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Anchor target (`#<id>`); matches an existing page section's element id. |
| `label` | `string` | Display text shown in the menu. |

**Source**: `STORY_SECTIONS` in `components/Navigation/StoryProgressNav.tsx` —
a static, ordered array of seven entries (Introduction, Selected Work, Career
Journey, Education, Projects, Technical Playbook, Contact). This feature does
not add, remove, reorder, or restructure entries — `HamburgerMenu` receives the
same array as a prop and renders it inside the menu panel instead of inline.

**Validation rules**: None beyond what already holds — `id` must correspond to
an anchor present on the page; enforced by existing content, not by this
feature.

**State transitions**: One new piece of UI state, local to the new component,
not persisted:

| State | Values | Trigger |
|---|---|---|
| Menu open/closed | `boolean` | Opens: toggle click/Enter/Space. Closes: toggle re-activation, Escape key, outside click, viewport breakpoint change (edge case), or selecting a link. |

No other entities are introduced.
