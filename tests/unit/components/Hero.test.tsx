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
    await screen.findByRole('list', { name: /what i do/i });
    expect(document.querySelector('section')).toBeInTheDocument();
  });

  it('names the owner in the portrait, the only place the opening still says it', async () => {
    renderHero();
    const nameElement = await screen.findByRole('list', { name: /what i do/i });
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
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

    it('puts the pitch and both calls to action ahead of the portrait', async () => {
      renderHero();
      await screen.findByRole('list', { name: /what i do/i });

      const portrait = screen.getByRole('img', { name: /prannoy mulmi/i });

      const ahead = [
        screen.getByRole('list', { name: /what i do/i }),
        screen.getByText(/scalable cloud systems/i),
        screen.getByRole('link', { name: /View Work/i }),
        screen.getByRole('link', { name: /Play Career/i }),
      ];

      for (const element of ahead) {
        expect(precedes(element, portrait)).toBe(true);
      }
    });

    it('leaves the visual order to the DOM, with no order-* utility to invert it', async () => {
      const { container } = renderHero();
      await screen.findByRole('list', { name: /what i do/i });

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

  it('says it builds secure systems, not merely scalable ones', async () => {
    renderHero();
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );

    // The word was missing from the shipped line while the design it was taken
    // from carried it, which is the whole of FR-008.
    expect(raw.intro).toMatch(/I build secure, scalable cloud systems/i);
    expect(await screen.findByText(new RegExp(raw.intro.slice(0, 40), 'i'))).toBeInTheDocument();
  });

  it('marks the tagline with the accent rule', async () => {
    renderHero();
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );

    const tagline = await screen.findByText(new RegExp(raw.intro.slice(0, 40), 'i'));
    // A left border rather than a pseudo-element, so it grows with the text
    // when the line wraps on a narrow screen.
    expect(tagline.className).toMatch(/border-l-4/);
    // border-primary, not the old literal #f2540d — specs/009-typography-color-refresh
    // moved this to a real design token.
    expect(tagline.className).toMatch(/border-primary/);
  });

  it('leaves the page heading to the navigation wordmark', async () => {
    renderHero();
    await screen.findByRole('list', { name: /what i do/i });

    // Printing the name here as well as in the persistent bar read as a
    // duplicate within one screen rather than as emphasis, so the opening
    // carries no heading of its own.
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('shows the portrait from content and no player card', async () => {
    renderHero();
    await screen.findByRole('list', { name: /what i do/i });
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );

    const portrait = screen.getByRole('img', { name: /prannoy mulmi/i });
    // next/image rewrites src through the optimizer, so the content path
    // arrives URL-encoded inside the query string rather than verbatim.
    expect(portrait.getAttribute('src')).toContain(encodeURIComponent(raw.imageSource));
    // The cut-out, not the studio original — the grey background is baked into
    // hero_pic.png and no CSS can reach it (research.md R2).
    expect(raw.imageSource).toBe('/images/hero_portrait.png');
  });

  it('no longer renders the player card or any of its parts', async () => {
    const { container } = renderHero();
    await screen.findByRole('list', { name: /what i do/i });

    expect(container.querySelector('figure')).toBeNull();
    expect(screen.queryAllByRole('meter')).toHaveLength(0);
    expect(screen.queryByText(/self-rated/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /amazon web services/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /germany/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /nepal/i })).not.toBeInTheDocument();
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
    await screen.findByRole('list', { name: /what i do/i });
    const section = document.querySelector('section');
    expect(section?.className).toMatch(/bg-gradient-to-/);
  });

  // Follows the content file rather than asserting one of the two states
  // outright: the portrait is editable content, and swapping it out — or
  // taking it away again — shouldn't fail this test, only move which half of
  // it runs.

  it('links to the CV address the shipped content carries', async () => {
    renderHero();
    await screen.findByRole('list', { name: /what i do/i });
    // Read the address from content rather than a copy of it, for the same
    // reason the roles test does: the CV lives on someone else's host (ADR
    // 0017) and the owner may repoint or relabel it without touching code.
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );

    expect(raw.cv.href).toMatch(/^https:\/\//);
    const link = await screen.findByRole('link', { name: new RegExp(raw.cv.label, 'i') });
    expect(link).toHaveAttribute('href', raw.cv.href);
    // Opening a tab is announced in the accessible name, not just implied by
    // target — the assertion belongs here because the address is now real.
    expect(link).toHaveAccessibleName(/opens in a new tab/i);
  });
});
