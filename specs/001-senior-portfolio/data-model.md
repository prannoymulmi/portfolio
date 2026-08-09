# Data Model: Senior Software Engineer Portfolio

**Purpose**: Define entity schemas, validation rules, and relationships for all JSON content types.

## Entity Definitions

### Home
**File**: `public/data/home.json`

**Purpose**: Hero section data (name, roles/title)

**Schema**:
```typescript
interface Home {
  name: string;              // Full name (e.g., "Prannoy Mulmi")
  roles: string[];           // Array of role descriptions (e.g., ["a Senior Cloud Architect", "a Fullstack Engineer"])
}
```

**Validation Rules**:
- `name`: required, string, 1-100 characters
- `roles`: required, array of strings, 1-3 items, each 10-100 characters
- Must be non-empty

**Example**:
```json
{
  "name": "Prannoy Mulmi",
  "roles": ["a Senior Cloud Architect", "a Fullstack Engineer"]
}
```

---

### About
**File**: `public/data/about.json`

**Purpose**: Biography and profile image for About page

**Schema**:
```typescript
interface About {
  about: string;            // Biographical text (1-2 paragraphs)
  imageSource?: string;     // Optional path to profile image (e.g., "/images/profile.jpg")
}
```

**Validation Rules**:
- `about`: required, string, 100-500 characters
- `imageSource`: optional, string, valid path format
- Must be non-empty

**Example**:
```json
{
  "about": "I'm a senior software engineer with 10+ years of experience...",
  "imageSource": "/images/profile.jpg"
}
```

---

### Skill & SkillCategory
**File**: `public/data/skills.json`

**Purpose**: Professional skills organized by category (e.g., "Languages & Databases")

**Schema**:
```typescript
interface Skill {
  title: string;            // Skill name (e.g., "TypeScript", "AWS")
  icon?: string;            // Optional icon path (e.g., "/images/skills/typescript.svg")
  category: string;         // Category name (e.g., "Languages & Databases")
}

interface SkillCategory {
  title: string;            // Category name (e.g., "Languages & Databases")
  items: Skill[];           // Array of skills in this category
}

interface SkillsFile {
  intro?: string;           // Optional intro text
  skills: SkillCategory[];  // Array of skill categories
}
```

**Validation Rules**:
- `SkillsFile.skills`: required, array of 3-8 categories
- `SkillCategory.title`: required, string, 10-50 characters, unique within file
- `SkillCategory.items`: required, array of 3-8 skills
- `Skill.title`: required, string, 3-30 characters
- `Skill.icon`: optional, valid image path
- `Skill.category`: must match parent SkillCategory.title

**Example**:
```json
{
  "intro": "Core competencies across full-stack development...",
  "skills": [
    {
      "title": "Languages & Databases",
      "items": [
        { "title": "TypeScript", "icon": "/images/skills/ts.svg", "category": "Languages & Databases" },
        { "title": "PostgreSQL", "icon": "/images/skills/postgres.svg", "category": "Languages & Databases" }
      ]
    }
  ]
}
```

---

### Experience
**File**: `public/data/experiences.json`

**Purpose**: Work history with company, role, dates, and achievements

**Schema**:
```typescript
interface Experience {
  title: string;                    // Job title (e.g., "Senior Backend Engineer")
  subtitle: string;                 // Company name (e.g., "Acme Corp")
  workType: "Full-time" | "Part-time" | "Contract" | "Freelance";
  workDescription: string[];        // Array of 3-5 achievement bullets
  dateText: string;                 // Date range (e.g., "2021-08 — Present" or "2021-08 – 2023-07")
  technologies?: string[];          // Optional array of tech stack used
}

interface ExperiencesFile {
  experiences: Experience[];        // Array of jobs, ordered chronologically (newest first)
}
```

**Validation Rules**:
- `experiences`: required, array of 1-15 experiences
- `title`: required, string, 10-50 characters
- `subtitle`: required, string, 5-50 characters
- `workType`: required, one of predefined values
- `workDescription`: required, array of 3-5 bullets, each 20-150 characters
- `dateText`: required, string, recognizable date format
- `technologies`: optional, array of 3-10 tech names
- Must be non-empty

**Example**:
```json
{
  "experiences": [
    {
      "title": "Senior Cloud Architect",
      "subtitle": "TechCorp Inc.",
      "workType": "Full-time",
      "workDescription": [
        "Designed and implemented cloud migration strategy for 50+ microservices",
        "Led infrastructure team of 5 engineers, improving deployment speed by 60%"
      ],
      "dateText": "2021-08 — Present",
      "technologies": ["AWS", "Kubernetes", "Terraform", "Go"]
    }
  ]
}
```

---

### Education
**File**: `public/data/education.json`

**Purpose**: Degrees, certifications, and educational credentials

**Schema**:
```typescript
interface EducationMedia {
  name: string;                     // Media name (e.g., "AWS Solutions Architect Badge")
  source: { url: string };          // Object with URL to badge/image
  type: "IMAGE";                    // Media type
}

interface Education {
  title: string;                    // Date or period (e.g., "2014-2018")
  cardTitle: string;                // Degree/certification name (e.g., "B.S. Computer Science")
  cardSubtitle: string;             // Institution name (e.g., "MIT")
  cardDetailedText?: string;        // Optional additional info (e.g., "3.8 GPA", "Honors")
  icon?: { src: string };           // Optional institution logo
  url?: string;                     // Optional link to credential/certificate
  media?: EducationMedia;           // Optional badge/certification image
}

interface EducationFile {
  education: Education[];           // Array of degrees/certifications, ordered chronologically
}
```

**Validation Rules**:
- `education`: required, array of 1-10 entries
- `title`: required, string (date or period)
- `cardTitle`: required, string, 10-100 characters
- `cardSubtitle`: required, string, 5-50 characters
- `cardDetailedText`: optional, string, 10-50 characters
- `icon.src`: optional, valid image path
- `url`: optional, valid URL
- `media`: optional, must have valid URL
- Must be non-empty

**Example**:
```json
{
  "education": [
    {
      "title": "2014-2018",
      "cardTitle": "B.S. Computer Science",
      "cardSubtitle": "MIT",
      "cardDetailedText": "3.8 GPA",
      "icon": { "src": "/images/education/mit-logo.png" },
      "url": "https://mit.edu",
      "media": {
        "name": "AWS Solutions Architect Badge",
        "source": { "url": "/images/education/aws-badge.png" },
        "type": "IMAGE"
      }
    }
  ]
}
```

---

### Project
**File**: `public/data/projects.json`

**Purpose**: Technical projects and case studies

**Schema**:
```typescript
interface ProjectLink {
  text: string;                     // Link label (e.g., "GitHub", "Live Demo")
  route: string;                    // URL or internal route
}

interface Project {
  title: string;                    // Project name
  bodyText: string;                 // Project description (problem, solution, impact)
  image?: string;                   // Optional project image path
  links: ProjectLink[];             // Array of relevant links
  tags: string[];                   // Technology/topic tags (e.g., "React", "AWS", "Performance")
}

interface ProjectsFile {
  projects: Project[];              // Array of projects
}
```

**Validation Rules**:
- `projects`: required, array of 1-10 projects
- `title`: required, string, 10-100 characters
- `bodyText`: required, string, 100-500 characters
- `image`: optional, valid image path
- `links`: required, array of 1-3 links
- `links[].text`: required, string, 5-30 characters
- `links[].route`: required, valid URL or internal path
- `tags`: required, array of 3-8 tags
- Must be non-empty

**Example**:
```json
{
  "projects": [
    {
      "title": "Cloud Migration Platform",
      "bodyText": "Built a Kubernetes-based platform that reduced deployment time by 60% and improved system reliability to 99.99% uptime...",
      "image": "/images/projects/migration-platform.jpg",
      "links": [
        { "text": "GitHub", "route": "https://github.com/..." },
        { "text": "Case Study", "route": "/projects/migration" }
      ],
      "tags": ["Kubernetes", "Go", "AWS", "DevOps"]
    }
  ]
}
```

---

### Playbook
**File**: `public/data/playbook.json`

**Purpose**: Technical principles organized by category

**Schema**:
```typescript
interface Principle {
  title: string;                    // Principle name (e.g., "API Versioning")
  description: string;              // Principle description
}

interface PlaybookCategory {
  name: string;                     // Category name (e.g., "Architecture", "Security")
  principles: Principle[];          // Array of 3-5 principles
}

interface PlaybookFile {
  categories: PlaybookCategory[];   // Array of 6 categories (Architecture, Cloud, Security, Backend, DevOps, Engineering Principles)
}
```

**Validation Rules**:
- `categories`: required, array of exactly 6 categories (fixed names)
- `PlaybookCategory.name`: required, one of: "Architecture", "Cloud", "Security", "Backend", "DevOps", "Engineering Principles"
- `PlaybookCategory.principles`: required, array of 3-5 principles
- `Principle.title`: required, string, 5-50 characters
- `Principle.description`: required, string, 20-200 characters

**Example**:
```json
{
  "categories": [
    {
      "name": "Architecture",
      "principles": [
        {
          "title": "Microservices First",
          "description": "Break systems into independently deployable, loosely coupled services..."
        }
      ]
    }
  ]
}
```

---

### Route & NavItem
**File**: `public/data/routes.json` and `public/data/navbar.json`

**Purpose**: Application routing and navigation configuration

**Schema**:
```typescript
interface Route {
  component: string;                // React component path (e.g., "pages/skills")
  path: string;                     // URL path (e.g., "/skills")
  headerTitle?: string;             // Optional page header title
}

interface NavItem {
  title: string;                    // Display label (e.g., "Skills")
  href: string;                     // URL or route path
  type?: "link" | "internal";       // "link" for external, "internal" for internal routes
}

interface NavbarConfig {
  logo: { source: string; height: number; width: number };  // Logo config
  sections: NavItem[];              // Navigation items
}

interface RoutesFile {
  sections: Route[];                // Array of routes
}
```

**Validation Rules**:
- Routes must match accessible components
- NavItems must reference existing routes
- Paths must start with "/"
- hrefs must be valid URLs or internal paths

**Example (routes.json)**:
```json
{
  "sections": [
    { "component": "pages/home", "path": "/", "headerTitle": "Home" },
    { "component": "pages/skills", "path": "/skills", "headerTitle": "Skills" },
    { "component": "pages/career", "path": "/career", "headerTitle": "Career Journey" }
  ]
}
```

**Example (navbar.json)**:
```json
{
  "logo": {
    "source": "/images/logo.svg",
    "height": 32,
    "width": 120
  },
  "sections": [
    { "title": "Home", "href": "/" },
    { "title": "Skills", "href": "/skills" },
    { "title": "Career", "href": "/career" },
    { "title": "GitHub", "href": "https://github.com/...", "type": "link" }
  ]
}
```

---

### Social
**File**: `public/data/social.json`

**Purpose**: Social media and external profile links

**Schema**:
```typescript
interface Social {
  network: string;                  // Platform name (e.g., "linkedin", "github")
  href: string;                     // Full URL to profile
}

interface SocialFile {
  social: Social[];                 // Array of social links
}
```

**Validation Rules**:
- `social`: required, array of 1-5 links
- `network`: required, string, unique within file
- `href`: required, valid URL starting with "http"

**Example**:
```json
{
  "social": [
    { "network": "LinkedIn", "href": "https://linkedin.com/in/prannoy" },
    { "network": "GitHub", "href": "https://github.com/prannoy" }
  ]
}
```

---

## Data Flow & Loading Strategy

```
User visits portfolio
  ↓
App mounts (Next.js hydrates)
  ↓
useContentLoader hook triggered (one per major section)
  ↓
Skeleton screen displays (immediate, from HTML)
  ↓
Fetch JSON from public/data/*.json (parallel requests)
  ↓
Validate against TypeScript interfaces (optional runtime validation with Zod)
  ↓
Cache in React state/Context API (within browser session)
  ↓
Render actual content (replace skeleton)
  ↓
Error? Display fallback UI ("Section not available")

Subsequent navigations:
  ↓
Check cache first (before fetching)
  ↓
If cached, render immediately
  ↓
If stale/missing, re-fetch
```

## Caching Strategy

- **Duration**: Browser session (in-memory via Context API or Zustand)
- **Cache Key**: Filename (e.g., "experiences.json")
- **Invalidation**: On deployment (new app version clears cache automatically)
- **Fallback**: Graceful rendering if JSON unavailable (show "Section not available")

## Validation Rules Summary

| Entity | Required Fields | Max Items | Validation |
|--------|-----------------|-----------|-----------|
| Home | name, roles | N/A | roles: 1-3 items |
| About | about | N/A | 100-500 chars |
| Skills | categories, items | 8 categories, 8 items per | Unique category names |
| Experience | title, company, dates, description | 15 experiences | chronological order |
| Education | title, degree, institution | 10 educations | optional badges/links |
| Project | title, description, links, tags | 10 projects | 1-3 links, 3-8 tags |
| Playbook | 6 categories, principles per category | Fixed 6 categories | 3-5 principles each |
| Route | component, path | 30 routes | paths unique, start with / |
| NavItem | title, href | 20 items | hrefs reference routes |
| Social | network, href | 5 links | URLs start with http |

---

**Data model defined for Phase 1. Ready for contract generation.**
