# Phase 1 Data Model: Annotated Hero & Working Theme Switching

No database. Two entities are persisted content (JSON, Zod-validated), one is browser-persisted state, one is a documentation artifact.

## HeroIntroduction

The editable content behind the hero. Lives in `public/data/home.json`, validated by `HomeSchema` in `lib/utils/validation.ts`.

| Field | Type | Rules | Notes |
|---|---|---|---|
| `name` | string | 1–100 chars, required | Existing field, unchanged — "Prannoy Mulmi" |
| `intro` | string | 20–200 chars, required | **New.** The short introductory statement (FR-001). Replaces the paragraph currently hardcoded in `Hero.tsx`, making it editable (FR-005) |
| `roles` | string[] | 2–5 entries, each 3–40 chars | **Repurposed.** Was 1–3 article-prefixed titles with only `roles[0]` displayed; becomes the annotated phrases, all displayed (FR-017). Length floor drops from 10 → 3 so short phrases like "AI enthusiast" aren't rejected by accident |

**Validation rules**
- `roles` requires ≥2 so the annotation sequence has something to vary across; caps at 5 so the hero stays legible.
- Mark styles are **not** a field here. They are derived positionally from a code-defined sequence (FR-024), so the schema gains no styling enum.

**Relationships**: consumed by `Hero.tsx` via the existing `ContentProvider`. Each entry in `roles` is paired at render time with the mark style at the same index in the code-defined sequence (wrapping if there are more phrases than styles, per FR-025).

**Migration note**: current `roles` values are `["a Senior Software Engineer", "a Cloud Architect", "a Technical Leader"]`. These are replaced by `["Software Engineer", "AI enthusiast", "Security Nerd"]`. The article-prefixed form was only ever used for a single-role sentence; nothing else reads this field.

## AnnotationMarkStyle

Not persisted content — a code-level constant, recorded here because it determines rendering.

| Field | Type | Notes |
|---|---|---|
| `type` | enum: `highlight` \| `circle` \| `underline` \| `box` \| `bracket` | Which hand-drawn mark to draw |
| `color` | per-theme pair | Must resolve to a value legible in both light and dark (FR-006, SC-007) — not a single fixed colour |
| `order` | implicit (array index) | Applied to `roles[i]`; wraps when phrases outnumber styles (FR-025) |

**Relationships**: an ordered sequence of these is defined once in code and zipped against `HeroIntroduction.roles` at render.

## ThemePreference

Browser-persisted, owned by `next-themes`. See [contracts/theme-contract.md](./contracts/theme-contract.md) for the full behavioural contract.

| Field | Type | Notes |
|---|---|---|
| `stored` | `"light"` \| `"dark"` \| absent | Absent means "no explicit choice yet" — follow the OS (FR-014) |
| `resolved` | `"light"` \| `"dark"` | What is actually rendered; equals `stored` when set, otherwise the OS preference |

**State transitions**
- *absent → light/dark*: visitor activates the toggle; choice written to storage and now outranks the OS (FR-013).
- *light ↔ dark*: subsequent toggles; whole page updates immediately (FR-011).
- *OS changes while `stored` is set*: `resolved` does **not** change — the explicit choice wins (spec Edge Cases).
- *OS changes while `stored` is absent*: `resolved` follows it live.

**Applied as**: a `dark` class on the document root, which the Tailwind `dark` variant and the CSS custom properties both key off (see research §3).

## DecisionRecord

Documentation artifact in `docs/adr/`, following the existing Nygard format (FR-018, FR-021).

| Field | Type | Notes |
|---|---|---|
| `id` | 4-digit sequential | Next available: `0009` |
| `title` | string | Short decision statement |
| `status` | `Proposed` \| `Accepted` \| `Superseded` | Per the existing `docs/adr/README.md` convention |
| `date` | date | |
| `context` / `decision` / `consequences` / `alternatives` | prose sections | Consequences split positive/negative (FR-021) |
| `affects` | reference to another record + resulting status | Required when the decision contradicts, narrows, or extends an existing record (FR-020) |

**Planned records**

| ID | Title | Affects |
|---|---|---|
| 0009 | RoughJS (via rough-notation) as a third animation library | **Amends ADR 0005** — raises the two-library ceiling to three with an explicit domain boundary |
| 0010 | next-themes for theme state | None — new ground |
| 0011 | Class-based dark mode over OS media query | **Supersedes** ADR 0006's appearance-switching mechanism; ADR 0006 otherwise stands |

**Relationships**: each is listed in the `docs/adr/README.md` index with its status (FR-018).
