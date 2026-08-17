<!-- SYNC IMPACT REPORT
Version change: 1.4.0 → 1.5.0
Modified principles:
  - IV. Technology Stack (NON-NEGOTIABLE) — the Deployment bullet's install
    command changes from npm with `--legacy-peer-deps` to pnpm (`pnpm install`,
    version-pinned via `package.json`'s `packageManager` field). This is a
    substitution, not an extension: Governance requires an ADR and an amendment
    together for any Principle IV change, and both land in this batch of work
    (ADR 0022). ADR 0007 is not rewritten or deleted — its record of the
    underlying React 19 peer-dependency decision still stands, and it gains a
    dated note pointing at ADR 0022 for the install-command specifics, per
    Principle VI's own no-rewrite rule. ADR 0022 supersedes ADR 0007's
    install-command guidance only, not its React 19 decision.
Added sections: none
Removed sections: none
Follow-up TODOs: none
Note: this is a package-manager swap (npm → pnpm), not a stack or framework
change — motivated by pnpm's shared content-addressable store (smaller
`node_modules` per install, larger savings across every pnpm project sharing
the same machine) and by keeping tooling current. No dependency versions
changed and no runtime behavior of the deployed site is affected; this is
purely which tool installs the same dependency tree. Done directly on `main`
per this feature's pre-approved no-branch/no-PR deviation (spec Assumptions,
015-pnpm-migration) — "same PR" in the Governance rule below is satisfied here
by "same batch of commits on `main`."

--- previous ---
Version change: 1.3.0 → 1.4.0
Modified principles:
  - IV. Technology Stack (Theming) — the dark design goes behind the
    `?experiment=true` flag (ADR 0019). The `next-themes` rule is untouched; what
    is added is that the toggle only renders under the flag, that `light` is the
    default, and that the OS preference is no longer consulted at all. The
    general rule underneath it — no theme a visitor did not ask for and cannot
    leave — is what the entry is really for.
Added sections: none
Removed sections: none
Follow-up TODOs: none
Note: fifth amendment to Principle IV, and the 1.3.0 report's observation that
it "has become a ledger of every visual decision the site has made" still
stands. This one is three lines rather than a restructure, deliberately: the
alternative on the table was deleting the second theme outright, and that
version of this amendment removed two entries and forbade `dark:` by fiat. It
was reverted. Constitution changes that foreclose an option should be the ones
that wait for a finished design, not the ones that arrive with it unfinished.

--- previous ---
Version change: 1.2.0 → 1.3.0
Modified principles:
  - IV. Technology Stack (NON-NEGOTIABLE) — removes the hero player card from the
    Visualisation entry and records the opening's portrait rule in its place
    (ADR 0018). The football metaphor still governs the career and skills
    chapters; it no longer reaches the opening.
Added sections: none
Removed sections: none
Follow-up TODOs: none
Note: this is the fourth amendment to Principle IV in three days. The previous
report already flagged the pattern as worth watching; it is now worth acting on.
Principle IV has become a ledger of every visual decision the site has made,
which is not what a fixed technology stack is for. A future amendment should
consider whether design commitments belong in it at all, or whether the ADR
index is the better home for them with Principle IV naming only the stack.

--- previous ---
Version change: 1.1.0 → 1.2.0
Modified principles:
  - IV. Technology Stack (NON-NEGOTIABLE) — admits `react-icons` for brand marks,
    scoped to the one component that may import it (ADR 0014), and records the
    page-wide photographic surface and its contrast floor (ADR 0015).
Added sections: none
Removed sections: none
Follow-up TODOs: none
Note: this is the third amendment to Principle IV in two days. Each one has been
individually justified; the pattern is worth watching.

--- previous ---
Version change: 1.0.0 → 1.1.0
Modified principles:
  - IV. Technology Stack (NON-NEGOTIABLE) — expanded to name the libraries already
    ratified by ADRs 0009/0010/0011 (rough-notation, next-themes, class-based dark
    mode), to state the three-library animation ceiling with per-library domains, and
    to add a bounded exception to the no-inline-styles rule for palette tokens
    Tailwind cannot see at build time (ADR 0013).
Added sections:
  - VI. Recorded Decisions (ADRs) — new principle requiring an ADR for architecturally
    significant decisions and forbidding silent rewriting of superseded records.
  - Governance: stack changes now require an ADR *and* an amendment in the same PR.
Removed sections: none
Modified sections:
  - Technology & Quality Constraints — inline-style exception, ADR back-reference rule.
  - Development Workflow — `docs/<slug>` added to the allowed branch name formats,
    matching existing practice for documentation-only changes.
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

A commit touching more than five files MUST be a single unit of work by nature — a
config, formatting, or lint pass, or one change that genuinely spans that many files.
Anything separable MUST be split, even when the parts ship together.

**Rationale**: Atomic commits make history reviewable, bisectable, and revertable.
The "why" prevents future engineers (including the author) from undoing intentional
decisions unknowingly.

### IV. Technology Stack (NON-NEGOTIABLE)

The following stack is fixed and MUST NOT be substituted or extended without a
constitution amendment:

- **Framework**: Next.js (App Router) + TypeScript — strict mode enabled.
- **Structure**: one scrolling story at `/`; sections are anchors, not routes. Retired
  paths MUST redirect rather than 404 (ADR 0012).
- **Content**: JSON files in `public/data/`, fetched client-side and validated against a
  Zod schema before use. No CMS, no database (ADR 0001, ADR 0003).
- **Styling**: Tailwind CSS v4, theme tokens via `@theme inline`; dark mode is bound to
  the `.dark` class through `@custom-variant`, never to `prefers-color-scheme`
  (ADR 0006, ADR 0011). No CSS-in-JS.
- **Theming**: `next-themes` owns theme state and applies the class before first paint.
  No hand-rolled theme hook (ADR 0010). The dark design is unfinished and ships behind
  the `?experiment=true` flag: the toggle renders only under it, the default is `light`,
  and the OS preference is not consulted (ADR 0019). Nothing may serve a theme a visitor
  did not explicitly ask for and cannot leave.
- **Animation**: exactly three libraries, each with one domain and no overlap —
  GSAP + ScrollTrigger for scroll-sequenced and timeline motion; Framer Motion for
  component entrance, exit, and interaction motion; `rough-notation` for hand-drawn
  annotation marks over text (ADR 0005, ADR 0009). If a need matches none of those three
  domains, none of these libraries is the answer; a fourth requires an amendment.
- **Visualisation**: SVG football pitch rendered in-browser; no canvas unless SVG is
  demonstrably insufficient. The football metaphor governs the career and skills
  chapters (ADR 0004). It does NOT reach the opening, which leads with a
  background-removed portrait of the site's owner (ADR 0018). Any image composited
  onto the page surface MUST carry its own alpha channel with colour-corrected
  edges, rather than relying on a CSS mask or blend mode to hide a background
  baked into the pixels — neither can, and both fail differently in each theme.
- **Surface**: one pinned photograph behind the whole story, served through the image
  optimizer — never as a CSS `background-image`, which bypasses it. Chapters carry a
  translucent scrim, never an opaque background. Body copy over it uses the `text-on-photo`
  token: the photograph's darkest region measures 0.293 relative luminance, so `gray-600`
  and `gray-700` fall below WCAG AA against it (ADR 0015).
- **Icons**: `react-icons` for brand marks only, imported per glyph from a subpath, and
  only in `components/Navigation/SocialIcons.tsx`. Not a general-purpose icon set for the
  rest of the UI (ADR 0014).
- **Deployment**: GitHub → Vercel (automatic preview + production deploys on push).
  Installs use pnpm (`pnpm install`, pinned via `package.json`'s `packageManager`
  field) in every environment — local, CI, and Vercel (ADR 0022, which supersedes
  ADR 0007's `--legacy-peer-deps`/npm install-command guidance specifically; ADR
  0007's record of the underlying React 19 peer-dependency decision stands).

**Rationale**: A fixed stack eliminates decision fatigue, keeps dependencies coherent,
and ensures all tooling choices have been made deliberately upfront. Naming the ADR
behind each entry means the reasoning stays reachable when the entry is questioned.

### V. Token Efficiency

All LLM-assisted work (prompts, context passed to AI tools) MUST be concise and minimal.
Prompts MUST NOT repeat information already present in files or conversation context.
Large file dumps and redundant scaffolding context are forbidden in AI requests.

**Rationale**: Token waste slows iteration and increases cost. Lean prompts also force
clearer thinking about what information is actually required.

### VI. Recorded Decisions (ADRs)

Every architecturally significant decision MUST be recorded as an ADR in `docs/adr/`,
landing in the same PR as the change it justifies. A decision is significant if it adds
or removes a dependency, changes the site's structure or URLs, changes how content is
stored, loaded, or validated, or commits the design to a metaphor other work must follow.

Accepted ADRs MUST NOT be rewritten or deleted once merged. When a later decision
overturns part of an earlier one, the earlier record keeps its text and gains a dated
note naming the ADR that replaced it; the new ADR states what it supersedes or amends.
The index in `docs/adr/README.md` MUST reflect every record's current status.

**Rationale**: The value of an ADR is the rejected alternatives and the constraints in
force at the time — deleting or editing that away leaves a decision no one can re-litigate
on the original terms. A superseded ADR is still true about the past.

## Technology & Quality Constraints

- TypeScript strict mode (`"strict": true`) is always on; `any` types require an explicit
  `// eslint-disable` comment with justification.
- Styling goes through Tailwind utility classes. Inline `style` is permitted only to apply
  a value exported by a shared token module (e.g. `components/Hero/palette.ts`), because
  Tailwind scans class strings as literal text and an interpolated class never reaches the
  stylesheet. Any other inline style MUST be rewritten as a utility.
- Tailwind classes MUST be ordered consistently (use `prettier-plugin-tailwindcss`).
- `dark:` utilities are the only supported way to style for dark mode; hand-written
  `.dark` selectors MUST NOT be added, as they silently outrank the zero-specificity
  custom variant.
- GSAP ScrollTrigger instances MUST be killed in cleanup functions to prevent memory leaks.
- Motion MUST respect `prefers-reduced-motion` through the existing helpers, not a new
  detection path per component.
- All SVG elements MUST have accessible `aria-label` or `role` attributes where interactive.
- Lighthouse performance score MUST remain ≥ 90 on production builds.
- Code that exists because of an ADR SHOULD name that ADR in a comment, so the constraint
  survives contact with a future reader who would otherwise "simplify" it away.

## Development Workflow

- **Branching**: feature branches off `main`; branch name format `feat/<slug>`,
  `fix/<slug>`, or `docs/<slug>`.
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

Adding, removing, or replacing anything in Principle IV requires **both** an ADR
recording the decision and an amendment to this file, in the same PR. An ADR alone does
not change the stack, and an amendment without an ADR loses the reasoning.

Version bumping follows semantic versioning:
- **MAJOR**: removal or redefinition of a non-negotiable principle.
- **MINOR**: new principle or section added.
- **PATCH**: clarification, wording fix, or non-semantic refinement.

All PRs and code reviews MUST verify compliance with this constitution.

**Version**: 1.5.0 | **Ratified**: 2026-08-09 | **Last Amended**: 2026-08-17
