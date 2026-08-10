import { render, screen, within } from '@testing-library/react';
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

// rough-notation measures real layout, which jsdom doesn't provide. The
// wrapper always renders its children regardless, so the text assertions
// below still exercise what matters.
jest.mock('rough-notation', () => ({
  annotate: () => ({ show: jest.fn(), hide: jest.fn(), remove: jest.fn() }),
}));

describe('Hero Component', () => {
  const renderHero = () => {
    return render(
      <ContentProvider>
        <Hero />
      </ContentProvider>,
    );
  };

  it('renders hero section', async () => {
    renderHero();
    await screen.findByText(/Prannoy Mulmi/i);
    expect(document.querySelector('section')).toBeInTheDocument();
  });

  it('displays portfolio owner name when content loads', async () => {
    renderHero();
    const nameElement = await screen.findByText(/Prannoy Mulmi/i);
    expect(nameElement).toBeInTheDocument();
  });

  it('renders every role phrase from home.json, each annotated', async () => {
    renderHero();
    const list = await screen.findByRole('list', { name: /what i do/i });
    for (const phrase of ['Software Engineer', 'AI enthusiast', 'Security Nerd']) {
      // Rendered with a trailing period as a styling choice, so match loosely.
      expect(within(list).getByText(new RegExp(`^${phrase}\\.?$`))).toBeInTheDocument();
    }
  });

  it('stacks the phrases one per line so the colour bars read vertically', async () => {
    renderHero();
    const list = await screen.findByRole('list', { name: /what i do/i });
    // One list item per phrase, rather than an inline run of highlights.
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('displays the intro statement from content, not hardcoded copy', async () => {
    renderHero();
    expect(await screen.findByText(/scalable cloud systems/i)).toBeInTheDocument();
  });

  it('has View Work CTA button linking to the projects section', async () => {
    renderHero();
    const viewWorkButton = await screen.findByRole('link', { name: /View Work/i });
    expect(viewWorkButton).toHaveAttribute('href', '/#projects');
  });

  it('has Play Career CTA button linking to the career section', async () => {
    renderHero();
    const playCareerButton = await screen.findByRole('link', { name: /Play Career/i });
    expect(playCareerButton).toHaveAttribute('href', '/#career');
  });

  it('applies a gradient background to the introduction', async () => {
    renderHero();
    await screen.findByText(/Prannoy Mulmi/i);
    const section = document.querySelector('section');
    expect(section?.className).toMatch(/bg-gradient-to-/);
  });

  it('shows a profile-picture placeholder in the introduction', async () => {
    renderHero();
    await screen.findByText(/Prannoy Mulmi/i);
    expect(screen.getByRole('img', { name: /profile photo coming soon/i })).toBeInTheDocument();
  });

  it('shows a flag for each country on the card', async () => {
    renderHero();
    await screen.findByText(/Prannoy Mulmi/i);
    expect(screen.getByRole('img', { name: /germany/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /nepal/i })).toBeInTheDocument();
  });

  it('no longer shows the Core Expertise card — the Skills chapter covers it', async () => {
    renderHero();
    await screen.findByText(/Prannoy Mulmi/i);
    expect(screen.queryByText(/Core Expertise/i)).not.toBeInTheDocument();
  });
});
