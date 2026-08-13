'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils/animations';

export interface HamburgerMenuSection {
  id: string;
  label: string;
}

interface HamburgerMenuProps {
  sections: HamburgerMenuSection[];
}

/**
 * One hand-drawn line icon per chapter id, matching the toggle's own
 * hamburger/close glyph (round caps/joins, 1.75 stroke) rather than a general
 * icon package. Constitution IV (Technology Stack, NON-NEGOTIABLE) confines
 * `react-icons` to the brand marks in SocialIcons.tsx alone (ADR 0014); a
 * decorative set for every chapter link is exactly the drift that scoping was
 * meant to prevent, so these are paths, not a dependency.
 */
const SECTION_ICON_PATHS: Record<string, React.ReactNode> = {
  hero: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  skills: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  career: (
    <>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </>
  ),
  education: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3 5v14c4-.5 7 0 9 1.5V6.5Z" />
      <path d="M12 6.5c2-1.5 5-2 9-1.5v14c-4-.5-7 0-9 1.5V6.5Z" />
    </>
  ),
  projects: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  playbook: (
    <>
      <polyline points="8 6 3 12 8 18" />
      <polyline points="16 6 21 12 16 18" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

function SectionIcon({ id }: { id: string }) {
  const paths = SECTION_ICON_PATHS[id];
  // An id outside the known set (future chapter, typo) still renders a link —
  // it just goes without decoration rather than throwing.
  if (!paths) return null;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}

/**
 * Replaces the bar's inline, horizontally-scrolling section list with a
 * single toggle. The seven chapter links move here rather than disappearing —
 * only their presentation changes (spec 010-hamburger-nav).
 *
 * A disclosure widget (toggle button + expandable region), not the ARIA
 * "menu" authoring pattern: these are plain anchor links a visitor Tabs
 * through, not application commands navigated with arrow keys, so the
 * simpler, more familiar pattern is the correct one (Constitution I).
 *
 * The panel portals to `document.body` rather than rendering as an absolute
 * child of the toggle. The bar it lives in has `overflow-hidden` (needed to
 * clip the progress hairline to its own rounded ends), and any
 * absolutely-positioned descendant is clipped by that ancestor regardless of
 * z-index — the panel would open but never be visible. Portaling escapes
 * that ancestor and lets the panel run the full height of the viewport
 * instead of being anchored under the toggle.
 */
export function HamburgerMenu({ sections }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Read once via lazy initializer — `window` isn't available during SSR —
  // matching the same helper and pattern StoryProgressNav already uses for
  // its own motion, rather than a second detection path (Constitution
  // Technology & Quality Constraints).
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  // Moves focus into the panel on open. Escape, an outside click (which
  // includes the dimmed backdrop behind the panel), or a viewport resize
  // close the menu while it's open; listeners attach only then and are
  // removed on cleanup.
  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      close();
    };
    const handleResize = () => close();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={toggleRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="story-sections-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center rounded p-1.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-100 dark:hover:text-blue-400"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Dimmed backdrop behind the panel. Always mounted (rather than
                gated on `open`) so it can fade out with the panel on close;
                its own opacity/pointer-events do the showing and hiding. A
                plain div, not a button — the pointerdown listener above
                already treats any click outside the panel as a close, so this
                needs no handler of its own and stays out of the toggle's way
                as the page's one "close menu" control. */}
            <div
              aria-hidden="true"
              className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/60 ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            />
            <AnimatePresence>
              {open && (
                <motion.nav
                  ref={panelRef}
                  id="story-sections-menu"
                  aria-label="Story sections"
                  initial={reducedMotion ? false : { x: '100%' }}
                  animate={{ x: 0 }}
                  exit={reducedMotion ? undefined : { x: '100%' }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 32 }}
                  onKeyDown={(event: React.KeyboardEvent) => {
                    // Keeps focus inside the panel on Tab: without this,
                    // tabbing past the last link (or shift-tabbing past the
                    // first) would leave the panel for the rest of the page
                    // while it is still open and visually in front of it.
                    const focusable = panelRef.current?.querySelectorAll('a');
                    if (!focusable || focusable.length === 0) return;
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (
                      event.key === 'Tab' &&
                      !event.shiftKey &&
                      document.activeElement === last
                    ) {
                      event.preventDefault();
                      first.focus();
                    } else if (
                      event.key === 'Tab' &&
                      event.shiftKey &&
                      document.activeElement === first
                    ) {
                      event.preventDefault();
                      last.focus();
                    }
                  }}
                  className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col overflow-y-auto bg-[#fffaf4]/95 px-6 pb-8 pt-20 shadow-[0_10px_30px_-12px_rgb(17_28_56/0.45)] ring-1 ring-[#111c38]/10 backdrop-blur-xl dark:bg-[#0c101c]/95 dark:ring-white/10 sm:max-w-sm"
                >
                  <p className="label-mono text-xs text-foreground/50 dark:text-gray-400">
                    Jump to
                  </p>
                  <ul className="mt-2 flex flex-1 flex-col">
                    {sections.map((section, index) => (
                      <li key={section.id}>
                        <a
                          ref={index === 0 ? firstLinkRef : undefined}
                          href={`#${section.id}`}
                          onClick={close}
                          className="group flex items-center gap-3 border-b border-foreground/10 py-4 text-base font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:ring-primary dark:border-white/10 dark:text-gray-100 dark:hover:text-blue-400"
                        >
                          <SectionIcon id={section.id} />
                          <span className="flex-1">{section.label}</span>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0 text-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.75}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.nav>
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </div>
  );
}
