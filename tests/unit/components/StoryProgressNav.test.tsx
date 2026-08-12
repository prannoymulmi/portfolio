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

/**
 * jsdom does no layout, so nothing ever overflows and the edge fade stays off —
 * which is the correct behaviour, but means the fade has to be provoked to be
 * tested at all. Forcing scrollWidth past clientWidth is the smallest way to
 * stand in for a narrow viewport.
 */
function withOverflowingChapters<T>(run: () => T): T {
  const scroll = jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900);
  const client = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(160);
  try {
    return run();
  } finally {
    scroll.mockRestore();
    client.mockRestore();
  }
}

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
    it('puts the wordmark first and the chapters after it', async () => {
      const { container } = renderNav();
      const heading = await screen.findByRole('heading', { level: 1, name: 'Prannoy Mulmi' });
      const sections = screen.getByRole('navigation', { name: /story sections/i });

      // Wordmark left, chapters right — the chapters are pushed over by an
      // auto margin rather than reordered, so this also holds in the DOM.
      expect(
        heading.compareDocumentPosition(sections) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(sections.querySelector('ul')?.className).toMatch(/ml-auto/);
      expect(container).toBeTruthy();
    });

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

    it('marks the edge only when chapters are actually out of sight', () => {
      withOverflowingChapters(() => {
        renderNav();
        const list = screen.getByRole('navigation', { name: /story sections/i });
        // FR-016b.
        expect(list.className).toMatch(/mask-r-from/);
      });
    });

    it('shows no edge fade when every chapter already fits', () => {
      renderNav();
      const list = screen.getByRole('navigation', { name: /story sections/i });

      // The list is right-aligned, so an unconditional fade left the last
      // chapter permanently half-faded on a desktop where nothing was hidden.
      expect(list.className).not.toMatch(/mask-r-from/);
    });

    it('drops the edge fade while anything inside has focus', () => {
      withOverflowingChapters(() => {
        renderNav();
        const list = screen.getByRole('navigation', { name: /story sections/i });
        // A mask fades by position and cannot be told to spare one child, so the
        // fade is removed outright during keyboard traversal rather than having
        // a focused link land underneath it (FR-016c).
        expect(list.className).toMatch(/focus-within:mask-none/);
      });
    });

    it('scrolls a focused link fully into view itself', () => {
      renderNav();
      const link = screen.getByRole('link', { name: 'Career Journey' });
      const scrollIntoView = jest.fn();
      Object.defineProperty(link, 'scrollIntoView', { value: scrollIntoView, writable: true });

      link.focus();

      // Chrome does not scroll a *partially* visible focused child on its own.
      // Measured at 375px: "Career Journey" sat 89px outside the scroller and
      // scrollLeft never moved, so the component has to ask explicitly.
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'center' });
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
