// Portfolio data type definitions
// All types map to public/data/*.json files per data-model.md

/** Which glyph fronts an honours row. CardIcons.tsx owns what each looks like. */
export type AchievementIcon = 'trophy' | 'shield' | 'code' | 'cloud' | 'people' | 'cert';

export interface Achievement {
  icon: AchievementIcon;
  /** One to two printed lines. The row grows for longer text rather than clipping. */
  text: string;
  /**
   * The single accent-coloured row. At most one per card — the schema refuses a
   * second, because two accent rows is not a layout the design has.
   */
  emphasis?: boolean;
}

export interface PlayerCard {
  /** Job title printed under the position mark. */
  title: string;
  /** Two or three capitals — the mark above the title, e.g. "SE". */
  positionAbbrev: string;
  /**
   * Printed twice, deliberately: as the figure block's numeral and as the third
   * meta row. It is the card's most prominent number and it is a count of
   * years, not a composite score — see ADR 0013 on why the reference's "91 OVR"
   * is the one thing from the mock the card does not reproduce.
   */
  yearsExperience: number;
  /** Display text for the meta column, e.g. "Hamburg, Germany". */
  location: string;
  /** ISO-ish codes rendered as flags on the card; currently DE and NP. */
  countries: string[];
  /** The honours rows: three to five, five in the reference design. */
  achievements: Achievement[];
}

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
  /** Portrait for the player card; falls back to a placeholder when absent. */
  imageSource?: string;
  /** Figures shown on the hero's player card. */
  card: PlayerCard;
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
}

// Content state for loading/error handling
export interface ContentState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
