# Quickstart: Minimal Nav with Hamburger Sections

Validates the feature end-to-end once implemented. See [data-model.md](./data-model.md)
for the section-link shape and [spec.md](./spec.md) for full acceptance criteria.

## Prerequisites

```sh
npm install --legacy-peer-deps
```

## Automated checks

```sh
npm run test -- HamburgerMenu StoryProgressNav
npm run type-check
npm run lint
```

Expect all `StoryProgressNav` and `HamburgerMenu` suites green, matching
FR-001–FR-011 (`spec.md`).

## Manual validation

1. `npm run dev`, open the site at `http://localhost:3000`.

2. **Minimal bar (User Story 1 / SC-001)**
   - At a wide (desktop) and a narrow (mobile) viewport, confirm the nav bar
     shows only: wordmark, hamburger toggle, social icons, email link, theme
     toggle.
   - Confirm no section labels (Introduction, Selected Work, Career Journey,
     Education, Projects, Technical Playbook, Contact) are visible without
     opening the menu, at either width.

3. **Menu contents and navigation (User Story 2 / SC-002)**
   - Click the hamburger toggle. Confirm all seven links appear, in the order
     above.
   - Click "Career Journey". Confirm the page scrolls to the Career section
     and the menu closes.
   - Reopen the menu; press Escape. Confirm it closes without navigating.
   - Reopen the menu; click outside the panel. Confirm it closes without
     navigating.

4. **Keyboard and screen reader (User Story 3 / SC-003)**
   - Tab to the hamburger toggle (do not click). Press Enter. Confirm the menu
     opens and focus lands on the first link.
   - Tab through the menu; confirm only menu links receive focus while open.
   - Press Escape. Confirm the menu closes and focus returns to the toggle.
   - With a screen reader (or by inspecting the toggle's accessible name/state
     in devtools), confirm it announces as a menu control and reports
     expanded/collapsed state.

5. **Reduced motion (Edge Case)**
   - Enable "reduce motion" at the OS level, reload, and repeat step 3.
     Confirm the menu still opens/closes, without the normal transition.

6. **Progress + performance (FR-008, SC-004)**
   - Scroll the page; confirm the progress hairline along the bar's bottom
     edge still tracks scroll position.
   - Run a production Lighthouse pass (`npm run build && npm run start`, then
     Lighthouse in Chrome DevTools) and confirm the performance score is ≥ 90.
