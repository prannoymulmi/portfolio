# ADR 0011: Class-based dark mode over the OS media query

- **Status**: Accepted
- **Date**: 2026-08-10
- **Supersedes**: the appearance-switching mechanism in [ADR 0006](0006-tailwind-v4.md).
  ADR 0006 otherwise stands — Tailwind v4 with `@theme inline` remains the
  styling approach; only the trigger for `dark` changes.

> **Amended 2026-08-12 by [ADR 0019](0019-dark-mode-behind-an-experiment-flag.md).**
> The class mechanism below is unchanged and still how dark mode works. What no
> longer holds is the precedence: the OS preference is not consulted at all any
> more, and the toggle that sets the class only exists under `?experiment=true`.
> The "Negative" note about first-time visitors depending on JavaScript to
> resolve the OS setting is moot — there is nothing to resolve.

## Context

Appearance was driven entirely by `prefers-color-scheme`, in two places:

- Tailwind's default `dark` variant, which compiles to a
  `@media (prefers-color-scheme: dark)` query.
- A `@media (prefers-color-scheme: dark)` block in `app/globals.css`
  overriding `--background`, `--foreground`, and `--border`.

Meanwhile `lib/hooks/useTheme.ts` was adding a `.dark` class to `<html>`.
Nothing consumed that class, so the toggle appeared to do nothing: hundreds
of `dark:` utilities across the codebase kept following the operating
system regardless of what the visitor chose.

The feature requires an explicit visitor choice to take precedence over the
OS setting, which a media query cannot express.

## Decision

Bind Tailwind's `dark` variant to a class instead of the media query, using
Tailwind v4's CSS-first custom variant in `app/globals.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

And move the custom-property overrides from the media-query block onto a
`.dark` selector.

Tailwind v4 removed the v3 `darkMode: 'class'` JavaScript config option;
`@custom-variant` is its replacement. The `:where()` wrapper keeps the
selector at zero specificity so the variant cannot outrank unrelated
utilities.

## Consequences

**Positive**

- One CSS declaration makes every existing `dark:` utility in the codebase
  respond to the toggle. No per-component edits — the alternative would
  have touched hundreds of call sites.
- Explicit choice can now outrank the OS, which is the required behaviour.
- Custom properties and Tailwind utilities share a single source of truth
  (the class), instead of two mechanisms that could disagree.

**Negative**

- First-time visitors now depend on JavaScript to resolve the OS
  preference, where the media query worked with JS disabled. Mitigated by
  the pre-paint script from [ADR 0010](0010-next-themes-for-theme-state.md),
  but with JS fully off the site renders light regardless of OS setting.
- `:where()` zero specificity means a plain `.dark` override written by
  hand elsewhere would silently outrank the variant. Contributors should
  use `dark:` utilities rather than hand-rolled `.dark` selectors.
- The background accent added in feature `002` uses `dark:invert`, which
  now inverts on explicit choice rather than OS. Intended, but it is a
  behaviour change worth knowing about.

## Alternatives rejected

- **Rewrite components to use custom properties instead of `dark:`
  utilities**: touches hundreds of call sites to solve what one CSS
  declaration solves.
- **Keep the media query and layer a class on top**: two competing sources
  of truth. An OS change would still fight an explicit choice, which is the
  bug being fixed.
