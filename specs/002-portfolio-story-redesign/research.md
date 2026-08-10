# Phase 0 Research: Story-Driven Portfolio Redesign

No items in Technical Context were left as NEEDS CLARIFICATION — the stack is fixed by the project constitution and the codebase already contains every section as a reusable, content-driven component. The research below covers the design decisions needed to assemble those pieces into one story.

## 1. How to consolidate 8 pages into one scrolling story

**Decision**: Render the existing section components sequentially inside `app/page.tsx`, each wrapped in a `<section id="...">` matching its story name (`hero`, `about`, `skills`, `career`, `education`, `projects`, `playbook`, `contact`).

**Rationale**: Every section already exists as a standalone, content-driven component (`Hero`, `AboutSection`, `SkillsFormation`, `CareerJourneyLazy`, `EducationSection`, `ProjectGalleryLazy`, `PlaybookGrid`). No new data flow or state management is needed — this is a pure assembly change, which satisfies the constitution's KISS principle.

**Alternatives considered**:
- *Client-side single-page-app router with animated transitions between "pages"*: rejected — adds a routing abstraction and animation surface area the feature doesn't need; a plain scrolling page already delivers "story, not clicks."

## 2. Navigation bar removal & in-page wayfinding

**Decision**: Remove `<Navbar />` from `app/layout.tsx`. Add a small `StoryProgressNav` component using Framer Motion's `useScroll`/`useSpring` to show scroll progress and provide anchor links to jump between sections, satisfying FR-007 (in-page jump + keyboard/screen-reader skip) without reintroducing a page-to-page nav bar.

**Rationale**: Framer Motion is already a fixed dependency and its scroll hooks don't require manual cleanup (unlike GSAP ScrollTrigger instances), keeping the addition small and low-risk. The existing skip-link in `app/layout.tsx` already gives keyboard users a way to jump past the story to `#main-content`; `StoryProgressNav` extends that same idea to jump *within* the story.

**Alternatives considered**:
- *GSAP ScrollTrigger progress bar*: viable per the constitution's animation stack, but requires explicit `kill()` cleanup and is more setup than needed for a simple progress/anchor control.
- *No in-page navigation at all*: rejected — fails FR-007 and the edge case of a visitor wanting to skip straight to Contact.

## 3. Modern gradient background

**Decision**: Apply a Tailwind gradient utility (e.g., `bg-gradient-to-b`/`bg-gradient-to-br`) at the story's outer wrapper, extending the palette already used in `Hero.tsx` (`from-white via-blue-50 to-white` / `dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`) so the whole story reads as one consistent surface instead of a hero-only effect.

**Rationale**: Reuses an existing, already-accessible color pairing rather than inventing a new palette; stays entirely within Tailwind utilities per the constitution (no CSS-in-JS, no inline styles).

**Alternatives considered**:
- *Animated/shifting gradient*: rejected for v1 — adds GPU cost and a `prefers-reduced-motion` branch for a purely decorative effect; a static gradient already reads as "modern."

## 4. Profile picture placeholder

**Decision**: Extend `AboutSection.tsx` (and reuse the same pattern in `Hero.tsx`'s intro) so that when `about.imageSource` is absent, a generic placeholder graphic (initials or silhouette) renders in the same layout slot the real photo would occupy — instead of rendering nothing, which is today's behavior.

**Rationale**: `imageSource` is already an optional field on the `About` content type (`lib/types/portfolio.ts`); today the image block is simply omitted when it's unset (`components/About/AboutSection.tsx:31`). FR-005/SC-005 require a placeholder that never looks broken and can be swapped for a real photo through a content update alone — no code change needed once a real `imageSource` is added.

**Alternatives considered**:
- *Upload UI for the profile picture*: rejected — out of scope per spec Assumptions; this is a single-owner site whose content is edited via JSON, consistent with every other section.

## 5. Redirecting the seven legacy page URLs

**Decision**: Declare all seven redirects (`/skills`, `/career`, `/education`, `/projects`, `/playbook`, `/about`, `/contact`) in `next.config.ts`'s `async redirects()`, each pointing at the matching anchor on `/` (e.g., `/projects` → `/#projects`), as permanent (308) redirects.

**Rationale**: Confirmed via this project's vendored Next.js docs (`node_modules/next/dist/docs/01-app/02-guides/redirecting.md`) that `redirects()` in `next.config.ts` is unchanged in this Next.js version and is the documented mechanism for "you change the URL structure of pages." Seven entries is far below the documented 1,024-redirect platform limit, so no Proxy/bloom-filter setup (the docs' "at scale" pattern) is warranted. This directly satisfies the clarified FR-009/SC-006.

**Alternatives considered**:
- *Keep each `app/(routes)/<name>/page.tsx` file and call `redirect()` from inside it*: rejected — duplicates seven files to express one static mapping; a single config array is simpler to read and maintain (KISS).

## 6. Contact section content

**Decision**: Carry the existing Contact section content forward unchanged into the story's final chapter; no new contact form or content is introduced by this feature.

**Rationale**: The current `/contact` page already renders placeholder copy ("Contact content coming soon."). This feature is about consolidation and navigation, not filling in unrelated content gaps — flagged here only so it isn't mistaken for a regression introduced by this work.
