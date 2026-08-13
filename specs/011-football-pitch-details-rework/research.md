# Phase 0 Research: Football Pitch Interaction Rework

Unknowns carried out of the spec, resolved against the code as it stands.
Every decision below names what it rejected, so a later reader can re-open it
on the original terms.

---

## R1. How the travelling ball is animated, given the pitch is raw SVG

**Context**: `SVGPitch.tsx` renders a `viewBox="0 0 100 64"` and
`CareerPitch.tsx` places players as bare `<circle cx cy>` inside it, with
chapter coordinates in 0–100 percent space scaled by `toPitchY`. There is no
DOM element per player that CSS transforms could move meaningfully, and the
existing GSAP helper `createPlayerPathAnimation` (`lib/utils/animations.ts`)
was written for the retired scroll-driven marker.

**Decision**: Render one `motion.circle` from `framer-motion` inside the
`SVGPitch` children, after the route polyline and before the player group, and
drive it with `animate={{ cx: active.x, cy: toPitchY(active.y) }}`. Framer
Motion animates SVG presentation attributes by name, so `cx`/`cy` are valid
animation targets on `motion.circle` — no transform maths against the viewBox
is needed, and the ball stays in the same coordinate space as the players.
Radius is fixed and visibly smaller than a player dot (players are `r=2.8`
inactive / `3.4` active; the ball sits around `r=1.4`), satisfying the spec's
"small ball" assumption. Transition is a single tween of roughly 0.5s with an
ease-out, so it reads as travel-then-settle.

**Rationale**:

- Framer Motion is already in the stack and Principle IV assigns it exactly
  this domain — "component entrance, exit, and interaction motion". Selection
  is interaction motion. GSAP's domain is scroll-sequenced/timeline motion,
  which this is not, so reaching for GSAP here would blur the one-domain-each
  rule the constitution states.
- FR-004 (a new selection mid-flight must retarget, not queue) falls out for
  free: Framer Motion's `animate` prop is interrupt-driven — a changed target
  re-aims the same running animation from its current value. No queue, no
  cancellation bookkeeping, no `isAnimating` state to get wrong.
- The panel updating immediately while the ball travels (Acceptance Scenario
  1.1) is automatic, because the ball is decoupled from the `index` state that
  `ChapterDetail` reads.
- Clicking the already-active player produces no coordinate change, so Framer
  Motion runs nothing — the edge case is satisfied without a guard.

**Alternatives considered**:

- *GSAP tween on `attr: { cx, cy }`* (the shape `createPlayerPathAnimation`
  already uses): works, but needs an imperative ref, an effect, and explicit
  `killTweensOf` cleanup per the constitution's ScrollTrigger/leak rule, and
  crosses the animation-domain boundary. More code and a principle argument to
  win, for identical output.
- *CSS transition on `cx`/`cy`*: `cx`/`cy` are animatable CSS properties in
  modern browsers, but the global `prefers-reduced-motion` block in
  `app/globals.css` already forces `transition-duration: 0.01ms !important`,
  which would make the reduced-motion path implicit and invisible — the
  opposite of FR-003's requirement that the skip be deliberate and consistent
  with the site's existing helper.
- *SVG `<animateMotion>` along the route path*: declarative and dependency-free,
  but retargeting mid-flight requires imperative `beginElement()` juggling and
  it cannot start from an interrupted position. Rejected on FR-004.
- *Animating a DOM element overlaid on the SVG*: requires converting viewBox
  units to pixels and re-measuring on resize. Rejected as strictly more work
  than animating inside the coordinate system that already exists.

---

## R2. How `prefers-reduced-motion` gates the ball

**Decision**: Read once via the existing `prefersReducedMotion()` helper from
`lib/utils/animations.ts`, in a lazy `useState` initializer guarded for SSR —
the exact pattern `components/Navigation/StoryProgressNav.tsx:42` and
`components/Navigation/HamburgerMenu.tsx:115` already use:

```ts
const [reducedMotion] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());
```

When `reducedMotion` is true, the ball is rendered at the active coordinates
with `transition={{ duration: 0 }}` (equivalently, as a plain `<circle>`), so
the marker still exists but never travels.

**Rationale**: The constitution's quality constraints require motion to
respect `prefers-reduced-motion` "through the existing helpers, not a new
detection path per component". Two components already establish this exact
call shape; a third instance of it is the boring, consistent choice.

**Alternatives considered**:

- *Framer Motion's `useReducedMotion()` hook*: idiomatic for the library and
  subscribes to changes, but it is a second detection path in a codebase that
  standardised on one helper — the precise thing the constraint forbids.
- *Relying on the global `@media (prefers-reduced-motion: reduce)` block in
  `app/globals.css`*: that block clamps CSS transitions/animations only;
  Framer Motion drives values via JS and is unaffected by it.
- *Hiding the ball entirely under reduced motion*: over-reaches. FR-003 asks
  for an instant update, not a removed affordance.

---

## R3. How the display name / abbreviation derivation is structured and tested

**Context**: The shipped `subtitle` values are
`"AViV GmbH (Formerly Immowelt GmbH) "` (note trailing space),
`"Otto GmbH & Co KG"`, `"Novomind AG"`, `"Lustita Limited"`, `"Clansweb.de"`.
`toChapters()` in `components/Career/chapters.ts` maps `subtitle` → `company`
today with no processing.

**Decision**: Two exported pure functions in `components/Career/chapters.ts`,
consumed by `toChapters` which stores their results on the chapter:

- `toDisplayName(company: string): string` — drops any parenthetical group,
  then strips a trailing run of legal-form tokens (`GmbH`, `AG`, `& Co KG`,
  `Limited`, `Ltd`, `Inc`, `KG`, `SE`, `mbH`, `Co`, `&`) from the end, then
  collapses whitespace and trims. Returns the original trimmed string if
  stripping would leave nothing.
- `toAbbreviation(displayName: string): string` — first whitespace-separated
  word, first 4 characters, uppercased.

Both are exported (not module-private) specifically so the unit test calls
them directly with the table of real inputs, rather than asserting on rendered
SVG text.

**Rationale**:

- FR-013 defines the abbreviation *in terms of* the display name, so the two
  functions compose in that order and each is independently checkable.
- Table-driven tests over the five real company strings plus the two worked
  examples the spec states are readable as documentation (Principle II) and
  need no render, no mocks, and no DOM.
- Guarding against an empty result matters: a naive suffix strip turns a
  hypothetical `"AG"` into `""`, which would render a nameless player. The
  fallback is one line and removes the whole class of failure.
- Keeping them in `chapters.ts` rather than `lib/utils/` keeps them next to
  the only shape that gives them meaning (Principle I, no premature
  extraction).

**Alternatives considered**:

- *Authoring `displayName`/`abbreviation` into `experiences.json`*: rejected
  by clarification 3 and spec Assumptions — it would mean a Zod schema change
  and content authoring for information already recoverable from `company`.
- *A single combined function returning both*: hides the FR-013 dependency
  chain and makes the abbreviation untestable without the display name it
  happens to compute internally.
- *Regex-free `split(' ')[0]` for the display name*: would yield `"AViV"`
  correctly but `"Novomind"` from `"Novomind AG"` only by accident, and would
  mangle a legitimate two-word company name. Suffix stripping is the rule the
  spec actually states.

---

## R4. How focus-visible is implemented on an SVG `<g>` player

**Context**: The reported "blue selected ball" is the browser's default focus
ring, which paints on the `<g role="button" tabIndex={0}>` in
`CareerPitch.tsx` after a click (Chrome focuses the element on
mousedown). `app/globals.css` defines no focus rules at all — confirmed by
search, it contains no `outline` or `focus-visible` declaration. The
components that *do* handle focus (`SocialIcons.tsx`, `HamburgerMenu.tsx`,
`ThemeToggle.tsx`, `EmailLink.tsx`, `StoryProgressNav.tsx`, `CvLink.tsx`) all
use the same Tailwind pair: `focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-primary`.

**Decision**: Two parts.

1. Apply `focus:outline-none focus-visible:outline-none` to the player `<g>`,
   killing the default ring for both pointer and keyboard focus. `focus:` (not
   only `focus-visible:`) is what removes the click-induced ring the spec
   complains about; `:focus-visible` never matches a mouse click in the first
   place, so a `focus-visible:`-only rule would not fix FR-001.
2. Draw the keyboard focus indicator *inside the SVG* — an extra `<circle>`
   with no fill, a `#f65600`-adjacent stroke at a radius outside both dot and
   halo — rendered when the group has keyboard focus, tracked with `onFocus`
   /`onBlur` plus `event.currentTarget.matches(':focus-visible')` so it appears
   only for keyboard focus.

**Rationale**:

- Tailwind's `ring-*` utilities compile to `box-shadow`, and `box-shadow` does
  not render on SVG child elements. Copying the project's existing focus class
  string onto the `<g>` would silently produce no visible indicator — a
  regression in accessibility disguised as consistency. This is a rendering
  fact about SVG, not a departure from the convention.
- An SVG-drawn ring shares the players' coordinate space, so it scales with
  the pitch and cannot drift the way a pixel-sized outline around a scaled
  bounding box does.
- Keeping the indicator visually distinct from the orange halo (a stroked ring
  at a larger radius versus a filled translucent disc) satisfies FR-001's
  "doesn't fight the halo", and leaves the halo as the sole *active* signal
  while the ring is the sole *focused* signal — the two are separate states and
  now look separate.
- No global `app/globals.css` rule is added: a site-wide focus reset would
  change every currently-unstyled interactive element on the page, which is
  far outside this feature's scope and is not asked for by any FR.

**Alternatives considered**:

- *CSS `outline` on the `<g>` via a Tailwind `focus-visible:outline-*` class*:
  browser support for `outline` on SVG elements is uneven and, where it works,
  it traces the bounding box of the whole group — number, abbreviation, and
  name label included — producing a large rectangle rather than a ring around
  the player. Rejected on appearance and on inconsistency.
- *Moving `tabIndex` to a wrapping HTML element*: would require restructuring
  the pitch out of pure SVG and breaks FR-011's spirit.
- *`outline: none` with no replacement*: removes the keyboard affordance
  entirely and fails FR-001/FR-010.
- *A global `:focus-visible` rule in `globals.css`*: tempting as a site-wide
  improvement, but it is scope creep and would be invisible on SVG anyway for
  the box-shadow reason above.

---

## R5. Where the "what I built" summary comes from without duplicating achievements

**Context**: `toChapters` already maps `experience.workDescription` →
`chapter.achievements`, and clarification 2 says the "what I built" summary is
derived from `workDescription`. Rendering the same array twice would be
duplication, and FR-009 forbids hiding any achievement.

**Decision**: The first `workDescription` entry becomes `builtSummary`; the
remaining entries become `achievements`. The panel renders the summary as a
sentence in the showcase's `bodyText` position and the remainder as the
achievements list. Nothing is dropped — the array is partitioned, not
truncated.

**Rationale**: `lib/utils/validation.ts` constrains `workDescription` to 3–6
entries of 20–150 characters each, so entry one is always present and always a
sentence-length string — a safe summary slot with no new content authoring.
Partitioning keeps FR-009's "no truncation or hiding" literally true while
removing the duplication, and it is what actually makes the panel shorter
(SC-003): one line moves out of a bulleted list into flowing body copy.

**Alternatives considered**:

- *Rendering the full array in both places*: duplicated text, taller panel,
  fails SC-003's intent.
- *Joining all entries into one paragraph as the summary*: loses the
  achievements list the showcase pattern and FR-008 both require.
- *A new `summary` field in the JSON*: schema change and ADR trigger, ruled
  out by the spec's Assumptions.

---

## R6. Keeping on-pitch labels from overlapping (FR-006)

**Context**: The `FORMATION` table in `chapters.ts` places players at fixed
percent coordinates; the closest pair vertically is Centre back (26, 26) and
Playmaker (60, 28), which are far apart horizontally. The tightest horizontal
neighbours are Playmaker (60, 28) and Right wing (66, 72) — 6 units apart in
x, 44 apart in y.

**Decision**: Place the abbreviation directly under the number inside the dot
column (small, centred, `dominantBaseline` offset by roughly 3.4 units), and
the display name below that (roughly 6.5 units under the centre), centred on
the player's x with `textAnchor="middle"`. Cap the rendered display name at a
sensible character budget by relying on the derivation already stripping legal
suffixes — the longest shipped result is `"Clansweb.de"` at 11 characters.
Labels are `pointer-events-none select-none`, matching the existing number.

**Rationale**: With suffixes stripped, no shipped name exceeds 11 characters
at ~2.2 font units, and the nearest formation slots are ≥ 6 units apart in x
and ≥ 20 in y, so centred sub-labels cannot collide at any viewport size — the
SVG scales uniformly, so the relationship is size-independent. That last point
is why FR-006 is satisfiable by geometry rather than by runtime measurement.

**Alternatives considered**:

- *Runtime bounding-box collision detection*: measurable complexity for a
  fixed seven-slot formation with fixed coordinates. Rejected under Principle
  I.
- *Alternating label placement above/below by slot*: unnecessary given the
  spacing, and it makes the pitch read inconsistently.
- *`<foreignObject>` with HTML text and CSS truncation*: heavier, and
  `foreignObject` scaling/wrapping behaviour differs across browsers.
