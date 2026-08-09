import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Hero } from '@/components/Hero/Hero';
import { ContentProvider } from '@/components/Common/ContentProvider';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useScroll: () => ({ scrollY: 0 }),
  useTransform: () => 0,
}));

describe('Hero Component', () => {
  const renderHero = () => {
    return render(
      <ContentProvider>
        <Hero />
      </ContentProvider>,
    );
  };

  it('renders hero section', () => {
    renderHero();
    // Hero section should render
    const section = screen.queryByRole('region');
    expect(section || document.querySelector('section')).toBeInTheDocument();
  });

  it('displays portfolio owner name when content loads', async () => {
    renderHero();
    // Wait for name to appear (from home.json)
    const nameElement = await screen.findByText(/Prannoy Mulmi/i);
    expect(nameElement).toBeInTheDocument();
  });

  it('displays primary role/title', async () => {
    renderHero();
    // Check for role title (first role from home.json)
    const roleElement = await screen.findByText(/Senior Software Engineer/i);
    expect(roleElement).toBeInTheDocument();
  });

  it('has View Work CTA button linking to projects', async () => {
    renderHero();
    const viewWorkButton = await screen.findByRole('link', { name: /View Work/i });
    expect(viewWorkButton).toHaveAttribute('href', '/projects');
  });

  it('has Play Career CTA button linking to career', async () => {
    renderHero();
    const playCareerButton = await screen.findByRole('link', { name: /Play Career/i });
    expect(playCareerButton).toHaveAttribute('href', '/career');
  });

  it('displays core expertise skills preview', async () => {
    renderHero();
    // Check for skills section heading
    const skillsHeading = await screen.findByText(/Core Expertise/i);
    expect(skillsHeading).toBeInTheDocument();
  });

  it('contains value proposition text', async () => {
    renderHero();
    const valueText = await screen.findByText(/build scalable cloud systems/i);
    expect(valueText).toBeInTheDocument();
  });
});
