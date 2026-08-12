# Phase 0 Research: Parallax Gradient Scrolling

No `[NEEDS CLARIFICATION]` markers remained in the spec, so research here focuses on confirming
the technical approach against the existing codebase rather than resolving open unknowns.

## Decision: Extend `HeroDrift`, don't touch `Backdrop.tsx`

**Decision**: The four gradient layers mount as foreground children inside the Hero section,
using the existing `HeroDrift` component (or a thin sibling built on the same `useScroll`/
`useTransform` primitives). The pinned page-wide photograph in `components/Common/Backdrop.tsx`
is not modified.

**Rationale**: `docs/adr/0015-photograph-as-page-surface.md` already ran this exact question —
"does it still move?" — and rejected backdrop parallax explicitly: *"the movement that reads as
depth against one section's boundary reads as a drifting seam when there are seven."* The
depth cue was deliberately relocated to the foreground (`HeroDrift`) for that reason. Re-adding
motion to the pinned backdrop would directly reopen a decision already made and recorded; adding
new drifting layers to the *foreground*, scoped to the Hero section the way `HeroPortrait` and
the role bars already are, stays inside that decision rather than reversing it.

**Alternatives considered**:
- **New pinned/fixed gradient layer behind or above `Backdrop.tsx`, parallaxed**: rejected — this
  is the exact case ADR 0015 ruled out ("the movement ... reads as a drifting seam"). Would also
  require an ADR to reopen a superseded decision.
- **CSS `background-attachment: fixed` for a "cheap" parallax**: rejected — unreliable and janky
  on iOS Safari, already noted as a rejected approach in `Backdrop.tsx`'s own comments and ADR 0015.
  Also bypasses the image optimizer, which Principle IV forbids for background imagery.

## Decision: Reuse Framer Motion, not GSAP + ScrollTrigger

**Decision**: Build the gradient-layer drift on the same Framer Motion `useScroll`/`useTransform`
primitives `HeroDrift` already uses, rather than introducing GSAP + ScrollTrigger for this feature.

**Rationale**: `HeroDrift` already implements scroll-linked transform-only motion in this exact
section, including the reduced-motion-safe read-before-first-paint pattern the spec's P3 story
requires. Introducing GSAP ScrollTrigger for the *same section* would mean two scroll-animation
systems solving one problem in one place — a concrete KISS (Principle I) violation. The
constitution's per-library domain split (GSAP for "scroll-sequenced ... motion", Framer for
"component entrance, exit, and interaction") is written for the general case; the specific case
of extending an already-shipped scroll-linked component in the same file is better served by
consistency than by a literal domain match. No new dependency is added either way.

**Alternatives considered**:
- **GSAP + ScrollTrigger**, matching the constitution's literal domain assignment: rejected for
  this feature specifically — would duplicate `HeroDrift`'s scroll-read logic in a second library
  inside the same component tree, and `HeroDrift` must still exist for the portrait/role-bar drift
  it already does. A future refactor that migrates *all* scroll-linked motion to GSAP is a separate,
  larger decision outside this feature's scope.

## Decision: Images through `next/image`, sized and formatted for web delivery

**Decision**: Each gradient PNG is rendered via `next/image` (`fill` or fixed dimensions matching
its container), not CSS `background-image`.

**Rationale**: Matches the existing `Backdrop.tsx` and `HeroPortrait.tsx` pattern and the
constitution's explicit rule ("never as a CSS `background-image`, which bypasses [the optimizer]").
Source assets are 1600×900 PNGs; `next/image` will serve responsive AVIF/WebP variants sized to
their rendered dimensions, keeping combined load time within the ≤200ms budget in SC-002.

**Alternatives considered**:
- **Raw `<img>` or CSS background**: rejected — bypasses the image optimizer (same reasoning as
  ADR 0015's rejection of the original JPEG background-image usage).
- **Convert to SVG/gradient-defined-in-CSS**: rejected — the four assets are pre-rendered mesh
  gradients (soft, hand-tuned color blends), not something a CSS `linear-gradient` reproduces
  faithfully; out of scope to redo the art direction.

## Open questions resolved by informed default (documented in spec Assumptions)

- **Which layer gets which drift strength / z-order**: left to implementation, following
  `HeroDrift`'s existing strength scale (role bars at 24, portrait at 28) — new layers should sit
  outside that range as background-most, e.g. lower strengths for slower/farther layers.
- **Mobile behavior**: desktop-first per spec Assumptions; drift strength may need reducing rather
  than removing on narrow viewports, consistent with `HeroDrift`'s existing `MAX_DRIFT` clamp.
