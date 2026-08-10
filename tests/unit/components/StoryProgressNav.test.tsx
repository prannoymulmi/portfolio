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

  it('renders a jump link for every story section', () => {
    renderNav();

    const expectedSections = [
      'Introduction',
      'About',
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
