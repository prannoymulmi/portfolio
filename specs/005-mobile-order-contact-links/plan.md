# Implementation Plan: Mobile reading order, corrected LinkedIn link, and a CV link

**Branch**: `005-mobile-order-contact-links` | **Date**: 2026-08-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-mobile-order-contact-links/spec.md`

## Summary

Three unrelated repairs to the opening section and the site's outbound links, sharing
no code between them and shipping as separate commits.

1. **Mobile reading order (FR-001…FR-004)** — the opening's two grid cells carry
   `order-*` utilities that put the player card first on narrow screens and only flip
   at `lg`. The DOM already has the text first, so the classes are inverting correct
   markup. **Deleting the four `order-*` classes is the entire fix**: source order
   becomes visual order at every width, which also closes an accessibility defect
   (announced order currently contradicts what a phone user sees).

2. **LinkedIn address (FR-005…FR-007)** — correct the href in `public/data/social.json`
   and delete the unserved `app/data/social.json`, which has drifted and, ironically,
   holds the correct URL. That divergence is why the wrong link went unnoticed.

3. **CV link (FR-008…FR-014)** — a new optional `cv: { label, href }` object on
   `home.json`, validated by Zod, rendered by a small `CvLink` component directly
   under the two CTAs. The document is hosted externally; the site stores only the
   address and never serves a copy.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode

**Primary Dependencies**: Next.js 16.3 (App Router), React 19, Tailwind CSS v4, Zod,
framer-motion. No new dependency is added by this feature.

**Storage**: Static JSON in `public/data/`, fetched client-side through
`ContentProvider` → `useContentLoader`, validated against Zod schemas before use
(ADR 0001, ADR 0003). This feature adds one optional field and deletes one dead file.

**Testing**: Jest + React Testing Library. Unit tests under `tests/unit/`, integration
under `tests/integration/`.

**Target Platform**: Static site on Vercel; evergreen desktop and mobile browsers.

**Project Type**: Single-page scrolling web application.

**Performance Goals**: Lighthouse ≥ 90 on production builds (constitution). This
feature adds no runtime fetches, no images, and no JS beyond one small component.

**Constraints**: Text over the backdrop photograph must use the `text-on-photo` token —
the photo's darkest region measures 0.293 relative luminance, so `gray-600`/`gray-700`
fall below WCAG AA against it (ADR 0015). Tailwind utilities only; inline `style` is
permitted solely for values exported by a shared token module.

**Scale/Scope**: 3 components touched, 1 component added, 1 schema extended, 1 content
file corrected, 1 dead file deleted, 1 ADR. No unresolved NEEDS CLARIFICATION.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Assessment | Verdict |
|---|---|---|
| **I. KISS & Maintainability** | The mobile fix is a deletion of four utility classes, not an added breakpoint rule. `CvLink` is a presentational component taking one prop. | ✅ Pass |
| **II. Test-First** | Every story gets tests alongside: reading order and DOM/visual agreement (US1), link targets and absence of the duplicate file (US2), link presence/attributes/absent-state (US3). | ✅ Pass |
| **III. Atomic Commits** | Four commits, one per concern, none exceeding five files. See Commit Plan below. | ✅ Pass |
| **IV. Technology Stack** | No new dependency. Content stays JSON in `public/data/` behind a Zod schema. Styling is Tailwind utilities plus the existing `text-on-photo` token — no inline `style` needed, so the ADR 0013 exception is not invoked. | ✅ Pass |
| **V. Token Efficiency** | N/A to the artifact. | ✅ Pass |
| **VI. Recorded Decisions (ADRs)** | Deleting `app/data/social.json` changes how content is stored, and routing the CV to an external host is a storage decision too. Both need a record — **ADR 0017**. Precedent: feature 004 wrote an ADR for retiring a content file on exactly this reasoning. | ⚠️ Requires ADR 0017 |
| **Constraints: contrast over photo** | `CvLink` uses `text-on-photo`, the token already verified AA against the backdrop. | ✅ Pass |
| **Constraints: accessibility** | External link carries `rel="noopener noreferrer"` and a label stating it opens a new tab (FR-012). | ✅ Pass |
| **Constraints: reduced motion** | Untouched — `HeroDrift` already collapses to zero travel and keeps normal flow position. | ✅ Pass |

**No constitution amendment required.** Principle IV already names `public/data/` as the
content location; deleting the dead `app/data/` copy moves toward that rule rather than
away from it. No package is added or removed.

**Gate result: PASS**, conditional on ADR 0017 landing in the same PR as the change it
justifies.

## Project Structure

### Documentation (this feature)

```text
specs/005-mobile-order-contact-links/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── content-schema.md
├── checklists/
│   └── requirements.md  # From /speckit-specify, revalidated by /speckit-clarify
├── spec.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
components/
├── Hero/
│   ├── Hero.tsx              # MODIFY — drop order-* classes; render <CvLink>
│   ├── ValueProp.tsx         # UNTOUCHED — the two CTAs are out of scope
│   └── CvLink.tsx            # NEW — small external text link
└── Navigation/
    ├── SocialIcons.tsx       # UNTOUCHED — reads the corrected content
    └── Footer.tsx            # UNTOUCHED — reads the corrected content

lib/
├── types/portfolio.ts        # MODIFY — CvLink interface, optional `cv` on Home
└── utils/validation.ts       # MODIFY — CvLinkSchema, optional `cv` on HomeSchema

public/data/
├── home.json                 # MODIFY — add `cv`
└── social.json               # MODIFY — correct the LinkedIn href

app/data/
└── social.json               # DELETE — unserved duplicate (FR-007)

docs/adr/
├── 0017-content-lives-in-one-place-and-the-cv-lives-elsewhere.md  # NEW
└── README.md                 # MODIFY — index row for 0017

tests/
├── unit/
│   ├── components/Hero.test.tsx      # MODIFY — reading order, CV link
│   ├── components/CvLink.test.tsx    # NEW
│   └── validation.test.ts            # MODIFY — cv schema bounds
└── integration/
    └── content-sources.test.ts       # NEW — one social.json, correct address
```

**Structure Decision**: The existing Next.js App Router layout is unchanged. All work
lands in `components/Hero/`, `lib/`, `public/data/`, and `tests/` — the same places the
hero's previous features used. No new directory is introduced.

## Design Notes

### US1 — why deletion, not a new rule

`components/Hero/Hero.tsx:37` and `:78` read:

```
order-2 min-w-0 lg:order-1   (text column)
order-1 min-w-0 lg:order-2   (card column)
```

The text column is already first in the DOM. Removing all four classes yields the
required behaviour at both sizes with no replacement rule, and makes DOM order the
single source of truth — which is what FR-004 asks for. Adding `lg:order-*` back, or
reordering the JSX and re-inverting, would both be more code for the same result.

`min-w-0` stays on both cells: a grid item defaults to `min-width:auto`, and the card's
fixed side rails would otherwise push the column past the viewport on narrow screens.
The existing comment saying so must survive the edit.

**Parallax check (spec Edge Cases):** the two cells drift at strengths 24 and 56, capped
at `MAX_DRIFT = 80`, transform-only, with normal flow position preserved. Stacking the
card below the text does not introduce overlap — the cells are grid tracks with a
`gap-12`, and 56px of transform cannot close a 48px gap plus the card's own height.
Worth an assertion that the section still renders both cells, not a new mechanism.

### US3 — where the link lives and why it is its own component

`ValueProp` is the two-button row and is explicitly out of scope for restyling. `CvLink`
therefore renders as its sibling inside the same `mt-8` wrapper in `Hero.tsx`, directly
below the buttons (FR-008).

`CvLink` takes the `cv` object as a prop rather than calling `useContent()` itself: the
hero already holds `home.data`, and a prop keeps the component pure and trivially
testable in isolation. Returning `null` for an absent `cv` satisfies FR-014.

### Commit plan (Principle III)

| # | Type & scope | Contents | Files |
|---|---|---|---|
| 1 | `fix(hero)` | Drop the `order-*` inversion; reading order follows the DOM at every width | 2 |
| 2 | `fix(content)` | Correct the LinkedIn address | 2 |
| 3 | `refactor(content)` | Delete the unserved `app/data/social.json` duplicate | 2 |
| 4 | `feat(hero)` | `cv` schema, content, `CvLink`, wiring, tests | 6 |
| 5 | `docs(adr)` | ADR 0017 + index row | 2 |

Commits 2 and 3 are separable but both concern the same bug; they stay apart because
one is a content correction and the other is a deletion with its own justification.
Commit 4 touches six files, one over the five-file guidance — it is a single unit of
work (a new content field cannot ship without its schema, its type, its renderer and
its tests), which the constitution admits explicitly.

## Constitution Re-check (post-design)

Re-evaluated after Phase 1. Design introduced no new gate pressure:

- **No new dependency** — `CvLink` is a plain anchor; no icon, no library.
- **No inline `style`** — the link's colour comes from the existing `text-on-photo`
  utility, so the ADR 0013 exception stays unused and Principle IV's styling rule holds
  without exception.
- **No new dark-mode selector** — `text-on-photo` resolves through the `--on-photo`
  custom property, which the theme already switches; no hand-written `.dark` rule.
- **No new motion path** — `HeroDrift` is untouched, so the `prefers-reduced-motion`
  handling stays in the one helper that owns it.
- **One design decision moved into the ADR** rather than into code comments alone: why
  the CV is not committed to `public/`. That reasoning must survive a future reader who
  would otherwise "simplify" it by self-hosting the PDF.

**Gate result after design: PASS.** The single obligation carried forward is ADR 0017,
landing in the same PR.

## Complexity Tracking

> No constitution violations requiring justification. ADR 0017 is a requirement the
> constitution imposes, not a violation of it, and is tracked in the Constitution Check
> table above.
