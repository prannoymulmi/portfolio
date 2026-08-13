'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
 * that ancestor; position is tracked from the toggle's own bounding rect.
 */
export function HamburgerMenu({ sections }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });
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

  // Measured fresh on every open rather than continuously, so the portal
  // stays anchored under the toggle without a scroll listener running while
  // closed. A resize while open closes the menu (below) rather than
  // re-measuring, so this only needs to run once per open.
  useLayoutEffect(() => {
    if (!open || !toggleRef.current) return;
    const rect = toggleRef.current.getBoundingClientRect();
    setPanelPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
  }, [open]);

  // Moves focus into the panel on open. Escape, an outside click, or a
  // viewport resize close the menu while it's open; listeners attach only
  // then and are removed on cleanup, matching the ResizeObserver pattern
  // already used elsewhere in this component's parent.
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
          <AnimatePresence>
            {open && (
              <motion.nav
                ref={panelRef}
                id="story-sections-menu"
                aria-label="Story sections"
                initial={reducedMotion ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={reducedMotion ? { duration: 0 } : undefined}
                onKeyDown={(event: React.KeyboardEvent) => {
                  // Keeps focus inside the panel on Tab: without this,
                  // tabbing past the last link (or shift-tabbing past the
                  // first) would leave the panel for the rest of the page
                  // while it is still open and visually in front of it.
                  const focusable = panelRef.current?.querySelectorAll('a');
                  if (!focusable || focusable.length === 0) return;
                  const first = focusable[0];
                  const last = focusable[focusable.length - 1];

                  if (event.key === 'Tab' && !event.shiftKey && document.activeElement === last) {
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
                style={{ top: panelPosition.top, right: panelPosition.right }}
                className="fixed z-50 min-w-48 overflow-hidden rounded-2xl bg-[#fffaf4]/95 py-2 shadow-[0_10px_30px_-12px_rgb(17_28_56/0.45)] ring-1 ring-[#111c38]/10 backdrop-blur-xl dark:bg-[#0c101c]/95 dark:ring-white/10"
              >
                <ul className="flex flex-col text-sm font-medium text-foreground dark:text-gray-200">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={`#${section.id}`}
                        onClick={close}
                        className="block px-4 py-2 hover:bg-black/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:ring-primary dark:hover:bg-white/5 dark:hover:text-blue-400"
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
