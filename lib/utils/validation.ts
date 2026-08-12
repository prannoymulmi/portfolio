import { z } from 'zod';

// Validation schemas for all portfolio JSON files
// Used by useContentLoader to validate data at runtime

const SkillSchema = z.object({
  title: z.string().min(1).max(30),
  icon: z.string().optional(),
  category: z.string().min(1),
});

const SkillCategorySchema = z.object({
  title: z.string().min(10).max(50),
  items: z.array(SkillSchema).min(1).max(8),
});

export const SkillsFileSchema = z.object({
  intro: z.string().optional(),
  skills: z.array(SkillCategorySchema).min(1).max(8),
});

export const CvLinkSchema = z.object({
  // Two characters is the floor for something a visitor can see and hit; forty
  // is where a link stops being a link and starts being a sentence, which would
  // undo the point of keeping it subordinate to the two buttons above it.
  label: z.string().min(2).max(40),
  // Same validator SocialSchema.href uses, so a malformed CV address fails at
  // load exactly as a malformed profile link does. The address is always
  // external — the site links to the CV and never hosts it (ADR 0017).
  href: z.string().url(),
});

export const HomeSchema = z.object({
  name: z.string().min(1).max(100),
  intro: z.string().min(20).max(200),
  // The biography the About chapter used to carry. 240 chars is the
  // enforceable proxy for "2 sentences, 40 words" — Zod cannot count words,
  // and at ~6 characters a word the two land in the same place.
  bio: z.string().min(40).max(240),
  // Absent means the player card renders its placeholder rather than a photo.
  imageSource: z.string().optional(),
  // Short phrases ("AI enthusiast"), all rendered together and annotated.
  // At least 2 so the mark sequence has something to vary across.
  roles: z.array(z.string().min(3).max(40)).min(2).max(5),
  // Optional: absent means the opening renders no CV link, which is a valid
  // state rather than an error — the address is supplied separately.
  cv: CvLinkSchema.optional(),
});

export const ExperienceSchema = z.object({
  title: z.string().min(10).max(50),
  subtitle: z.string().min(5).max(50),
  workType: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Working student']),
  workDescription: z.array(z.string().min(20).max(150)).min(3).max(6),
  dateText: z.string().min(5).max(30),
  technologies: z.array(z.string()).optional(),
});

export const ExperiencesFileSchema = z.object({
  experiences: z.array(ExperienceSchema).min(1).max(15),
});

export const EducationMediaSchema = z.object({
  name: z.string(),
  source: z.object({ url: z.string().url() }),
  type: z.literal('IMAGE'),
});

export const EducationSchema = z.object({
  title: z.string(),
  cardTitle: z.string().min(10).max(100),
  cardSubtitle: z.string().min(5).max(50),
  cardDetailedText: z.string().optional(),
  icon: z.object({ src: z.string() }).optional(),
  url: z.string().url().optional(),
  media: EducationMediaSchema.optional(),
});

export const EducationFileSchema = z.object({
  education: z.array(EducationSchema).min(1).max(10),
});

export const ProjectLinkSchema = z.object({
  text: z.string().min(5).max(30),
  route: z.string().min(1),
});

export const ProjectSchema = z.object({
  title: z.string().min(10).max(100),
  bodyText: z.string().min(100).max(500),
  image: z.string().optional(),
  links: z.array(ProjectLinkSchema).min(1).max(3),
  tags: z.array(z.string()).min(3).max(8),
});

export const ProjectsFileSchema = z.object({
  projects: z.array(ProjectSchema).min(1).max(10),
});

export const PrincipleSchema = z.object({
  title: z.string().min(5).max(50),
  description: z.string().min(20).max(200),
});

export const PlaybookCategorySchema = z.object({
  name: z.enum([
    'Architecture',
    'Cloud',
    'Security',
    'Backend',
    'DevOps',
    'Engineering Principles',
  ]),
  principles: z.array(PrincipleSchema).min(3).max(5),
});

export const PlaybookFileSchema = z.object({
  categories: z.array(PlaybookCategorySchema).length(6),
});

export const RouteSchema = z.object({
  component: z.string(),
  path: z.string().startsWith('/'),
  headerTitle: z.string().optional(),
});

export const RoutesFileSchema = z.object({
  sections: z.array(RouteSchema).min(1).max(30),
});

export const NavItemSchema = z.object({
  title: z.string().min(3).max(30),
  href: z.string().min(1),
  type: z.enum(['link', 'internal']).optional(),
});

export const LogoConfigSchema = z.object({
  source: z.string(),
  height: z.number().min(24).max(48),
  width: z.number().min(100).max(200),
});

export const NavbarConfigSchema = z.object({
  logo: LogoConfigSchema,
  sections: z.array(NavItemSchema).min(1).max(20),
});

export const SocialSchema = z.object({
  network: z.string().min(1),
  href: z.string().url(),
});

export const SocialFileSchema = z.object({
  social: z.array(SocialSchema).min(1).max(5),
  // A sibling of the list, deliberately not a member of it: the footer renders
  // every entry in `social`, and the address is not wanted there. Structure
  // keeps it out, rather than a filter that a later edit could drop.
  //
  // `.email()` rather than the `.url()` used by SocialSchema.href above —
  // `.url()` accepts "mailto:x@y.z" and rejects a bare address, which is the
  // opposite of what this field holds. The plain address is stored because the
  // Contact chapter shows it as text; the places that need a link compose the
  // `mailto:` themselves.
  email: z.string().email(),
});

// Validation function with error handling
export async function validateJSON<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  fileName: string,
): Promise<{ valid: true; data: T } | { valid: false; error: string }> {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      return { valid: false, error: `${fileName} validation failed: ${issues}` };
    }
    return { valid: false, error: `${fileName} validation error: ${String(error)}` };
  }
}
