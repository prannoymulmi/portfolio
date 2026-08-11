# Quickstart: validating the rebuilt hero card

How to prove this feature works, criterion by criterion. Every success criterion in
[spec.md](./spec.md) has a check here; none is "looks right".

## Prerequisites

```sh
npm install --legacy-peer-deps   # ADR 0007 — required in every environment
npm run dev                      # http://localhost:3000
```

The reference mock is at `public/images/card.png`. It is **uncommitted and must stay
that way** (FR-024). Before any commit:

```sh
git status --short          # public/images/card.png must appear as modified, never staged
git diff --cached --name-only | grep -q 'images/card.png' && echo 'STOP: reference staged'
```

## Automated gates

```sh
npm run type-check
npm run lint
npm test
npx prettier --check 'components/**/*.tsx' 'app/**/*.css'
```

Prettier matters more than usual here: `prettier-plugin-tailwindcss` enforces the class
ordering the constitution requires, and this feature writes a lot of new utility strings.

## Per-criterion verification

### SC-001 — anatomy complete (11 of 11)

Open `/` at 1280px in light mode beside `card.png` and account for each element:
shield outline with gold border · figure block · position abbreviation · full job title ·
location row · country row · years row · portrait · name · five achievement rows · crest.

Covered automatically by `tests/unit/components/PlayerCard.test.tsx`, which asserts each
region renders. The side-by-side is what catches *placement*, which a test cannot.

### SC-002 — contrast

Computed values are recorded in [research.md §2](./research.md). To re-verify after any
token edit, run the ratios rather than trusting the eye — the mock's own rust failed AAA
and had to be darkened, which no visual check would have caught.

Spot-check in DevTools: the name and the figure block numeral must report ≥ 7:1, every
other text element ≥ 4.5:1, in **both** themes.

### SC-003 — responsive, 14px floor

Sweep 320 / 375 / 768 / 1024 / 1440 / 1920px. At each: no horizontal page scroll, no
clipped content, full anatomy present.

At 320px specifically — the case FR-020a exists for — inspect the smallest text on the
card and confirm the computed `font-size` is ≥ 14px. The card is *expected* to be taller
than the mock's proportion here; that is the design, not a defect.

### SC-004 — theme flip

Toggle the theme with the card on screen. No surface, rule, or glyph may hold a
light-mode value in the dark edition. Because colour resolves through custom properties
(research §1), a missed element shows up as one that did not change at all — which is
easy to spot by flipping back and forth.

Also: load `/` directly with the theme already dark and confirm no flash of the light
card (US2 scenario 4).

### SC-005 — content-driven

Edit `public/data/home.json`: change `location`, change `yearsExperience`, reword one
achievement, and move `emphasis` to a different row. Reload. All four changes appear
with no code touched.

Then break it deliberately and confirm each fails at load rather than rendering
partially: a sixth achievement, two rows with `emphasis: true`, an `icon` value not in
the enum.

### SC-006 — performance

```sh
npm run build && npm start
```

Lighthouse on the production build, mobile preset, must report performance ≥ 90.

Two additions put pressure here and both are new with this feature: the display font
(research §6) and the portrait asset. If the score drops below 90, the font is the first
thing to remove — research §6 records the fallback.

### SC-007 — every number traceable

Read the card and name the source of each figure. There should be exactly two, and both
are `yearsExperience`: the figure block and the meta column's third row. If any other
number appears, FR-004a has been violated.

### SC-008 — cut-out quality

**Read [research.md §5](./research.md) before starting this.** The spike showed that
automated matting cannot produce an acceptable cut-out from `hero_pic.png` — the grey
backdrop and the subject's white tee and black jacket occupy the same colour space, so
no threshold separates them.

If a cut-out has been supplied: view it at twice its rendered size on both card grounds
and confirm no halo of the original background and no hard fringing along hair or
shoulders.

If not: the framed fallback from FR-007a applies, and this criterion is recorded as
deferred rather than passed. Do not ship a poor matte to close it.

### SC-009 — reference not committed

```sh
git log --oneline --all -- public/images/card.png   # no commit from this feature
grep -rn 'card\.png' app components public/data     # no reference in shipped code
```

### SC-010 — reduced motion

Enable *Reduce Motion* (macOS: System Settings → Accessibility → Display) and reload.
The card must render complete and static: **no sheen at all**, not a frozen one. A
stationary bright band across the frame means the component is relying on the global CSS
rule instead of gating on `prefersReducedMotion()` — see research §4.

## Definition of done

- All automated gates pass.
- SC-001 through SC-007, SC-009 and SC-010 verified above.
- SC-008 either verified or explicitly deferred with the framed fallback in place.
- ADR amending 0013 written and committed in this PR (FR-025), recording what the card
  gives up as well as what it gains.
- `public/images/card.png` still uncommitted.
