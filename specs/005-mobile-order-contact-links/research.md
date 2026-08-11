# Phase 0 Research: Mobile reading order, LinkedIn address, CV link

**Feature**: 005-mobile-order-contact-links | **Date**: 2026-08-11

No `NEEDS CLARIFICATION` markers entered this phase — the three open questions were
settled by `/speckit-clarify` (see [spec.md](spec.md) § Clarifications). What follows
is the investigation of the existing code that the plan rests on.

---

## R1: What actually causes the card to come first on mobile?

**Decision**: Delete the four `order-*` utilities from the two grid cells in
`components/Hero/Hero.tsx`. Add no replacement rule.

**Findings**: The opening is a two-cell grid, `lg:grid-cols-[1fr_1fr]`. In the DOM the
text column is written first (`Hero.tsx:37`) and the card second (`Hero.tsx:78`) — which
is already the order FR-001 asks for. The classes invert it:

| Cell | Current classes | Narrow result | `lg` result |
|---|---|---|---|
| Text | `order-2 … lg:order-1` | second | first |
| Card | `order-1 … lg:order-2` | **first** | second |

So the utilities exist only to flip correct markup and then flip it back. Removing them
gives text-then-card when stacked and text-left/card-right when side by side — both
required outcomes — with source order as the single source of truth.

**Why this matters beyond layout**: `order-*` moves boxes visually but not in the
accessibility tree or the tab sequence. Today a phone user *sees* the card first while a
screen reader announces the text first. That is a live WCAG 1.3.2 (Meaningful Sequence)
failure, and FR-004 exists because of it. The deletion closes it as a side effect; any
fix that kept `order-*` would not.

**Alternatives considered**:

- *Reorder the JSX and add `lg:order-*` to restore desktop*: same visual result, but
  re-creates the DOM/visual divergence at `lg` instead of at mobile. Rejected.
- *`flex-col-reverse` on a flex container*: same accessibility problem as `order-*`, and
  would mean rewriting the grid. Rejected.
- *Move the card into a separate JSX branch per breakpoint*: duplicates the card in the
  DOM, doubling the portrait's cost and the `HeroDrift` instances. Rejected.

**Risk**: `min-w-0` sits in the same class strings and must not be removed with them —
a grid item defaults to `min-width:auto`, and the card's fixed side rails would push the
column past the viewport on narrow screens. The existing comment recording this
(`Hero.tsx:34-36`) stays.

---

## R2: Why is the wrong LinkedIn URL the one being served?

**Decision**: Correct `public/data/social.json`; delete `app/data/social.json`.

**Findings**: Two copies of the social content exist and they disagree:

| File | LinkedIn href | Served? |
|---|---|---|
| `public/data/social.json` | `https://linkedin.com/in/prannoy-mulmi` ❌ | **Yes** |
| `app/data/social.json` | `https://www.linkedin.com/in/prannoy-mulmi-0617026b/` ✅ | No |

`ContentProvider` calls `useContentLoader('social.json', SocialFileSchema)`, which
fetches `/data/social.json` — resolved from `public/`. Nothing imports `app/data/` at
all; a repo-wide grep finds references only in prose (ADR 0001 and the feature 004
plan/tasks, both of which already describe the directory as dead and drifted and
explicitly defer cleaning it up).

The correct URL sitting in the unread file is the whole explanation for the bug's
longevity: anyone who checked "is the LinkedIn URL right?" by opening a `social.json`
had a 50% chance of reading the reassuring one.

**Alternatives considered**:

- *Sync both files*: keeps a file that looks authoritative, is never served, and can
  drift again the moment someone edits one and not the other. Rejected in clarification.
- *Delete all of `app/data/`*: correct eventually, but four of the five files are
  unrelated to this feature and feature 004 already scoped that as separable work.
  Rejected as scope creep.

**Consumers verified unaffected**: `SocialIcons.tsx` and `Footer.tsx` both read from
`useContent().social`, i.e. the served copy. Neither changes.

---

## R3: How should an external CV link be modelled and styled?

**Decision**: An optional `cv: { label, href }` object on `home.json`, validated by a
new `CvLinkSchema`, rendered by a new `components/Hero/CvLink.tsx` that takes the object
as a prop and returns `null` when it is absent.

**Rationale**:

- **On `home.json`, not `social.json`** — clarification placed the link in the opening
  section rather than with the profile links. `social.json` feeds `SocialIcons` and the
  footer, which render every entry they are given as a brand glyph; a CV has no glyph
  and would fall through to that component's text fallback in a row of icons. Keeping it
  in `home.json` also means the address travels with the hero content it belongs to.
- **Optional, with a null render** — FR-014. The address is not yet supplied, so the
  field has to be absent-safe on day one. `imageSource` on the same schema already sets
  this precedent (`z.string().optional()`, placeholder when missing).
- **Prop, not `useContent()`** — `Hero` already holds `home.data`; passing `cv` down
  keeps `CvLink` pure, rendering-only, and testable without a provider. Matches
  `PlayerCard`, which takes `card` the same way.
- **`z.string().url()` for the address** — the same validator `SocialSchema.href` uses,
  so a malformed CV address fails at load exactly as a malformed profile link does.

**Styling decision**: `text-on-photo` for colour, small size, underline with offset. The
constitution requires body copy over the backdrop to use that token — the photo's
darkest region measures 0.293 relative luminance, which puts `gray-600`/`gray-700` below
WCAG AA (ADR 0015). Reusing the token means no new colour needs verifying, and no inline
`style` is required, so the ADR 0013 inline-style exception stays unused here.

**External-link handling**: `target="_blank"` with `rel="noopener noreferrer"`, matching
`SocialIcons`. This is what satisfies FR-011 — the portfolio stays open behind the CV,
so a visitor who has scrolled keeps their place. The accessible name states that it
opens in a new tab (FR-012); an external link that steals the tab, or opens one without
warning, is the failure mode this guards against.

**Alternatives considered**:

- *`download` attribute*: does nothing cross-origin — browsers ignore it for
  external documents. Would have been the right call had the CV been self-hosted, which
  clarification ruled out. Rejected.
- *A third `<Link>` styled like the CTAs*: directly contradicts "don't make it a big
  button". Rejected.
- *Hardcoding the URL in the component*: violates FR-013 and ADR 0001 (content is
  content, not markup). Rejected.
- *Fetching the CV or health-checking the address*: explicitly out of scope; the site
  renders a link and makes no promise about the host.

---

## R4: Does anything here need an ADR or a constitution amendment?

**Decision**: One ADR (0017). No amendment.

**Rationale**: Principle VI requires an ADR for decisions that "change how content is
stored, loaded, or validated". Two of the three items qualify:

- deleting `app/data/social.json` collapses the content sources to one, and ADR 0001
  explicitly documents the two-directory situation as it stands;
- routing the CV to an external host is a decision *not* to store an asset the site
  displays, and the reasoning (public git history, privacy of a document carrying a home
  address and phone number) is exactly the kind that must survive someone later
  "simplifying" it by committing the PDF.

The mobile order fix is a bug fix against existing intent and needs no record.

**Precedent**: feature 004 wrote an ADR for retiring a content file, on the stated
grounds that "retiring a content file and its schema is a storage change, not a
tidy-up". The same logic applies here.

**No amendment needed**: Principle IV already names `public/data/` as the content
location, so the deletion moves toward the rule rather than away from it, and no
dependency is added or removed.

---

## Summary of decisions

| ID | Decision | Drives |
|---|---|---|
| R1 | Delete the four `order-*` classes; keep `min-w-0` | FR-001…FR-004 |
| R2 | Correct `public/data/social.json`; delete `app/data/social.json` | FR-005…FR-007 |
| R3 | Optional `cv` on `home.json`; `CvLink` prop component; `text-on-photo`; new tab | FR-008…FR-014 |
| R4 | ADR 0017; no constitution amendment | Principle VI |
