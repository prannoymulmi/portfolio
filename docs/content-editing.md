# Editing portfolio content

All portfolio content lives in `public/data/*.json`. Edit a file, save,
refresh the browser — no rebuild needed (the JSON is served with a 5-minute
CDN cache; see `next.config.ts`). Validate before pushing with:

```bash
npm run validate:json
```

Every file is validated at runtime against a Zod schema in
`lib/utils/validation.ts`. If a field is missing or wrong-typed the
section will render "Failed to load …" and log a specific error to the
browser console — check there first when something disappears.

## Files at a glance

| File | Renders | Type source |
|---|---|---|
| `home.json` | Hero (name + rotating roles) | `Home` |
| `about.json` | About page biography | `About` |
| `skills.json` | Skills formation on the pitch | `SkillsFile` |
| `experiences.json` | Career journey milestones | `ExperiencesFile` |
| `education.json` | Education & certifications | `EducationFile` |
| `projects.json` | Project gallery | `ProjectsFile` |
| `playbook.json` | Technical playbook grid | `PlaybookFile` |
| `navbar.json` | Top nav links | `NavbarConfig` |
| `social.json` | Social links (footer + about page) | `SocialFile` |
| `routes.json` | Reserved / not currently rendered | `RoutesFile` |

Full type definitions: `lib/types/portfolio.ts`.

## Common edits

### Add a new skill

`public/data/skills.json` — append to the appropriate category's `items`:

```json
{
  "skills": [
    {
      "title": "Backend",
      "items": [
        { "title": "Node.js", "category": "runtime" },
        { "title": "Rust", "category": "runtime" }
      ]
    }
  ]
}
```

`title` is displayed on the pitch marker. `category` is a free-form tag
used by the SkillCard drawer.

### Add a new job

`public/data/experiences.json` — prepend to `experiences` (most recent first):

```json
{
  "title": "Staff Engineer",
  "subtitle": "Company Name",
  "workType": "Full-time",
  "workDescription": [
    "Led migration of legacy monolith to service-oriented architecture.",
    "Mentored three engineers to senior."
  ],
  "dateText": "2025-01",
  "technologies": ["Kubernetes", "Go", "Postgres"]
}
```

`dateText` is parsed with `new Date()` for sorting — ISO `YYYY-MM` works
best. `workType` must be one of `Full-time | Part-time | Contract | Freelance`.

### Add a project

`public/data/projects.json` — append to `projects`:

```json
{
  "title": "Project Name",
  "bodyText": "One paragraph describing the problem, your approach, and the outcome. Aim for 2-4 sentences — the card truncates after ~3 lines.",
  "image": "/images/projects/project-name.png",
  "tags": ["TypeScript", "AWS", "Terraform"],
  "links": [
    { "text": "View Case Study", "route": "/case-studies/project-name" },
    { "text": "GitHub", "route": "https://github.com/..." }
  ]
}
```

Link text must be at least 5 characters (Zod min length). If the route
starts with `http`, the card opens it in a new tab with safe rel attrs.

### Change navbar links

`public/data/navbar.json` — order in the `sections` array is display order.
Set `"type": "link"` for external URLs (opens in a new tab).

## Images

Put images under `public/images/`. Reference them by absolute path
(`/images/foo.png`). Next.js Image component optimizes them automatically
(AVIF/WebP, responsive sizes). Cache TTL is one year — rename the file
to bust caches.

## When the site says "Failed to load …"

1. Open browser DevTools console. Zod error messages include the field
   path and expected type.
2. Common causes:
   - Missing required field (e.g. new object without `title`).
   - Wrong type (`"tags": "TypeScript"` instead of `["TypeScript"]`).
   - String too short (see min lengths in `lib/utils/validation.ts`).
3. Fix the JSON, refresh. No restart needed.

## Adding a new content type

Rarely needed, but if you do:

1. Add the JSON file to `public/data/`.
2. Define types in `lib/types/portfolio.ts`.
3. Define a Zod schema in `lib/utils/validation.ts`.
4. Add a `useContentLoader` call in `components/Common/ContentProvider.tsx`
   and expose it on the context.
5. Consume via `useContent()` in whichever component needs it.
