# Quickstart: validating the portrait hero and floating navigation

How to prove this feature works. Split by what can be automated and what cannot —
three of the spec's criteria are visual and have no test that can assert them, so
they are listed as manual steps rather than quietly dropped.

## Prerequisites

```sh
cd /Users/prannoy/projects/portfolio
npm install --legacy-peer-deps   # ADR 0007 — required in every environment
```

**Baseline before starting**: `npx jest` → **17 suites, 99 tests passing**. If
that is not what you see, fix it before touching the feature; otherwise you
cannot tell your regressions from pre-existing ones.

---

## 1. Automated checks

```sh
npm run type-check     # tsc --noEmit — catches the type deletions
npm run lint
npm test
npm run validate:json  # content files against their schemas
```

**Expected after implementation**: type-check and lint clean, JSON valid, and the
suite green with **more** tests than the 99 baseline — this feature adds
`HeroPortrait`, `ValueProp`, `EmailLink` and `ContactSection` specs while
rewriting `Hero.test.tsx`.

### Failure modes worth recognising

| Symptom | Almost certainly |
|---|---|
| Every content test fails at once | `card` removed from `home.json` while `HomeSchema` still requires it — commit order violated (see data-model.md) |
| `SocialIcons` and `EmailLink` both render nothing | `email` added to the schema but not to `social.json` |
| `tsc` errors in files you did not touch | `PlayerCard`/`PlayerStat`/`SoftSkill` still imported somewhere — grep before deleting |

---

## 2. Run it

```sh
npm run dev     # http://localhost:3000
```

### Opening — User Story 1

- [ ] No player card anywhere: no job-title bar, stat pills, star rating,
      self-rated bars, AWS badge or country flags.
- [ ] Portrait on the right at ≥1024px; roles, tagline, buttons and CV link left.
- [ ] Tagline reads "I build **secure**, scalable cloud systems, …".
- [ ] Below 1024px the text comes first and the portrait follows — check the DOM
      order too, not just the visual order. There must be no `order-*` utility
      doing the reordering, or a screen reader and the screen will disagree.

### Navigation — User Story 2

- [ ] Bar floats: visible gap left, right and top; fully rounded ends.
- [ ] Still visible at every scroll position.
- [ ] Every section link lands on a section that exists.
- [ ] Progress still advances as you scroll, clipped inside the pill.

### Calls to action — User Story 3

- [ ] Both carry a leading icon in the same position.
- [ ] The primary keeps its trailing arrow — this is intended (research.md R3),
      not a defect to fix.

### Email — User Story 4

- [ ] Envelope in the bar opens a message to `prannoy.mulmi@gmail.com`.
- [ ] Contact chapter shows the address as text; "coming soon" is gone.
- [ ] Change the address in `social.json` → both update, no other edit.

---

## 3. Manual checks that no test covers

### 3a. The blend (FR-004, FR-004a, FR-004b)

jsdom does not rasterise. The tests assert the *mechanism* — right asset, mask
utility applied — never the appearance. These must be looked at:

- [ ] **Light theme**: no grey studio background anywhere around the subject.
- [ ] **Dark theme**: no light halo or fringe along the hair. This is the one
      most likely to regress, because it is invisible in light mode.
- [ ] **Both**: the lower edge dissolves; no horizontal crop line.
- [ ] Five widths — 375, 768, 1024, 1440, 2560.

If a halo appears, the cause is almost certainly a *different* asset being
rendered, not a CSS problem: `hero_portrait.png` has decontaminated edges,
`hero_pic.png` has an opaque grey rectangle. Check `imageSource` first.

### 3b. Button geometry (SC-003, 0px tolerance)

jsdom does not lay out, so this needs a browser. In DevTools console:

```js
const [a, b] = document.querySelectorAll('a[href="/#projects"], a[href="/#career"]');
const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
console.log({ heightDelta: ra.height - rb.height, topDelta: ra.top - rb.top });
```

- [ ] Both deltas are `0` at ≥640px **and** below 640px. The stacked case is the
      one that is broken today — see research.md R3.

### 3c. Keyboard through the scroller (FR-016c)

The identified risk in the nav work — a mask fades by position, so a focused
link at the very edge is faded regardless of focus.

- [ ] At 375px, tab through every section link.
- [ ] Each focused link scrolls into view **and** its focus ring is fully
      visible, not under the edge fade — particularly the last one.

### 3d. Reduced motion

```sh
# macOS: System Settings → Accessibility → Display → Reduce motion
```

- [ ] Portrait does not drift; progress bar tracks scroll without spring
      overshoot; layout is identical to the un-reduced case (drift is
      transform-only, so switching it off must shift nothing).

### 3e. Contrast (SC-006)

Measure, do not eyeball:

- [ ] Tagline and body copy over the photograph, both themes.
- [ ] Nav labels and glyphs against the pill's own fill, both themes — the
      photograph shows through behind it.
- [ ] Both button labels against their own fills.

Use `text-on-photo` for body copy over the backdrop. `gray-600`/`gray-700` fail
AA against it — the photo's darkest region is 0.293 relative luminance (ADR 0015).

---

## 4. Production build (SC-008)

```sh
npm run build && npm start
```

Lighthouse on `http://localhost:3000`, mobile preset:

- [ ] Performance ≥ 90.
- [ ] **Record which element is LCP.** The portrait is a plausible new candidate.
      It deliberately has no `preload` while the backdrop does (research.md R8).
      If the portrait *is* the LCP element, that decision needs revisiting — note
      it rather than leaving the config as-is on an assumption that measurement
      has just disproved.
- [ ] Compare LCP against `main`. SC-008 forbids a regression, and "roughly the
      same" is not the bar.

---

## 5. Governance (FR-025)

Not optional, and not something CI will catch:

- [ ] `docs/adr/0018-the-opening-leaves-the-player-card.md` exists and names what
      it supersedes.
- [ ] `docs/adr/0013-hero-player-card.md` carries a dated supersession note and
      its **original text is unaltered** — Principle VI forbids rewriting an
      accepted record.
- [ ] `docs/adr/README.md` reflects 0013's new status and lists 0018.
- [ ] `.specify/memory/constitution.md` — Principle IV amended, version
      1.2.0 → 1.3.0, sync impact report at the top.
- [ ] All four are in **this** PR, not a follow-up.

---

## Done when

Every box above is ticked, `npx jest` reports more than 99 passing tests, and the
three known gaps in plan.md have been checked by eye rather than assumed.
