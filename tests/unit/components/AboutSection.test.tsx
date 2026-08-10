import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AboutSection } from '@/components/About/AboutSection';
import { ContentProvider } from '@/components/Common/ContentProvider';

describe('AboutSection', () => {
  const renderSection = () =>
    render(
      <ContentProvider>
        <AboutSection />
      </ContentProvider>,
    );

  it('renders the biography from about.json', async () => {
    renderSection();
    expect(
      await screen.findByText(/senior software engineer with 10\+ years/i),
    ).toBeInTheDocument();
  });

  it('renders the About Me heading once content loads', async () => {
    renderSection();
    expect(await screen.findByRole('heading', { name: /about me/i })).toBeInTheDocument();
  });

  it('embeds SocialLinks below the biography', async () => {
    renderSection();
    expect(await screen.findByRole('heading', { name: /connect with me/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Visit my LinkedIn/i })).toBeInTheDocument();
  });

  it('shows a placeholder graphic instead of blank space when about.json has no imageSource', async () => {
    // Today's about.json has no imageSource, so this exercises the real,
    // unmocked "no photo yet" state described in FR-005/SC-005.
    renderSection();
    await screen.findByRole('heading', { name: /about me/i });
    expect(screen.getByRole('img', { name: /profile photo coming soon/i })).toBeInTheDocument();
  });
});
