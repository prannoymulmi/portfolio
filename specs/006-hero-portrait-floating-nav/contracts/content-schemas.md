# Contracts: content files and component interfaces

This project exposes no HTTP API. Its contracts are of two kinds:

1. **Content contracts** — the JSON files under `public/data/`, which are edited
   by hand and fetched at runtime. A change here is a breaking change to whoever
   edits content.
2. **Component contracts** — the props of the components this feature adds, which
   are the seam the tests bind to.

---

## 1. Content contracts

### `public/data/home.json`

**Before** (abridged):

```jsonc
{
  "name": "Prannoy Mulmi",
  "intro": "I build scalable cloud systems, and I care about …",
  "bio": "…",
  "imageSource": "/images/hero_pic.png",
  "roles": ["Software Engineer", "Security Advocate", "AI enthusiast"],
  "cv": { "label": "View CV", "href": "https://…" },
  "card": {
    "title": "Senior Software Engineer",
    "yearsExperience": 9,
    "rating": 4.5,
    "countries": ["DE", "NP"],
    "stats": [ { "label": "Backend", "value": 9 }, … ],
    "blurb": "…",
    "softSkills": [ { "label": "Mentoring", "level": 5 }, … ]
  }
}
```

**After**:

```jsonc
{
  "name": "Prannoy Mulmi",
  "intro": "I build secure, scalable cloud systems, and I care about getting the security and the details right.",
  "bio": "…",
  "imageSource": "/images/hero_cutout.png",
  "roles": ["Software Engineer", "Security Advocate", "AI enthusiast"],
  "cv": { "label": "View CV", "href": "https://…" }
}
```

**Breaking**: yes. The `card` key is removed and `HomeSchema` will reject it as
an unknown key only if the schema is made strict — it is not, so a leftover
`card` object would be silently ignored rather than failing. Delete it anyway;
dead content is worse than rejected content because nothing reports it.

### `public/data/social.json`

**Before**:

```jsonc
{
  "social": [
    { "network": "LinkedIn", "href": "https://www.linkedin.com/in/…" },
    { "network": "GitHub",   "href": "https://github.com/prannoymulmi" }
  ]
}
```

**After**:

```jsonc
{
  "social": [
    { "network": "LinkedIn", "href": "https://www.linkedin.com/in/…" },
    { "network": "GitHub",   "href": "https://github.com/prannoymulmi" }
  ],
  "email": "prannoy.mulmi@gmail.com"
}
```

**Breaking**: yes — `email` is required. A `social.json` without it fails
validation, and `SocialIcons` plus `EmailLink` both render nothing. The file and
the schema must change in the same commit.

### Schema deltas

```ts
// lib/utils/validation.ts

// REMOVED entirely
export const PlayerStatSchema = …
export const SoftSkillSchema  = …
export const PlayerCardSchema = …

export const HomeSchema = z.object({
  …
- card: PlayerCardSchema,
  …
});

export const SocialFileSchema = z.object({
  social: z.array(SocialSchema).min(1).max(5),
+ // `.email()`, not `.url()`: `.url()` accepts "mailto:x@y.z" and rejects a
+ // bare address, which is the opposite of what is stored here. The plain
+ // address is stored because the Contact chapter shows it as text; the one
+ // place that needs a URI composes "mailto:" itself.
+ email: z.string().email(),
});
```

---

## 2. Component contracts

### `components/Hero/HeroPortrait.tsx` (new)

```ts
interface HeroPortraitProps {
  /**
   * Address of the cut-out portrait, from `home.imageSource`. Undefined
   * renders nothing at all — the opening falls back to text-only rather
   * than to a placeholder graphic.
   */
  imageSource?: string;
  /** Subject's name, used to build the alt text. */
  name: string;
}
```

**Guarantees the tests bind to**:

- Returns `null` when `imageSource` is undefined.
- Renders exactly one `<img>`, via `next/image`.
- Carries a non-empty `alt` naming the subject — this is a portrait of a person
  and is content, not decoration, so an empty `alt` would be wrong.
- Applies a bottom mask utility and no inline `style`.
- Passes an explicit `sizes`, and does **not** set `preload`.

### `components/Navigation/EmailLink.tsx` (new)

```ts
interface EmailLinkProps {
  /** Plain address, e.g. "prannoy.mulmi@gmail.com". */
  email: string;
}
```

**Guarantees**:

- Renders `<a href="mailto:{email}">`.
- Accessible name identifies it as email, not as a bare glyph (FR-023). The
  visible content is an inline SVG marked `aria-hidden`, so the name must come
  from `aria-label`.
- The glyph is an inline `<svg>`. It must **not** import from `react-icons` —
  ADR 0014 confines that library to brand marks in `SocialIcons.tsx`, and an
  envelope is not a brand mark.
- Focus-visible ring matching the existing controls in the bar.

### `components/Hero/ValueProp.tsx` (modified)

Props unchanged (none). The contract that changes is structural:

- Both links carry a **leading** icon.
- Both links resolve to the same border-box height — the primary gains
  `border-2 border-transparent` to match the secondary's `border-2`.
- The primary retains its trailing arrow, which is a hierarchy signal and not a
  violation of FR-019; FR-019 governs the leading icons.

### `components/Contact/ContactSection.tsx` (modified)

Props unchanged (none). Now consumes `useContent().social` and renders the
address as visible, activatable text. Returns its loading/empty state rather
than throwing when content is unavailable.

### `components/Navigation/StoryProgressNav.tsx` (modified)

Props unchanged (none). Structural contract:

- Outer element is `sticky`, horizontally inset from the viewport edges, with
  fully rounded ends and `overflow-hidden` so the progress hairline is clipped
  to the pill.
- The section list scrolls on the x-axis; the control cluster (`SocialIcons`,
  `EmailLink`, `ThemeToggle`) is `shrink-0` and outside the scrolling element.
- The progress element keeps its existing reduced-motion branch — raw
  `scrollYProgress` instead of the spring.

---

## Contracts explicitly *not* changing

Listed so a reviewer can tell deliberate stability from oversight:

- `useContentLoader` — signature and `{ loading, error, data }` shape.
- `HeroDrift` — props unchanged; only the `strength` value passed to it changes.
- `SocialIcons` — untouched, including its `react-icons` imports.
- `Footer` — untouched, and must stay untouched: it maps only the `social`
  array, which is precisely why the email is a sibling field.
- `STORY_SECTIONS` — the same seven entries (FR-013).
- All other content files and their schemas.
