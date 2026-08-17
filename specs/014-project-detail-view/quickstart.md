# Quickstart: Validate Featured Project Detail View

## Prerequisites

- Dependencies installed: `npm install --legacy-peer-deps`
- On branch `feat/project-detail-view`

## Run the app

```sh
npm run dev
```

Open `http://localhost:3000`, scroll to "Featured Projects".

## Manual validation scenarios

Each maps to an acceptance scenario in [spec.md](./spec.md).

1. **Read the full description** (spec US1)
   - Click any project card.
   - Expected: a centered modal opens over a dimmed backdrop; the
     description text is complete, with no trailing "..." (compare against
     the full `bodyText` for that project in `public/data/projects.json`).
   - Close via the ✕ control, then reopen and close by clicking the dimmed
     backdrop, then reopen and close via `Escape`. Expected: all three close
     the modal and return you to the same scroll position.

2. **Go to the project on GitHub** (spec US2)
   - With a modal open, locate the GitHub link.
   - Expected: visible without scrolling inside the modal; opens the
     project's repository in a new tab; the portfolio tab stays open and
     the modal stays open behind it.

3. **Discover more projects on GitHub** (spec US3)
   - Without opening any modal, look at the "Featured Projects" section
     heading area.
   - Expected: a link reading something like "More on GitHub" is present,
     visually lighter than the project cards and their own GitHub links.
     Activating it opens `https://github.com/prannoymulmi` in a new tab.

4. **Keyboard-only pass** (spec SC-005, FR-004/FR-005)
   - Tab to a project card (no mouse). Press Enter. Expected: modal opens,
     focus moves inside it.
   - Press Tab repeatedly. Expected: focus cycles only among the modal's own
     controls (close button, GitHub link) — it never reaches page content
     behind the modal.
   - Press Escape. Expected: modal closes, focus returns to the card that
     opened it.

5. **Reduced motion** (spec FR-010)
   - Enable "Reduce motion" in OS accessibility settings (or emulate via
     Chrome DevTools Rendering tab → "Emulate CSS media feature
     prefers-reduced-motion: reduce").
   - Open and close a modal. Expected: the panel appears/disappears without
     the sliding/scaling transition used when reduced motion is off.

6. **Missing optional fields** (spec Edge Cases)
   - Open a project whose data has no `role` or `metric` (or temporarily
     remove one in `public/data/projects.json` for this check).
   - Expected: that field's row is simply absent — no empty label, no
     placeholder text.

## Automated checks

```sh
npm run type-check
npm run lint
npm test
npm run build
```

All four MUST pass before this feature is considered complete (Constitution
II — Test-First; new/updated specs live in `tests/unit/components/`).
