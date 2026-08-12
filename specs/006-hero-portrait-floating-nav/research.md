# Phase 0 Research: Portrait hero and floating navigation

Every finding below was checked against the installed toolchain or the actual
source, not recalled. Where something is derived by reading class lists rather
than measured in a browser, it says so.

---

## R1: Can the fades be Tailwind utilities, or do they need inline styles?

**Decision**: Tailwind utilities. `mask-b-from-*` / `mask-b-to-*` for the
portrait's lower dissolve, `mask-r-from-*` / `mask-l-from-*` for the navigation
scroller's edge cue.

**Rationale**: This mattered because the constitution permits inline `style` only
for values exported by a token module; a hand-written `mask-image` would have
needed either an exception or a `@utility`. Verified by compiling a probe against
the project's own `app/globals.css` with Tailwind 4.3.3:

```css
.mask-b-from-0\% {
  mask-image: var(--tw-mask-linear), var(--tw-mask-radial), var(--tw-mask-conic);
  mask-composite: intersect;
  --tw-mask-linear: var(--tw-mask-left), var(--tw-mask-right), var(--tw-mask-bottom), var(--tw-mask-top);
  --tw-mask-bottom: linear-gradient(to bottom, …);
}
```

`mask-composite: intersect` is the important part: directional masks compose, so
a bottom fade and a right fade can coexist on one element without either
cancelling the other.

**Note for whoever runs a similar check**: Tailwind 4's CLI ignores `--content`.
The first probe reported zero mask utilities and looked like a negative result;
it was actually never scanning the probe file — `backdrop-blur-md` didn't compile
either, which is what gave it away. Use `@source` in the CSS instead.

**Alternatives considered**: a registered `@utility` in `globals.css` (unnecessary
once the built-ins were confirmed); an inline `style` with a gradient mask
(would have needed a constitution exception); a PNG with the fade baked in
(bakes one background assumption into the asset and defeats the point of the
alpha channel).

---

## R2: How is the portrait framed and blended?

**Decision**: `next/image` rendering `hero_portrait.png`, with

- `mask-b-from-60% mask-b-to-100%` — dissolves the torso where the frame crops it;
- `object-top` plus a height cap below `lg` — head-and-shoulders on mobile;
- no `preload`, unlike the backdrop (see R8).

**Rationale**: The cut-out has transparent surroundings already, so the only hard
edge left is the bottom, where the original photograph ends mid-torso. That is
the single edge needing a fade, which keeps the mask to one direction.

The asset's opaque content occupies `929x1197+94+340` within the 1023×1537 frame
— measured, not estimated. It is *not* cropped to that box, deliberately: keeping
the original frame means the subject's position is stable and CSS positioning
does not have to compensate for a re-centred bounding box.

**Alternatives considered**: cropping the asset to its bounding box (smaller file,
but transparent margins compress to almost nothing in PNG, so the saving is
negligible against the positioning cost); a CSS `radial-gradient` vignette
(reintroduces a soft rectangle, which FR-004b rules out).

---

## R3: Why are the two calls to action misaligned?

**Decision**: It is a box-model defect, not a flex defect. Fix by giving the
primary button `border-2 border-transparent` so both buttons have identical box
math, and by moving both icons to the leading position.

**Rationale**: Reading the current `ValueProp.tsx` class lists against Tailwind's
preflight (`box-sizing: border-box` globally):

| | View Work | Play Career |
|---|---|---|
| text | `text-lg` → 28px line box | 28px |
| padding | `py-4` → 32px | 32px |
| border | *none* | `border-2` → 4px |
| **height** | **60px** | **64px** |

Two distinct symptoms follow, which is why the defect looks inconsistent:

- **Stacked (below `sm`)**: the container is `flex-col`, so `align-items: stretch`
  equalises *widths*, not heights. The 4px difference is visible.
- **Side by side (`sm` and up)**: cross-axis is vertical, so stretch equalises
  heights and hides the 4px — but the labels still sit at different horizontal
  offsets, because View Work's arrow is trailing (`ml-2`) while Play Career's
  play triangle is leading (`mr-2`). The buttons look the same height and the
  *text* looks off-axis.

A height override would paper over the first symptom and miss the second. A
transparent border fixes the cause, and matching icon positions fixes the second.

**On FR-019 and the reference image**: `rework_hero_nav.png` shows View Work with
*both* a leading calendar glyph and a trailing arrow, Play Career with a leading
triangle. FR-019 requires the icons to occupy the same position relative to their
labels — satisfied by the leading pair. The trailing arrow on the primary button
only is a deliberate hierarchy signal, not a fourth inconsistency, and is
retained. Whoever implements this should not "fix" it away.

**Verification limit**: derived from class lists and preflight, not measured.
SC-003 asks for 0px tolerance, which needs a computed-style check in a real
browser — see quickstart.md.

---

## R4: How does the floating bar keep showing reading progress?

**Decision**: Keep the existing `motion.div` with the `scaleX` spring, but move
it inside the pill as a hairline along the bottom inner edge, with the pill
carrying `overflow-hidden rounded-full` so the bar is clipped to the rounded
shape.

**Rationale**: FR-015 requires progress to survive the reshape. The current bar
spans the full viewport width at `top-0`, which a detached pill no longer does.
Reusing the same spring means the reduced-motion branch already in
`StoryProgressNav.tsx` carries over untouched — it swaps `springScaleX` for the
raw `scrollYProgress`, and that logic is orthogonal to where the bar is drawn.

**Alternatives considered**: a progress ring around the wordmark (more novel, but
a 1px arc is hard to read and would need new geometry); keeping the full-width
bar above the floating pill (two competing horizontal elements, and it
contradicts FR-011's "detached from the viewport edges").

---

## R5: How does the section scroller behave, and does the fade break focus?

**Decision**: `overflow-x-auto` on the section list (as today) with
`mask-r-from-85% mask-r-to-100%` for the edge cue; the icon cluster stays
`shrink-0` outside the scrolling element.

**Rationale**: The existing markup already separates a scrolling `<nav>` from a
`shrink-0` control cluster, so FR-016a needs layout changes but no restructure.

**The focus risk is real and needs care.** FR-016c requires a focused link to be
brought into view with its indicator unobscured. Two mechanisms interact:

1. Browsers auto-scroll a focused element into view within its scroll container,
   so a keyboard user tabbing to "Contact" will scroll it in. That is free.
2. A mask fades by *position in the element*, so an item scrolled to the very
   edge is faded regardless of focus — and unlike `opacity`, a mask cannot be
   overridden per-child.

Mitigation: keep the fade narrow (last ~15%) and add `scroll-px-*` so the
auto-scroll lands the focused item clear of the faded zone rather than flush
against it. This must be verified by tabbing, not assumed — it is the one part of
the nav work that a unit test cannot confirm.

**Alternatives considered**: `opacity` on edge items via a scroll listener
(per-child control, but adds a scroll handler and state for a purely decorative
cue); no cue at all (fails FR-016b).

---

## R6: Where does the email live, and why not in the `social` array?

**Decision**: an `email` string field beside the `social` array in
`social.json`. Settled in the clarification session; recorded here with the
verification that supports it.

**Rationale**: An entry *inside* the array would validate — confirmed against the
installed zod 3.25.76:

```
"mailto:prannoy.mulmi@gmail.com"  -> PASS
"https://github.com/x"            -> PASS
"prannoy.mulmi@gmail.com"         -> FAIL   (bare address is not a URL)
```

But `Footer.tsx` renders every member of that array, so the address would appear
in the footer — explicitly declined — and would then need filtering logic. A
sibling field avoids the side effect instead of compensating for it.

The bare-address failure also decides the stored shape: store the plain address
(`prannoy.mulmi@gmail.com`) and let components compose `mailto:`, since the
plain form is what the Contact chapter must display as text (FR-024). Validate it
with `z.string().email()`, not `.url()`.

---

## R7: Should the portrait get the reference image's rim light?

**Decision**: No. Not in this feature.

**Rationale**: `rework_hero_nav.png` glows the subject against the stadium. It is
attractive but it is two treatments to build and tune (warm in light, cool in
dark), it is not required by any FR, and Principle I forbids reaching past what
the requirement asks for. The cut-out already reads cleanly against both surfaces
— verified at 3× zoom over the sunset and over `#111827` before the asset was
committed.

**Alternatives considered**: a `drop-shadow` filter tinted per theme (cheap, but
a coloured shadow on a person reads as a printing error more often than as
light); building it and hiding it behind a flag (unused code).

---

## R8: Does the portrait threaten the LCP budget?

**Decision (revised after measurement)**: The portrait gets an explicit `sizes`
**and** `preload`. The backdrop keeps its own.

> **Corrected during implementation.** The original decision below withheld
> `preload` on the reasoning that `Backdrop.tsx` was the LCP element. That was
> an assumption, and it was wrong. Chrome reports the *portrait* as LCP
> (272,580px² at 1440x900). The open item at the end of this entry said to
> revisit if that happened, so it was measured — four runs each with the cache
> disabled:
>
> | | LCP |
> |---|---|
> | `main` (card's portrait was LCP) | 348 ms |
> | branch, portrait not preloaded | 216 / 216 / 212 / 216 ms |
> | branch, portrait preloaded | 196 / 208 / 208 / 196 ms |
>
> The ranges do not overlap, so the ~14ms gain is real rather than noise, and
> the feared contention between two preloads did not materialise. SC-008 asked
> only that LCP not regress; it improves by roughly 140ms against `main`.
>
> The original reasoning is left below, because "two preloaded images compete
> for early bandwidth" is still a sound thing to worry about — it simply turned
> out not to be true here, and that is only knowable by measuring.

**Original decision**: The portrait gets an explicit `sizes` and **no**
`preload`. The backdrop keeps the `preload` it already has.

**Rationale**: `Backdrop.tsx` documents itself as the largest contentful paint
element and carries `preload` (Next 16's replacement for the deprecated
`priority`). A large portrait entering the same viewport is a plausible new LCP
candidate; preloading both would have them compete for early bandwidth and could
regress the metric SC-008 protects.

`next.config.ts` already emits AVIF and WebP and sets `deviceSizes`, so the
optimiser will serve a right-sized variant — but only if `sizes` is accurate.
Without it, Next assumes `100vw` and ships a far larger file than the ~50%
column needs.

Alpha survives the conversion: both WebP and AVIF support transparency.

**Open item**: whether the portrait *becomes* the LCP element is a measurement,
not a prediction. quickstart.md includes the check. If it does become LCP, the
preload decision should be revisited — moving `preload` to the portrait may then
be correct.

---

## R9: What exactly can be deleted?

**Decision**: Six components, three types, three schemas, one content object.
Verified by grep, not assumed.

`PlayerCard.tsx` is imported only by `Hero.tsx`. Its five dependencies —
`AwsBadge`, `Flags`, `SkillBars`, `StarRating`, and `ProfilePicturePlaceholder`
— have no other importer, so all become unreachable once it goes.

`palette.ts` needs care rather than deletion. Its exports split cleanly:

| Export | Used by | Fate |
|---|---|---|
| `INK`, `EMBER`, `TEAL`, `CREAM` | `Hero.tsx` role highlights | **Keep** |
| `CARD_INK` | `PlayerCard` only | Remove |
| `SUNGLOW`, `SUNGLOW_TEXT` | `PlayerCard`, `AwsBadge`, `StarRating`, `SkillBars` | Remove |
| `WARM_INK` | Nothing — mirrored as a literal in `Hero.tsx`/`ValueProp.tsx` | Keep, still documents the literal |

`SUNGLOW` also appears as the literal `#ffa62b` in `ValueProp.tsx` and
`CvLink.tsx` dark-mode classes. Those are Tailwind class strings, not imports, so
removing the token does not break them — but the comment explaining why the
literal exists must survive, or the next reader will "helpfully" reintroduce the
import.

`ProfilePicturePlaceholder` is deleted rather than reused: the spec's edge case
says a missing portrait falls back to a text-only layout that still fills the
space, not to a placeholder graphic.

---

## Summary of decisions

| # | Decision |
|---|---|
| R1 | Tailwind's built-in mask utilities; no inline styles, no new dependency |
| R2 | `next/image` + one-directional bottom mask + `object-top` cap on mobile |
| R3 | Transparent border on the primary button; both icons leading; keep the primary's trailing arrow |
| R4 | Progress hairline moves inside the pill, clipped by `overflow-hidden rounded-full` |
| R5 | Existing scroller + narrow right-edge mask + `scroll-px-*` so focus lands clear |
| R6 | Plain address in an `email` field beside the array; validate with `.email()` |
| R7 | No rim light |
| R8 | `sizes` yes, `preload` no; re-measure and revisit |
| R9 | 6 components deleted; `palette.ts` trimmed, not removed |
