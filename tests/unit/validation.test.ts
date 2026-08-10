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
    yearsExperience: 9,
    rating: 4.5,
    countries: ['DE', 'NP'],
    // Stat values are years in that area, not a 0-100 score.
    stats: [
      { label: 'Backend', value: 9 },
      { label: 'Cloud', value: 6 },
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

  it('rejects a stat value that is not a plausible number of years', () => {
    const bad = {
      ...validHome,
      card: { ...validHome.card, stats: [{ label: 'Backend', value: 140 }] },
    };
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

  it('rejects a rating that is not on a half step', () => {
    const bad = { ...validHome, card: { ...validHome.card, rating: 4.3 } };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
    const good = { ...validHome, card: { ...validHome.card, rating: 3.5 } };
    expect(HomeSchema.safeParse(good).success).toBe(true);
  });

  it('rejects a country without a flag to render', () => {
    const bad = { ...validHome, card: { ...validHome.card, countries: ['ZZ'] } };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
  });

  it('requires the intro statement', () => {
    const { intro: _intro, ...withoutIntro } = validHome;
    expect(HomeSchema.safeParse(withoutIntro).success).toBe(false);
  });
});
