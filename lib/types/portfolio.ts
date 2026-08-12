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
}

export interface Skill {
  title: string;
  icon?: string;
  category: string;
}

export interface SkillCategory {
  title: string;
  items: Skill[];
}

export interface SkillsFile {
  intro?: string;
  skills: SkillCategory[];
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
}

export interface ProjectsFile {
  projects: Project[];
}

export interface Principle {
  title: string;
  description: string;
}

export interface PlaybookCategory {
  name: string;
  principles: Principle[];
}

export interface PlaybookFile {
  categories: PlaybookCategory[];
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

// Content state for loading/error handling
export interface ContentState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
