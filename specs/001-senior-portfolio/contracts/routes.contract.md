# Route & Navigation Contract

**Purpose**: Define all portfolio routes, navigation structure, and URL patterns.

## Route Definitions (routes.json)

All portfolio sections must be defined in `public/data/routes.json`:

```json
{
  "sections": [
    {
      "component": "pages/home",
      "path": "/",
      "headerTitle": "Home"
    },
    {
      "component": "pages/skills",
      "path": "/skills",
      "headerTitle": "Skills"
    },
    {
      "component": "pages/career",
      "path": "/career",
      "headerTitle": "Career Journey"
    },
    {
      "component": "pages/education",
      "path": "/education",
      "headerTitle": "Education"
    },
    {
      "component": "pages/projects",
      "path": "/projects",
      "headerTitle": "Projects"
    },
    {
      "component": "pages/playbook",
      "path": "/playbook",
      "headerTitle": "Technical Playbook"
    },
    {
      "component": "pages/about",
      "path": "/about",
      "headerTitle": "About"
    },
    {
      "component": "pages/contact",
      "path": "/contact",
      "headerTitle": "Contact"
    }
  ]
}
```

## Navigation Bar (navbar.json)

All navigation links must be defined in `public/data/navbar.json`:

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
    { "title": "Education", "href": "/education" },
    { "title": "Projects", "href": "/projects" },
    { "title": "Playbook", "href": "/playbook" },
    { "title": "About", "href": "/about" },
    { "title": "Contact", "href": "/contact" },
    { "title": "GitHub", "href": "https://github.com/...", "type": "link" },
    { "title": "LinkedIn", "href": "https://linkedin.com/in/...", "type": "link" }
  ]
}
```

## Navigation Requirements

| Property | Type | Required | Validation |
|----------|------|----------|-----------|
| **logo.source** | string | Yes | Valid image path |
| **logo.height** | number | Yes | 24-48 px |
| **logo.width** | number | Yes | 100-200 px |
| **sections[].title** | string | Yes | 3-30 chars |
| **sections[].href** | string | Yes | Valid URL or internal path |
| **sections[].type** | string | No | "link" or "internal" |

## Navigation Behavior

1. **Internal Links** (href="/skills"): Use Next.js Link for client-side navigation (no page reload)
2. **External Links** (href="https://..." or type="link"): Open in new tab with `target="_blank"`
3. **Active State**: Highlight current route in navbar
4. **Mobile**: Hamburger menu for screens < 768px (responsive)
5. **Dark/Light Toggle**: Theme selector in navbar (separate component)

## Route Component Mapping

Each route must have a corresponding Next.js page component:

```
app/(routes)/
├── page.tsx              # / (home)
├── skills/page.tsx       # /skills
├── career/page.tsx       # /career
├── education/page.tsx    # /education
├── projects/page.tsx     # /projects
├── playbook/page.tsx     # /playbook
├── about/page.tsx        # /about
└── contact/page.tsx      # /contact
```

## URL Pattern Contract

- **Base URL**: portfolio.prannoy-mulmi.com
- **Home**: `/` (hero section)
- **Sections**: `/section-name` (all lowercase, no underscores)
- **Invalid routes**: Redirect to home or show 404
- **Reserved**: `/api/*` for internal endpoints only

## 404 & Error Handling

- **Not Found (404)**: Show "Page not found" fallback, offer return-to-home link
- **Invalid Route in navbar.json**: Skip rendering that link, log error
- **Broken Link**: 404 page, not an error crash

## SEO & Meta Tags

Each route must have appropriate meta tags (Open Graph, structured data):

```typescript
// Example: /career route
export const metadata = {
  title: "Career Journey - Prannoy Mulmi",
  description: "Interactive career timeline with technical achievements",
  openGraph: {
    title: "Career Journey",
    description: "...",
    url: "https://portfolio.prannoy-mulmi.com/career",
  }
}
```

## Accessibility Requirements

- **ARIA Labels**: All nav links must have accessible labels
- **Keyboard Navigation**: All routes accessible via Tab key
- **Focus Management**: Focus visible on nav items
- **Semantic HTML**: Use `<nav>`, `<a>` elements correctly

## External Link Contract

Links to external services (GitHub, LinkedIn, etc.) must:
- Open in new tab (`target="_blank"`)
- Include `rel="noopener noreferrer"` for security
- Use absolute URLs (https://...)
- Maintain rel="external" attribute for tracking (optional)

---

**Routes & Navigation Contract complete. All navigation must comply with this contract.**
