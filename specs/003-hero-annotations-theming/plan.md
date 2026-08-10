# Implementation Plan: Annotated Hero & Working Theme Switching

**Branch**: `003-hero-annotations-theming` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-hero-annotations-theming/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Rebuild the hero around a hand-annotated introduction — the owner's name, three annotated role phrases ("Software Engineer", "AI enthusiast", "Security Nerd"), an intro line, and the existing CTAs — with the portrait beside the text on desktop and the "Core Expertise" card removed. Alongside it, repair theme switching end to end: it is currently broken in three independent ways (no control mounted anywhere, `dark:` utilities still bound to the OS media query, and CSS custom properties likewise OS-bound), plus a flash-of-wrong-theme on load.

Technical approach: adopt `next-themes` for theme ownership (replacing the hand-rolled `useTheme` hook and its post-hydration flash), switch Tailwind's `dark` variant from the OS media query to a class selector via `@custom-variant`, mount the existing `ThemeToggle` in the story-progress chrome, and add `rough-notation` for the annotations behind a small wrapper component. Both libraries are new dependencies requiring constitution reconciliation — recorded as ADRs 0009–0011.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 16.3.0 (App Router), React 19.2.8

**Primary Dependencies**: Tailwind CSS 4.3.3 (theming + layout), Framer Motion ^11 (existing), GSAP ^3.12 (existing), Zod ^3.22 (content validation) — plus two **new**: `next-themes` 0.4.6 (theme state, ~2KB gz) and `rough-notation` 0.5.1 (hand-drawn annotations, ~9KB gz)

**Storage**: N/A — content is static JSON in `public/data/`, loaded via `ContentProvider`; theme preference persists in browser local storage, managed by `next-themes`

**Testing**: Jest + @testing-library/react (existing, 28 tests passing)

**Target Platform**: Web, deployed to Vercel; modern desktop and mobile browsers

**Performance Goals**: Lighthouse performance ≥ 90 (constitution); no flash of wrong theme on first paint; annotations drawn within 2s of interactive (SC-001)

**Constraints**: WCAG AA contrast in both themes (SC-007); `prefers-reduced-motion` disables annotation animation (SC-008); annotations must survive text reflow (SC-006); combined new-dependency budget ~11KB gz on top of the ~40KB gz already accepted in ADR 0005

**Scale/Scope**: Single-owner portfolio; 1 hero section reworked, 1 theming mechanism replaced site-wide (affects every `dark:` utility in the codebase), 3 ADRs written

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. KISS & Maintainability | `next-themes` **removes** hand-rolled code (`lib/hooks/useTheme.ts` deleted) rather than adding a layer. The annotation wrapper is a thin, single-purpose component. Mark styles fixed in code (FR-024) keeps the content schema unchanged. | PASS |
| II. Test-First (NON-NEGOTIABLE) | Tests written alongside each change: annotation rendering, reduced-motion behaviour, theme persistence/precedence, hero composition. Enforced per-task in `/speckit-tasks`. | PASS (enforced at task level) |
| III. Atomic Commits | Enforced during implementation; each ADR lands with the change it documents. | N/A at plan stage |
| **IV. Technology Stack (NON-NEGOTIABLE)** | **VIOLATION — two new dependencies.** The stack clause fixes Framer Motion + GSAP for animation and names no theming library. `rough-notation` is a third animation/rendering library; `next-themes` adds a state library. Both require justification. | **FAIL → see Complexity Tracking** |
| V. Token Efficiency | Plan reuses existing components and content pipeline; no scaffolding regenerated. | PASS |
| Quality: Lighthouse ≥ 90 | +11KB gz combined, both lazy-loadable; verified by build + Lighthouse before done. | PASS (verify at T-end) |
| Quality: ScrollTrigger cleanup | No new ScrollTrigger instances introduced. | PASS |
| Quality: Tailwind ordering | `prettier-plugin-tailwindcss` already enforced. | PASS |

**Gate result**: Principle IV fails as written. Proceeding is contingent on the Complexity Tracking justification below plus a constitution amendment recorded in ADR 0009 — per the constitution's own Governance clause, the stack "MUST NOT be substituted without a constitution amendment". This plan does not dilute the principle; it triggers the amendment process the principle prescribes.

## Project Structure

### Documentation (this feature)

```text
specs/003-hero-annotations-theming/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   ├── content-schema.md      # hero content shape + validation rules
│   └── theme-contract.md      # theme state, persistence, precedence
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                  # Wrap in next-themes provider; suppressHydrationWarning on <html>
├── globals.css                 # @custom-variant dark; move OS-only vars to .dark class
└── page.tsx                    # Unchanged (hero already mounted at #hero)

components/
├── Hero/
│   ├── Hero.tsx                # Rework: portrait beside text, annotated phrases, drop Core Expertise
│   ├── TopSkillsPreview.tsx    # DELETED — Core Expertise card removed (FR-027)
│   ├── HeroParallax.tsx        # Unchanged
│   └── ValueProp.tsx           # Unchanged (CTAs retained per FR-026)
├── Common/
│   ├── ThemeProvider.tsx       # NEW — next-themes provider wrapper
│   ├── ThemeToggle.tsx         # Rewired to next-themes' useTheme
│   └── RoughAnnotation.tsx     # NEW — annotation wrapper (reflow + reduced-motion aware)
└── Navigation/
    └── StoryProgressNav.tsx    # Mount ThemeToggle here (FR-010)

lib/
├── hooks/useTheme.ts           # DELETED — superseded by next-themes
├── types/portfolio.ts          # Home type: add intro + roles-as-phrases
└── utils/validation.ts         # HomeSchema updated to match

public/data/home.json           # New hero copy: name, intro, three role phrases

docs/adr/
├── 0009-rough-notation-third-animation-library.md   # NEW (amends ADR 0005)
├── 0010-next-themes-for-theme-state.md              # NEW
├── 0011-class-based-dark-mode.md                    # NEW (supersedes part of ADR 0006)
└── README.md                                        # Index updated

tests/
├── unit/components/Hero.test.tsx              # Update: Core Expertise assertion removed
├── unit/components/RoughAnnotation.test.tsx   # NEW
├── unit/components/ThemeToggle.test.tsx       # NEW
└── integration/theming.test.tsx               # NEW — persistence, precedence, no-flash
```

**Structure Decision**: Single Next.js app, no new packages. The theming change is deliberately centralised — one provider, one CSS variant declaration — so that the hundreds of existing `dark:` utilities across the codebase start working without being touched individually. The annotation library is isolated behind `RoughAnnotation.tsx` so a future swap doesn't reach into the hero.

## Complexity Tracking

> Filled because Constitution Check (Principle IV) has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| **`rough-notation` — a third animation/rendering library**, against ADR 0005's deliberate two-library ceiling (~40KB gz accepted) | The requested effect is hand-drawn imperfection: seeded-random stroke jitter, multi-pass sketchy paths, five mark types that trace on. This is RoughJS's whole purpose. ~9KB gz for the exact effect, actively maintained, SSR-safe when rendered client-side. | **Hand-rolled SVG/CSS**: a CSS highlight is trivial, but circle/box/underline with credible hand-drawn wobble means reimplementing RoughJS's path-roughening — dozens of lines of seeded randomisation per mark type, and it would land in the "clever tricks" territory Principle I forbids. **Framer Motion**: animates values, not path geometry; would still need hand-rolled rough paths. **GSAP DrawSVG**: a paid Club plugin, and still needs the rough paths authored by hand. |
| **`next-themes` — a new state dependency** not named in the fixed stack | Replaces `lib/hooks/useTheme.ts`, which is the source of the flash-of-wrong-theme bug: it applies the theme in a `useEffect` after hydration, so the first paint is always wrong for dark-mode visitors. `next-themes` injects a blocking pre-hydration script — the only reliable fix — plus cross-tab sync and system-preference tracking. ~2KB gz, React 19 peer support, purpose-built for the App Router. | **Keep and fix the hand-rolled hook**: the no-flash fix requires hand-writing a `dangerouslySetInnerHTML` blocking script that reads storage and sets the class before paint, then keeping storage/system/DOM state in sync manually. That is strictly more custom code than the dependency it avoids, and it is exactly the subtle, easy-to-break code Principle I exists to prevent. Net line count goes *down* by adopting the library. |

**Both violations are net-negative in custom code**: this feature deletes `lib/hooks/useTheme.ts` and `components/Hero/TopSkillsPreview.tsx` and adds two thin wrappers. The bundle grows ~11KB gz; the maintenance surface shrinks. ADR 0009 records the amendment to ADR 0005's ceiling (two → three libraries, with the rule "GSAP for scroll, Framer for interaction, RoughJS for hand-drawn marks"); ADR 0010 and ADR 0011 record the theming decisions.

## Post-Design Constitution Re-check

*Re-evaluated after Phase 1.*

| Principle | Post-design finding | Result |
|---|---|---|
| I. KISS & Maintainability | Design confirms the reduction: 2 files deleted, 2 thin wrappers added, and the theming fix is one CSS declaration rather than per-component edits. `RoughAnnotation` isolates the new library to a single file. | PASS |
| II. Test-First | Contracts (`theme-contract.md`, `content-schema.md`) give numbered, directly testable guarantees (T1–T6, C1–C5), so tests can be written against the contract before implementation. | PASS |
| III. Atomic Commits | Design splits cleanly into independent commits: theming repair, hero rework, each ADR with its change. | PASS |
| **IV. Technology Stack** | Unchanged — still 2 new dependencies. No additional libraries surfaced during design. Justified above; requires the ADR 0009 amendment to clear. | **FAIL, justified** |
| V. Token Efficiency | Artifacts cross-reference rather than duplicate; no regenerated scaffolding. | PASS |
| Quality: Lighthouse ≥ 90 | +11KB gz against an existing ~40KB gz animation budget. Quickstart step gates on measuring it before done. | PASS (verify) |

**No new violations introduced by the design.** The single outstanding gate is Principle IV, which the constitution's own Governance clause resolves through amendment — the process ADR 0009 initiates. Implementation must not begin on the `rough-notation` tasks until that amendment is accepted.
