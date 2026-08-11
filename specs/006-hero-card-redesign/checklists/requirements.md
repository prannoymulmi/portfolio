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

### Iteration 3 — `/speckit-clarify` session, 2026-08-11

Four questions asked and integrated. Checklist held at 16/16 throughout; no item
changed state, because the spec was already internally consistent — what the session
removed was under-specification, not error.

- **Phone layout** (FR-020a, SC-003) — legibility wins over proportion; 14px floor,
  full anatomy at every width. Previously the spec stated the constraint and left the
  resolution open, which would have surfaced as a disagreement during implementation.
- **Retiring elements** (FR-018a) — stat pills, star rating, soft-skill bars and blurb
  are removed with their content fields. This was an Assumption; it is now a confirmed
  requirement, which matters because it deletes components and schema.
- **Motion** (FR-023, FR-023a, SC-010) — exactly one treatment, a foil sheen. The spec
  previously conditioned motion without establishing that any existed.
- **Desktop proportion** (FR-021a) — the opening stays two columns; the card widens but
  does not dominate.

Three validation fixes applied in the same pass, all authoring slips rather than
findings: the card's own element is now consistently the **figure block** (the
reference's is its *rating block*), SC-008/SC-009 were out of numeric order, and SC-001
counted "11 of 11 elements listed in FR-001 to FR-010" against a list of ten
requirements — it now points at the eleven-element enumeration in User Story 1.

### Deliberate omissions

- **No embedded checklists** in the spec — that is `/speckit-checklist`'s job.
- **No dark-mode hex values** in the requirements. FR-012 and FR-013 state the
  relationship the dark edition must hold to the light one; the values themselves are a
  planning artefact, not a requirement a stakeholder can validate.
