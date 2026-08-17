# Portfolio — Prannoy Mulmi

Interactive senior software engineer portfolio. Built with Next.js 16
(App Router), React 19, TypeScript strict mode, Tailwind CSS v4, GSAP,
and Framer Motion. Content lives in JSON files under `public/data/`
and is validated at runtime with Zod.

**Live**: portfolio.prannoy-mulmi.com

## Quickstart

```bash
# Requires Node 22.x (matches CI). pnpm is pinned via package.json's
# packageManager field — see docs/adr/0022 for rationale.
pnpm install
pnpm run dev             # http://localhost:3000
```

## Common tasks

| Command | What it does |
|---|---|
| `pnpm run dev` | Turbopack dev server with fast refresh |
| `pnpm run build` | Production build (also prerenders sitemap.xml + robots.txt) |
| `pnpm start` | Serve the production build locally |
| `pnpm run type-check` | `tsc --noEmit`, strict mode |
| `pnpm run lint` | ESLint 9 flat config with Next.js + React Hooks rules |
| `pnpm test` | Jest + React Testing Library |
| `pnpm run validate:json` | Validate `public/data/*.json` against Zod schemas |

## Editing content

All copy — bio, roles, skills, jobs, projects — lives in
`public/data/*.json`. Edit the file, refresh the page. No rebuild
needed. See [docs/content-editing.md](docs/content-editing.md) for the
schema reference and common gotchas.

## Architecture

Key decisions live under [docs/adr/](docs/adr/README.md). Read those
before proposing a major change — they explain what was already
considered and why.

Highlights:
- [ADR 0001](docs/adr/0001-json-files-over-cms.md) — JSON files over a CMS
- [ADR 0002](docs/adr/0002-nextjs-app-router.md) — Next.js App Router
- [ADR 0003](docs/adr/0003-client-content-loading-with-zod.md) — Client-side loading + Zod validation
- [ADR 0004](docs/adr/0004-football-pitch-metaphor.md) — Football pitch metaphor
- [ADR 0007](docs/adr/0007-react-19-legacy-peer-deps.md) — React 19 with `--legacy-peer-deps`
- [ADR 0022](docs/adr/0022-migrate-to-pnpm.md) — Migrate to pnpm

## Project layout

```
app/                     # Next.js App Router — pages, layout, sitemap, robots
  (routes)/              # Grouped routes: about, career, skills, projects, ...
  layout.tsx             # Root layout: theme, fonts, structured data, skip link
  sitemap.ts             # Auto-generated sitemap.xml
  robots.ts              # Auto-generated robots.txt
  not-found.tsx          # 404 page
components/
  About/                 # About section + social links
  Career/                # Football pitch + player animation + timeline
  Common/                # ContentProvider, ErrorBoundary, LoadingState, ...
  Hero/                  # Hero section + parallax
  Navigation/            # Navbar, Footer
  Projects/              # Project gallery + cards
  Skills/                # 4-3-3 formation on the pitch
lib/
  hooks/                 # useContentLoader, useTheme
  types/portfolio.ts     # All content type definitions
  utils/validation.ts    # Zod schemas — the source of truth for shape
  utils/animations.ts    # GSAP helpers + prefers-reduced-motion check
public/data/*.json       # All portfolio content
docs/adr/                # Architecture Decision Records
tests/                   # Jest unit + integration
```

## Deployment

- **Platform**: Vercel (see [vercel.json](vercel.json) — pins install
  command to `pnpm install`).
- **Domain**: Porkbun-registered, DNS pointed at Vercel via A record
  (`76.76.21.21`) or CNAME to `cname.vercel-dns.com` for subdomains.
- **Env vars** (Vercel dashboard, Production scope):
  - `NEXT_PUBLIC_SITE_URL` — the canonical URL, e.g.
    `https://portfolio.prannoy-mulmi.com`. Used by `sitemap.ts`,
    `robots.ts`, and Open Graph metadata.
- **CI**: [.github/workflows/ci.yml](.github/workflows/ci.yml) runs
  type-check, lint, tests, and a bundle-size check on every PR.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit format, PR flow, and
what triggers an ADR.

## License

MIT (see `LICENSE`).
