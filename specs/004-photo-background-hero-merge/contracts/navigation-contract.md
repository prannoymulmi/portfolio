# Contract: Navigation bar and backdrop

**Feature**: `004-photo-background-hero-merge`

The UI contracts this feature changes — what a visitor, a screen reader, and a crawler are
entitled to expect.

---

## Chapter list

**Before**: 8 entries — Introduction, About, Skills, Career Journey, Education, Projects,
Technical Playbook, Contact.

**After**: 7 — `About` removed. Every remaining entry must resolve to a section that exists
on the page (SC-004). The rendered list and the sections in `app/page.tsx` are two copies
of the same truth; a test asserts they agree.

---

## Social icons

| Property | Contract |
|----------|----------|
| Source | `social.json`, not hardcoded (FR-008) |
| Placement | Right-hand cluster beside the theme toggle, which is `shrink-0` while the chapter list scrolls |
| Accessible name | Names the destination — "LinkedIn", "GitHub" — never "link" or an unlabelled glyph (FR-009) |
| Target | New tab, `rel="noopener noreferrer"` (FR-009) |
| Size | Visually secondary to chapter links; must not displace them or the toggle down to 320px (FR-010) |
| Unknown network | Readable labelled link, not a blank or a broken glyph (FR-011) |
| Content unavailable | Renders nothing; chapter links, progress bar and toggle keep working (FR-012) |
| Bundle | Only the glyphs actually used are downloaded (FR-008b) |

**Reachability**: one click to either profile from any scroll position, without navigating
to a chapter first (SC-003). The nav is `sticky top-0`, so this follows from placing the
icons in it.

---

## Retired URL

| URL | Before | After |
|-----|--------|-------|
| `/about` | 308 → `/#about` | 308 → `/` |

The current target becomes a dead anchor once the section is gone — the browser silently
stays at the top rather than erroring, which is why this is easy to miss. The other six
legacy redirects are untouched.

---

## Backdrop

| Property | Contract |
|----------|----------|
| Coverage | Behind all 7 chapters, continuous, no seam or restart at any boundary (FR-001, FR-002) |
| Movement | Pinned. Does not move relative to the viewport at any scroll position (FR-007) |
| Light appearance | Photograph at full strength |
| Dark appearance | Photograph present at 18–22% — measured ceiling is ~41% before body text drops below AA (research.md R1) |
| Chapter treatment | Translucent scrim only; no chapter may reintroduce an opaque background (FR-003) |
| Delivery | Through the image optimizer, responsive, modern formats — not a raw CSS `background-image` (research.md R2) |

---

## Foreground drift

| Property | Contract |
|----------|----------|
| Subject | Player card and role bars, within the opening (FR-007a) |
| Reduced motion | Off entirely, with no layout shift — elements sit at their resting positions (FR-007b) |
| Bounds | No overlap with neighbouring content, no element leaves its column, page length unchanged, down to 320px (FR-007c) |

---

## Contrast floor

Applies to every chapter, both appearances (SC-002, FR-005).

| Text role | Requirement | Measured basis |
|-----------|-------------|----------------|
| Body copy, light appearance | `gray-900` or darker | `gray-900` is 5.79:1 against the photograph's darkest region; `gray-700` is 3.37:1 and **fails** |
| Large/display text | ≥ 3:1 | Existing hero bars already clear 7:1 |
| Body copy, dark appearance | ≥ 4.5:1 | Holds while the backdrop stays at or below ~41% opacity |

Verified by hand at the top, middle and bottom of each chapter — contrast against a
photographic backdrop is not meaningfully assertable in jsdom.
