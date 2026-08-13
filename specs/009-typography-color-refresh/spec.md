# Feature Specification: Typography & Color Refresh

**Feature Branch**: `009-typography-color-refresh`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "I am not happy with the fonts and colors of how they look. Fonts: Load Space Grotesk (400, 500, 600, 700) for headings and body, and JetBrains Mono (400, 500) for labels and mono text. Use CSS variables --font-display and --font-mono-ui. Color palette (warm orange on cream): Background oklch(0.985 0.016 78), Foreground oklch(0.25 0.05 48), Primary oklch(0.66 0.22 48), Primary-foreground oklch(0.99 0.012 85), Accent oklch(0.78 0.17 68), Muted-foreground oklch(0.5 0.06 50), Border oklch(0.42 0.07 48 / 14%), Card oklch(0.995 0.01 80), Ink-deep oklch(0.975 0.03 72). Restyle every chapter (Hero, Work, Career Match, Parallax Band, Craft/skills, Contact) to this type and color system, keeping the site's existing pinned-photo surface, layout, and interactive behavior unchanged."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A cohesive, intentional visual identity site-wide (Priority: P1)

A visitor loads the site and every chapter — hero through contact — presents the same warm, orange-on-cream color system and the same two-typeface system (a display/body face for headings and copy, a mono face for labels), instead of today's default typeface and generic gray/blue palette. The site reads as one designed thing rather than a stack of unstyled sections.

**Why this priority**: This is the entire point of the request — the current look is the problem being fixed. Without this, nothing else matters.

**Independent Test**: Load the page and scroll from hero to contact; every chapter's headings, body copy, and accents use the new typefaces and colors, with none left on the old system.

**Acceptance Scenarios**:

1. **Given** a visitor on any viewport, **When** the page loads, **Then** all headings and body copy render in the display typeface and all uppercase labels/eyebrows/tags render in the mono typeface, across every chapter.
2. **Given** a visitor scrolling the full story, **When** they pass through hero, work, career, the parallax quote band, skills, and contact, **Then** each chapter's background, text, borders, and accent colors come from the new warm-orange-on-cream palette rather than the previous colors.

---

### User Story 2 - Labels and accents read as a distinct, consistent voice (Priority: P2)

A visitor scanning the page can tell at a glance which text is a label (mono, uppercase, small) versus a heading or body copy (display face), and which elements are interactive or emphasized (primary/accent color), because the mono treatment and the primary/accent hues are used the same way everywhere.

**Why this priority**: Consistent hierarchy is what makes the new palette and type system actually legible and "designed" rather than just re-colored; it's the payoff of Story 1, one level down.

**Independent Test**: Inspect every label, tag, stat caption, and interactive element (buttons, active states, highlighted metrics) across chapters; confirm they consistently use the mono face and the primary/accent hues respectively, with no chapter using an ad hoc variant.

**Acceptance Scenarios**:

1. **Given** any chapter containing an uppercase label, eyebrow, or tag, **When** it renders, **Then** it uses the mono typeface at a consistent weight/tracking treatment.
2. **Given** any primary call-to-action, active state, or highlighted metric, **When** it renders, **Then** it uses the new primary or accent color consistently with equivalent elements in other chapters.

---

### User Story 3 - Text stays legible on every surface it sits on (Priority: P3)

A visitor with normal or low vision can read every piece of text on the page — over the bare background, over a card/panel, and over the pinned photograph's scrim — because the new palette's foreground and muted-foreground tones were chosen to keep sufficient contrast on each surface.

**Why this priority**: A visually distinctive palette that fails contrast on the photo surface would trade one problem (bland look) for a worse one (unreadable text); this guards the floor under Stories 1 and 2.

**Independent Test**: Check contrast of body and label text against each of the site's surfaces (bare background, card/panel, photo + scrim) and confirm each meets WCAG AA.

**Acceptance Scenarios**:

1. **Given** body copy on the bare background, **When** measured, **Then** it meets at least 4.5:1 contrast against that background.
2. **Given** body copy on a chapter's card/panel surface over the pinned photograph, **When** measured, **Then** it meets at least 4.5:1 contrast against the composited surface.

---

### Edge Cases

- What happens where the current design uses an opaque card background? It must be re-expressed as a translucent panel over the pinned photograph (per the site's existing surface rule), using the new card tone as a tint rather than a solid fill — not replaced with a solid, photo-hiding card.
- How does the page handle the moment the new fonts are still loading? Text must not be invisible, and layout must not jump noticeably once the fonts arrive.
- What happens to the experimental dark theme (behind the `?experiment=true` flag)? It must keep working; this restyle targets the default light theme only.
- What happens to existing interactive chapters (career player selection, timeline, scroll-triggered animation, annotations)? Their look changes; their behavior does not.
- How does long label or heading text behave now that the display face has different letter widths than the previous typeface? It must wrap and truncate the same way it did before, without overflowing or overlapping neighboring elements.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST load Space Grotesk (weights 400, 500, 600, 700) as the display/body typeface and JetBrains Mono (weights 400, 500) as the label/mono typeface for every visitor in the default theme, replacing the typefaces currently in use.
- **FR-002**: All headings and body copy across every existing chapter MUST render in the display typeface; all uppercase labels, eyebrows, tags, and stat captions MUST render in the mono typeface.
- **FR-003**: The background, foreground, primary, primary-foreground, accent, muted-foreground, border, and card colors MUST be updated to the specified warm-orange-on-cream values across every chapter.
- **FR-004**: The site's existing surface rule — one pinned photograph behind the story, chapters carrying a translucent scrim/panel rather than an opaque background — MUST be preserved; the new card tone is applied as a panel tint, not a solid fill.
- **FR-005**: Primary calls-to-action, active/hover states, and highlighted metrics MUST consistently use the new primary and accent colors across all chapters.
- **FR-006**: Body copy, labels, and captions MUST meet WCAG AA contrast (4.5:1 for normal text) against every surface they can appear on: the bare background, the card/panel tint, and the photo scrim.
- **FR-007**: The existing experimental dark theme (behind `?experiment=true`) MUST continue to function without regression; its token values are not redefined by this restyle.
- **FR-008**: Font loading MUST NOT produce invisible text, and MUST NOT cause a noticeable layout shift once the fonts finish loading; a system-font fallback stack MUST render in the interim.
- **FR-009**: The restyle MUST apply to every existing chapter of the single-page story (hero, work, career, parallax band, skills, contact, navigation) without adding, removing, reordering, or changing the behavior of any chapter or interaction.
- **FR-010**: Existing interactive behaviors (career pitch player selection, timeline, scroll-triggered motion, annotations) MUST be restyled visually but MUST remain functionally unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every chapter of the site, from hero through contact, visually presents the new typefaces and colors — zero chapters remain on the previous typeface or color set.
- **SC-002**: All body and label text measures at least 4.5:1 contrast against every surface it appears on (bare background, card/panel, photo scrim) in the default theme.
- **SC-003**: On a fresh page load, visitors see styled, visible text without a noticeable flash of invisible or unstyled text, and font loading does not produce a layout shift a visitor would notice.
- **SC-004**: Labels, eyebrows, and tags across all chapters consistently use the mono treatment; a visual sweep of the page finds no chapter using an inconsistent label style.
- **SC-005**: All existing interactive features (career player selection, timeline playback, scroll-triggered animation) behave identically before and after the restyle.

## Assumptions

- The palette and fonts in this request come from a separate, gitignored visual reference prototype (not part of this repository); only its color values and typefaces are being adopted, not its opaque-card/gradient-background surface system or its page structure.
- The section names in the request (Hero, Work, Career Match, Parallax Band, Craft, Contact) map onto the current site's existing chapters (Hero, Work, Career/Pitch, Parallax Band, the skills chapter, Contact); no new chapters, features, or interactions are introduced by this restyle.
- Dark-mode token values are out of scope: the request specifies light-theme values only, and the dark theme is already unfinished and gated behind an experiment flag.
- The new `--card` value is applied as a panel tint over the pinned photograph, consistent with the site's existing translucent-surface rule, rather than as an opaque fill.
- Standard font-loading practice (a swap-in strategy plus a system-font fallback stack) is used to avoid invisible text during font load.
