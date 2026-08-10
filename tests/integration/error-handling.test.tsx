import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import { EducationSection } from '@/components/Education/EducationSection';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { clearContentCache } from '@/lib/hooks/useContentLoader';

describe('Error handling', () => {
  beforeEach(() => {
    clearContentCache();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a fallback UI when a child throws', () => {
    const Boom = () => {
      throw new Error('Simulated content failure');
    };

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders a section-level fallback (not a crash) when JSON fetch 404s', async () => {
    const originalFetch = global.fetch;
    // Force every fetch to fail for this test — simulating missing JSON files.
    (global.fetch as jest.Mock).mockImplementation(async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
      text: async () => 'not found',
    }));

    render(
      <ErrorBoundary>
        <ContentProvider>
          <EducationSection />
        </ContentProvider>
      </ErrorBoundary>,
    );

    expect(await screen.findByText(/failed to load education/i)).toBeInTheDocument();

    global.fetch = originalFetch;
  });
});
