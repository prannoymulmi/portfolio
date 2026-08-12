import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContactSection } from '@/components/Contact/ContactSection';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { clearContentCache } from '@/lib/hooks/useContentLoader';

const ADDRESS = 'prannoy.mulmi@gmail.com';

const renderContact = () =>
  render(
    <ContentProvider>
      <ContactSection />
    </ContentProvider>,
  );

describe('ContactSection', () => {
  beforeEach(() => clearContentCache());

  it('shows the address as readable text, not only as a link target', async () => {
    renderContact();
    // FR-024: someone reading the page, or copying it down, needs the address
    // itself — not a "get in touch" that hides it behind an href.
    expect(await screen.findByText(ADDRESS)).toBeInTheDocument();
  });

  it('makes the address activatable', async () => {
    renderContact();
    const link = await screen.findByRole('link', { name: new RegExp(ADDRESS, 'i') });
    expect(link).toHaveAttribute('href', `mailto:${ADDRESS}`);
  });

  it('no longer says the chapter is coming soon', async () => {
    renderContact();
    await screen.findByText(ADDRESS);
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('reads the address from content, so it is edited in one place', async () => {
    const realFetch = global.fetch;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input);
      if (url.includes('social.json')) {
        return {
          ok: true,
          status: 200,
          statusText: 'stub',
          json: async () => ({
            social: [{ network: 'GitHub', href: 'https://github.com/example' }],
            email: 'someone.else@example.com',
          }),
        };
      }
      return realFetch(input);
    }) as unknown as typeof fetch;

    try {
      renderContact();
      expect(await screen.findByText('someone.else@example.com')).toBeInTheDocument();
      expect(screen.queryByText(ADDRESS)).not.toBeInTheDocument();
    } finally {
      global.fetch = realFetch;
    }
  });

  it('keeps its heading and does not throw when the content fails to load', async () => {
    const realFetch = global.fetch;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : String(input);
      if (url.includes('social.json')) {
        return { ok: false, status: 500, statusText: 'Server Error', json: async () => ({}) };
      }
      return realFetch(input);
    }) as unknown as typeof fetch;

    try {
      renderContact();
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /contact/i })).toBeInTheDocument();
      });
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    } finally {
      global.fetch = realFetch;
    }
  });
});
