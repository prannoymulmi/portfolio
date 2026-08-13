# Phase 1 Data Model: Typography & Color Refresh

This feature carries no application data model — no schema, no `public/data/` change. What it
does define is a token system (the "entities" a styling feature actually has) and the inventory
of existing places that currently encode the *old* system, which the tasks phase will migrate one
by one. Both are recorded here in place of a conventional data model.

## Entity: Design Token

A named CSS custom property, registered once in `app/globals.css` and exposed to Tailwind through
`@theme inline`, so it is usable as a utility class rather than a raw `var()`.

| Token | Value (oklch, as given) | CSS variable | Tailwind utility it powers |
|---|---|---|---|
| Background | `oklch(0.985 0.016 78)` | `--background` | `bg-background` |
| Foreground | `oklch(0.25 0.05 48)` | `--foreground` | `text-foreground` |
| Primary | `oklch(0.66 0.22 48)` | `--primary` | `bg-primary`, `border-primary` |
| Primary-foreground | `oklch(0.99 0.012 85)` | `--primary-foreground` | `text-primary-foreground` (non-body/large-scale use only — see R1) |
| Accent | `oklch(0.78 0.17 68)` | `--accent` | `bg-accent`, `text-accent` (large-scale/non-text use only — see R1) |
| Muted-foreground | `oklch(0.5 0.06 50)` | `--muted-foreground` | `text-muted-foreground` (bare background / opaque card only — see R1) |
| Border | `oklch(0.42 0.07 48 / 14%)` | `--border` | `border-border` |
| Card | `oklch(0.995 0.01 80)` | `--card` | panel/scrim tint (not `bg-card` as an opaque fill — see FR-004) |
| Ink-deep | `oklch(0.975 0.03 72)` | `--ink-deep` | reserved for panel/scrim depth variation; not required by any FR, kept for parity with the given palette |
| Display font | Space Grotesk 400/500/600/700 | `--font-display` | `font-display` |
| Mono-UI font | JetBrains Mono 400/500 | `--font-mono-ui` | `font-mono-ui` (labels, eyebrows, tags — "label-mono" in the brief) |

**Validation rules** (from FR-006 and research R1):

- `foreground`, not `muted-foreground` or `primary-foreground`, is the text color wherever text
  sits directly on the photo/scrim outside a card (generalizes the existing `text-on-photo`
  token).
- `foreground`, not `primary-foreground`, is the text color on a solid `primary` or `accent`
  fill (buttons, badges, highlighted metrics).
- `muted-foreground` is valid on the bare `background` or an opaque-enough card surface; not
  valid directly on the photo/scrim or on a low-alpha panel over it.
- `primary`/`accent` as a *text* color (`text-primary`, `text-accent`) is valid at large/display
  scale or for non-text elements (icons, underlines, borders); not as small body-sized text,
  where it falls below the 4.5:1 floor.

**State/lifecycle**: none — these are static values, not runtime state. The existing dark-theme
values in `.dark` (behind `?experiment=true`) are untouched (FR-007) and are unaffected because
this feature only adds/changes `:root` (light) values.

## Entity: Chapter

The 8 chapters `app/page.tsx` renders, each an existing component subtree that currently mixes
Tailwind's default gray/blue palette (or one-off hex values) with the site's `chapter-scrim` /
`chapter-panel` / `text-on-photo` utilities. FR-009 requires all 8 in scope.

| Chapter | Root component | Anchor |
|---|---|---|
| Hero | `components/Hero/Hero.tsx` (+ `ValueProp`, `HeroPortrait`, `HeroParallax`) | `/` |
| Work | `components/Work/ThreeSystems.tsx` (+ `SystemCard`) | `#skills` |
| Parallax principle band | `components/EngineeringPrinciple/PrincipleBand.tsx` | (unlisted in `STORY_SECTIONS`, per ADR 0020) |
| Career | `components/Career/CareerJourneyLazy.tsx` → `CareerPitch`, `TimelineView`, `ChapterDetail` | `#career` |
| Education | `components/Education/EducationSection.tsx` | `#education` |
| Projects | `components/Projects/ProjectGalleryLazy.tsx` → `ProjectCard` | `#projects` |
| Skills/playbook | `components/Playbook/PlaybookGrid.tsx` → `PrincipleCategory` | `#playbook` |
| Contact | `components/Contact/ContactSection.tsx` | `#contact` |

Plus site-wide chrome in scope per FR-009 (navigation) and general legibility: `app/layout.tsx`
(body text color, skip-link), `components/Navigation/Footer.tsx`,
`components/Navigation/StoryProgressNav.tsx`, `components/Navigation/SocialIcons.tsx`,
`components/Navigation/EmailLink.tsx`, `components/Common/ThemeToggle.tsx`,
`components/Common/ErrorBoundary.tsx`, `components/Common/LoadingState.tsx`, `app/not-found.tsx`.

## Migration inventory: old system → new token

Grep of the current tree (excluding tests) finds every place the old palette/typeface is
hard-coded. This is the scope tasks.md will turn into concrete work items — not new decisions,
just where the tokens above land.

| Old value | Occurrences (files) | New token |
|---|---|---|
| `gray-900` / `text-gray-900` | `ContactSection`, `Footer`, `ThemeToggle`, `ErrorBoundary`, `layout.tsx`, `not-found.tsx` | `foreground` |
| `gray-700` / `gray-600` (body/muted text) | `Footer`, `ErrorBoundary`, `not-found.tsx` | `muted-foreground` (bare background) or `foreground` (on photo/scrim — see validation rule) |
| `gray-700` (hover fill, not text) | `PrincipleCategory`, `CareerPitch` | `foreground`-derived hover tint (implementation detail for tasks/plan-adjacent, not a token substitution) |
| `blue-600` / `blue-500` / `blue-400` (links, focus rings, CTAs) | `Footer`, `EmailLink`, `StoryProgressNav`, `SocialIcons`, `ThemeToggle`, `ErrorBoundary`, `layout.tsx` (skip-link), `not-found.tsx` | `primary` |
| `#3d2318` (hard-coded hex, CTA border/text) | `ValueProp` | `foreground` |
| `#111c38` (hard-coded hex, nav/social text) | `EmailLink`, `StoryProgressNav`, `SocialIcons` | `foreground` |
| `font-sans` (Geist) | `ChapterDetail`, `TimelineView`, `CareerPitch`, `PrincipleBand`, `ProjectCard`, `SystemCard`, `CvLink` | `font-display` |
| `font-mono` (Geist Mono) | same files, where used for labels/data | `font-mono-ui` |
| `text-on-photo` (currently `gray-900`/`gray-100` via CSS var) | 16 files | unchanged utility name; underlying `--on-photo` value becomes `foreground` (light) |
| `chapter-panel` / `chapter-scrim` (currently plain white/black at fixed opacity) | 7 / 2 files | unchanged utility names; underlying tint becomes `card` (light), same opacity |

**Out of scope for this migration** (per spec Assumptions and research):

- The four existing gradient-overlay image assets (`gradient-hero.png`, `gradient-text.png`,
  `mesh-soft.png`, `mesh-soft-flip.png`) and `ChapterGradientOverlay` — these are static images
  layered per ADR 0020's rule, not CSS color tokens, and this feature does not ask for new
  gradient assets or retinting existing ones.
- `.dark` token values (FR-007) — untouched.
- Any content/data file under `public/data/` — untouched, no schema change.
