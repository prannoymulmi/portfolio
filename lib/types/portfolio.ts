// Portfolio data type definitions
// All types map to public/data/*.json files per data-model.md

export interface CvLink {
  /** Visible link text. */
  label: string;
  /**
   * External address of the hosted CV. The site links to the document; it never
   * stores or serves a copy — see ADR 0017.
   */
  href: string;
}

export interface Home {
  name: string;
  /** Short introductory statement shown under the name in the hero. */
  intro: string;
  /** Role phrases rendered together in the hero, each with a hand-drawn mark. */
  roles: string[];
  /**
   * Short biography, shown beneath the intro. Replaces the About chapter,
   * which was retired in feature 004.
   */
  bio: string;
  /**
   * Background-removed portrait shown in the opening. Absent renders no
   * portrait at all and the opening falls back to text — there is no
   * placeholder graphic (ADR 0018).
   */
  imageSource?: string;
  /** Absent means the opening section renders no CV link at all. */
  cv?: CvLink;
  /**
   * Authored prose for the Contact chapter's closing line — content, not
   * chrome (contracts/ui-dictionary.md §Scope rule, T039). Absent renders no
   * paragraph rather than falling back to another locale's text.
   */
  contactNote?: string;
}

export interface Experience {
  id?: string;
  title: string;
  subtitle: string;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Working student';
  workDescription: string[];
  dateText: string;
  technologies?: string[];
}

export interface ExperiencesFile {
  experiences: Experience[];
}

export interface EducationMedia {
  name: string;
  source: { url: string };
  type: 'IMAGE';
}

export interface Education {
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDetailedText?: string;
  icon?: { src: string };
  url?: string;
  media?: EducationMedia;
}

export interface EducationFile {
  education: Education[];
}

export interface ProjectLink {
  text: string;
  route: string;
}

export interface Project {
  id?: string;
  title: string;
  bodyText: string;
  image?: string;
  links: ProjectLink[];
  tags: string[];
  /**
   * The three fields below exist for the "three systems" showcase chapter. All
   * optional, and absence is meaningful: the showcase omits the corresponding
   * element entirely rather than rendering a placeholder, because a made-up
   * year or role on a piece of professional evidence is worse than a missing
   * one. The projects gallery ignores them.
   */
  year?: string;
  role?: string;
  /**
   * One headline figure. Must be traceable to a number already stated in this
   * project's own `bodyText` — the showcase presents it as a claim about real
   * work, so it is not a place to introduce a figure nothing else supports.
   */
  metric?: string;
}

export interface ProjectsFile {
  projects: Project[];
}

/**
 * The single statement carried by the engineering-principle band. Named
 * EngineeringPrincipleFile, not PrincipleFile, to avoid colliding with any
 * future type named for a single principle.
 */
export interface EngineeringPrincipleFile {
  statement: string;
  supporting: string;
}

export interface Route {
  component: string;
  path: string;
  headerTitle?: string;
}

export interface RoutesFile {
  sections: Route[];
}

export interface NavItem {
  title: string;
  href: string;
  type?: 'link' | 'internal';
}

export interface LogoConfig {
  source: string;
  height: number;
  width: number;
}

export interface NavbarConfig {
  logo: LogoConfig;
  sections: NavItem[];
}

export interface Social {
  network: string;
  href: string;
}

export interface SocialFile {
  social: Social[];
  /**
   * Contact address, stored plain rather than as a `mailto:` URI — the Contact
   * chapter shows it as readable text, and the link is composed where needed.
   *
   * Required, not optional: the navigation control and the Contact chapter both
   * depend on it, so an absent value would silently empty a chapter and drop a
   * control with nothing reporting it.
   */
  email: string;
}

/**
 * A technology the site owner has professionally used. Deliberately carries
 * no duration, level, or role list — those are derived at render time from
 * `experiences.json` by `lib/utils/techDuration.ts` (research R-001). Storing
 * a hand-authored number here would be the exact untraceable claim ADR 0020
 * removed the old skills formation for.
 */
export interface Technology {
  /** Display name; unique across the file, and used as the selection key. */
  name: string;
  /** Must be a member of `TechnologiesFile.categories` — enforced cross-field
   * by `TechnologiesFileSchema`'s `superRefine`, not by this entry's schema. */
  category: string;
  /**
   * Literal strings as they appear in a role's `technologies` array in
   * `experiences.json` (e.g. `"Spring"` vs `"Spring Boot"`). Matching is
   * exact after trim, case-insensitive — no fuzzy or substring matching.
   */
  matches: string[];
  /**
   * Optional, additive override for when a matched role's *whole* dateText
   * span overstates this technology's real start within that one role (e.g.
   * threat modeling began partway through a still-ongoing role, not at its
   * start). Keyed by the role's `subtitle` (employer), compared trimmed —
   * `experiences.json` subtitles are not guaranteed to be trim-clean — with
   * an `"MM/YYYY"` value. `buildUsage` clamps that one matched role's
   * interval start to this month before unioning; every other role and every
   * other technology is unaffected. Deliberately not a replacement for
   * splitting a role in two: the career-chapter timeline stays one entry per
   * real job, and this field only adjusts how much of that job's span counts
   * toward one technology's duration (docs/adr/0023).
   */
  sinceByEmployer?: Record<string, string>;
  /** Short prose on where/how it was used, consistent with the
   * `workDescription` of the roles it matches. */
  note: string;
}

export interface TechnologiesFile {
  /** The chapter's supporting paragraph. */
  intro: string;
  /** The single Claude Code / spec-driven development sentence (FR-005). */
  builtWithNote: string;
  /** Display order of the category filter row. The component prepends its
   * own "All" option; it is not stored here. */
  categories: string[];
  technologies: Technology[];
}

// Content state for loading/error handling
export interface ContentState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
