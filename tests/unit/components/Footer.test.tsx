import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '@/components/Navigation/Footer';
import { ContentProvider } from '@/components/Common/ContentProvider';

describe('Footer', () => {
  const renderFooter = () =>
    render(
      <ContentProvider>
        <Footer />
      </ContentProvider>,
    );

  it('keeps GitHub and LinkedIn reachable now that the nav bar is gone', async () => {
    renderFooter();
    const github = await screen.findByRole('link', { name: /github/i });
    const linkedin = await screen.findByRole('link', { name: /linkedin/i });

    expect(github).toHaveAttribute('href', expect.stringContaining('github.com'));
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');

    expect(linkedin).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
    expect(linkedin).toHaveAttribute('target', '_blank');
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('points Quick Links at in-page story anchors, not the removed standalone pages', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/#projects');
    expect(screen.getByRole('link', { name: 'Skills' })).toHaveAttribute('href', '/#skills');
    expect(screen.getByRole('link', { name: 'Career' })).toHaveAttribute('href', '/#career');
  });
});
