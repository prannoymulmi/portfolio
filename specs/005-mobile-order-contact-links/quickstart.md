# Quickstart: Validating feature 005

**Feature**: 005-mobile-order-contact-links | **Date**: 2026-08-11

How to prove the three stories work. Each section stands alone — the stories share no
code, so they can be verified in any order or individually.

## Prerequisites

```bash
npm install --legacy-peer-deps   # ADR 0007 — required in every environment
```

## Full check

```bash
npx tsc --noEmit && npx eslint components lib tests && npx jest && npx next build
```

All four must pass before the feature is done. `next build` is included because the
production build type-checks separately from `tsc` and catches App Router issues the
test suite cannot.

---

## US1 — Mobile reading order

### Automated

```bash
npx jest tests/unit/components/Hero.test.tsx
```

Expected assertions (see [plan.md](plan.md) § Design Notes):

- The role list, the intro, the bio, and the CTA block all precede the player card in
  document order.
- Neither grid cell carries an `order-*` utility — the regression guard. A test that
  only checks DOM order would still pass if someone re-added `order-1`/`order-2`,
  because `order-*` does not move nodes in the DOM. This assertion is the one that
  actually protects the fix.
- `min-w-0` survives on both cells.

### Manual

1. `npm run dev`, open `http://localhost:3000`.
2. Device toolbar → any phone width (e.g. 390 × 844).
3. **Expect**: the first thing on screen is "Software Engineer." — not the portrait.
   Scroll down: intro → bio → View Work / Play Career → CV link → player card.
4. Widen past 1024px. **Expect**: text left, card right — identical to before this
   feature. Compare against `git stash` or the previous deploy if in doubt.
5. Tab from the top of the page at phone width. **Expect**: focus moves through the
   text and buttons before reaching anything in the card.

### Accessibility spot-check

With VoiceOver (⌘F5) at phone width, navigate the opening section. The announced
sequence must match the visual one. Before this feature it did not — that divergence is
the WCAG 1.3.2 failure the fix closes.

---

## US2 — LinkedIn address

### Automated

```bash
npx jest tests/integration/content-sources.test.ts tests/unit/components/SocialIcons.test.tsx tests/unit/components/Footer.test.tsx
```

Expected assertions:

- The LinkedIn entry in `public/data/social.json` equals
  `https://www.linkedin.com/in/prannoy-mulmi-0617026b/`.
- No `social.json` exists anywhere in the repository outside `public/data/` — this is
  what fails if someone restores `app/data/social.json`.
- `SocialIcons` and `Footer` render an anchor whose `href` is the address from content,
  proving neither hardcodes it.

### Manual

1. `npm run dev`.
2. Click the LinkedIn glyph in the top navigation. **Expect**: the owner's profile.
3. Scroll to the footer, click LinkedIn there. **Expect**: the same profile.
4. `git status` — `app/data/social.json` is deleted, nothing else in `app/data/` is.

---

## US3 — CV link

The address is supplied by the owner and is not in the repository yet, so there are two
valid states to verify.

### State A — `cv` absent (the shipping state until the URL arrives)

```bash
npx jest tests/unit/components/CvLink.test.tsx
```

1. Confirm `public/data/home.json` has no `cv` key.
2. `npm run dev`. **Expect**: the opening section renders normally with no CV link and
   no gap, placeholder, or console error. This is FR-014, not a bug.

### State B — `cv` present

1. Add to `public/data/home.json`:

   ```jsonc
   "cv": { "label": "Download CV", "href": "https://example.com/cv.pdf" }
   ```

2. `npm run dev`. **Expect**:
   - "Download CV" appears as small text directly under the two buttons — visibly
     lighter and smaller than either, clearly not a third button.
   - Clicking it opens the address in a **new tab**; the portfolio stays open behind it
     at the same scroll position.
   - Tab to it: a visible focus ring appears; Enter activates it.
   - Its accessible name says what it is and that it opens in a new tab.
3. Toggle dark mode and re-check legibility over the photograph at both themes. The link
   uses the `text-on-photo` token, which is already AA-verified against the backdrop
   (ADR 0015) — this is a confirmation, not a new measurement.
4. Break it deliberately: set `"href": "not-a-url"`. **Expect**: the opening section
   fails to render (schema rejection at load), proving validation is wired.
   Then set `"label": "X"`. **Expect**: the same. Restore or remove the key afterwards.

### Schema bounds

```bash
npx jest tests/unit/validation.test.ts
```

Covers: label under 2 and over 40 characters rejected, malformed `href` rejected, the
whole `cv` object omitted accepted.

---

## Constitution gate before merge

- [ ] `npx jest` — full suite green
- [ ] `npx tsc --noEmit` and `npx eslint` clean
- [ ] `npx next build` succeeds
- [ ] Lighthouse performance ≥ 90 on the production build (nothing here should move it —
      no new dependency, no new image, no runtime fetch)
- [ ] ADR 0017 written and added to `docs/adr/README.md`, in the same PR (Principle VI)
- [ ] Commits split per [plan.md](plan.md) § Commit plan (Principle III)
