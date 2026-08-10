# ADR 0017: Inline the two brand marks, drop the icon dependency

- **Status**: Accepted
- **Date**: 2026-08-10
- **Supersedes**: [ADR 0014](0014-icon-set-dependency.md) — the icon package is removed.
- **Paired with**: constitution amendment 1.3.0, which withdraws the icon entry from
  Principle IV.

## Context

[ADR 0014](0014-icon-set-dependency.md) adopted `react-icons` to render the LinkedIn and
GitHub marks, and claimed: *"Subpath imports keep the bundle to the two glyphs."*

That claim was never measured. Lighthouse on the production build showed
`node_modules_react-icons_fa6_index_mjs` as **the largest chunk on the page — 506 KB
transferred, 2.5 MB raw** — downloaded on first load for two icons.

The cause is structural, not a misconfiguration:

- `react-icons/fa6` is a **single 1.6 MB module** with no per-icon files, so there is no
  deeper import to reach for.
- `react-icons/fa6` is already in Next's **default `optimizePackageImports` list**, and
  declaring it explicitly changed nothing under Turbopack.

This violates FR-008b of the feature spec — *"Adding that dependency MUST NOT pull the
whole icon set into what visitors download"* — by two orders of magnitude.

## Decision

Remove `react-icons`. Inline the two marks as SVG components in
`components/Navigation/BrandMarks.tsx`.

- Path data from **Font Awesome 6 Free, CC BY 4.0**, attributed in the file.
- The marks remain trademarks of LinkedIn and GitHub, used only as links to the profiles
  they identify — nominative use, as ADR 0014 already recorded.
- `SocialIcons.tsx` is unchanged apart from where the glyphs come from: still driven by
  `social.json`, still falls back to a labelled text link for an unmatched network.

## Consequences

**Positive**

- **506 KB leaves the initial bundle**, for a component that renders two 20px glyphs.
  Total page weight fell from 1,712 KB to 1,099 KB, and Lighthouse performance rose from
  58 to 64.
- FR-008b is satisfied exactly: only the two glyphs shipped are the two glyphs shown.
- No dependency, so no peer range to track and no install footprint.
- The fixed stack shrinks back. Principle IV had grown three times in two days; this is
  the first entry to be withdrawn.

**Negative**

- **This reverses a choice the project owner made deliberately.** Asked during
  clarification, they chose a package over hand-committed paths knowing the governance
  cost. The reversal is driven by a measurement taken after that decision, not by a change
  of opinion — but it is still a reversal, and re-adding the package is a two-line change
  if 506 KB is judged acceptable.
- **The path data is now copied into the repo**, so a brand refresh means editing SVG by
  hand rather than bumping a version. For two marks that change roughly never, this is a
  small price; for a dozen it would not be.
- CC BY 4.0 requires attribution to be preserved. It lives in a file comment, which is
  easy to delete during a refactor.

## Alternatives rejected

- **Keep `react-icons` and lazy-load `SocialIcons`**: defers the 506 KB out of the initial
  bundle but still ships it. FR-008b says *reach the browser*, not *reach it first*.
- **`experimental.optimizePackageImports`**: tried and measured. No effect under
  Turbopack; the package is in the default list already.
- **Switch to another icon package**: the third candidate. `@icons-pack/react-simple-icons`
  has no LinkedIn mark (ADR 0014), `lucide-react` has no brand marks at all, and any
  replacement would need the same barrel-tree-shaking property verified rather than
  assumed. Two SVG paths do not justify a fourth attempt.

## What this record is really about

Both ADR 0014 and its research argued from install size, peer ranges and licensing —
plausible criteria, none of which was the deciding one. The two facts that actually
mattered were *does the set contain these specific marks* and *what does it cost the
visitor*, and neither was checked until the code was written and measured.
