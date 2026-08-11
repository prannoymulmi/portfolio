# Specification Quality Checklist: Mobile reading order, corrected LinkedIn link, and a CV link

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

- **Iteration 1 findings, since fixed:**
  - Success criteria named breakpoint pixel values and CSS ordering behaviour.
    Reworded to "narrow (phone-width)" / "wide (desktop)" and moved the breakpoint
    detail into Assumptions as a deliberate reuse of the existing threshold.
  - FR-007 originally named `app/data/social.json` directly. Generalised to "any
    unserved duplicate copy"; the concrete path stays in Assumptions as context for
    why the wrong address is the one being served.
  - The CV's placement was the only genuinely open decision ("somewhere"). Resolved
    as an informed default beside the two existing calls to action, recorded in
    Assumptions with the reasoning, rather than left as a clarification marker.

- **Clarification session 2026-08-11 (3 questions)** — all three answers tightened
  requirements rather than adding any:
  - The CV is externally hosted and never committed to the repository. FR-010 and
    FR-014 are new; the "supply the PDF" dependency became "supply the address".
  - FR-007 previously read "either brought into agreement **or** removed" — an
    untestable either/or in a MUST. Now a single instruction: delete the duplicate.
  - CV placement moved from a documented assumption to a stated requirement
    (FR-008), including where it must *not* go.

- **One item for the owner's attention, not a spec defect**: the CV remains publicly
  reachable by anyone with the address — hosting it elsewhere keeps it out of git
  history but does not make it private. Recorded under Dependencies. Worth confirming
  the document carries no home address or phone number before the link goes live.

- Items marked incomplete require spec updates before `/speckit-clarify` or `/speckit-plan`
