# JSON Format Contract

**Purpose**: Define the structure and format requirements for all portfolio JSON files.

## File Locations

All JSON files are stored in `public/data/` and bundled with deployment:

```
public/data/
├── home.json              # Hero section (name, roles)
├── about.json             # Biography and profile image
├── skills.json            # Skills organized by category
├── experiences.json       # Work history
├── education.json         # Degrees and certifications
├── projects.json          # Technical projects
├── playbook.json          # Technical principles
├── routes.json            # Application routing
├── navbar.json            # Navigation bar configuration
└── social.json            # Social media links
```

## Loading & Caching Rules

1. **Initial Load**: All JSON files are fetched in parallel when portfolio loads
2. **Display**: Skeleton screens appear within 100ms while JSON loads
3. **Replacement**: Content replaces skeleton when JSON is valid
4. **Caching**: In-memory cache (session) to avoid re-fetching on navigation
5. **Error Handling**: If JSON is missing or malformed, show fallback UI ("Section not available")

## Format Requirements

### File-Level Requirements

- **Encoding**: UTF-8
- **Format**: Valid JSON (RFC 8259)
- **Max Size**: 500 KB per file (bundle not to exceed 2 MB)
- **Line Breaks**: Unix (LF) only
- **Indentation**: 2 spaces

### Field-Level Requirements

- **Strings**: Escaped quotes and newlines; no control characters
- **URLs**: Must be valid HTTP/HTTPS URLs or absolute paths (e.g., `/images/...`)
- **Dates**: ISO 8601 format (YYYY-MM-DD) or ranges (e.g., "2021-08 — Present")
- **Enums**: Must match predefined values (e.g., workType: "Full-time" or "Part-time")
- **Arrays**: Each item must validate against item schema
- **Optional Fields**: May be omitted from JSON (not null); component handles absence

## Validation Contract

### At Build Time
- JSON syntax validation (valid JSON)
- Required file presence check (all 10 files must exist)
- Schema compliance (fields, types, format)

### At Runtime
- JSON parse success (handle parse errors)
- Field presence check (optional fields can be missing)
- Type coercion (strings to numbers/dates if needed)
- Fallback on error (show "Section not available" instead of crash)

## TypeScript Interface Contract

All JSON files must match TypeScript interfaces defined in `lib/types/portfolio.ts`:

```typescript
export interface Home { name: string; roles: string[] }
export interface About { about: string; imageSource?: string }
export interface SkillsFile { intro?: string; skills: SkillCategory[] }
export interface ExperiencesFile { experiences: Experience[] }
export interface EducationFile { education: Education[] }
export interface ProjectsFile { projects: Project[] }
export interface PlaybookFile { categories: PlaybookCategory[] }
export interface RoutesFile { sections: Route[] }
export interface NavbarConfig { logo: LogoConfig; sections: NavItem[] }
export interface SocialFile { social: Social[] }
```

## Migration Script Contract

The migration script (`lib/scripts/migrate-content.ts`) will:
1. Read from existing e-portfolio source data (skills, experiences, education, projects, playbook)
2. Transform into portfolio JSON schema
3. Output to `public/data/*.json` files
4. Validate output against TypeScript interfaces
5. Report any schema mismatches or missing required fields

**Output**: Executable script that developers run manually to populate v1 JSON files from existing data.

## Example: Valid vs Invalid JSON

### Valid (skills.json)
```json
{
  "intro": "Core competencies across...",
  "skills": [
    {
      "title": "Languages & Databases",
      "items": [
        { "title": "TypeScript", "icon": "/images/skills/ts.svg", "category": "Languages & Databases" }
      ]
    }
  ]
}
```

### Invalid (missing required title)
```json
{
  "intro": "Core competencies...",
  "skills": [
    { "items": [] }  // ❌ Missing "title" field
  ]
}
```

### Invalid (wrong field type)
```json
{
  "roles": "a Senior Engineer"  // ❌ Should be array, not string
}
```

## Error Handling Contract

If JSON fails to load or validate:

1. **Parse Error** → Log to console, display "Section not available"
2. **Missing Required Field** → Log field name, display "Section not available"
3. **Wrong Type** → Log expected vs actual, display "Section not available"
4. **Invalid Enum** → Log valid options, display "Section not available"
5. **Network Error** → Retry once after 2 seconds, then display fallback

## Performance Contract

- **JSON files combined**: < 2 MB total size
- **Parse time**: < 500ms for all files
- **Load time**: Skeleton screens visible within 100ms
- **Cache hit**: < 50ms to render cached content
- **Network**: Parallel fetches (up to 10 concurrent requests)

---

**JSON Format Contract complete. All portfolio content must comply with this contract.**
