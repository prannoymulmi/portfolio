import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocialLinks } from '@/components/About/SocialLinks';
import { ContentProvider } from '@/components/Common/ContentProvider';

describe('SocialLinks', () => {
  const renderWithProvider = () =>
    render(
      <ContentProvider>
        <SocialLinks />
      </ContentProvider>,
    );

  it('renders each social link from social.json', async () => {
    renderWithProvider();
    expect(await screen.findByRole('link', { name: /Visit my LinkedIn/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Visit my GitHub/i })).toBeInTheDocument();
  });

  it('opens links in a new tab with safe rel attributes', async () => {
    renderWithProvider();
    const linkedin = await screen.findByRole('link', { name: /Visit my LinkedIn/i });
    expect(linkedin).toHaveAttribute('target', '_blank');
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('points each link at the href defined in JSON', async () => {
    renderWithProvider();
    const linkedin = await screen.findByRole('link', { name: /Visit my LinkedIn/i });
    const github = await screen.findByRole('link', { name: /Visit my GitHub/i });
    expect(linkedin).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
    expect(github).toHaveAttribute('href', expect.stringContaining('github.com'));
  });
});
