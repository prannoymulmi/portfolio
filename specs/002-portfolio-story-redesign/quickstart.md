# Quickstart: Validating the Story-Driven Portfolio Redesign

## Prerequisites

- Dependencies installed: `npm install`
- Dev server buildable: `npm run type-check` and `npm run lint` pass

## Run it

```bash
npm run dev
```

Open `http://localhost:3000/`.

## Validation scenarios

1. **Single continuous story** (SC-001, SC-002): Scroll from top to bottom on `/`. Confirm every chapter appears in order — Introduction, About, Skills, Career, Education, Projects, Playbook, Contact — with no click-through required.
2. **No persistent nav bar** (FR-002): Confirm no top navigation bar with page links is rendered on `/` at any scroll position, on both desktop and mobile viewport widths.
3. **In-page jump still works** (FR-007): Use the `StoryProgressNav` control (or keyboard skip-link) to jump directly to a section (e.g., Contact) without scrolling through the whole page. Tab through it with keyboard only and confirm focus order is sensible.
4. **Career journey stays interactive** (SC-003, User Story 2): Scroll to the Career chapter and interact with a milestone exactly as on the current standalone `/career` page — behavior must be unchanged.
5. **Gradient background & contrast** (SC-004): Load the page in both light and dark mode (toggle via `ThemeToggle`). Confirm the gradient renders and check text contrast with a browser accessibility inspector (WCAG AA).
6. **Profile picture placeholder** (SC-005): With no `imageSource` set in `about.json`/`home.json`, confirm a clearly-intentional placeholder graphic renders (not blank space, not a broken image). Add a real `imageSource` value and confirm the placeholder is replaced with no layout break.
7. **Legacy redirects** (SC-006): For each of `/skills`, `/career`, `/education`, `/projects`, `/playbook`, `/about`, `/contact`, load the URL directly and confirm a 308 redirect lands on the matching anchor per [contracts/legacy-redirects.md](./contracts/legacy-redirects.md). No 404s.
8. **Reduced motion** (Edge Cases): Enable `prefers-reduced-motion` in the OS/browser and reload. Confirm scroll-linked and gradient animation is suppressed or minimized while content remains fully readable and navigable.

## Automated checks

```bash
npm run type-check
npm run lint
npm test
```

Tests should cover: all sections render on `/`, nav bar is absent, each legacy path redirects to its anchor, and the profile placeholder renders when `imageSource` is missing (per constitution Principle II — tests alongside implementation).
