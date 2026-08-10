# ADR 0010: next-themes for theme state

- **Status**: Accepted
- **Date**: 2026-08-10

## Context

Theme switching was broken in four independent ways:

1. No theme control was mounted anywhere. `ThemeToggle` existed but had
   zero importers — it was rendered by `Navbar`, deleted during the story
   redesign (ADR-less change, feature `002`).
2. `dark:` utilities ignored the toggle (see [ADR 0011](0011-class-based-dark-mode.md)).
3. The CSS custom properties were separately bound to the OS media query.
4. **Flash of wrong theme.** `lib/hooks/useTheme.ts` applied the theme class
   in a `useEffect` — i.e. after hydration — so a visitor who had chosen
   dark always saw a light first paint.

Defect 4 is the one that constrains the solution. Painting in the right
theme requires the class to be on the document *before the browser paints*,
which means a synchronous script in `<head>`. No amount of `useEffect` can
achieve this; it runs after the first paint by definition.

## Decision

Adopt **`next-themes` 0.4.6** as the owner of theme state, and delete
`lib/hooks/useTheme.ts`.

`next-themes` injects a small blocking script before hydration that reads
the stored preference and sets the class, which is the only reliable fix
for the flash. It also handles storage persistence, cross-tab
synchronisation, and live system-preference tracking.

`<html>` gains `suppressHydrationWarning`, required because that script
mutates the element before React hydrates.

## Consequences

**Positive**

- Eliminates the flash of wrong theme — not reducible by any in-React fix.
- **Net code reduction**: deletes a ~45-line hand-rolled hook, adds a
  ~10-line provider wrapper.
- Gains cross-tab sync and live system-preference tracking, neither of
  which the hand-rolled hook had.
- ~2KB gzipped.
- React 19 compatible out of the box (peer range `^16.8 || ^17 || ^18 ||
  ^19`), so it contributes no new peer conflict of its own. Note the
  install still needs `--legacy-peer-deps`, but for the pre-existing
  reason recorded in [ADR 0007](0007-react-19-legacy-peer-deps.md):
  `@testing-library/react@14` pins React ^18. A bare `npm install` fails
  the same way with no new packages at all.

**Negative**

- A new dependency where the project previously had none for this, against
  the constitution's fixed-stack principle. Justified by the net reduction
  in bespoke code: the alternative is *more* custom code, not less.
- `suppressHydrationWarning` on `<html>` suppresses a real React safety
  signal for that element. Narrowly scoped and unavoidable with any
  pre-paint theming approach.
- Theme is now owned by a library rather than project code, so debugging it
  means reading their source rather than ours.

## Alternatives rejected

- **Keep and fix `lib/hooks/useTheme.ts`**: fixing the flash means
  hand-authoring a `dangerouslySetInnerHTML` inline script that reads
  storage, resolves the system preference, and writes the class before
  paint — then keeping storage, OS changes, and DOM state in sync manually.
  That is strictly *more* bespoke, easy-to-break code than the 2KB
  dependency it avoids, and exactly what Principle I exists to prevent.
- **CSS-only (`light-dark()` + `color-scheme`)**: genuinely elegant and
  needs no JavaScript, but it cannot express an explicit user choice that
  outlives the OS setting, and the codebase's hundreds of `dark:` utilities
  would all need rewriting as custom properties.
