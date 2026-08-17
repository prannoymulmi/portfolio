import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoryProgressNav } from '@/components/Navigation/StoryProgressNav';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { clearContentCache } from '@/lib/hooks/useContentLoader';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...rest }: React.ComponentProps<'div'>) => <div {...rest}>{children}</div>,
  },
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: (value: unknown) => value,
}));

// The nav lives inside ContentProvider in the real layout, and now reads the
// social content, so the test mirrors that.
const renderNav = () =>
  render(
    <ContentProvider>
      <StoryProgressNav />
    </ContentProvider>,
  );

describe('StoryProgressNav', () => {
  // The loader caches per session; without this the failure case below is
  // served the content an earlier test already fetched.
  beforeEach(() => clearContentCache());

  it('offers both profile links from anywhere in the story', async () => {
    renderNav();

    expect(await screen.findByRole('link', { name: /LinkedIn/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /GitHub/i })).toBeInTheDocument();
  });

  describe('the wordmark', () => {
    it('carries the owner name as the page heading', async () => {
      renderNav();
      // Waits on the accessible name: the heading is in the DOM immediately,
      // but the name arrives with the content fetch.
      const heading = await screen.findByRole('heading', { level: 1, name: 'Prannoy Mulmi' });

      // The nav renders ahead of <main>, so this is the document's first
      // heading as well as the site's mark.
      expect(heading).toHaveTextContent('Prannoy Mulmi');
      expect(document.querySelectorAll('h1')).toHaveLength(1);
    });

    it('announces the full name, not the two-letter mark', async () => {
      renderNav();
      const heading = await screen.findByRole('heading', { level: 1, name: 'Prannoy Mulmi' });

      // "PM" is decoration once there is a name to announce instead; below sm the name is visually hidden rather than
      // removed, so the heading never announces as two letters on a phone.
      expect(heading).toHaveAccessibleName('Prannoy Mulmi');
      expect(heading.querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('returns to the top of the story', async () => {
      renderNav();
      const heading = await screen.findByRole('heading', { level: 1, name: 'Prannoy Mulmi' });
      expect(heading.querySelector('a')).toHaveAttribute('href', '#hero');
    });
  });

  describe('the floating bar', () => {
    it('floats: inset from the viewport edges, with fully rounded ends', () => {
      const { container } = renderNav();
      const bar = container.querySelector('.sticky');

      expect(bar).not.toBeNull();
      // Detached rather than spanning edge to edge (FR-011).
      expect(bar!.className).toMatch(/rounded-full/);
      expect(bar!.className).toMatch(/mx-/);
      // Clips the progress hairline to the rounded shape.
      expect(bar!.className).toMatch(/overflow-hidden/);
    });

    it('shows no section links inline — only the wordmark, menu toggle, and icon group', async () => {
      renderNav();
      await screen.findByRole('heading', { level: 1, name: 'Prannoy Mulmi' });

      // The chapter list moved into the hamburger menu (spec 010-hamburger-nav,
      // FR-001); the bar itself carries none of it.
      for (const label of [
        'Introduction',
        'Selected Work',
        'Career Journey',
        'Education',
        'Projects',
        'Contact',
      ]) {
        expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument();
      }
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('keeps the wordmark, toggle, and full icon group together in one render', async () => {
      renderNav();

      // FR-001, FR-010: nothing here is conditional on the others.
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Prannoy Mulmi' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
      expect(await screen.findByRole('link', { name: /linkedin/i })).toBeInTheDocument();
      expect(await screen.findByRole('link', { name: /email/i })).toBeInTheDocument();
    });

    it('still conveys reading progress after the reshape', () => {
      const { container } = renderNav();
      // FR-015: the bar changed shape; the progress indicator survives it.
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('offers the contact address from anywhere in the story', async () => {
      renderNav();
      const link = await screen.findByRole('link', { name: /email/i });
      expect(link).toHaveAttribute('href', 'mailto:prannoy.mulmi@gmail.com');
    });
  });

  it('keeps working when the social content fails to load', async () => {
    const realFetch = global.fetch;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input);
      if (url.includes('social.json')) {
        return { ok: false, status: 500, statusText: 'Server Error', json: async () => ({}) };
      }
      return realFetch(input);
    }) as unknown as typeof fetch;

    try {
      renderNav();

      // The menu toggle is the nav's own job; social is not.
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
      });
      expect(screen.queryByRole('link', { name: /GitHub/i })).not.toBeInTheDocument();
    } finally {
      global.fetch = realFetch;
    }
  });
});
