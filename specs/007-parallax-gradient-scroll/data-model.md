# Phase 1 Data Model: Parallax Gradient Scrolling

This feature has no persisted data, API payloads, or database entities — it is a client-side
visual/motion feature. The "entities" below are component-level concepts that shape the
implementation, not data stored or transmitted anywhere.

## Gradient Layer

Represents one decorative gradient image drifting in the Hero section's foreground.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `src` | string | Path under `public/images/` (`gradient-hero.png`, `gradient-text.png`, `mesh-soft.png`, `mesh-soft-flip.png`) | Must resolve to an existing asset |
| `strength` | number | Pixels of drift travel over `HeroDrift`'s scroll window (`DRIFT_OVER`), same unit `HeroDrift` already uses for the portrait (28) and role bars (24) | `0 < strength <= MAX_DRIFT` (existing clamp, 80px) |
| `zIndex` | number \| CSS layer order | Determines stacking relative to `HeroPortrait`, role bars, and the pinned `Backdrop` | Must render behind foreground text/portrait, ahead of the pinned `Backdrop` (`-z-10`) |
| `opacity` | number (0–1) | Blend intensity against existing scrim/photograph | Chosen so `text-on-photo` contrast (ADR 0015, §Decision) is not degraded |

No relationships to other entities — each layer is independent. No state transitions; a layer's
only "state" is its scroll-derived transform, which is derived (not stored) on every frame via
`useTransform`, exactly as `HeroDrift` already does for `HeroPortrait`.

## Reduced-Motion State

Not a new entity — reuses `HeroDrift`'s existing `prefersReducedMotion` boolean, read once via
`matchMedia('(prefers-reduced-motion: reduce)')` before first paint, and updated on the
`change` event. Gradient layers consume the same flag; no per-layer duplication of this logic.
