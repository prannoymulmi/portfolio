# Phase 1 Data Model: Mobile reading order, LinkedIn address, CV link

**Feature**: 005-mobile-order-contact-links | **Date**: 2026-08-11

Content is static JSON in `public/data/`, fetched client-side and validated against Zod
before use (ADR 0001, ADR 0003). This feature adds one optional object, corrects one
value, and removes one file. No storage mechanism changes.

---

## Entity: CvLink (new)

The address of the owner's externally hosted CV. **Not** the document — the site never
holds a copy (FR-010).

| Field | Type | Required | Constraint | Why |
|---|---|---|---|---|
| `label` | string | yes | 2–40 chars | The visible link text. Lower bound rejects an empty or one-character link, which would be an invisible click target. Upper bound keeps it a link rather than a sentence — FR-009 requires it stay visually subordinate to the CTAs. |
| `href` | string | yes | valid URL | Same validator `SocialSchema.href` already uses. A malformed CV address must fail at load, exactly as a malformed profile link does. |

**Lifecycle**: optional at the parent. Absent → the opening section renders no CV link
at all (FR-014). This is the state the feature ships in until the address is supplied,
so it is a first-class case, not an error.

**Location**: nested under `home.json`, not `social.json`. It is hero content that
happens to point outward, not a social profile — see [research.md](research.md) § R3.

---

## Entity: Home (modified)

`public/data/home.json`, validated by `HomeSchema`.

| Change | Field | Type |
|---|---|---|
| **Added** | `cv` | `CvLink` (optional) |

All existing fields (`name`, `intro`, `bio`, `roles`, `imageSource`, `card`) are
unchanged. `cv` follows the precedent set by `imageSource`: optional, with a defined
render for its absence.

```jsonc
{
  "name": "Prannoy Mulmi",
  // …existing fields…
  "cv": {
    "label": "Download CV",
    "href": "https://example.com/prannoy-mulmi-cv.pdf"
  }
}
```

> The `href` above is a placeholder. The real address is a Dependency the owner supplies;
> until then the `cv` key is omitted entirely rather than pointed at a guess.

---

## Entity: Social (unchanged shape, corrected value)

`public/data/social.json`, validated by `SocialFileSchema`. Neither the schema nor the
TypeScript interface changes — only the stored value and the number of files holding it.

| Network | Before | After |
|---|---|---|
| LinkedIn | `https://linkedin.com/in/prannoy-mulmi` | `https://www.linkedin.com/in/prannoy-mulmi-0617026b/` |
| GitHub | `https://github.com/prannoymulmi` | unchanged |

**Uniqueness rule (FR-006, FR-007)**: exactly one file in the repository may define
social link addresses, and it is `public/data/social.json`. `app/data/social.json` is
deleted. This is a constraint on the repository, not on the runtime — it is enforced by
a test asserting no second `social.json` exists outside `public/data/`, because nothing
in the type system can express it.

---

## Deleted: `app/data/social.json`

| Property | Value |
|---|---|
| Served | No — `useContentLoader` fetches `/data/*.json`, resolved from `public/` |
| Imported | No — repo-wide grep finds references only in prose (ADR 0001, feature 004 plan/tasks) |
| Drifted | Yes — held the **correct** LinkedIn address the served copy lacked |
| Consumers to update | None |

The remaining four files under `app/data/` are equally dead but out of scope; feature
004 scoped their removal as separable work and that stands.

---

## Validation rules (Zod, `lib/utils/validation.ts`)

```ts
export const CvLinkSchema = z.object({
  label: z.string().min(2).max(40),
  href: z.string().url(),
});

// on HomeSchema:
//   cv: CvLinkSchema.optional(),
```

**Failure behaviour** is the existing one and is not modified: `useContentLoader`
surfaces a validation error, and `Hero` returns `null` on `home.error`. A malformed `cv`
therefore costs the whole opening section, not just the link — which is the correct
trade for a content file that is edited by hand and validated at load.

---

## TypeScript types (`lib/types/portfolio.ts`)

```ts
export interface CvLink {
  label: string;
  /** External address. The site links to the CV; it never hosts it (FR-010). */
  href: string;
}

export interface Home {
  // …existing fields…
  /** Absent means the opening section renders no CV link (FR-014). */
  cv?: CvLink;
}
```

---

## No state transitions

Nothing in this feature holds mutable state. `cv` is either present in content or not;
the social addresses are static values. The only "transition" is a content edit, which
takes effect on the next load.
