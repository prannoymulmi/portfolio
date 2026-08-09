# ADR 0006: Tailwind CSS v4 with `@theme inline`

- **Status**: Accepted
- **Date**: 2026-08-09

## Context

Styling approach for a portfolio with dark/light modes, custom brand
colors, and consistent spacing:

1. **CSS Modules** — scoped, framework-agnostic, verbose.
2. **Styled-components / Emotion** — runtime cost, less pleasant with
   Server Components.
3. **Tailwind v3** — proven, but requires `tailwind.config.js` for theme
   customization.
4. **Tailwind v4** — new engine, `@theme` directive in CSS, faster build,
   smaller output.

## Decision

Use **Tailwind CSS v4** with theme tokens declared in `app/globals.css`
via `@theme inline`. Dark mode uses class-based toggle (`html.dark`)
driven by the `useTheme` hook.

## Consequences

**Positive**

- Utility classes keep component files self-contained — no separate
  stylesheet to maintain per component.
- v4's Oxide engine builds ~5× faster than v3, keeping dev inner loop
  snappy.
- `@theme inline` puts brand tokens (primary, accent, border) next to
  the CSS reset, so a designer can tweak colors without touching JS.
- Class-based dark mode integrates cleanly with the `useTheme` hook
  and localStorage persistence.

**Negative**

- Long className strings can hurt readability. Mitigated by Prettier's
  tailwindcss plugin (auto-sorts + wraps).
- v4 is relatively new; some plugins (`@tailwindcss/forms`,
  `typography`) still catching up. Not needed here.
- No JS `theme()` helper access in components — but since the tokens
  are CSS vars, `var(--color-primary)` works anywhere.

## Alternatives rejected

- **CSS Modules**: fine but verbose for a design that leans heavily on
  responsive utilities.
- **Styled-components**: adds runtime and hurts Server Component ergonomics
  in the App Router.
- **Tailwind v3**: fewer risks, but v4's speed and simpler theme
  configuration are worth the small ecosystem lag.
