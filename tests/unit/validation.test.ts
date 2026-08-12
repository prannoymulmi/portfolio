import fs from 'node:fs';
import path from 'node:path';
import { HomeSchema } from '@/lib/utils/validation';

const validHome = {
  name: 'Prannoy Mulmi',
  intro: 'I build scalable cloud systems, and I care about the details.',
  bio: 'Senior software engineer with 9 years building cloud systems and leading teams.',
  roles: ['Software Engineer', 'AI enthusiast', 'Security Nerd'],
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

  it('keeps the portrait reference optional, so the opening can fall back to text', () => {
    const withPortrait = { ...validHome, imageSource: '/images/portrait.jpg' };
    expect(HomeSchema.safeParse(withPortrait).success).toBe(true);
    expect(HomeSchema.safeParse(validHome).success).toBe(true);
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
