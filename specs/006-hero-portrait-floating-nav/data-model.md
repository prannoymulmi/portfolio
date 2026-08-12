# Phase 1 Data Model: Portrait hero and floating navigation

The site has no database. "Data model" here means the shape of the JSON content
files in `public/data/`, the TypeScript types in `lib/types/portfolio.ts`, and
the Zod schemas in `lib/utils/validation.ts` that validate the former at runtime.

All three must change together — a field removed from JSON but left in the schema
fails validation at load, and the page renders its error state.

---

## Entity: Opening content (`home.json` → `Home`)

### Fields after this feature

| Field | Type | Constraint | Change |
|---|---|---|---|
| `name` | string | 1–100 | unchanged |
| `intro` | string | 20–200 | **value edited** — see below |
| `bio` | string | 40–240 | unchanged |
| `roles` | string[] | 2–5 items, each 3–40 | unchanged |
| `imageSource` | string? | optional | **repointed** to the cut-out |
| `cv` | CvLink? | optional | unchanged |
| ~~`card`~~ | ~~PlayerCard~~ | — | **REMOVED** |

### The `intro` edit (FR-008)

```diff
- "I build scalable cloud systems, and I care about getting the security and the details right."
+ "I build secure, scalable cloud systems, and I care about getting the security and the details right."
```

One word. Length goes 92 → 100 characters, comfortably inside the existing
20–200 bound, so `HomeSchema` needs no change for this.

### The `imageSource` repoint (FR-003)

```diff
- "imageSource": "/images/hero_pic.png"
+ "imageSource": "/images/hero_portrait.png"
```

`hero_pic.png` stays in the repository as the regeneration source. Nothing
renders it after this change.

The field stays **optional**. Its doc comment currently reads "Portrait for the
player card; falls back to a placeholder when absent" — that must be rewritten,
because the placeholder component is being deleted. New behaviour: absent means
the opening renders text-only and the portrait column collapses.

### Removed sub-entities

`PlayerCard`, `PlayerStat` and `SoftSkill` disappear entirely — types,
schemas, and the `card` object in `home.json`.

| Removed | From |
|---|---|
| `PlayerCard` interface | `lib/types/portfolio.ts` |
| `PlayerStat` interface | `lib/types/portfolio.ts` |
| `SoftSkill` interface | `lib/types/portfolio.ts` |
| `PlayerCardSchema` | `lib/utils/validation.ts` |
| `PlayerStatSchema` | `lib/utils/validation.ts` |
| `SoftSkillSchema` | `lib/utils/validation.ts` |
| `card: PlayerCardSchema` | `HomeSchema` |
| `card: PlayerCard` | `Home` interface |
| the whole `"card": { … }` object | `public/data/home.json` |

**Ordering constraint**: remove the renderer before the schema. If `card` leaves
`home.json` while `HomeSchema` still requires it, every load fails validation and
the opening renders its error state — including on the commit in between. Hence
commit 5 (portrait renders) before 6 (card deleted) before 7 (schema trimmed).

---

## Entity: Social content (`social.json` → `SocialFile`)

### Fields after this feature

| Field | Type | Constraint | Change |
|---|---|---|---|
| `social` | Social[] | 1–5 items | unchanged |
| `email` | string | valid email address | **ADDED** |

```diff
  {
    "social": [
      { "network": "LinkedIn", "href": "https://www.linkedin.com/in/…" },
      { "network": "GitHub",   "href": "https://github.com/prannoymulmi" }
-   ]
+   ],
+   "email": "prannoy.mulmi@gmail.com"
  }
```

### Why a sibling field and not an array member

`Footer.tsx` maps every member of `social`, so an entry there would surface the
address in the footer — which was explicitly declined (FR-022a). A sibling field
is invisible to that map, so the constraint is satisfied by structure rather than
by filtering logic.

### Why the plain address, not a `mailto:` URI

FR-024 requires the Contact chapter to show the address as readable text.
Storing `mailto:prannoy.mulmi@gmail.com` would force every display site to strip
the scheme back off. Storing the plain address means the one place that needs a
URI composes it.

This also fixes the validator choice. Confirmed against the installed zod
3.25.76: `z.string().url()` **accepts** `mailto:…` and **rejects** a bare
address, so the existing `SocialSchema.href` validator is the wrong one here.

```ts
// SocialFileSchema gains:
email: z.string().email(),
```

### Required or optional?

**Required.** Unlike `cv` and `imageSource`, which are optional because an absent
value is a legitimate state, FR-023 and FR-024 both mandate the address. Making
it optional would let a content edit silently empty the Contact chapter and drop
a nav control, and nothing would fail.

Consequence: `social.json` must gain the field in the same commit the schema
requires it, or content validation fails. Commit 1 does both.

---

## Derived, not stored

Neither of these is a content field, and neither should become one:

| Value | Where it comes from |
|---|---|
| `mailto:` URI | Composed at render from `email` |
| Section list in the nav | The `STORY_SECTIONS` constant in `StoryProgressNav.tsx`, which must stay in step with the `id`s in `app/page.tsx` |

`STORY_SECTIONS` already exists as a hardcoded array and FR-013 keeps its
current seven entries, so it is untouched by this feature. It is listed here only
because FR-013 forbids introducing a link to a section that does not exist —
which is a coupling to `app/page.tsx` that no schema enforces.

---

## Validation-failure behaviour

Unchanged, and worth restating because this feature edits two content files:
`useContentLoader` validates each file against its schema and exposes
`{ loading, error, data }`. On failure the consuming component renders its error
or null state.

The spec's edge case requires the navigation to keep working when content fails,
which the current design already satisfies — `StoryProgressNav` renders its
section links and progress bar from a constant, not from content. Only
`SocialIcons` and the new `EmailLink` depend on `social.json`, and both must
return `null` rather than throw when it is unavailable, exactly as `SocialIcons`
does today.
