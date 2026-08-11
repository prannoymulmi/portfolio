import fs from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Hero } from '@/components/Hero/Hero';
import { ContentProvider } from '@/components/Common/ContentProvider';

// Mock framer-motion to avoid animation issues in tests. className is forwarded:
// the layout classes on the drifting columns are the subject of the reading-order
// tests below, and a mock that dropped them would hide what they assert.
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
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
    // Read from the content file rather than a copy of it: the phrases are
    // editable content, and a reworded role shouldn't fail this test.
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );
    expect(raw.roles.length).toBeGreaterThan(0);
    for (const phrase of raw.roles) {
      // Rendered with a trailing period as a styling choice, so match loosely.
      expect(within(list).getByText(new RegExp(`^${phrase}\\.?$`))).toBeInTheDocument();
    }
  });

  describe('reading order of the opening section', () => {
    /** True when `first` comes before `second` in document order. */
    const precedes = (first: Element, second: Element) =>
      Boolean(
        first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
      );

    it('puts the pitch and both calls to action ahead of the player card', async () => {
      const { container } = renderHero();
      await screen.findByText(/Prannoy Mulmi/i);

      // The card is the only <figure> in the section.
      const card = container.querySelector('figure');
      expect(card).not.toBeNull();

      const ahead = [
        screen.getByRole('list', { name: /what i do/i }),
        screen.getByText(/scalable cloud systems/i),
        screen.getByRole('link', { name: /View Work/i }),
        screen.getByRole('link', { name: /Play Career/i }),
      ];

      for (const element of ahead) {
        expect(precedes(element, card!)).toBe(true);
      }
    });

    it('leaves the visual order to the DOM, with no order-* utility to invert it', async () => {
      const { container } = renderHero();
      await screen.findByText(/Prannoy Mulmi/i);

      const grid = container.querySelector('.grid');
      expect(grid).not.toBeNull();

      const columns = Array.from(grid!.children);
      expect(columns).toHaveLength(2);

      for (const column of columns) {
        // An order-* utility moves the box but not the node, so it would
        // desync what a phone shows from what a screen reader announces —
        // exactly the defect this feature fixes. A DOM-order assertion alone
        // cannot catch that, which is why this test exists.
        expect(column.className).not.toMatch(/(^|\s)(lg:)?order-/);
        // A grid item defaults to min-width:auto, which lets the card's fixed
        // side rails push the column past the viewport on narrow screens.
        expect(column.className).toMatch(/(^|\s)min-w-0(\s|$)/);
      }
    });
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

  it('prints the job title across the top of the player card', async () => {
    renderHero();
    expect(await screen.findByText(/Senior Software Engineer/i)).toBeInTheDocument();
  });

  it('reads every card stat as a count of years, not a 0-100 score', async () => {
    renderHero();
    await screen.findByText(/Prannoy Mulmi/i);
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );
    for (const stat of raw.card.stats) {
      expect(stat.value).toBeLessThanOrEqual(raw.card.yearsExperience);
      const label = screen.getByText(stat.label);
      // Each pill sits directly above its figure inside the same list item.
      expect(label.closest('li')).toHaveTextContent(String(stat.value));
    }
  });

  it('prints the scouting line in small type under the name banner', async () => {
    renderHero();
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );
    expect(await screen.findByText(raw.card.blurb)).toBeInTheDocument();
  });

  it('draws a bar per soft skill, each reading as a self-rating out of 5', async () => {
    renderHero();
    await screen.findByText(/Prannoy Mulmi/i);
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );

    const meters = screen.getAllByRole('meter');
    expect(meters).toHaveLength(raw.card.softSkills.length);

    for (const skill of raw.card.softSkills) {
      const meter = screen.getByRole('meter', { name: skill.label });
      expect(meter).toHaveAttribute('aria-valuenow', String(skill.level));
      expect(meter).toHaveAttribute('aria-valuemax', '5');
    }
  });

  it('labels the bars as self-rated, so they do not read as measurements', async () => {
    renderHero();
    expect(await screen.findByText(/self-rated/i)).toBeInTheDocument();
  });

  it('shows an AWS mark on the card', async () => {
    renderHero();
    expect(await screen.findByRole('img', { name: /amazon web services/i })).toBeInTheDocument();
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
