# Contract: Theme Behaviour

The observable contract for appearance switching. Satisfies FR-010 – FR-016 and SC-002 – SC-004, SC-007, SC-009.

## Resolution precedence

Highest wins:

1. **Explicit stored choice** — the visitor used the toggle at any point in the past.
2. **Operating-system preference** — no stored choice exists.

An OS change never overrides a stored choice (FR-013). An OS change *is* followed live when no choice is stored (FR-014).

## Guarantees

| # | Guarantee | Requirement |
|---|---|---|
| T1 | A visible, keyboard-reachable light/dark control is present on every part of the page | FR-010, SC-009 |
| T2 | Activating the control updates the entire page — sections, background accent, and hero annotations — with nothing left in the previous theme | FR-011, SC-002 |
| T3 | The choice survives reload and browser restart | FR-012, SC-003 |
| T4 | First paint is already in the correct theme; no flash of the opposite theme | FR-015, SC-004 |
| T5 | With no stored choice, the site opens matching the OS | FR-014 |
| T6 | Text meets WCAG AA contrast in both themes, including annotated phrases | FR-016, SC-007 |

## Mechanism

- **Applied as**: a `dark` class on the document root. Absent = light.
- **Consumed by**: Tailwind's `dark` variant (rebound from the OS media query to this class) and the CSS custom properties in `globals.css`.
- **Set before paint**: a synchronous script runs ahead of hydration to apply the class, which is what makes T4 possible.

## Out of contract

- A three-way light/dark/system control. Following the OS is the pre-choice default, not a selectable option (spec Assumptions).
- Per-section or per-component theme overrides. Theme is global.
- Server-side persistence. The preference is per-browser.
