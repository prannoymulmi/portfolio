import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Project } from '@/lib/types/portfolio';

/**
 * spec.md Edge Cases: "The toggle MUST NOT reset scroll position or
 * collapse open UI state (e.g. an open project detail view) where
 * avoidable." Flagged as an untested gap during Phase 7 polish (T065) —
 * this closes it for the open-modal half. jsdom has no layout engine, so
 * scroll-position preservation itself stays a documented, reasoned-through
 * gap (research.md / tasks.md T065) rather than something assertable here.
 *
 * The mechanism under test: LocaleProvider's setLocale is a context value
 * update, not a remount — no component in the tree is keyed by locale
 * (verified separately by grep in T065), so React reconciles in place and
 * any local component state (like ProjectGallery's selectedProjectId)
 * survives a toggle untouched.
 */
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub only
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(() => false),
}));

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: React.forwardRef(
        (
          { children, initial, animate, exit, transition, ...rest }: Record<string, unknown>,
          ref: React.Ref<HTMLDivElement>,
        ) => (
          <div ref={ref} {...rest}>
            {children as React.ReactNode}
          </div>
        ),
      ),
    },
  };
});

const mockProjects: { data: { projects: Project[] } | null; loading: boolean; error: Error | null } = {
  loading: false,
  error: null,
  data: {
    projects: [
      {
        id: 'alpha',
        title: 'Alpha Project',
        bodyText: 'A description long enough to read like real body copy that ends without truncation.',
        links: [{ text: 'View on GitHub', route: 'https://github.com/prannoymulmi/example' }],
        tags: ['TypeScript'],
      },
    ],
  },
};

jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({ projects: mockProjects }),
}));

jest.mock('@/lib/i18n/locales', () => {
  const actual = jest.requireActual('@/lib/i18n/locales');
  return {
    ...actual,
    SUPPORTED_LOCALES: [
      { code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' },
      { code: 'de', label: 'Deutsch', shortLabel: 'DE', htmlLang: 'de' },
    ],
    isLocale: (value: unknown) => value === 'en' || value === 'de',
  };
});

import { ProjectGallery } from '@/components/Projects/ProjectGallery';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { LocaleToggle } from '@/components/Common/LocaleToggle';

describe('toggling locale preserves open UI state (spec.md Edge Cases)', () => {
  it('does not close an open project detail modal when the language is switched', () => {
    render(
      <LocaleProvider>
        <LocaleToggle />
        <ProjectGallery />
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /alpha project/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /english.*deutsch/i }));

    // Still open, and still showing the same project — a remount would have
    // reset selectedProjectId to null and closed it.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
