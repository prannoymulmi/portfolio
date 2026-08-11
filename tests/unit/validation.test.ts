import fs from 'node:fs';
import path from 'node:path';
import { HomeSchema } from '@/lib/utils/validation';

const validHome = {
  name: 'Prannoy Mulmi',
  intro: 'I build scalable cloud systems, and I care about the details.',
  bio: 'Senior software engineer with 9 years building cloud systems and leading teams.',
  roles: ['Software Engineer', 'AI enthusiast', 'Security Nerd'],
  card: {
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
  },
};

describe('HomeSchema', () => {
  it('accepts the real home.json shipped in public/data', () => {
    const raw = fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8');
    expect(HomeSchema.safeParse(JSON.parse(raw)).success).toBe(true);
  });

  it('requires the biography that replaced the About chapter', () => {
    const { bio: _bio, ...withoutBio } = validHome;
    expect(HomeSchema.safeParse(withoutBio).success).toBe(false);
  });

  it('rejects a biography longer than two sentences worth of prose', () => {
    // 240 characters is the enforceable proxy for the spec's 40-word ceiling.
    const tooLong = { ...validHome, bio: 'a'.repeat(241) };
    expect(HomeSchema.safeParse(tooLong).success).toBe(false);
  });

  it('rejects a biography trimmed down to a fragment', () => {
    expect(HomeSchema.safeParse({ ...validHome, bio: 'Engineer.' }).success).toBe(false);
  });

  it('keeps the portrait reference optional, so the card falls back to its placeholder', () => {
    const withPortrait = { ...validHome, imageSource: '/images/portrait.jpg' };
    expect(HomeSchema.safeParse(withPortrait).success).toBe(true);
    expect(HomeSchema.safeParse(validHome).success).toBe(true);
  });

  it('states the same years of experience in the biography and on the card', () => {
    const raw = fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8');
    const home = JSON.parse(raw);

    // Nothing in the schema can enforce this, so it is asserted against the
    // real content: the retired About copy claimed "10+ years" while the card
    // said 9.
    const yearsInBio = home.bio.match(/(\d+)\s*(?:\+\s*)?years?/i);
    expect(yearsInBio).not.toBeNull();
    expect(Number(yearsInBio[1])).toBe(home.card.yearsExperience);
  });

  it('accepts short role phrases like "AI enthusiast"', () => {
    expect(HomeSchema.safeParse(validHome).success).toBe(true);
  });

  it('accepts 2 roles and 5 roles, so phrases can be added or removed', () => {
    const two = { ...validHome, roles: ['Engineer', 'Security Nerd'] };
    const five = {
      ...validHome,
      roles: ['Engineer', 'AI enthusiast', 'Security Nerd', 'Mentor', 'Cloud Architect'],
    };
    expect(HomeSchema.safeParse(two).success).toBe(true);
    expect(HomeSchema.safeParse(five).success).toBe(true);
  });

  it('rejects a single role, since the mark sequence needs variation', () => {
    expect(HomeSchema.safeParse({ ...validHome, roles: ['Engineer'] }).success).toBe(false);
  });

  it('rejects a years figure that is not a plausible career length', () => {
    const bad = { ...validHome, card: { ...validHome.card, yearsExperience: 140 } };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
  });

  it('requires a card title, since the card prints it across the top', () => {
    const { title: _title, ...cardWithoutTitle } = validHome.card;
    expect(HomeSchema.safeParse({ ...validHome, card: cardWithoutTitle }).success).toBe(false);
  });

  it('requires the player card figures', () => {
    const { card: _card, ...withoutCard } = validHome;
    expect(HomeSchema.safeParse(withoutCard).success).toBe(false);
  });

  it('accepts the lower bound of three achievement rows', () => {
    const three = {
      ...validHome,
      card: { ...validHome.card, achievements: validHome.card.achievements.slice(0, 3) },
    };
    expect(HomeSchema.safeParse(three).success).toBe(true);
  });

  it('rejects fewer achievements than the card looks balanced with', () => {
    const two = {
      ...validHome,
      card: { ...validHome.card, achievements: validHome.card.achievements.slice(0, 2) },
    };
    expect(HomeSchema.safeParse(two).success).toBe(false);
  });

  it('caps the honours list at the five the shield holds', () => {
    const six = {
      ...validHome,
      card: {
        ...validHome.card,
        achievements: [
          ...validHome.card.achievements,
          { icon: 'cert', text: 'AWS Certified Solutions Architect' },
        ],
      },
    };
    expect(HomeSchema.safeParse(six).success).toBe(false);
  });

  // FR-009 says exactly one row is carried in the accent colour. Two is not a
  // layout that exists, so it fails at the schema rather than rendering.
  it('rejects a second emphasised achievement row', () => {
    const twoEmphasised = {
      ...validHome,
      card: {
        ...validHome.card,
        achievements: validHome.card.achievements.map((a, i) =>
          i < 2 ? { ...a, emphasis: true } : a,
        ),
      },
    };
    expect(HomeSchema.safeParse(twoEmphasised).success).toBe(false);
  });

  it('accepts a card with no emphasised row at all', () => {
    const none = {
      ...validHome,
      card: {
        ...validHome.card,
        achievements: validHome.card.achievements.map(({ emphasis: _e, ...rest }) => rest),
      },
    };
    expect(HomeSchema.safeParse(none).success).toBe(true);
  });

  it('rejects an achievement icon the card has no glyph for', () => {
    const bad = {
      ...validHome,
      card: {
        ...validHome.card,
        achievements: [
          { icon: 'rocket', text: 'Shipped something to orbit' },
          ...validHome.card.achievements.slice(1),
        ],
      },
    };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects achievement text longer than the two lines a row holds', () => {
    const at80 = { ...validHome.card.achievements[0], text: 'a'.repeat(80) };
    const at81 = { ...validHome.card.achievements[0], text: 'a'.repeat(81) };
    const rest = validHome.card.achievements.slice(1);
    expect(
      HomeSchema.safeParse({
        ...validHome,
        card: { ...validHome.card, achievements: [at80, ...rest] },
      }).success,
    ).toBe(true);
    expect(
      HomeSchema.safeParse({
        ...validHome,
        card: { ...validHome.card, achievements: [at81, ...rest] },
      }).success,
    ).toBe(false);
  });

  // The abbreviation is set in display type in the accent colour. A lowercase
  // value would not render as the mark the design expects, and silently
  // restyling content is worse than refusing it.
  it('rejects a position abbreviation that is not two or three capitals', () => {
    for (const positionAbbrev of ['se', 'S', 'SENIOR', 'S.E']) {
      expect(
        HomeSchema.safeParse({ ...validHome, card: { ...validHome.card, positionAbbrev } }).success,
      ).toBe(false);
    }
    expect(HomeSchema.safeParse(validHome).success).toBe(true);
  });

  // The retired fields must be gone from home.json, not merely unrendered —
  // FR-018a. Zod strips unknown keys rather than failing, so this asserts the
  // shape that comes out, which is what stops the file drifting from the card.
  it('drops the retired rating, stats, soft skills and blurb', () => {
    const withRetired = {
      ...validHome,
      card: {
        ...validHome.card,
        rating: 4.5,
        stats: [{ label: 'Backend', value: 9 }],
        softSkills: [{ label: 'Mentoring', level: 5 }],
        blurb: 'Owns systems end to end and brings the rest of the team along with it.',
      },
    };
    const parsed = HomeSchema.safeParse(withRetired);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.card).not.toHaveProperty('rating');
      expect(parsed.data.card).not.toHaveProperty('stats');
      expect(parsed.data.card).not.toHaveProperty('softSkills');
      expect(parsed.data.card).not.toHaveProperty('blurb');
    }
  });

  it('requires the location the meta column prints', () => {
    const { location: _location, ...cardWithoutLocation } = validHome.card;
    expect(HomeSchema.safeParse({ ...validHome, card: cardWithoutLocation }).success).toBe(false);
  });

  it('rejects a country without a flag to render', () => {
    const bad = { ...validHome, card: { ...validHome.card, countries: ['ZZ'] } };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a home.json with no CV link, since the address is optional', () => {
    expect(HomeSchema.safeParse(validHome).success).toBe(true);
  });

  it('accepts a CV link with a label and an external address', () => {
    const withCv = {
      ...validHome,
      cv: { label: 'Download CV', href: 'https://example.com/cv.pdf' },
    };
    expect(HomeSchema.safeParse(withCv).success).toBe(true);
  });

  it('rejects a CV label too short to be a visible click target', () => {
    const bad = { ...validHome, cv: { label: 'X', href: 'https://example.com/cv.pdf' } };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a CV label long enough to stop being a link and start being a sentence', () => {
    const bad = {
      ...validHome,
      cv: { label: 'a'.repeat(41), href: 'https://example.com/cv.pdf' },
    };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a CV address that is not a URL, same as a malformed profile link', () => {
    const bad = { ...validHome, cv: { label: 'Download CV', href: 'not-a-url' } };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
  });

  it('requires the intro statement', () => {
    const { intro: _intro, ...withoutIntro } = validHome;
    expect(HomeSchema.safeParse(withoutIntro).success).toBe(false);
  });
});
