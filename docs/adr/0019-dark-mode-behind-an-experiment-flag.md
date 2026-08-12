# ADR 0019: Dark mode ships behind an experiment flag

- **Status**: Accepted
- **Date**: 2026-08-12
- **Amends**: the resolution precedence in
  [ADR 0011](0011-class-based-dark-mode.md). The class-based mechanism stands
  unchanged; what changes is who gets to reach it, and that the OS preference
  is no longer a source of truth at all.

## Context

The dark design had fallen behind the light one. Every chapter that landed
after the photograph became the page surface ([ADR 0015](0015-photograph-as-page-surface.md))
was designed against the light composite and checked against it; the `dark:`
half of each utility pair was carried along rather than looked at. The site
was, in practice, shipping one finished design and one that merely compiled.

The first attempt at fixing this deleted the second theme outright — a sweep
across 32 files, plus a constitution amendment forbidding `dark:` from coming
back. That solves the maintenance problem by removing the option, and removing
the option is the part that has to be reversible: the dark design is unfinished,
not unwanted.

## Decision

Keep the dark design in the tree and gate the only way to reach it.

- The toggle renders **only** when the URL carries `?experiment=true`
  (`lib/utils/experiment.ts`). No param, no control.
- The default theme is `light` and `enableSystem` is **off**. Following the OS
  would hand an unfinished design to every visitor whose machine is set dark —
  the one group who never asked for it and, with the toggle hidden, could not
  leave.
- A stored `dark` choice is reset to `light` on any load without the flag
  (`ThemeExperimentGuard`), so stepping out of the experiment cannot strand a
  visitor in a theme they have no control to exit.
- `color-scheme` moves into `globals.css`, keyed off the same `.dark` class as
  everything else, so scrollbars and form controls follow the applied theme
  rather than the OS. `theme-color` drops its `prefers-color-scheme` pair for a
  single light value, for the same reason.

The flag has two readers, and the difference matters. Rendering uses the hook;
anything that _acts_ on the flag calls `isExperimentEnabled()` and reads the
address bar itself. The hook must report `false` during the hydration render so
the client's first pass matches the server's, which makes its `false` ambiguous
between "off" and "not read yet" for exactly one commit — long enough for an
effect to fire its off-branch on a visitor who is in the experiment. That is not
hypothetical: the guard below was written that way first and reset every stored
dark choice on load, while the client-only tests passed throughout — they never
hydrate, so that commit does not exist in them.

The flag is read through `useSyncExternalStore` rather than `useSearchParams`.
`useSearchParams` opts its whole subtree out of static rendering unless wrapped
in Suspense, and this flag is consulted from chrome that renders on every page.
Its server snapshot is `false`, which is also the honest answer for a flag: off
is the state the server and every first paint share.

## Consequences

**Positive**

- The dark design keeps its history and its call sites. Finishing it is a
  design problem again, not a re-implementation.
- Nobody is served the unfinished theme by accident — not by an OS setting, not
  by a stale localStorage entry from a past visit.
- The mechanism generalises. `?experiment=true` is not theme-specific; the next
  unfinished thing can hide behind the same param instead of a branch.

**Negative**

- The `dark:` utilities stay in 22 components, and every future component
  either carries them or quietly widens the gap between the two designs. This
  ADR does not fix the drift that motivated the deletion — it buys time to fix
  it deliberately.
- A visitor who used the experiment and returns on a plain URL gets one frame of
  dark before the guard resets it. The pre-paint script cannot see the query
  string, so this cannot be fixed on the client without a flash somewhere; it is
  accepted because the audience for that frame is whoever is building the theme.
- The dark path is only exercised by someone who knows the param exists.
  Regressions in it will be found late.

## Alternatives rejected

- **Delete the second theme** (the previous attempt, now reverted): correct
  about the cost, wrong about the remedy. Deleting is cheap to do and expensive
  to undo, which is the wrong way round for something unfinished.
- **An environment variable or build-time flag**: needs a deploy to flip, so the
  dark design could not be looked at on the live site — which is where the
  photograph, the scrims and the type actually compose.
- **Keep `defaultTheme="system"` and hide only the button**: the failure mode
  this whole ADR exists to prevent. It serves the unfinished design, by default,
  to exactly the visitors who cannot switch away from it.
