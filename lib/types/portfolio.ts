// Portfolio data type definitions
// All types map to public/data/*.json files per data-model.md

export interface Home {
  name: string;
  roles: string[];
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
  title: string;
  subtitle: string;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
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
