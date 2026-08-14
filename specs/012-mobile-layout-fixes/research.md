# Phase 0 Research: Mobile Layout Fixes

**Feature**: [spec.md](./spec.md) | **Date**: 2026-08-14

Every decision below is grounded in code read in this repository, cited by
file and line as it stood on 2026-08-14.

---

## R1. What is actually causing the horizontal overflow

**Decision**: Treat `components/Contact/ContactSection.tsx:41` as the
confirmed cause, and measure — rather than assume — three secondary
suspects before touching them.

The glow is declared as:

```
pointer-events-none absolute top-0 left-1/2 -z-10 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]
```

`w-[40rem]` is 640px. It is positioned `left-1/2` then pulled back by half
its own width, so it is centred on its parent and extends 320px either side
of that centre. Its nearest positioned ancestor is the `relative isolate`
wrapper in the same file (line 35), inside `#contact`'s `mx-auto max-w-4xl`
container in `app/page.tsx:105`. On a 375px viewport that container is at
most 375px minus padding, so the glow overhangs by roughly 130px on each
side. The left overhang is not reachable by scrolling; the right overhang is
exactly the "space that is scrollable to the right".

**Rationale**: `components/EngineeringPrinciple/PrincipleBand.tsx:105`
declares a materially larger decorative element — `h-[34rem] w-[34rem]`,
also `left-1/2 -translate-x-1/2` — and causes no overflow, because its
section carries `overflow-hidden` at line 66. The two files are the same
pattern with and without containment. That is as close to a controlled
experiment as a codebase offers, and it identifies both the cause and the
in-repo remedy.

**Secondary suspects to measure, not to pre-emptively change**:

- `components/Hero/HeroPortrait.tsx:76` — `lg:w-[52vw]` and `lg:h-[90vh]`
  apply only from the `lg` breakpoint, so they are out of the mobile range
  by construction; the mask utilities do not affect layout box size. Expected
  clean.
- `components/Hero/HeroGradientLayers.tsx:18` and
  `components/Common/ChapterGradientOverlay.tsx:42` — both already wrap their
  fills in `absolute inset-0 overflow-hidden`. Expected clean.
- `components/Career/CareerPitch.tsx:147` — the pitch is `w-full` with a
  fixed aspect ratio and its own `overflow-hidden`. Expected clean; the
  chapter pill list above it wraps.

**Explicitly ruled out**: `components/Navigation/HamburgerMenu.tsx:228`. The
menu panel animates in from `x: '100%'` and exits the same way, which looks
like an overflow source but is not — the panel is `fixed`, and fixed-position
elements do not contribute to the document's scrollable area. Recording this
so the implementer does not spend time on it; the spec's third acceptance
scenario for User Story 1 still requires it to be checked empirically.

**Alternatives considered**:

- *Guess-and-patch across all sections*: rejected. FR-002 requires that no
  element extends past the viewport, which is a property to be measured, not
  asserted; blanket-patching sections that do not overflow adds clipping
  contexts nobody asked for and can silently cut a future design.

---

## R2. How to contain the overflow

**Decision**: Apply `overflow-x-clip` to the section that hosts the
overhanging decorative child. Do not apply `overflow-hidden`, and do not add
a global guard on `html` or `body`.

**Rationale**, in the order the alternatives fail:

1. **`overflow-x: hidden` on the section** — the obvious choice, and the one
   `PrincipleBand.tsx:66` already uses. Rejected here for a reason that does
   not apply there: when one axis is set to `hidden` and the other is
   `visible`, CSS computes the `visible` axis to `auto`. The section becomes
   a scroll container, which (a) can trap `position: sticky` descendants
   against it and (b) introduces a nested scrollport. FR-004 forbids
   degrading the pinned navigation bar, and the site's only sticky element
   lives one level up in the same document. `clip` avoids the whole class of
   problem, so it is the safer default even where `hidden` would happen to
   work. PrincipleBand's existing `overflow-hidden` is left alone — it works,
   it has no sticky descendant, and changing it is out of scope.
2. **Global `html { overflow-x: clip }` or `body { overflow-x: hidden }` in
   `app/globals.css`** — one line, fixes every present and future overflow.
   Rejected on requirements, not taste: it satisfies FR-001 (page is not
   scrollable sideways) while leaving FR-002 (no element extends past the
   viewport) violated in place. The oversized element would still be
   oversized, merely invisible. It also converts every future overflow bug
   from a visible symptom into a silent clip, which is the opposite of
   maintainable (Principle I). The `body`-with-`hidden` variant additionally
   propagates to the viewport and is a well-known way to break `position:
   sticky` and smooth scrolling on iOS Safari — a direct FR-004 hazard.
3. **Constrain the glow responsively**, e.g. `w-full max-w-[40rem]` —
   rejected by FR-003, which forbids boxing decorative full-bleed elements
   into something narrower than they occupy today. This would shrink the
   glow's spread on phones, changing the design rather than fixing a defect.

**Browser support**: `overflow: clip` is Safari 16+, Chrome 90+, Firefox 81+
— inside the evergreen target the spec's Assumptions name. Tailwind v4 ships
`overflow-x-clip` as a first-class utility, so no arbitrary value and no
hand-written CSS is needed, keeping the Technology & Quality constraint that
styling goes through utilities.

**Where to apply it**: at the chapter `<section>` in `app/page.tsx` rather
than on `ContactSection.tsx`'s inner `relative isolate` wrapper. The wrapper
sits inside `mx-auto max-w-4xl`; clipping there would cut the glow at the
content column on wide screens, producing a hard vertical edge on a blurred
element — the exact failure the spec's fifth edge case warns about. The
section spans the full width, so clipping there removes only what is off
screen.

---

## R3. The navigation bar's apparent desync

**Decision**: Make no change to `components/Navigation/StoryProgressNav.tsx`
in the first instance. Verify User Story 2 after R2 lands, and only
investigate further if the symptom survives.

**Rationale**: the bar at line 71 is `sticky top-3 z-40 mx-3 ... sm:mx-6`.
`position: sticky` with only a `top` offset is a vertical behaviour; the
element is laid out at the document's content width and scrolls horizontally
with the document like anything else. So when the document is wider than the
viewport and the visitor pushes it sideways, the bar travels left with it and
appears to come unstuck from the screen — while the chapters beneath, being
wider, appear to stay. That is precisely "the navbar does not scroll all the
way together", and it has no cause of its own. Removing the horizontal
overflow removes the only way to observe it.

The bar's ability to stay pinned for the *full* page length was also checked
and is sound: it is a flex item of `body` (`flex min-h-full flex-col`, in
`app/layout.tsx:81`), rendered ahead of `<main>` and the footer, so its
containing block spans the whole document and it has room to travel to the
bottom. No structural change is warranted.

**Alternatives considered**:

- *Switch the bar to `position: fixed`*: rejected. It would mask a
  document-width bug rather than fix it — the bar would stay put while the
  content still slid underneath — and it would remove the bar from flow,
  changing the top spacing of the hero. FR-006 asks for the bar and the
  content to stay in alignment, which is a statement about the document being
  the right width, not about the bar's positioning scheme.
- *Wrap the bar in its own container*: rejected as unnecessary structure
  (Principle I) for a symptom with an upstream cause.

**Risk recorded**: this decision is a prediction. If US2 still reproduces
after R2, the next candidates are a stray `transform`/`filter`/`contain` on
an ancestor (any of which would make that ancestor the containing block for
the sticky bar) — none is present today, which is why this is second, not
first.

---

## R4. Splitting verification between automated and manual

**Decision**: Automate the two structural guarantees; verify all geometry
manually against the checklist in `quickstart.md`. Settled in the clarify
session (spec `## Clarifications`, 2026-08-14) and recorded here as SC-006
and SC-007.

**Rationale**: `jest.config.js` sets `testEnvironment: 'jest-environment-jsdom'`,
and jsdom implements no layout — `scrollWidth`, `clientWidth` and
`getBoundingClientRect()` all return zeros regardless of CSS. SC-001, SC-002,
SC-003 and SC-005 are geometric and therefore unobservable to the installed
suite. Making them observable means a real browser runner (Playwright), which
Principle IV puts behind an ADR *and* a constitution amendment — a heavy
instrument for one CSS fix.

What *is* automatable is that the code carries the properties the fix
depends on, and the repository already has the precedent:
`tests/integration/backdrop-coverage.test.tsx` reads component and page
source with `fs.readFileSync` and asserts on class names, on the explicit
grounds that "what matters is the class names the chapters carry, not their
runtime output" (line 5). This feature's containment test is the same idea
applied to the same page file.

**Alternatives considered**:

- *Add Playwright now*: rejected in clarification. Worth raising separately
  if e2e coverage is wanted site-wide; it should not ride in on a CSS fix.
- *Mock layout in jsdom* (stubbing `getBoundingClientRect` to fake widths):
  rejected outright. It would test the mock, not the page, and Principle II
  forbids over-mocked suites that provide false confidence.
- *Skip automated tests, manual only*: rejected — Principle II is
  non-negotiable, and there are real assertable invariants here.

---

## R5. What the automated tests should assert

**Decision**: Two test files, four assertions.

New — `tests/integration/mobile-overflow.test.tsx`, source-level, modelled on
`backdrop-coverage.test.tsx`:

1. Every chapter section that hosts a decorative element wider than its
   container carries a horizontal containment utility. Written against
   `app/page.tsx` source.
2. No global horizontal-overflow guard has been introduced — `app/globals.css`
   and `app/layout.tsx` contain no `overflow-x: hidden` / `overflow-x-hidden`
   on `html` or `body`. This is the regression guard for FR-002 and FR-004
   together: it is the one way the fix could be "undone" by a later
   well-meaning one-liner that makes the symptom disappear while reinstating
   the cause. Encoding a rejected alternative as a test is the same technique
   `backdrop-coverage.test.tsx` uses for the rejected parallax (line 14).

Extended — `tests/unit/components/ChapterDetail.test.tsx`:

3. The date renders before the "What I built" label in document order.
4. With `builtSummary` empty, the date still renders ahead of the remaining
   sections (FR-012). The existing `baseChapter` fixture at line 7 supports
   both cases by spread-override, as the existing empty-`tech` test at line 55
   already demonstrates.

**Rationale for how order is asserted**: jsdom gives no geometry but full
document order. The readable form — and Principle II demands tests read as
documentation — is to compare positions within the rendered container's text,
e.g. asserting the index of the date string precedes the index of `What I
built`. `Node.compareDocumentPosition` is more precise but reads as bit-mask
arithmetic; it is the fallback if the text-index form proves ambiguous for a
fixture whose date string could appear twice, which FR-009 forbids anyway.

---

## R6. Moving the date in the career panel

**Decision**: Relocate the existing date paragraph in
`components/Career/ChapterDetail.tsx` from its current position at the foot
of the panel (lines 96–99 as of 2026-08-14) to directly after the role line
(line 47) and before the `builtSummary` block (lines 49–57), carrying its
markup and class list over verbatim.

Current node, to be moved unchanged, satisfying FR-011:

```
<p className="text-on-photo font-mono-ui mt-3 flex items-center gap-1.5 text-xs opacity-70">
  <span aria-hidden="true">📅</span>
  <span>{years}</span>
</p>
```

**Rationale**: the resulting order — chapter/position label, company, role,
date, what I built, achievements, technologies — is exactly the order the
spec's Key Entities section fixes. Carrying the classes over unchanged is the
cheapest way to satisfy FR-011, and it keeps the emoji `aria-hidden`, so the
accessible name is unaffected. The `mt-3` spacing already matches the sibling
sections it now sits among.

**Comments must be rewritten, not dropped**: two comments in this file
currently document the *old* placement as a decision —

- the file docblock, lines 24–26: "The date moved out of the header into its
  own line at the foot of the panel, alongside its own mark."
- the inline comment at lines 93–95: "Date moved down here, out of the header
  — the header now reads as 'what chapter, what position', and the date reads
  as a footer fact..."

Both were written by spec 011 and are the record of a decision this feature
reverses. Leaving them would make the file lie about itself; deleting them
silently would erase the trail. They are rewritten to state the new placement
and why (the visitor should know *when* before reading *what*), consistent
with the codebase's convention of comments carrying reasoning.

**No conflict with spec 011**: its functional requirements were re-read.
FR-008 there requires the panel to carry a "what I built" summary,
achievements and technologies in the showcase's section pattern; FR-009
requires tighter vertical spacing with nothing truncated. Neither pins the
date to the foot — that placement lives only in prose and code comments. This
feature therefore refines 011 rather than contradicting a ratified
requirement, and 011's FR-009 still holds: moving a node changes no heights.

**Alternatives considered**:

- *Fold the date into the header block beneath the role, without its calendar
  mark*: rejected by FR-011, which preserves today's treatment.
- *Show the date in both places*: rejected by FR-009, exactly one date line.
- *Also reorder `components/Career/TimelineView.tsx`*: rejected — it already
  presents the date first, in its own left rail (line 33), and the spec puts
  it out of scope.

---

## Open questions

None. No NEEDS CLARIFICATION markers remain in the spec or in this document.
