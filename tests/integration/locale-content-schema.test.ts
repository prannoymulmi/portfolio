import fs from 'node:fs';
import path from 'node:path';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import {
  HomeSchema,
  ExperiencesFileSchema,
  EducationFileSchema,
  ProjectsFileSchema,
  EngineeringPrincipleFileSchema,
  RoutesFileSchema,
  SocialFileSchema,
  TechnologiesFileSchema,
  NavbarConfigSchema,
} from '@/lib/utils/validation';
import { z } from 'zod';

/**
 * `useContentLoader` validates each `public/data/<locale>/*.json` file at
 * runtime and, on a Zod failure, falls back to the whole English file
 * silently (ADR 0024's whole-file fallback rule) — a `console.warn`, not a
 * thrown error a build would catch. A translated string that overruns a
 * schema's `max()` (German commonly runs 15-30% longer than English) ships
 * looking exactly like a missing translation: the visitor sees English text
 * with no error anywhere in CI.
 *
 * This is exactly the failure this suite exists to catch before it reaches
 * a browser: every locale's content file, validated against the same schema
 * `useContentLoader` uses, at test time rather than page-load time.
 */
describe('locale content files pass their own schema (no silent English fallback)', () => {
  const REPO_ROOT = process.cwd();

  const FILES: { name: string; schema: z.ZodSchema }[] = [
    { name: 'home.json', schema: HomeSchema },
    { name: 'experiences.json', schema: ExperiencesFileSchema },
    { name: 'education.json', schema: EducationFileSchema },
    { name: 'projects.json', schema: ProjectsFileSchema },
    { name: 'systems.json', schema: ProjectsFileSchema },
    { name: 'principle.json', schema: EngineeringPrincipleFileSchema },
    { name: 'routes.json', schema: RoutesFileSchema },
    { name: 'navbar.json', schema: NavbarConfigSchema },
    { name: 'social.json', schema: SocialFileSchema },
    { name: 'technologies.json', schema: TechnologiesFileSchema },
  ];

  for (const { code } of SUPPORTED_LOCALES) {
    describe(`locale "${code}"`, () => {
      for (const { name, schema } of FILES) {
        it(`public/data/${code}/${name} validates`, () => {
          const filePath = path.join(REPO_ROOT, 'public/data', code, name);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(raw);

          const result = schema.safeParse(data);
          if (!result.success) {
            const issues = result.error.issues
              .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
              .join('\n  ');
            throw new Error(`public/data/${code}/${name} failed validation:\n  ${issues}`);
          }
        });
      }
    });
  }
});
