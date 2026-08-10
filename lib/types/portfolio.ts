// Portfolio data type definitions
// All types map to public/data/*.json files per data-model.md

export interface PlayerStat {
  label: string;
  /** Years worked in this area, shown as a figure on the hero card. */
  value: number;
}

export interface PlayerCard {
  /** Job title printed across the top of the card. */
  title: string;
  yearsExperience: number;
  /** Out of 5, in half steps. */
  rating: number;
  /** ISO-ish codes rendered as flags on the card; currently DE and NP. */
  countries: string[];
  stats: PlayerStat[];
}

export interface Home {
  name: string;
  /** Short introductory statement shown under the name in the hero. */
  intro: string;
  /** Role phrases rendered together in the hero, each with a hand-drawn mark. */
  roles: string[];
  /** Figures shown on the hero's player card. */
  card: PlayerCard;
}

export interface About {
  about: string;
  imageSource?: string;
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
