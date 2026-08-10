import fs from 'node:fs';
import path from 'node:path';
import { HomeSchema } from '@/lib/utils/validation';

const validHome = {
  name: 'Prannoy Mulmi',
  intro: 'I build scalable cloud systems, and I care about the details.',
  roles: ['Software Engineer', 'AI enthusiast', 'Security Nerd'],
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

  it('requires the intro statement', () => {
    const { intro: _intro, ...withoutIntro } = validHome;
    expect(HomeSchema.safeParse(withoutIntro).success).toBe(false);
  });
});
