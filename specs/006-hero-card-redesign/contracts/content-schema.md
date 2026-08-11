# Content Contract: `home.json` → `card`

The interface this feature exposes is the content file. Everything printed on the card
comes through here (FR-016); nothing is hardcoded in markup.

Consumers: `components/Hero/PlayerCard.tsx` and its region components, via
`ContentProvider` → `useContentLoader('home.json', HomeSchema)`.

---

## Shape after this feature

```jsonc
{
  "name": "Prannoy Mulmi",
  "intro": "…",
  "bio": "…",
  "imageSource": "/images/hero_pic_cutout.png",
  "roles": ["Software Engineer", "Security Advocate", "AI enthusiast"],
  "cv": { "label": "View CV", "href": "https://…" },

  "card": {
    "title": "Senior Software Engineer",
    "positionAbbrev": "SE",
    "yearsExperience": 9,
    "location": "Hamburg, Germany",
    "countries": ["DE", "NP"],
    "achievements": [
      { "icon": "trophy", "text": "Built production cloud platforms used by thousands of users" },
      { "icon": "shield", "text": "Designed secure identity systems (OIDC, OAuth 2.0)" },
      { "icon": "code",   "text": "Built AI integrations using MCP", "emphasis": true },
      { "icon": "cloud",  "text": "Architected and scaled systems on AWS" },
      { "icon": "people", "text": "Led and mentored engineering teams to deliver impact" }
    ]
  }
}
```

The five achievement lines above are the mock's own copy and are the intended starting
content. They are content, so they are editable without code — that is the whole point
of US3.

---

## Field rules

| Path | Type | Constraint | Failure mode |
|---|---|---|---|
| `card.title` | string | 3–40 | load fails |
| `card.positionAbbrev` | string | 2–3 chars, `/^[A-Z]{2,3}$/` | load fails |
| `card.yearsExperience` | int | 0–60 | load fails |
| `card.location` | string | 3–40 | load fails |
| `card.countries` | enum array | 1–3 of `DE`, `NP` | load fails |
| `card.achievements` | array | 3–5 entries | load fails |
| `card.achievements[].text` | string | 10–80 | load fails |
| `card.achievements[].icon` | enum | one of `trophy`, `shield`, `code`, `cloud`, `people`, `cert` | load fails |
| `card.achievements[].emphasis` | boolean | optional; **at most one `true` across the array** | load fails |

`positionAbbrev` is constrained to uppercase letters rather than merely to length,
because it is set in display type in the accent colour — a lowercase or punctuated value
would not render as the mark the design expects, and silently restyling content is worse
than rejecting it.

---

## Removed fields

`card.rating`, `card.stats`, `card.softSkills`, `card.blurb` are removed from the schema
and **must be deleted from `home.json` in the same change**. Zod objects reject unknown
keys by default in this codebase's usage, so leaving them behind fails the load — which
is the intended behaviour, not a hazard: it guarantees the content file and the card
cannot drift apart.

---

## Compatibility

**Breaking.** A `home.json` written for the previous card fails validation against this
schema, and a `home.json` written for this one fails against the previous. There is no
migration path and none is needed — the file ships in the repository and changes in the
same commit as the schema.

This is the one place where the constitution's atomic-commit rule and its
one-change-per-commit preference pull apart: schema, types, content file and components
must move together or the build breaks. That combined change is a single unit of work by
nature, which is the exemption Principle III already allows.

---

## Contract tests

Named here so `/speckit-tasks` can turn them into work items. These belong in
`tests/unit/validation.test.ts` alongside the existing schema tests:

1. A valid card with five achievements parses.
2. A valid card with three achievements parses (lower bound).
3. Six achievements fail.
4. Two achievements fail (below the lower bound).
5. Two entries with `emphasis: true` fail.
6. An unknown `icon` value fails.
7. A lowercase `positionAbbrev` fails.
8. A card still carrying `rating`/`stats`/`softSkills`/`blurb` fails.
9. `achievements[].text` at 81 characters fails; at 80 it parses.
