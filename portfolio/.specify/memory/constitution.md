<!-- SYNC IMPACT REPORT
Version change: [unversioned] → 1.0.0
Added sections: Core Principles (I–V), Technology Stack, Development Workflow, Governance
Removed sections: none (initial ratification)
Modified principles: none (initial)
Follow-up TODOs: none
-->

# Portfolio Constitution

## Core Principles

### I. KISS & Maintainability (NON-NEGOTIABLE)

Every piece of code MUST be simple enough for any engineer to read and understand without
prior context. Clever tricks, over-engineering, and premature abstractions are forbidden.
If a solution requires a comment to explain WHAT it does (not WHY), it MUST be rewritten.
Prefer boring, explicit code over terse or "elegant" code.

**Rationale**: Maintainability is a first-class requirement. Code is read far more often
than it is written. Complexity compounds; simplicity compounds in the opposite direction.

### II. Test-First (NON-NEGOTIABLE)

Tests MUST be written before or alongside every feature. No feature is considered complete
without passing tests. Tests MUST be as simple to read as the production code they cover —
a test is documentation. Obscure test setups and over-mocked suites are forbidden.

**Rationale**: Tests are the safety net that enables confident change. If a test is hard
to understand, it provides false confidence and becomes a maintenance burden.

### III. Atomic Commits

Every commit MUST be small and self-contained — it MUST not mix unrelated changes.
Every commit message MUST state both **what** changed and **why** it was changed.
Format: `<type>(<scope>): <what> — <why>`.
Example: `feat(pitch): add SVG offside line — needed to visualise tactical positions`.

**Rationale**: Atomic commits make history reviewable, bisectable, and revertable.
The "why" prevents future engineers (including the author) from undoing intentional
decisions unknowingly.

### IV. Technology Stack (NON-NEGOTIABLE)

The following stack is fixed and MUST NOT be substituted without a constitution amendment:

- **Framework**: Next.js (App Router) + TypeScript — strict mode enabled.
- **Styling**: Tailwind CSS — no inline styles, no CSS-in-JS outside Tailwind utilities.
- **Animation**: Framer Motion for React-driven UI animations; GSAP + ScrollTrigger for
  scroll-sequenced and timeline animations.
- **Visualisation**: SVG football pitch rendered in-browser; no canvas unless SVG is
  demonstrably insufficient.
- **Deployment**: GitHub → Vercel (automatic preview + production deploys on push).

**Rationale**: A fixed stack eliminates decision fatigue, keeps dependencies coherent,
and ensures all tooling choices have been made deliberately upfront.

### V. Token Efficiency

All LLM-assisted work (prompts, context passed to AI tools) MUST be concise and minimal.
Prompts MUST NOT repeat information already present in files or conversation context.
Large file dumps and redundant scaffolding context are forbidden in AI requests.

**Rationale**: Token waste slows iteration and increases cost. Lean prompts also force
clearer thinking about what information is actually required.

## Technology & Quality Constraints

- TypeScript strict mode (`"strict": true`) is always on; `any` types require an explicit
  `// eslint-disable` comment with justification.
- Tailwind classes MUST be ordered consistently (use `prettier-plugin-tailwindcss`).
- GSAP ScrollTrigger instances MUST be killed in cleanup functions to prevent memory leaks.
- All SVG elements MUST have accessible `aria-label` or `role` attributes where interactive.
- Lighthouse performance score MUST remain ≥ 90 on production builds.

## Development Workflow

- **Branching**: feature branches off `main`; branch name format `feat/<slug>` or
  `fix/<slug>`.
- **CI**: GitHub Actions runs type-check, lint, and tests on every PR; merge blocked on
  failure.
- **Deploy**: Vercel preview deploy on every PR; production deploy on merge to `main`.
- **PR size**: PRs MUST map to a single, shippable unit of work. Large changes MUST be
  split into stacked PRs.
- **Review**: Every PR requires at least one approval before merge.

## Governance

This constitution supersedes all other documented practices. Any amendment requires:
1. A draft PR that updates this file with a version bump and rationale.
2. Review and approval before merge.
3. A migration note if the amendment invalidates existing code patterns.

Version bumping follows semantic versioning:
- **MAJOR**: removal or redefinition of a non-negotiable principle.
- **MINOR**: new principle or section added.
- **PATCH**: clarification, wording fix, or non-semantic refinement.

All PRs and code reviews MUST verify compliance with this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-08-09 | **Last Amended**: 2026-08-09
