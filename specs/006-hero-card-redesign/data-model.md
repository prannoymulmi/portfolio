# Phase 1 Data Model: Hero card, rebuilt to the collectible reference

The card's data lives in `public/data/home.json` under `card`, is validated by
`PlayerCardSchema` in `lib/utils/validation.ts`, and is typed by `PlayerCard` in
`lib/types/portfolio.ts`. This feature reshapes all three together.

There is no database and no server state. "Entities" here are content shapes.

---

## PlayerCard

The collectible object in the opening.

| Field | Type | Rules | Status |
|---|---|---|---|
| `title` | string | 3–40 chars | kept |
| `positionAbbrev` | string | 2–3 chars, uppercase | **new** |
| `yearsExperience` | integer | 0–60 | kept |
| `location` | string | 3–40 chars | **new** |
| `countries` | `('DE' \| 'NP')[]` | 1–3 entries | kept |
| `achievements` | `Achievement[]` | 3–5 entries | **new** |
| `rating` | number | half steps, 0–5 | **removed** |
| `stats` | `PlayerStat[]` | 1–4 entries | **removed** |
| `softSkills` | `SoftSkill[]` | 1–3 entries | **removed** |
| `blurb` | string | 40–150 chars | **removed** |

**Where each field surfaces**

- `yearsExperience` renders twice, deliberately: as the figure block's numeral and as the
  third row of the meta column. FR-004a makes this the card's most prominent number, and
  the duplication is how the mock relates its rating block to its meta rows.
- `positionAbbrev` is the accent-coloured mark above the job title — `SE` in the mock. It
  is content rather than derived from `title`, because no derivation produces `SE` from
  "Senior Software Engineer" without guessing.
- `location` is display text, not structured geography. The card prints it; nothing
  parses it.
- `countries` continues to drive `Flags.tsx` unchanged.

**Why the four removals**

FR-018a requires removal rather than hiding, so the content file stops carrying values
nothing renders. The cost is named in the spec and must be recorded in the ADR: the
per-area year counts (`stats`) were checkable figures, and `softSkills` was introduced by
ADR 0013 as its bounded answer to the composite rating it rejected. `achievements`
carries evidence of a different kind — specific things done, rather than self-assessment.

---

## Achievement

One row of the honours list. Five rows in the mock.

| Field | Type | Rules |
|---|---|---|
| `text` | string | 10–80 chars |
| `icon` | enum | `trophy \| shield \| code \| cloud \| people \| cert` |
| `emphasis` | boolean | optional, default `false` |

**Rules**

- `text` caps at 80 characters — about two printed lines at the card's width. Longer
  content still renders (US3 scenario 3 requires the row to grow rather than overlap),
  but the cap keeps content from silently reshaping the card.
- `icon` is a closed enum, not a path or a component name. Content names *which* glyph;
  `CardIcons.tsx` owns what it looks like. An open string would let content reference a
  glyph that does not exist.
- `emphasis` marks the single accent-coloured row. **At most one entry may set it** —
  the schema enforces this with a refinement, because two emphasised rows is not a
  layout that exists in the design, and FR-009 says *exactly one*.

---

## Home

Unchanged except that `card` now conforms to the reshaped `PlayerCard`. `imageSource`
keeps its meaning and its optionality — absent still means the placeholder renders.

**Portrait**: if the cut-out is produced (research §5), `imageSource` points at
`/images/hero_pic_cutout.png` and the card renders it as a bleeding figure. If the
fallback applies, it points at `/images/hero_pic.png` and the card renders it framed.
The field's shape does not change either way; only the component's treatment does.

---

## Retired shapes

`PlayerStatSchema` and `SoftSkillSchema` are removed from `lib/utils/validation.ts`
along with the `PlayerStat` and `SoftSkill` types. Nothing else references them —
`SkillBars.tsx` and `StarRating.tsx` are deleted in the same change.

`AwsBadge.tsx` is deleted too: the AWS certification becomes an achievement row with
`icon: "cert"`, which is why the enum carries a value the mock's five rows do not use.

---

## Validation behaviour

Unchanged mechanism (ADR 0003): content is fetched client-side, parsed by Zod, and a
failure surfaces through the existing error path rather than rendering a partial card
(FR-018). The new constraints that can fail a load:

- fewer than 3 or more than 5 achievements
- more than one achievement with `emphasis: true`
- an `icon` value outside the enum
- `positionAbbrev` or `location` missing

Each is a loud failure at load, which is the point — FR-017 exists so content cannot
quietly overflow the card.
