import fs from 'node:fs';
import path from 'node:path';
import { HomeSchema, TechnologiesFileSchema } from '@/lib/utils/validation';

const validHome = {
  name: 'Prannoy Mulmi',
  intro: 'I build scalable cloud systems, and I care about the details.',
  roles: ['Software Engineer', 'AI enthusiast', 'Security Nerd'],
};

describe('HomeSchema', () => {
  it('accepts the real home.json shipped in public/data', () => {
    const raw = fs.readFileSync(path.join(process.cwd(), 'public/data/en/home.json'), 'utf-8');
    expect(HomeSchema.safeParse(JSON.parse(raw)).success).toBe(true);
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

describe('TechnologiesFileSchema', () => {
  const validTechnologies = {
    intro: 'Every technology below is tied to a real role and date range from the career history.',
    builtWithNote:
      'This site itself was designed and built with Claude Code, using spec-driven development.',
    categories: ['Cloud & Infrastructure', 'Languages'],
    technologies: [
      {
        name: 'AWS',
        category: 'Cloud & Infrastructure',
        matches: ['AWS'],
        note: 'Architected cloud infrastructure across four roles, from Terraform to IAM at scale.',
      },
      {
        name: 'TypeScript',
        category: 'Languages',
        matches: ['TypeScript'],
        note: 'Primary language for authentication services and cloud tooling in recent senior roles.',
      },
      {
        name: 'Java',
        category: 'Languages',
        matches: ['Java'],
        note: 'Core backend language from junior backend roles through senior microservice work.',
      },
      {
        name: 'JavaScript',
        category: 'Languages',
        matches: ['JavaScript'],
        note: 'Used across frontend and full stack roles, from early prototypes to Angular and React.',
      },
    ],
  };

  it('accepts the real technologies.json shipped in public/data', () => {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'public/data/en/technologies.json'),
      'utf-8',
    );
    const result = TechnologiesFileSchema.safeParse(JSON.parse(raw));
    if (!result.success) {
      // Surface the Zod issues in the test failure output for a fast diagnosis.
      console.error(result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it('accepts a well-formed file', () => {
    expect(TechnologiesFileSchema.safeParse(validTechnologies).success).toBe(true);
  });

  // ADR 0027: German dropped builtWithNote at the site owner's request while
  // English kept it — the field has to validate as absent, not merely as an
  // empty string (which the min(40) floor would still reject).
  it('accepts the real German technologies.json, which omits builtWithNote entirely', () => {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'public/data/de/technologies.json'),
      'utf-8',
    );
    const parsed = JSON.parse(raw);
    expect(parsed.builtWithNote).toBeUndefined();

    const result = TechnologiesFileSchema.safeParse(parsed);
    if (!result.success) {
      console.error(result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it('accepts a file with builtWithNote entirely absent (ADR 0027)', () => {
    const { builtWithNote: _builtWithNote, ...withoutNote } = validTechnologies;
    expect(TechnologiesFileSchema.safeParse(withoutNote).success).toBe(true);
  });

  it('still rejects a present-but-too-short builtWithNote', () => {
    const bad = { ...validTechnologies, builtWithNote: 'Too short.' };
    expect(TechnologiesFileSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a technology whose category is not a member of categories', () => {
    const bad = {
      ...validTechnologies,
      technologies: [
        ...validTechnologies.technologies,
        { name: 'Rust', category: 'Systems', matches: ['Rust'], note: 'a'.repeat(50) },
      ],
    };
    expect(TechnologiesFileSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an empty matches array', () => {
    const bad = {
      ...validTechnologies,
      technologies: [
        { name: 'Go', category: 'Languages', matches: [], note: 'a'.repeat(50) },
        ...validTechnologies.technologies,
      ],
    };
    expect(TechnologiesFileSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a duplicate technology name', () => {
    const bad = {
      ...validTechnologies,
      technologies: [...validTechnologies.technologies, validTechnologies.technologies[0]],
    };
    expect(TechnologiesFileSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an out-of-range note', () => {
    const bad = {
      ...validTechnologies,
      technologies: [
        { ...validTechnologies.technologies[0], note: 'too short' },
        ...validTechnologies.technologies.slice(1),
      ],
    };
    expect(TechnologiesFileSchema.safeParse(bad).success).toBe(false);
  });

  describe('sinceByEmployer (docs/adr/0023)', () => {
    it('accepts a technology with a well-formed sinceByEmployer override', () => {
      const withSince = {
        ...validTechnologies,
        technologies: [
          {
            ...validTechnologies.technologies[0],
            sinceByEmployer: { 'AViV GmbH (Formerly Immowelt GmbH)': '01/2024' },
          },
          ...validTechnologies.technologies.slice(1),
        ],
      };
      expect(TechnologiesFileSchema.safeParse(withSince).success).toBe(true);
    });

    it('accepts a technology with no sinceByEmployer at all — it stays optional', () => {
      expect(TechnologiesFileSchema.safeParse(validTechnologies).success).toBe(true);
    });

    it('rejects a sinceByEmployer value that is not MM/YYYY', () => {
      const bad = {
        ...validTechnologies,
        technologies: [
          {
            ...validTechnologies.technologies[0],
            sinceByEmployer: { 'AViV GmbH (Formerly Immowelt GmbH)': '2024-01' },
          },
          ...validTechnologies.technologies.slice(1),
        ],
      };
      expect(TechnologiesFileSchema.safeParse(bad).success).toBe(false);
    });
  });
});
