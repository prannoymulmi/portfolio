# Specification Quality Checklist: Hero card, rebuilt to the collectible reference

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-08-11
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

- Items marked incomplete require spec updates before `/speckit-clarify` or `/speckit-plan`

### Iteration 1 — findings (resolved)

Two [NEEDS CLARIFICATION] markers were raised to the user as Questions 1 and 2:

- **FR-004 (rating block)** — the reference prints an invented composite score.
  ADR 0013 rejected exactly this on honesty grounds, so the reference and the project's
  own recorded decision disagree. No default is safe: guessing either way rewrites the
  card's most prominent element.
- **FR-007 (cut-out portrait)** — the reference portrait is background-removed and
  bleeds past the frame; the supplied photograph is a studio shot on grey. The gap
  between them decides how close to the reference the card can actually get.

Both are scope-level, which is the highest clarification priority. Everything else the
description left open was resolved with a documented default in Assumptions rather than
a marker.

### Iteration 2 — outcome

Both answered and folded into the spec (see Clarifications):

- The figure block keeps the reference's shape and prints the career total in years
  (FR-004, FR-004a). ADR 0013's years-only rule is upheld, not amended — which removes
  the only part of this feature that would have needed a decision reversed rather than
  extended.
- The cut-out is produced during implementation, with an explicit quality bar and a
  named fallback (FR-007a, SC-009), so a poor matte cannot quietly ship.

All checklist items now pass. The spec is ready for `/speckit-plan`.

### Deliberate omissions

- **No embedded checklists** in the spec — that is `/speckit-checklist`'s job.
- **No dark-mode hex values** in the requirements. FR-012 and FR-013 state the
  relationship the dark edition must hold to the light one; the values themselves are a
  planning artefact, not a requirement a stakeholder can validate.
