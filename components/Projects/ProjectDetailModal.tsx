'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils/animations';
import type { Project } from '@/lib/types/portfolio';
import { useUi } from '@/components/Common/LocaleProvider';
import { format } from '@/lib/i18n/format';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  /** True for the ~4s after the hero's credit pill opened this modal — see
   * `.project-card-highlight` in globals.css and the event/hash-driven
   * effect in ProjectGallery. */
  isHighlighted?: boolean;
  /** Changes on every highlight request, even repeats of the same project,
   * so the animation can be forced to restart — see the effect that reads
   * it below. */
  highlightToken?: number | null;
}

/**
 * Resolves the project's single CTA link: the first `links` entry whose
 * route contains `github.com`, falling back to the first link when none
 * does (research.md decision — every project already carries a GitHub or
 * most-primary link, so no new `githubUrl` field is needed). The fallback
 * case is not necessarily GitHub at all — a closed-source client project
 * (e.g. "Auth0 Identity & Access Platform") has no repo to link, and its
 * most-relevant link is whichever one the content puts first. The button's
 * own label is chosen to match (see isGithubLink below); it used to say
 * "View on GitHub" unconditionally, which was wrong — and misleading about
 * the destination — for exactly this fallback case.
 */
function resolvePrimaryLink(project: Project) {
  return project.links.find((link) => link.route.includes('github.com')) ?? project.links[0];
}

/**
 * Full-description modal for a featured project, opened from
 * `ProjectGallery`'s existing `selectedProjectId` state.
 *
 * Follows the same portal/backdrop/focus-trap/reduced-motion shape already
 * proven in `components/Navigation/HamburgerMenu.tsx` (research.md), but is a
 * true modal dialog (`role="dialog"`, `aria-modal="true"`) rather than a
 * disclosure panel: the rest of the page is inert and background scroll is
 * locked while it is open (spec FR-006), which the hamburger menu's
 * non-blocking nav panel never does.
 */
export function ProjectDetailModal({
  project,
  onClose,
  isHighlighted = false,
  highlightToken = null,
}: ProjectDetailModalProps) {
  const ui = useUi();
  const panelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Deferring the portal to an effect keeps the first client render matching
  // the server (no portal), avoiding a hydration mismatch — same reasoning as
  // HamburgerMenu.tsx.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [reducedMotion] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());

  // Moves focus into the panel on open, locks background scroll, and wires
  // Escape/outside-click to close while the modal is open. Listeners and the
  // scroll lock are removed on cleanup, mirroring HamburgerMenu.tsx.
  useEffect(() => {
    if (!mounted || !project) return;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      // frameRef, not panelRef: the highlight ring is drawn on the frame
      // just outside the panel, and a click landing on it is still a click
      // on the dialog, not the backdrop.
      if (frameRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [mounted, project, onClose]);

  // `.project-card-highlight`'s ::before runs a fixed `animation: ... 3` —
  // three loops, then it stops; it does not loop forever. Re-rendering with
  // the class already applied (the case when the hero's pill is clicked
  // again while this modal is still open and highlighted) touches no DOM, so
  // the browser has no reason to restart a finished-or-running animation.
  // Removing the class, forcing a reflow, then re-adding it — keyed off
  // `highlightToken`, which changes on every request even for repeats — is
  // what makes each click retrigger the ring from its first frame.
  useEffect(() => {
    if (!mounted || !project || !isHighlighted || highlightToken === null) return;
    const el = frameRef.current;
    if (!el) return;

    el.classList.remove('project-card-highlight');
    // Reading a layout property flushes the removal before the class goes
    // back on, so what follows is a fresh start rather than a no-op toggle.
    void el.offsetWidth;
    el.classList.add('project-card-highlight');
  }, [mounted, project, isHighlighted, highlightToken]);

  if (!mounted || !project) return null;

  const titleId = `project-detail-title-${project.id ?? project.title}`;
  const primaryLink = resolvePrimaryLink(project);
  const isGithubLink = primaryLink?.route.includes('github.com') ?? false;

  return createPortal(
    <>
      {/* Dimmed backdrop. A plain div — the pointerdown listener above
          already treats any click outside the panel as a close, so this
          needs no handler of its own. */}
      <div
        aria-hidden="true"
        className="bg-foreground/60 fixed inset-0 z-40 backdrop-blur-sm dark:bg-black/70"
      />
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          {/* The ring rides this frame rather than the panel itself: the
              panel scrolls its own overflow, and an absolutely positioned
              ::before inside a scroll container scrolls away with the
              content instead of staying pinned to the visible edge. The
              frame doesn't scroll, so the ring stays put. `rounded-2xl`
              here is what the ring's `border-radius: inherit` picks up. */}
          <div
            ref={frameRef}
            className={`w-full max-w-lg rounded-2xl ${isHighlighted ? 'project-card-highlight' : ''}`}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="chapter-panel max-h-[85vh] w-full overflow-y-auto rounded-2xl p-6 shadow-[0_10px_30px_-12px_rgb(17_28_56/0.45)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                  {project.title}
                </h2>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label={ui.projects.close}
                  className="text-on-photo hover:text-primary focus-visible:ring-primary shrink-0 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {(project.role || project.metric) && (
                <div className="text-on-photo mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                  {project.role && <span>{project.role}</span>}
                  {project.metric && <span>{project.metric}</span>}
                </div>
              )}

              <p className="text-on-photo mt-4 text-sm leading-relaxed">{project.bodyText}</p>

              {project.tags.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-on-photo label-mono border-border rounded-full border px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              {primaryLink && (
                <a
                  href={primaryLink.route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  {isGithubLink
                    ? ui.projects.viewOnGithub
                    : format(ui.projects.visitLive, { name: primaryLink.text })}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body,
  );
}
