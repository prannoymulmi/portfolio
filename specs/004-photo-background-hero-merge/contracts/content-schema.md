# Contract: Content schema changes

**Feature**: `004-photo-background-hero-merge`

The contract between the JSON files an author edits and the components that consume them.
Breaking it produces a validation error at load, not a silent blank — that is the point of
ADR 0003.

---

## `home.json` — after this feature

```jsonc
{
  "name": "Prannoy Mulmi",
  "intro": "I build scalable cloud systems, and I care about getting the security and the details right.",
  "bio": "Senior software engineer with 9 years building cloud systems, leading teams, and mentoring engineers. Focused on backend architecture, security, and getting the details right.",
  "imageSource": "/images/portrait.jpg",   // optional; omit for the placeholder
  "roles": ["Software Engineer", "AI enthusiast", "Security Nerd"],
  "card": {
    "title": "Senior Software Engineer",
    "yearsExperience": 9,
    "rating": 4.5,
    "countries": ["DE", "NP"],
    "stats": [
      { "label": "Backend", "value": 9 },
      { "label": "Cloud", "value": 6 },
      { "label": "Security", "value": 4 }
    ]
  }
}
```

### Validation contract

| Field | Rule | Failure mode |
|-------|------|--------------|
| `bio` | required, 40–240 characters | Load fails with a path-specific Zod message; the opening shows its error state |
| `imageSource` | optional string | Absent → player card shows the placeholder |

**The `bio` example above is 176 characters** — inside the ceiling, two sentences, and it
says 9 years. It is a starting point for the author, not fixed copy.

### What breaks if you get it wrong

- **Over 240 characters**: validation fails, the whole opening fails to render. Loud, by
  design.
- **Stating a different number of years than `card.yearsExperience`**: nothing fails.
  Validation cannot catch it. This is the one rule that depends on review (FR-015b).

---

## `about.json` — removed

The file, `AboutSchema`, the `About` type, and the `about` entry in `ContentProvider` are
all deleted together. Deleting the file while the loader still runs causes a 404 and a
console error on every page load.

---

## `social.json` — unchanged, newly load-bearing

```jsonc
{
  "social": [
    { "network": "LinkedIn", "href": "https://linkedin.com/in/prannoy-mulmi" },
    { "network": "GitHub", "href": "https://github.com/prannoymulmi" }
  ]
}
```

The schema does not change, but `network` now does more work: it selects which glyph
renders.

| `network` value | Result |
|-----------------|--------|
| `LinkedIn` (any case) | LinkedIn mark |
| `GitHub` (any case) | GitHub mark |
| anything else | Text label fallback, still a working labelled link |

**Deliberately not enforced in the schema.** Restricting `network` to an enum would make
adding a third profile a code change, and the spec's edge cases require an unmatched
network to degrade rather than fail (FR-011). The permissiveness is the contract.
