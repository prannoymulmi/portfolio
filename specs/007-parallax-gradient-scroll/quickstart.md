# Quickstart: Parallax Gradient Scrolling

Validation guide for confirming the feature works end-to-end once implemented. See
[data-model.md](./data-model.md) for the Gradient Layer shape and [research.md](./research.md)
for why the approach extends `HeroDrift` rather than touching `Backdrop.tsx`.

## Prerequisites

- Dependencies installed: `npm install --legacy-peer-deps` (per constitution, ADR 0007)
- The four gradient assets present in `public/images/`: `gradient-hero.png`, `gradient-text.png`,
  `mesh-soft.png`, `mesh-soft-flip.png`

## Setup

```sh
npm run dev
```

Open `http://localhost:3000` and scroll to the top so the Hero section is in view.

## Automated validation

```sh
npm test -- HeroParallax
npm test -- backdrop-coverage
```

Expected: both suites pass, covering:
- Gradient layers render with `aria-hidden="true"` (decorative, not content)
- Drift transform is `0` when `prefers-reduced-motion: reduce` is set, matching `HeroDrift`'s
  existing test pattern
- `Backdrop.tsx` still renders the single pinned photograph with no added motion — confirms the
  feature did not reopen ADR 0015

## Manual validation (visual — jsdom cannot assert compositing, per ADR 0015's own caveat)

1. **Parallax motion**: Scroll from the top of the page through the Hero section at a normal pace.
   Confirm the gradient layers move at visually distinct speeds from `HeroPortrait` and the role
   bars, and that motion looks smooth (no stutter) — matches spec **SC-001**, **SC-003**.
2. **Layer composition**: Confirm the gradients sit behind the portrait/text and don't reduce
   `text-on-photo` legibility against the pinned photograph — matches spec **FR-005**.
3. **No layout shift**: Reload with browser DevTools' Performance panel recording; confirm no CLS
   spike when the Hero mounts — matches spec **SC-002**.
4. **Reduced motion**: In OS settings, enable "Reduce motion" (macOS: Accessibility → Display; or
   `chrome://settings/accessibility` emulation via DevTools' Rendering tab →
   `prefers-reduced-motion: reduce`). Reload. Confirm gradients are visible but static — matches
   spec **SC-005**, User Story 3.
5. **Backdrop unaffected**: Scroll through the *entire* page (all chapters, not just Hero). Confirm
   the pinned photograph behind every chapter remains stationary, exactly as before this feature —
   confirms the plan's Constitution Check (`Backdrop.tsx` untouched).

## Performance check

```sh
npm run build && npm run start
```

Run Lighthouse (Chrome DevTools → Lighthouse → Performance) against the production build. Confirm
score ≥90, matching the constitution's floor and spec **SC-004**.
