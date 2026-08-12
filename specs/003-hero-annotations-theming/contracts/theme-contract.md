# Contract: Theme Behaviour

The observable contract for appearance switching. Satisfies FR-010 – FR-016 and SC-002 – SC-004, SC-007, SC-009.

> **Amended 2026-08-12 by [ADR 0019](../../../docs/adr/0019-dark-mode-behind-an-experiment-flag.md).**
> The dark design is unfinished and now sits behind an experiment flag. Every
> guarantee below holds only for a visitor who opened the site with
> `?experiment=true`; without it there is no control, and no way to leave light.

## Resolution precedence

Highest wins:

1. **The experiment flag** — without `?experiment=true` in the URL the theme is light, full stop, and any stored choice is reset to light on load.
2. **Explicit stored choice** — the visitor used the toggle at any point in the past.

The operating-system preference is no longer consulted (was rank 2). Following it
would serve the unfinished design to a visitor who never asked for it and has no
control to escape it. FR-014 is suspended for as long as the flag stands; FR-013
holds within the experiment.

## Guarantees

| # | Guarantee | Requirement |
|---|---|---|
| T1 | Under the flag, a visible, keyboard-reachable light/dark control is present on every part of the page; without it, no control renders at all | FR-010, SC-009, ADR 0019 |
| T2 | Activating the control updates the entire page — sections, background accent, and hero annotations — with nothing left in the previous theme | FR-011, SC-002 |
| T3 | The choice survives reload and browser restart | FR-012, SC-003 |
| T4 | First paint is already in the correct theme; no flash of the opposite theme | FR-015, SC-004 |
| T5 | The site opens light whatever the OS says | ADR 0019 (replaces FR-014) |
| T6 | Text meets WCAG AA contrast in both themes, including annotated phrases | FR-016, SC-007 |

## Mechanism

- **Applied as**: a `dark` class on the document root. Absent = light.
- **Consumed by**: Tailwind's `dark` variant (rebound from the OS media query to this class) and the CSS custom properties in `globals.css`.
- **Set before paint**: a synchronous script runs ahead of hydration to apply the class, which is what makes T4 possible.

## Out of contract

- A three-way light/dark/system control. Following the OS is the pre-choice default, not a selectable option (spec Assumptions).
- Per-section or per-component theme overrides. Theme is global.
- Server-side persistence. The preference is per-browser.
