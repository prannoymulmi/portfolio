import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocialIcons } from '@/components/Navigation/SocialIcons';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { clearContentCache } from '@/lib/hooks/useContentLoader';

const renderWithProvider = () =>
  render(
    <ContentProvider>
      <SocialIcons />
    </ContentProvider>,
  );

/** Serve a custom social.json for one test, leaving other content untouched. */
function stubSocialContent(payload: unknown, ok = true) {
  const realFetch = global.fetch;
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : String(input);
    if (url.includes('social.json')) {
      return { ok, status: ok ? 200 : 500, statusText: 'stub', json: async () => payload };
    }
    return realFetch(input);
  }) as unknown as typeof fetch;
  return () => {
    global.fetch = realFetch;
  };
}

describe('SocialIcons', () => {
  // The loader caches per session, so without this a later test is served the
  // content an earlier one already fetched.
  beforeEach(() => clearContentCache());

  it('renders a link for each network in the content', async () => {
    renderWithProvider();
    expect(await screen.findByRole('link', { name: /LinkedIn/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /GitHub/i })).toBeInTheDocument();
  });

  it('names each link by its destination, so a glyph is never announced unlabelled', async () => {
    renderWithProvider();
    const github = await screen.findByRole('link', { name: /GitHub/i });

    expect(github).toHaveAccessibleName();
    // The glyph must not be read out on top of the label.
    expect(github.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens each destination in a new tab with safe rel attributes', async () => {
    renderWithProvider();
    const linkedin = await screen.findByRole('link', { name: /LinkedIn/i });

    expect(linkedin).toHaveAttribute('target', '_blank');
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkedin).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
  });

  it('renders a readable label for a network with no matching glyph', async () => {
    const restore = stubSocialContent({
      social: [{ network: 'Mastodon', href: 'https://example.com/@someone' }],
      // Required by the schema since the contact address moved into this file.
      // Without it the stub is invalid content, and the component under test
      // correctly renders nothing — which would look like a glyph-fallback bug.
      email: 'someone@example.com',
    });

    try {
      renderWithProvider();
      const link = await screen.findByRole('link', { name: /Mastodon/i });
      expect(link).toHaveTextContent('Mastodon');
      expect(link.querySelector('svg')).toBeNull();
    } finally {
      restore();
    }
  });

  it('renders nothing when the social content fails to load', async () => {
    const restore = stubSocialContent({}, false);

    try {
      const { container } = renderWithProvider();
      await waitFor(() => expect(container).toBeEmptyDOMElement());
    } finally {
      restore();
    }
  });
});
