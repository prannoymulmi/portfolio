# ADR 0014: An icon set as a dependency

- **Status**: Accepted
- **Date**: 2026-08-10
- **Amends**: [ADR 0005](0005-gsap-and-framer-motion.md) is untouched — this adds a
  *rendering* dependency, not a fourth animation library.
- **Paired with**: constitution amendment 1.2.0, which admits this package to Principle IV.

## Context

The About chapter is being retired, and with it the only place the LinkedIn and GitHub
links lived. They move to the persistent navigation bar as small icons, reachable from any
scroll position.

Two ways to draw two brand marks: commit the SVG paths, or take a dependency. The paths
are about fifteen lines each, stable, and would need no amendment. That was the
recommendation. **The project owner chose the dependency route**, knowing it triggers
Principle IV — this record exists to argue the choice on its merits rather than treat it
as inevitable.

## Decision

Adopt **`react-icons` 5.7.0**, importing from the `react-icons/fa6` subpath so only the
glyphs actually used reach the bundle.

Confined to one component, `components/Navigation/SocialIcons.tsx`, which is the only file
that imports it.

### Why not the package this was planned around

The plan and its research selected **`@icons-pack/react-simple-icons`** — smaller install,
an explicit React 19 peer range, brand-accurate marks. It was installed, and then it
turned out **Simple Icons has no LinkedIn icon**: 6,824 exports, zero matches for
`linked`. The mark was removed from the set following a legal request from LinkedIn.

So the package could satisfy exactly half the requirement. It was uninstalled.

This is worth recording because the reasoning that selected it was sound and still wrong —
the deciding fact was not size, peer ranges, or licensing, but whether the set contains
the two specific marks the feature needs. Check that first next time.

### Trademark note

The LinkedIn and GitHub marks are trademarks of their owners. They are used here solely as
links to the profiles they identify, which is nominative use. They must not be reused
decoratively, or to imply endorsement or affiliation.

## Consequences

**Positive**

- Delivers both marks, which is the requirement. Font Awesome 6 brands still carry
  LinkedIn.
- Subpath imports keep the bundle to the two glyphs; the install footprint is a
  developer-machine cost, not a visitor cost.
- One file imports it, so replacing it later touches one file.
- No new peer conflict of its own — the install still needs `--legacy-peer-deps` for the
  pre-existing reason in [ADR 0007](0007-react-19-legacy-peer-deps.md).

**Negative**

- **An 88 MB install to render two glyphs.** Hard to defend on its own terms; it is the
  cost of the dependency route once the smaller package proved unusable.
- **`react-icons` declares `react: "*"`**, which asserts nothing about React 19
  compatibility. It works, but the peer range provides no signal if a future React breaks
  it.
- **The fixed stack has grown again.** Principle IV has now moved twice in two days
  (rough-notation, next-themes, this). Each move makes the next easier to argue for, which
  is exactly what the amendment requirement exists to slow down.
- A general icon set is now available to any future component, inviting decorative icon
  use nobody has decided on. The domain rule — brand marks only, in `SocialIcons.tsx` —
  is the mitigation.

## Alternatives rejected

- **`@icons-pack/react-simple-icons`**: the planned choice, and the better package on
  every axis except the one that matters. No LinkedIn mark, so it cannot do the job.
- **`lucide-react`**: ruled out on fact rather than preference — lucide carries no brand
  logos at all, so it can render neither mark.
- **Hand-committed SVG paths**: ~15 lines per mark, no dependency, no amendment, no
  install footprint. Offered as the recommendation and declined by the owner.
- **Text labels instead of icons**: contradicts the request.
