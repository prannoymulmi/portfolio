import fs from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlayerCard } from '@/components/Hero/PlayerCard';
import type { PlayerCard as PlayerCardData } from '@/lib/types/portfolio';

// The sheen is the card's only motion. Mocked so the anatomy assertions below
// are not testing Framer Motion, and separately exercised in its own block.
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

const card: PlayerCardData = {
  title: 'Senior Software Engineer',
  positionAbbrev: 'SE',
  yearsExperience: 9,
  location: 'Hamburg, Germany',
  countries: ['DE', 'NP'],
  achievements: [
    { icon: 'trophy', text: 'Built production cloud platforms used by thousands' },
    { icon: 'shield', text: 'Designed secure identity systems (OIDC, OAuth 2.0)' },
    { icon: 'code', text: 'Built AI integrations using MCP', emphasis: true },
    { icon: 'cloud', text: 'Architected and scaled systems on AWS' },
    { icon: 'people', text: 'Led and mentored engineering teams to deliver impact' },
  ],
};

const renderCard = (overrides: Partial<PlayerCardData> = {}, imageSource?: string) =>
  render(
    <PlayerCard name="Prannoy Mulmi" card={{ ...card, ...overrides }} imageSource={imageSource} />,
  );

describe('PlayerCard anatomy', () => {
  // SC-001: the eleven elements enumerated in User Story 1, Scenario 1.
  it('renders the figure block as a count of years', () => {
    renderCard();
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
    expect(screen.getByText('YRS')).toBeInTheDocument();
  });

  it('renders the position mark and the full job title', () => {
    renderCard();
    expect(screen.getByText('SE')).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
  });

  it('renders the meta column — location, country, years', () => {
    renderCard();
    expect(screen.getByText('Hamburg, Germany')).toBeInTheDocument();
    expect(screen.getByText('DE · NP')).toBeInTheDocument();
    expect(screen.getByText(/9\+ Years Experience/i)).toBeInTheDocument();
  });

  it('renders a flag for each country', () => {
    renderCard();
    expect(screen.getByRole('img', { name: /germany/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /nepal/i })).toBeInTheDocument();
  });

  it('renders the name at the largest size on the card', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Prannoy Mulmi' })).toBeInTheDocument();
  });

  it('renders one row per achievement', () => {
    renderCard();
    const rows = screen.getAllByRole('listitem');
    const honours = rows.filter((row) =>
      card.achievements.some((a) => row.textContent?.includes(a.text)),
    );
    expect(honours).toHaveLength(5);
  });

  it('renders the portrait when content supplies one', () => {
    renderCard({}, '/images/hero_pic.png');
    expect(screen.getByRole('img', { name: /prannoy mulmi, portrait/i })).toBeInTheDocument();
  });

  it('falls back to the placeholder with no portrait, still reading as a card', () => {
    renderCard();
    expect(screen.getByRole('img', { name: /profile photo coming soon/i })).toBeInTheDocument();
    // The rest of the anatomy is unaffected — an absent photo must not leave a
    // hole where a cut-out silhouette would be.
    expect(screen.getByRole('heading', { name: 'Prannoy Mulmi' })).toBeInTheDocument();
    expect(screen.getByText('YRS')).toBeInTheDocument();
  });
});

describe('PlayerCard emphasis', () => {
  // FR-009: exactly one row carries the accent.
  it('carries the accent on the row content marks, and only that row', () => {
    renderCard();
    const emphasised = screen.getByText('Built AI integrations using MCP');
    expect(emphasised.className).toMatch(/text-card-accent/);

    for (const other of card.achievements.filter((a) => !a.emphasis)) {
      expect(screen.getByText(other.text).className).not.toMatch(/text-card-accent/);
    }
  });

  it('renders a card with no emphasised row at all', () => {
    renderCard({ achievements: card.achievements.map(({ emphasis: _e, ...rest }) => rest) });
    expect(screen.getByText('Built AI integrations using MCP').className).not.toMatch(
      /text-card-accent/,
    );
  });
});

describe('PlayerCard retired elements', () => {
  // These are absence tests on purpose. The elements were deliberately retired
  // (FR-018a) and the ADR records what that gives up — a later edit that quietly
  // reinstates one should fail here rather than pass review.
  it('shows no star rating', () => {
    renderCard();
    expect(screen.queryByRole('img', { name: /rating/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/4\.5/)).not.toBeInTheDocument();
  });

  it('shows no soft-skill bars and no self-rated label', () => {
    renderCard();
    expect(screen.queryAllByRole('meter')).toHaveLength(0);
    expect(screen.queryByText(/self-rated/i)).not.toBeInTheDocument();
  });

  it('shows no stat pills', () => {
    renderCard();
    for (const label of ['Backend', 'Cloud', 'Security']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it('prints no composite rating anywhere', () => {
    renderCard();
    expect(screen.queryByText(/OVR/i)).not.toBeInTheDocument();
  });
});

describe('PlayerCard theming', () => {
  /**
   * The dark edition is a change of six custom properties, not a second set of
   * markup (research §1). If a colour is ever hardcoded into this tree, the
   * theme flip stops being total — so this asserts the absence of raw colour
   * rather than the presence of a particular one.
   */
  it('takes every colour from a card token, with no hex literal or dark: variant', () => {
    const { container } = renderCard({}, '/images/hero_pic.png');
    const markup = container.innerHTML;

    expect(markup).not.toMatch(/dark:/);
    // Hex literals in class strings, e.g. text-[#001126]. Gradients reference
    // var(--card-*) instead, which is why those are allowed through.
    expect(markup).not.toMatch(/-\[#[0-9a-fA-F]{3,8}\]/);
  });

  it('sources every colour used by the tree from the card palette', () => {
    const { container } = renderCard();
    const markup = container.innerHTML;
    for (const token of ['card-ink', 'card-foil', 'card-ground']) {
      expect(markup).toContain(token);
    }
  });
});

describe('PlayerCard legibility floor', () => {
  /**
   * FR-020a puts legibility above proportion: no text on the card may render
   * below 14px at any width, which is why the card stretches on a phone rather
   * than scaling down as a unit.
   *
   * jsdom does not do layout, so this asserts the classes rather than computed
   * sizes — a proxy, but the one that actually catches the mistake, since the
   * only way to go under 14px here is to reach for a smaller size utility.
   */
  it('uses no type size below 14px anywhere on the card', () => {
    const { container } = renderCard({}, '/images/hero_pic.png');
    const markup = container.innerHTML;

    // text-xs is 12px, text-[10px] and friends are explicit. text-sm is 14px
    // and is the floor, so it is allowed.
    expect(markup).not.toMatch(/text-xs\b/);
    expect(markup).not.toMatch(/text-\[(?:[0-9]|1[0-3])px\]/);
  });

  it('never locks the card itself to an aspect ratio, so it grows instead of shrinking', () => {
    const { container } = renderCard();
    // The portrait keeps its own ratio; the card must not. A ratio on the card
    // root is what would force the mock's proportion at every width and drive
    // the type under the floor.
    const cardRoot = container.querySelector('figure');
    expect(cardRoot).not.toBeNull();
    expect(cardRoot!.className).not.toMatch(/aspect-/);
    expect(cardRoot!.firstElementChild?.className ?? '').not.toMatch(/aspect-/);
  });
});

describe('PlayerCard foil usage', () => {
  /**
   * research §2, Finding B: the light foil measures 3.79:1 on the card ground.
   * That clears WCAG 1.4.11's 3:1 for meaningful boundaries, so it is a sound
   * frame and rule colour — and fails AA for text. The two editions stay
   * structurally identical, so it carries no text in either.
   */
  it('uses the foil for borders and rules, never for text', () => {
    const { container } = renderCard({}, '/images/hero_pic.png');
    expect(container.innerHTML).not.toMatch(/\btext-card-foil\b/);
  });
});

describe('PlayerCard content contract', () => {
  it('renders the values shipped in home.json rather than literals', () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8'),
    );
    render(<PlayerCard name={raw.name} card={raw.card} imageSource={raw.imageSource} />);

    expect(screen.getByText(raw.card.location)).toBeInTheDocument();
    expect(screen.getByText(raw.card.positionAbbrev)).toBeInTheDocument();
    for (const achievement of raw.card.achievements) {
      expect(screen.getByText(achievement.text)).toBeInTheDocument();
    }
  });

  it('grows a row for longer text rather than clipping it', () => {
    const long = 'a'.repeat(80);
    renderCard({
      achievements: [{ icon: 'trophy', text: long }, ...card.achievements.slice(1)],
    });
    const row = screen.getByText(long).closest('li');
    expect(row).not.toBeNull();
    expect(within(row!).getByText(long)).toBeInTheDocument();
    // No line clamp or fixed height that would hide the overflow.
    expect(screen.getByText(long).className).not.toMatch(/line-clamp|truncate|h-\d/);
  });
});
