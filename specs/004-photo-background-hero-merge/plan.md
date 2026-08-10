# Implementation Plan: One photo backdrop, a shorter opening, social links in the nav

**Branch**: `004-photo-background-hero-merge` | **Date**: 2026-08-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-photo-background-hero-merge/spec.md`

## Summary

Three changes to the single-page story: the sunset photograph becomes the backdrop for all
of it instead of just the opening, the About chapter folds into the opening as a two-
sentence biography, and LinkedIn/GitHub icons move into the persistent nav bar.

The approach is set by two measurements taken in Phase 0. First, the photograph has **no
dark regions** (minimum luminance 0.293), so dark text passes AA over it unscrimmed while
light text in dark appearance is the real constraint — the backdrop must be held at 18–22%
opacity there. Second, the photograph is a **5600×3550, 1.73 MB** file served raw through
CSS, bypassing the image optimizer entirely; routing it through the framework's image
component is what keeps SC-007 (Lighthouse ≥ 90) reachable while putting it on every
screen.

The feature also carries governance work: it adds a dependency, so it must ship an ADR and
a constitution amendment in the same change (FR-020).

## Technical Context

**Language/Version**: TypeScript 5, strict mode; React 19.2.8

**Primary Dependencies**: Next.js 16.3.0 (App Router), Tailwind CSS v4, Framer Motion 11,
GSAP 3.12, rough-notation 0.5.1, next-themes 0.4.6, Zod 3
**New**: `@icons-pack/react-simple-icons` 13.13.0 (see research.md R3)

**Storage**: JSON content files in `public/data/`, fetched client-side and Zod-validated

**Testing**: Jest 29 + Testing Library, jsdom environment

**Target Platform**: Modern evergreen browsers; iOS Safari explicitly in scope for the
pinned backdrop (research.md R2)

**Project Type**: Single-page web application

**Performance Goals**: Lighthouse performance ≥ 90, accessibility 100 (SC-007). Backdrop
delivered under ~200 KB on a typical viewport, down from 1.73 MB today

**Constraints**: WCAG AA throughout, both appearances (SC-002); reduced-motion honoured
with no layout shift (FR-007b); usable to 320px (FR-007c, FR-010)

**Scale/Scope**: 7 chapters after the change (from 8); 9 content files (from 10); ~14
source files touched, 3 deleted

## Constitution Check

*GATE: checked before Phase 0, re-checked after Phase 1.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. KISS & Maintainability | **Pass** | Reuses the existing fixed-layer pattern, the existing `HeroParallax`, and the existing content loader. No new abstractions. |
| II. Test-First | **Pass** | Every story has named tests below; the About-removal story deletes tests with their subject and adds nav/social coverage. |
| III. Atomic Commits | **Pass** | Commit plan below; no commit exceeds 5 files except the chapter-scrim pass, which is one mechanical change across `app/page.tsx`. |
| IV. Technology Stack | **VIOLATION — justified** | Adds `@icons-pack/react-simple-icons`. See Complexity Tracking. Requires ADR + amendment in this change. |
| V. Token Efficiency | **Pass** | n/a to runtime; research reused measurements rather than re-deriving. |
| VI. Recorded Decisions | **Pass** | Two ADRs planned (below). Both land with the code, not after. |

**Post-Phase-1 re-check**: unchanged. The design added no further dependencies, and the
drift stays inside ADR 0005's existing Framer domain (research.md R4), so Principle IV is
touched exactly once — for the icon package.

### Decision records this feature must produce

- **ADR 0014 — icon set as a dependency**: records `@icons-pack/react-simple-icons`, the
  rejected alternatives (lucide carries no brand marks; react-icons is 88 MB for two
  glyphs; hand-committed paths were declined), and the trademark/nominative-use note.
  Paired with a **constitution amendment to 1.2.0** adding the icon set to Principle IV.
- **ADR 0015 — the photograph is the page surface**: records the backdrop decision, the
  measured luminance floor that makes it legible, the opacity ceiling in dark appearance,
  the move to an optimized image, and the retirement of the About chapter and its content
  file. This is ADR-worthy under Principle VI on two counts: it changes how content is
  stored, and it commits the design.

## Project Structure

### Documentation (this feature)

```text
specs/004-photo-background-hero-merge/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── content-schema.md
│   └── navigation-contract.md
└── tasks.md             # Created by /speckit-tasks, not here
```

### Source Code (repository root)

```text
app/
├── layout.tsx                       # MODIFY  backdrop layer: SVG accent → optimized photo
├── page.tsx                         # MODIFY  drop About section; scrims on 7 chapters
└── data/                            # (dead duplicate — see Notes)

components/
├── About/                           # DELETE  whole directory
│   ├── AboutSection.tsx             # DELETE
│   └── SocialLinks.tsx              # DELETE  (replaced by nav icons)
├── Common/
│   ├── ContentProvider.tsx          # MODIFY  drop the about loader
│   ├── LoadingState.tsx             # MODIFY  drop AboutSkeleton
│   └── Backdrop.tsx                 # NEW     pinned, optimized photo layer
├── Hero/
│   ├── Hero.tsx                     # MODIFY  render the short bio
│   ├── HeroParallax.tsx             # MODIFY  backdrop layer out, foreground drift in
│   └── PlayerCard.tsx               # MODIFY  read imageSource from home content
└── Navigation/
    ├── StoryProgressNav.tsx         # MODIFY  drop About entry; mount social icons
    └── SocialIcons.tsx              # NEW     LinkedIn/GitHub marks from content

lib/
├── types/portfolio.ts               # MODIFY  About type out; Home gains bio + imageSource
└── utils/validation.ts              # MODIFY  AboutSchema out; HomeSchema extended

public/
├── data/about.json                  # DELETE  content merged into home.json
├── data/home.json                   # MODIFY  gains bio + imageSource
└── images/background.svg            # DELETE  557 KB, superseded by the photo

next.config.ts                       # MODIFY  /about redirect target
tests/                               # MODIFY  see Testing Strategy
```

**Structure Decision**: no new top-level directories. The feature fits the existing
`app/` + `components/<Chapter>/` + `lib/` layout, adding two components (`Backdrop`,
`SocialIcons`) and removing one chapter directory.

## Implementation Approach

### Story 1 — one backdrop (P1)

1. **`components/Common/Backdrop.tsx`** (new): the pinned layer. Keeps the existing
   `fixed inset-0 -z-10` element (not `background-attachment: fixed`, per research.md R2)
   but renders the photograph through the image component with `fill`, `priority`, and
   `sizes="100vw"` so it is optimized and responsive. Opacity is full in light appearance
   and **18–22%** in dark, which is the measured ceiling for AA (research.md R1).
2. **`app/layout.tsx`**: swap the `background.svg` div for `<Backdrop />`; delete the SVG.
3. **`app/page.tsx`**: replace all 7 `bg-gradient-to-br …` chapter backgrounds with a
   single shared translucent scrim class — white at 35–45% in light, near-black at a
   matching value in dark. This is one mechanical substitution repeated 7 times.
4. **Body text audit**: every `text-gray-700` / `text-gray-600` used for body copy over the
   backdrop moves to `text-gray-900`. Measured: `gray-700` is 3.37:1 against the
   photograph's darkest region and fails AA; `gray-900` is 5.79:1 and passes.

### Story 2 — social icons in the nav (P2)

1. `npm install @icons-pack/react-simple-icons --legacy-peer-deps` (the flag is required
   for the pre-existing reason in ADR 0007, not for this package).
2. **`components/Navigation/SocialIcons.tsx`** (new): maps social content entries to
   `SiLinkedin` / `SiGithub` by network name, with a labelled text fallback for any
   network without a match (FR-011). Each link gets `target="_blank"`,
   `rel="noopener noreferrer"`, and an `aria-label` naming the destination (FR-009).
3. **`StoryProgressNav.tsx`**: mount it beside the theme toggle in the right-hand cluster,
   which is already `shrink-0` while the chapter list scrolls — so the icons cannot push
   the chapter links out of reach at 320px (FR-010).
4. Renders nothing (not an error) when social content is absent, so the nav survives a
   failed content load (FR-012).

### Story 3 — About folds into the opening (P3)

**Must not merge before Story 2** — the About chapter is the only home the social links
currently have.

1. **Content**: `home.json` gains `bio` and `imageSource`; `about.json` is deleted.
   `HomeSchema` gains `bio: z.string().min(40).max(240)` (≈2 sentences, ≤40 words per
   FR-014) and `imageSource: z.string().optional()`. `AboutSchema` and the `About` type go.
   The new bio text must say **9 years**, not the "10+ years" the old copy claimed
   (FR-015b).
2. **`Hero.tsx`**: render `bio` under the intro line. **`PlayerCard.tsx`**: read
   `imageSource` from home content instead of about content.
3. **Removal**: delete `components/About/`, the About section from `app/page.tsx`, the
   `about` entry from `ContentProvider` and `StoryProgressNav`, and `AboutSkeleton` from
   `LoadingState.tsx`.
4. **`next.config.ts`**: retarget `/about` from `/#about` (a now-dead anchor) to `/`
   (FR-017).

### Story 4 — governance (ships with Story 2)

ADR 0014 + constitution amendment to 1.2.0, and ADR 0015 for the backdrop. Per the
Governance section of the constitution these are not follow-ups — the dependency cannot
land without them.

## Testing Strategy

Constitution Principle II requires tests alongside each story.

| Story | Tests |
|-------|-------|
| 1 | Backdrop renders once and is present for every chapter; opacity differs by appearance; no chapter carries an opaque background. Contrast is verified manually against the measured floors in research.md — it is not meaningfully assertable in jsdom. |
| 2 | Both icons render from content; each has an accessible name and opens in a new tab; unknown network falls back to a readable label; nav still renders chapter links when social content fails. Extends `tests/unit/components/StoryProgressNav.test.tsx`. |
| 3 | `home.json` validates with `bio` and rejects one over 240 chars; hero renders the bio; the page has no About section and the nav lists 7 chapters. |
| 4 | `tests/integration/legacy-redirects.test.ts` asserts `/about → /`, replacing the current `/about → /#about` expectation. |

**Tests to delete with their subject**: `AboutSection.test.tsx`,
`AboutSection.withPhoto.test.tsx`, `SocialLinks.test.tsx`, and the `AboutSection` case in
`tests/integration/error-handling.test.tsx`. `tests/integration/story-page.test.tsx` and
`StoryProgressNav.test.tsx` both assert `about` is present and must be updated, not deleted.

## Commit Plan

Per Principle III and the ≤5-file rule:

1. `feat(backdrop)` — `Backdrop.tsx`, `layout.tsx`, delete `background.svg` (3 files)
2. `feat(story)` — chapter scrims + body-text darkening in `app/page.tsx` (1 file)
3. `feat(hero)` — foreground drift in `HeroParallax.tsx` (+ test) (2 files)
4. `docs(adr)` + `docs(constitution)` — ADR 0014, ADR 0015, amendment, index (4 files)
5. `feat(nav)` — icon dependency, `SocialIcons.tsx`, `StoryProgressNav.tsx`, tests,
   `package.json`/lock (5 files)
6. `feat(content)` — schema, types, `home.json`, delete `about.json`, provider (5 files)
7. `refactor(about)` — delete the chapter, its tests, nav entry, redirect (5–6 files;
   deletions of one subject, so a single unit)

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| New dependency `@icons-pack/react-simple-icons`, against Principle IV's fixed stack | The user explicitly chose the dependency route over hand-committed SVG paths during clarification, knowing the governance cost | Hand-committed paths (~15 lines each, no dependency, no amendment) were offered as the recommendation and declined. Recorded here so the ADR argues the choice on its merits rather than treating it as inevitable. |

## Notes

- **`app/data/` remains dead.** Four of its five JSON files have drifted from
  `public/data/`, and nothing reads any of them. This feature deletes `public/data/about.json`
  but should **not** be the change that cleans up `app/data/` — that is separable and was
  already flagged as its own follow-up.
- **`AboutSchema.about` is `min(100)`**, so the old content cannot simply be shortened in
  place; the new `bio` field carries its own, shorter bounds.
