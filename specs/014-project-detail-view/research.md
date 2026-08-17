# Phase 0 Research: Featured Project Detail View

No item in the Technical Context needed a `NEEDS CLARIFICATION` marker — the
constitution gate (run before `/speckit-specify`) and the two clarify-phase
answers already resolved every open decision. This file records the choices
made and the alternative considered for each, rather than open research
questions.

## Decision: Modal built on the `HamburgerMenu` portal/backdrop/focus-trap pattern

**Decision**: Build a new `ProjectDetailModal` component following the same
shape already proven in `components/Navigation/HamburgerMenu.tsx`: portal to
`document.body` via `createPortal`, a dimmed backdrop `div`, `AnimatePresence`
+ `motion.div` for the panel, a `Tab`-key handler that traps focus inside the
panel, `Escape`/outside-click to close, and the existing
`prefersReducedMotion()` helper from `lib/utils/animations.ts` (same
lazy-`useState` read pattern) to skip motion when requested.

**Rationale**: The site already has exactly this problem solved once
(overlay panel, must trap focus, must respect reduced motion, must not use a
new dependency). Reusing the pattern satisfies Constitution I (KISS — no new
abstraction invented) and IV (no new dependency; Framer Motion is already the
correct library for this interaction domain). It also means the test
suite's existing `framer-motion` + `prefersReducedMotion` mock pattern
(`tests/unit/components/HamburgerMenu.test.tsx`) transfers directly.

**Alternatives considered**:
- *A headless dialog library (e.g. Radix Dialog)* — rejected: Constitution IV
  fixes the stack and forbids adding a dependency without an amendment; the
  existing pattern already covers every requirement (focus trap, Escape,
  outside-click, portal) with nothing missing.
- *`<dialog>` element with `showModal()`* — rejected: inconsistent focus-trap
  and backdrop (`::backdrop`) styling support interacts awkwardly with
  Tailwind's `dark:` variant and the site's custom backdrop treatment: it
  would trade a proven, already-tested pattern for a native API this
  codebase has never used, for no behavioral gain over the reuse option.
- *Reuse `HamburgerMenu` itself, generalized* — rejected: `HamburgerMenu` is a
  disclosure/nav pattern (`role` implicit `nav`, plain links, no
  `aria-modal`); a project detail view is a true modal dialog blocking the
  rest of the page. Forcing one component to serve both would blur two
  different ARIA patterns (Constitution I favors the boring, correctly-typed
  option over a clever shared abstraction).

## Decision: `role="dialog"` + `aria-modal="true"`, not the disclosure pattern

**Decision**: The panel is a true modal dialog: `role="dialog"`,
`aria-modal="true"`, `aria-labelledby` pointing at the project title. Unlike
`HamburgerMenu`'s nav-disclosure pattern, the rest of the page is inert while
open (background scroll locked per spec FR-006).

**Rationale**: A modal that blocks the page (spec FR-006: prevent background
scroll) is the dialog pattern, not the disclosure pattern used for the nav
menu, which never blocks background interaction. Matching ARIA role to actual
behavior is what makes the existing screen-reader/keyboard experience
correct, not just visually similar.

**Alternatives considered**: Treating it as a non-modal disclosure (like the
hamburger menu) — rejected: the spec explicitly requires a dimmed backdrop and
scroll lock (FR-006), which are modal, not disclosure, semantics; mismatching
role and behavior would fail accessibility testing rather than pass it.

## Decision: Card `onClick` opens the modal directly; existing `isSelected`/`onSelect` wiring is reused, not replaced

**Decision**: `ProjectGallery`'s existing `selectedProjectId` state (already
passed to every `ProjectCard` as `isSelected`/`onSelect`) becomes the same
state that drives which project's modal is open. Clicking a card sets
`selectedProjectId` (as it already does, for the border highlight) and the
gallery renders `<ProjectDetailModal project={... } onClose={...} />` when
that id is set.

**Rationale**: `selectedProjectId` currently only drives a border-highlight
style with no other effect — repurposing it to also open the modal is not a
new state shape, just a second consumer of state that already exists,
keeping the change minimal (Constitution I).

**Alternatives considered**: A second, independent `openProjectId` state —
rejected: would duplicate state that already identifies "the card the visitor
is interacting with," for no behavioral difference, and risks the two falling
out of sync (e.g. a highlighted card that isn't the open one).

## Decision: Existing project `links` array supplies the "View on GitHub" link; no new data field

**Decision**: The modal's GitHub link (spec FR-003) renders the first entry
in `project.links` whose `route` contains `github.com`, falling back to
`project.links[0]` if none matches (per spec Assumptions: "where a project's
most relevant link is not GitHub, the existing primary link is used in its
place").

**Rationale**: Every current project already carries a GitHub (or most-primary)
link in its existing `links` array (`public/data/projects.json`); no schema
or content change is needed. Matching by substring keeps the lookup boring
and explicit rather than requiring a new `githubUrl` field that would
duplicate data already present.

**Alternatives considered**: Add a dedicated `githubUrl` field to the
`Project` schema — rejected: the `links` array already models "external link
plus its label," and every project already has a GitHub entry; a second field
for the same fact would be redundant state (Constitution I).

## Decision: GitHub profile link is a static text link in `ProjectGallery`'s header, using the same URL pattern already in the codebase

**Decision**: Add a single `<a>` beside the "Featured Projects" heading,
`text-sm text-on-photo/70` (secondary weight, below the heading's own
emphasis), reading "More on GitHub ↗", linking to
`https://github.com/prannoymulmi`, `target="_blank" rel="noopener noreferrer"`.

**Rationale**: Matches spec FR-008 (placement in the section heading/intro
area) and FR-009 (curated-subset wording) directly. `https://github.com/prannoymulmi`
is already the base of every per-project GitHub link already in
`projects.json` (e.g. `.../prannoymulmi/portfolio`), so no new value is
introduced — it is the profile root of URLs already present in the data.

**Alternatives considered**: Deriving the profile URL dynamically by
stripping the repo path off a project's GitHub link at render time —
rejected: adds runtime string parsing for a value that is simpler and more
transparent as a constant, for a single static link (Constitution I).
