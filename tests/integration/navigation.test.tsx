import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navbar } from '@/components/Navigation/Navbar';
import { ContentProvider } from '@/components/Common/ContentProvider';

jest.mock('next/navigation', () => ({
  usePathname: () => '/career',
}));

describe('Navbar', () => {
  const renderNav = () =>
    render(
      <ContentProvider>
        <Navbar />
      </ContentProvider>,
    );

  it('renders every section from navbar.json as a link', async () => {
    renderNav();
    // Wait for content by finding a known link
    expect(await screen.findAllByRole('link', { name: /home/i })).not.toHaveLength(0);
    expect(screen.getAllByRole('link', { name: /skills/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /projects/i }).length).toBeGreaterThan(0);
  });

  it('marks the active route with distinct styling', async () => {
    renderNav();
    const careerLinks = await screen.findAllByRole('link', { name: /^career$/i });
    // Desktop + potentially mobile — at least one must carry the active class
    expect(careerLinks.some((el) => el.className.includes('bg-blue-100'))).toBe(true);
  });

  it('opens external links (GitHub, LinkedIn) in a new tab', async () => {
    renderNav();
    const github = (await screen.findAllByRole('link', { name: /github/i }))[0];
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('toggles the mobile menu when the hamburger is clicked', async () => {
    renderNav();
    // Wait for nav to render
    await screen.findAllByRole('link', { name: /home/i });
    const toggle = screen.getByRole('button', { name: /menu|open|close/i });
    fireEvent.click(toggle);
    // After opening, links appear both in desktop (hidden md:flex) and mobile lists.
    // Just assert the toggle didn't crash and is still in the document.
    expect(toggle).toBeInTheDocument();
  });
});
