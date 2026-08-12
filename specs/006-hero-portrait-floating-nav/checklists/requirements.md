# Specification Quality Checklist: Portrait hero and floating navigation

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-12
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

Three scope questions were resolved with the owner before the spec was written,
rather than left as clarification markers:

1. **Player card data** — dropped from the opening outright. The reference
   image's credential chips and statistics strip were offered and declined, and
   are recorded in Out of Scope.
2. **Navigation labels** — the seven sections that actually exist keep their
   names. The reference image's labels (including a Blog the site does not have)
   were declined.
3. **Email placement** — the floating navigation and the Contact chapter. The
   footer was offered and not selected.

Two items were reviewed closely against the "no implementation details" rule and
kept deliberately:

- **FR-021** (icons drawn inline, not from the icon library) reads as a technical
  constraint, but it restates a binding project rule that reserves the icon
  library for brand marks. Leaving it out would let planning violate the
  constitution.
- **FR-025** (ADR and constitution amendment in the same pull request) is a
  governance obligation triggered by removing the card, surfaced by the
  pre-spec constitution gate. It is a delivery requirement, not a design one, and
  is cheaper to plan for than to retrofit.

Both were judged in-scope for the spec because they constrain *what may be
delivered*, not *how to build it*.

## Clarify session 2026-08-12

Five questions asked and answered — the session quota. All recorded in the
spec's Clarifications section.

| # | Question | Requirements touched |
|---|----------|----------------------|
| 1 | Separating the portrait from its grey studio background | FR-003, FR-004 rewritten; FR-004a, FR-004b added; SC-002 widened |
| 2 | Where the email address is stored | FR-022 rewritten; FR-022a added; FR-021 extended to the envelope glyph |
| 3 | Floating nav at 375px | FR-016a, FR-016b, FR-016c added; SC-004 widened |
| 4 | Portrait framing when stacked | FR-005a, FR-005b added; SC-004a added |
| 5 | Portrait drift on scroll | FR-006a added |

No `[NEEDS CLARIFICATION]` markers were introduced or remain.

**"No implementation details" was re-examined and kept checked, with reservation.**
The Clarifications section now names CSS techniques (positional masks,
`mix-blend-mode`), an image property (`hasAlpha`) and delivery formats
(WebP/AVIF). That is more technical than the rest of the spec.

It was kept because the detail is *rejected alternatives and the reason the
requirement reads as it does* — the "Constraints & Tradeoffs" category — not
build instructions. Without it, a future reader sees "no grey background may be
visible" and reasonably reaches for a CSS fade, which cannot satisfy it. The
cheapest place to prevent that rework is here.

If this section is ever trimmed for a non-technical audience, the four bullets
under the Q/A are the ones to cut; the requirements themselves stay readable
without them.

**Still verified by inspection, not automation**: FR-004, FR-004a and SC-002 are
visual criteria with no test that can assert them. The cut-out was checked
against transparency, the sunset backdrop and the dark surface at 3x zoom before
the asset was committed, but nothing in CI will catch a regression here.
