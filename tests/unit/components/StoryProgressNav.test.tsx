import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoryProgressNav } from '@/components/Navigation/StoryProgressNav';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { clearContentCache } from '@/lib/hooks/useContentLoader';

jest.mock('framer-motion', () => ({
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

  it('renders a jump link for every story section, and none for the retired About chapter', () => {
    renderNav();

    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();

    const expectedSections = [
      'Introduction',
      'Skills',
      'Career Journey',
      'Education',
      'Projects',
      'Technical Playbook',
      'Contact',
    ];

    for (const label of expectedSections) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('points the career entry at the #career anchor', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Career Journey' })).toHaveAttribute('href', '#career');
  });

  it('offers both profile links from anywhere in the story', async () => {
    renderNav();

    expect(await screen.findByRole('link', { name: /LinkedIn/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /GitHub/i })).toBeInTheDocument();
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

    it('scrolls the section links inside itself rather than the page', () => {
      renderNav();
      // At 375px the contents are roughly 2.2x the available width, so the
      // links scroll within the bar while the controls stay put (FR-016a).
      const list = screen.getByRole('navigation', { name: /story sections/i });
      expect(list.className).toMatch(/overflow-x-auto/);
    });

    it('marks the edge where more links exist, so overflow does not read as clipping', () => {
      renderNav();
      const list = screen.getByRole('navigation', { name: /story sections/i });
      // FR-016b.
      expect(list.className).toMatch(/mask-r-from/);
    });

    it('keeps the controls out of the scrolling region, so they never scroll away', () => {
      renderNav();
      const list = screen.getByRole('navigation', { name: /story sections/i });
      const themeToggle = screen.getByRole('button');

      expect(list.contains(themeToggle)).toBe(false);
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

      // The chapter links and the theme toggle are the nav's job; social is not.
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Skills' })).toBeInTheDocument();
      });
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /GitHub/i })).not.toBeInTheDocument();
    } finally {
      global.fetch = realFetch;
    }
  });
});
