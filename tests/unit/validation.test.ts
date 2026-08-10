import fs from 'node:fs';
import path from 'node:path';
import { HomeSchema } from '@/lib/utils/validation';

const validHome = {
  name: 'Prannoy Mulmi',
  intro: 'I build scalable cloud systems, and I care about the details.',
  roles: ['Software Engineer', 'AI enthusiast', 'Security Nerd'],
  card: {
    yearsExperience: 9,
    rating: 4.5,
    countries: ['DE', 'NP'],
    stats: [
      { label: 'Backend', value: 88 },
      { label: 'Cloud', value: 90 },
    ],
  },
};

describe('HomeSchema', () => {
  it('accepts the real home.json shipped in public/data', () => {
    const raw = fs.readFileSync(path.join(process.cwd(), 'public/data/home.json'), 'utf-8');
    expect(HomeSchema.safeParse(JSON.parse(raw)).success).toBe(true);
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

  it('rejects a stat value outside 0-100', () => {
    const bad = {
      ...validHome,
      card: { ...validHome.card, stats: [{ label: 'Backend', value: 140 }] },
    };
    expect(HomeSchema.safeParse(bad).success).toBe(false);
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
