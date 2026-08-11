# Phase 0 Research: Hero card, rebuilt to the collectible reference

Decisions taken before any code is written, with the alternatives that lost and why.
Contrast figures here are computed, not estimated; the cut-out finding is the result of
a spike run against the real photograph.

---

## 1. Two editions without inline styles — the card's colour mechanism

**Decision**: Declare card colour as CSS custom properties in `app/globals.css`, under
the existing `:root` block and re-declared under the existing `.dark` block, then expose
them to Tailwind through the existing `@theme inline` block as `--color-card-*`. The card
then uses ordinary utilities — `bg-card-ground`, `text-card-ink`, `border-card-foil` —
which resolve per theme with no variant on them at all.

**Rationale**: This is the crux of the feature. Today's card paints itself with inline
`style` from `components/Hero/palette.ts`, and an inline style cannot carry a `dark:`
variant — which is exactly why the current card is the same navy in both themes. ADR
0013 recorded this as a known negative. The mechanism to fix it already exists in the
codebase and already carries `--background`, `--foreground`, `--scrim` and `--on-photo`.

It also collapses the two editions into a diff of ten values in one file, which is what
makes FR-013 (hue identity preserved across editions) reviewable rather than a matter of
opinion.

**Alternatives considered**:

- *Paired `dark:` utilities on every element* — roughly forty paired classes across the
  card, with the two editions defined in scattered fragments rather than side by side.
  Correct but unreviewable. Kept as the fallback if a reviewer rejects §1's judgement
  call on the `.dark` block (see plan.md).
- *Keep inline styles, swap the palette object on theme change* — requires reading theme
  state in the component, re-renders the card on toggle, and reintroduces the
  hydration-flash problem `next-themes` exists to prevent (FR-014, US2 scenario 4).
- *A second palette module for dark* — same inline-style dead end, doubled.

---

## 2. The palette, and two contrast findings that change it

**Decision**: The tokens below. Two differ deliberately from the values sampled off the
mock, for reasons the measurements forced.

| Token | Light | Dark | Role |
|---|---|---|---|
| `card-ground` | `#F8EDE0` | `#12151B` | card face |
| `card-edge` | `#EED6BB` | `#0B0D11` | outer grade |
| `card-ink` | `#001126` | `#F4E8D9` | all type |
| `card-accent` | `#822F16` | `#E88A5E` | position abbreviation, emphasised row |
| `card-foil` | `#A86A3F` | `#E3B863` | frame, rules |
| `card-foil-lite` | `#D89D6B` | `#F0D28A` | foil gradient highlight |

Measured (WCAG 2.1 relative luminance):

| Pair | Ratio | Verdict |
|---|---|---|
| light ink on ground | 16.41:1 | AAA |
| light ink on sand edge | 13.51:1 | AAA |
| light accent on ground | **7.68:1** | AAA |
| dark ink on ground | 15.14:1 | AAA |
| dark accent on ground | **7.16:1** | AAA |
| dark foil on ground | 9.84:1 | AAA |
| light foil on ground | 3.79:1 | **decorative only** |

**Finding A — the mock's rust fails AAA, so it is darkened.** Sampled straight off the
mock the accent is `#9A3B1E`, which measures 6.02:1 on the ivory ground: AA, but short
of the 7:1 that FR-019 requires of display-size text, and the position abbreviation is
display-size. `#822F16` reaches 7.68:1 and is roughly ten percent darker — still
unmistakably the mock's rust. The dark edition moves from `#E07A4F` (6.15:1) to
`#E88A5E` (7.16:1) for the same reason.

**Finding B — the foil cannot carry text in the light edition.** At 3.79:1 it fails AA
for text, though it clears the 3:1 that WCAG 1.4.11 asks of meaningful non-text
boundaries, so it is sound as a frame and rule colour. The mock already respects this —
gold appears only in the border, the dividers and the crest — so this constrains future
edits rather than the initial build. It is recorded so that nobody later sets a label in
gold and ships it. Note the asymmetry: in the dark edition foil measures 9.84:1 and
*could* carry text. It still should not, so the two editions stay structurally identical.

**Alternatives considered**: keeping `#9A3B1E` and relaxing FR-019 to match SC-002
(which scopes AAA to the name and figure block only). Rejected — the spec's stricter
line is the better one, and a ten-percent shift costs nothing visually.

---

## 3. The shield silhouette

**Decision**: Build the outline from a rounded rectangle plus a separate crown element
at the top centre, both plain elements. Do **not** clip the card with a single SVG path.

**Rationale**: The card stretches taller than the mock's proportion on narrow screens
(FR-020a). An SVG `clipPath` with `clipPathUnits="objectBoundingBox"` scales its path
with the element's box, which means every corner radius and the crown's curve distort
as the aspect ratio changes — circular corners become elliptical exactly where the card
is most likely to be seen, on a phone. A CSS `border-radius` does not distort, because
it is resolved against each corner independently.

Splitting the shape also keeps each piece obvious: a rounded rect is a rounded rect, and
the crown is one small SVG whose path can be read in isolation. That is the KISS
principle applied to a shape, and it survives a future reader who has never seen the mock.

**Alternatives considered**:

- *Single `clip-path: path()`* — one definition for clip and stroke, but distorts on
  stretch, and needs a fixed coordinate space that fights fluid width.
- *`border-image` with a nine-slice foil* — needs a raster asset, which cannot re-theme.
- *Nested divs faking the notch* — no distortion, but the crown's curve degrades to
  straight edges.

---

## 4. The foil border and its sheen

**Decision**: The border is a gradient-stroked ring. The sheen is a narrow angled
highlight that travels across that ring on hover and on first entrance, animated with
Framer Motion, masked so it only lights the frame and never washes the portrait.

**Rationale**: Framer Motion's declared domain in the constitution is *"component
entrance, exit, and interaction motion"* — a hover-triggered highlight is squarely
inside it, so no library question arises. GSAP is for scroll-sequenced motion and would
be the wrong domain; `rough-notation` is for annotation marks over text.

**Reduced motion must remove the element, not shorten it.** `globals.css` carries a
global `@media (prefers-reduced-motion: reduce)` rule collapsing every animation to
`0.01ms`. Applied to a travelling highlight, that does not remove the sheen — it freezes
it at its final position, leaving a bright band stuck across the frame. That is the
mid-state FR-023a explicitly forbids. So the component gates on
`prefersReducedMotion()` from `lib/utils/animations.ts` and returns `null`, rather than
relying on the global rule.

**Touch devices**: the sheen's trigger is hover, which does not exist there. It also
plays once on entrance, so a touch visitor sees it once and then a static card — which
satisfies the edge case without inventing a tap interaction that would compete with the
page's real controls.

---

## 5. The cut-out portrait — spike result: **automated matting fails**

**Decision**: The cut-out cannot be produced by the image tooling available on this
machine. It must come from a subject-aware tool or be supplied ready-made. The
implementation task carries this as a prerequisite, and FR-007a's framed-portrait
fallback is live rather than theoretical.

**This is a reversal of the assumption behind the clarify-session answer.** That answer
("I cut it out during implementation") rested on the premise that a flat grey studio
background makes background removal tractable. The spike shows it does not, for a
structural reason rather than a tuning one.

**Evidence**. The backdrop is neutral grey spanning a wide luminance range — sampled
`#959A9D` at top centre down to `#494952` at bottom left. The subject's two largest
regions are also neutral: a white t-shirt and a black jacket, plus black hair. Their
luminances sit *inside* the backdrop's range. Flood-filling from the edges was tested
across thresholds:

| Fuzz | Result |
|---|---|
| 8% | Subject intact, but a large grey cap remains around the hair — the halo SC-008 forbids |
| 12% | Better background clearance; leakage begins across the cheek and jaw |
| 16% | Fill breaks through the face; unusable |
| 22% | Face, shirt and shoulders largely consumed |

Adding a dense ring of border seeds at 8–10% — the standard fix for a gradient
background — made it worse, not better: seeded locally, the fill matched the white
t-shirt and the black jacket and removed both, while the grey cap around the hair
survived. There is no threshold that spans the backdrop without also matching the
subject, because the two occupy the same region of colour space. No amount of tuning
resolves a collision of that kind.

**Paths forward**, in order of preference:

1. **Supply a background-removed PNG.** macOS does subject-aware segmentation natively —
   right-click the file in Finder → Quick Actions → Remove Background, or the same
   feature in Preview — which produces exactly the asset this needs in a couple of
   clicks. This is the option originally offered at specify time and is now clearly the
   right one.
2. **Any subject-aware remover** (Photoshop's Remove Background, remove.bg, etc.).
3. **Ship the framed fallback** from FR-007a and treat the cut-out as follow-up work.
   The card is complete and correct without it; it simply reads as inspired-by rather
   than matching the mock.

**Alternatives considered and rejected on evidence**: chroma/saturation keying (the tee
and jacket are as neutral as the backdrop); luminance thresholding (ranges overlap);
edge detection plus fill (the jacket's edge against the dark backdrop region has almost
no gradient to detect).

---

## 6. The display face for the name

**Decision**: Add one condensed grotesque at a single heavy weight through
`next/font/google`, `display: 'swap'`, Latin subset only, exposed as a CSS variable
alongside the existing Geist pair. It is used for the name and the figure block numeral
and nowhere else.

**Rationale**: The mock's name is set in a heavy condensed face, and that compression is
most of what makes the banner read as a collectible card rather than a heading. Geist
Sans has no condensed cut and no width axis, so the effect cannot be approximated —
tightening letter-spacing narrows the gaps but not the glyphs, and a CSS `scaleX`
distorts stroke weights, which is visible at display size.

This adds no package dependency: `next/font/google` is part of Next.js and
`package.json` is untouched, so FR-022 holds. One weight, Latin-subset, is roughly
15–25KB of woff2.

**Cost, and where it is checked**: the card is on the LCP path, so this lands on the
critical path against a Lighthouse floor of 90 (SC-006). `display: 'swap'` keeps text
painted throughout. The quickstart measures it rather than assuming it, and if the
budget is breached, the fallback is Geist at maximum weight with tightened tracking and
a documented loss of fidelity.

**Alternatives considered**: a self-hosted subset of a variable font (smaller, but adds
an asset pipeline this project does not have); system condensed stacks such as
`Arial Narrow` (absent on most non-Windows machines, so the card would differ per
visitor — unacceptable for the one element that carries the identity).

---

## 7. Texture, pitch marks and the crest

**Decision**: All three are inline SVG — a `<pattern>` of dots for the paper texture, a
small line-art group for the pitch diagram in the upper right, and a drawn crest for the
foot. No raster assets.

**Rationale**: They must re-theme with the card, and a raster cannot. Drawn in SVG they
inherit `currentColor` and the foil token, so the dark edition needs no second copy.
They also stay out of the LCP payload, which matters given §6 already spends budget
there. The constitution states the preference directly — SVG in the browser, canvas only
when SVG is demonstrably insufficient.

**Rendering care**: both the texture and the pitch marks sit at low opacity and must not
become legible enough to compete with content (FR-003). They are decorative, so they
carry `aria-hidden`, which also keeps them out of the accessibility tree.

---

## 8. Icons

**Decision**: One new `components/Hero/CardIcons.tsx` exporting the seven glyphs the
card needs — pin, calendar, trophy, shield, code, cloud, people — as inline SVG
components. Country flags continue to come from the existing `Flags.tsx`.

**Rationale**: ADR 0014 scopes `react-icons` to brand marks in
`components/Navigation/SocialIcons.tsx` only. Widening that scope needs a constitution
amendment, and seven simple glyphs do not justify one. Drawn inline they inherit
`currentColor` and theme for free, which an icon-font or sprite approach would not.

---

## 9. Content shape and the retirement

**Decision**: Reshape `PlayerCardSchema` — drop `stats`, `rating`, `softSkills` and
`blurb`; add `positionAbbrev`, `location` and `achievements`; keep `title`,
`yearsExperience` and `countries`. Details in
[contracts/content-schema.md](./contracts/content-schema.md).

**Rationale**: FR-018a requires removal rather than hiding, so that `home.json` stops
carrying values nothing renders. Zod is the enforcement point for FR-017's cap, which is
what keeps a sixth achievement from silently breaking the layout instead of failing
loudly at load.

**Migration note**: the schema change and the component change must land in the same
commit. A commit that removed `softSkills` while `SkillBars` still read it would not
type-check, and the reverse would ship a card rendering a field that no longer validates.

---

## 10. Responsive strategy

**Decision**: The card's height is content-driven, never a locked aspect ratio. Type
scales fluidly with a hard floor at 14px. At desktop the card's column widens by one
step; the opening stays a two-column grid.

**Rationale**: FR-020a puts legibility above proportion, which rules out any approach
that scales the card as a fixed-ratio unit — the mock's 2:3 at 320px would put
achievement text near 8px. Letting height follow content is what allows the stretch the
clarify session chose. FR-021a caps the desktop growth: the card may widen to hold its
new content, but not so far that the three annotated role phrases read as secondary.

**Watch item**: the card grows tallest exactly where vertical space is scarcest. FR-021
requires the pitch and its two calls to action to stay ahead of it, which source order
already guarantees from feature 005 — but the card must not be given an entrance that
pulls it above them, and no `order-*` utility may be introduced.
