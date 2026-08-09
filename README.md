# Portfolio — Senior Software Engineer

A modern, interactive portfolio showcasing engineering expertise using football as a storytelling metaphor. Built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and GSAP.

**Domain**: portfolio.prannoy-mulmi.com (not live yet — in development)

## Vision

**Professional first, interactive second.**

The portfolio should communicate who I am, my skills, and experience within 20 seconds for recruiters. For curious visitors, it offers an interactive football-themed career journey that explains technical growth through the lens of the sport.

The football metaphor is subtle and purposeful:
- **Player** = me
- **Position** = skill
- **Pass** = career transition
- **Match** = major project
- **Season** = career period
- **Trophy** = major accomplishment

The goal: **High-end engineering portfolio, not a football game.**

## Stack

- **Framework**: Next.js (App Router) + TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion (React-driven UI), GSAP + ScrollTrigger (scroll-sequenced timelines)
- **Visualization**: SVG football pitch (in-browser rendering)
- **Deployment**: GitHub → Vercel (automatic preview + production deploys)
- **Domain**: Custom domain via Vercel

## Structure

### Hero
- Name and title
- 1-line value proposition
- CTA: View Work / Play Career

### Skills Formation ⚽
- Skills displayed as a football formation on an SVG pitch
- Click/hover to reveal details and technologies
- Professional and readable, not a game

### Career Journey ⚽
- **Primary interactive feature**
- Scroll-driven animation: player moves through pitch/path
- Each pass = career transition
- Each milestone = role, company, dates, achievements, technologies
- Animations are subtle and premium
- **Toggle mode**: Interactive ⚽ or Linear Timeline (for recruiters, mobile, accessibility)

### Projects / Match Highlights 🏆
- Separate from career history
- Strongest technical projects
- Focus on impact, architecture, engineering decisions
- Case-study style cards

### Technical Playbook
- Architecture
- Cloud
- Security
- Backend
- DevOps
- Engineering principles

### About & Contact
- Short personal story
- Contact information

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Building

```bash
# Production build
npm run build

# Test production build locally
npm start
```

### Linting & Testing

```bash
# Type check
npm run type-check

# Lint (ESLint + Prettier)
npm run lint

# Tests
npm test
```

## Project Governance

This project is managed with **Spec Kit**, an AI-assisted specification and planning workflow. See `.specify/memory/constitution.md` for the project constitution.

### Key Principles

1. **KISS & Maintainability** — Code must be simple to read and understand without context
2. **Test-First** — All features require passing tests; tests must be as readable as production code
3. **Atomic Commits** — Small, self-contained commits with messages explaining both **what** and **why**
4. **Fixed Technology Stack** — No substitutions without a constitution amendment
5. **Token Efficiency** — LLM prompts are concise and minimize redundant context

### Workflow

- **Spec**: Feature specifications stored in `.specify/`
- **Plan**: Implementation plans with design artifacts
- **Tasks**: Actionable, dependency-ordered task lists
- **Claude**: AI-assisted spec, plan, and implementation via Spec Kit skills

See `.specify/` for templates and workflow configuration.

## Deployment

- **Preview**: Every PR gets a Vercel preview deploy
- **Production**: Merge to `main` triggers production deploy to custom domain
- **CI**: GitHub Actions runs type-check, lint, and tests on every PR

## Performance & SEO

- Lighthouse score ≥ 90
- Mobile-first responsive design
- Optimized images and animations
- Open Graph & meta tags
- Accessibility (WCAG 2.1)

## Contributing

See `.specify/memory/constitution.md` for governance rules and commit guidelines.

## License

[Your License]

---

**Built with Claude and Spec Kit** — AI-assisted engineering for scalable, maintainable design.