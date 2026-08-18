/**
 * Cross-component signal for "point the visitor at this project card, with a
 * moving light along its border". The hero's "Built with Claude Code" pill
 * (components/Hero/Hero.tsx) and the card it targets
 * (components/Projects/ProjectGallery.tsx) sit on the same page but aren't
 * parent/child, so a DOM CustomEvent is the connection between them rather
 * than a prop drilled through app/page.tsx.
 *
 * The `/#project-<id>` hash the pill links to is deliberately kept alongside
 * this event, not replaced by it: the hash is what gets the browser to
 * scroll there at all (globals.css `scroll-behavior: smooth`, plus the
 * matching `id` ProjectCard sets), so a bookmarked or refreshed link still
 * lands on the right card even in a fresh page load where this event never
 * fires. The event only adds the highlight when a click happens without a
 * full navigation.
 */
export const PROJECT_HIGHLIGHT_EVENT = 'portfolio:highlight-project';

export interface ProjectHighlightDetail {
  id: string;
  /**
   * Monotonically increasing per dispatch, never reused — this is what lets
   * ProjectGallery tell two consecutive clicks on the *same* card apart.
   * `id` alone can't: setting React state to a value it already holds is a
   * no-op re-render, so a second click while the first card is still (or
   * again) highlighted would otherwise never flip `highlightedId` and the
   * CSS animation would never restart. See nextProjectHighlightToken().
   */
  token: number;
}

export function dispatchProjectHighlight(id: string): void {
  window.dispatchEvent(
    new CustomEvent<ProjectHighlightDetail>(PROJECT_HIGHLIGHT_EVENT, {
      detail: { id, token: nextProjectHighlightToken() },
    }),
  );
}

// Shared by the dispatch above and ProjectGallery's own hash-on-load path,
// so every highlight request — click or refreshed `/#project-<id>` link —
// draws from the same counter and no two ever compare equal.
let lastToken = 0;
export function nextProjectHighlightToken(): number {
  lastToken += 1;
  return lastToken;
}

// The one project the hero's credit pill currently targets — kept here,
// not re-typed at the two call sites, so the link and the data file's own
// `id` field (public/data/projects.json) can't drift apart silently.
export const PORTFOLIO_PROJECT_ID = 'portfolio-spec-driven';
