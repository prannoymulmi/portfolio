# Feature Specification: Senior Software Engineer Portfolio

**Feature Branch**: `001-senior-portfolio`

**Created**: 2026-08-09

**Status**: Draft

**Input**: Build a modern senior software engineer portfolio using football metaphor to explain career journey with Framer Motion parallax effects, powered by JSON content structure for skills, experiences, education, and projects.

## Clarifications

### Session 2026-08-09

- Q1: Should Technical Playbook be JSON-driven or hardcoded? → A: JSON-driven (playbook.json for consistency and maintainability)
- Q2: How should content be populated into JSON files for v1? → A: Create manual migration script for skills, experiences, education, projects, playbook; manually create routes, navbar, social, about, home
- Q3: Is Education section required for v1 and where? → A: Required in v1 and must be prominently accessible
- Q4: What should users see during JSON loading? → A: Skeleton screens for each section

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recruiter Quick Overview (Priority: P1)

A recruiter visits the portfolio and must understand in under 20 seconds who I am, my key skills, and professional value without scrolling.

**Why this priority**: This is the critical path. 80% of recruiters will bounce within 20 seconds if they don't immediately grasp expertise and seniority level. Failing this means the portfolio fails its primary purpose.

**Independent Test**: Recruiter can see name, title, value proposition, and top skills within 20 seconds. No scrolling or interaction required for initial impression.

**Acceptance Scenarios**:

1. **Given** recruiter lands on homepage, **When** page loads, **Then** name, "Senior Software Engineer" title, and 1-line value proposition are immediately visible (above fold)
2. **Given** page is loaded, **When** recruiter glances at hero, **Then** they can identify top 3-4 core competencies (Backend, Cloud, Security, etc.) from skills.json
3. **Given** recruiter scans for proof points, **When** they look below hero, **Then** they see major achievements or companies briefly summarized from experiences.json

---

### User Story 2 - Interactive Career Journey (Priority: P1)

A curious visitor explores the interactive career timeline where a football player moves through an SVG pitch, with each pass representing a career transition loaded from experiences.json.

**Why this priority**: This is the unique value—makes the portfolio memorable and differentiates from generic profiles. The metaphor must be intuitive and reinforce technical growth.

**Independent Test**: User can scroll through career milestones from experiences.json, see player animation move along pitch path, and click/hover to reveal job details without breaking immersion.

**Acceptance Scenarios**:

1. **Given** experiences.json defines multiple jobs, **When** user scrolls on Career Journey, **Then** SVG player animates along pitch path smoothly for each milestone
2. **Given** user hovers/clicks on a milestone, **When** action occurs, **Then** tooltip or card appears with company, role, dates, achievements, and technologies from experiences.json
3. **Given** user is on mobile or prefers accessibility, **When** they toggle to Timeline mode, **Then** career displays as linear list from experiences.json with all details visible without interaction

---

### User Story 3 - Skills Formation Visualization (Priority: P2)

A visitor sees skills arranged as a football formation on a pitch, loaded from skills.json with categories and items (e.g., Backend, Cloud, Security, System Design, Frontend, DevOps).

**Why this priority**: Reinforces the football metaphor; makes skill overview visually engaging and professional. Secondary to hero and career journey but still core to brand.

**Independent Test**: Skills formation is visible, clickable, and reveals technologies and project examples without needing external tools.

**Acceptance Scenarios**:

1. **Given** skills.json defines categories and items, **When** Skills section renders, **Then** skills display as formation on SVG pitch with positions labeled by skill names
2. **Given** user clicks/hovers on a skill, **When** interaction occurs, **Then** panel appears showing 5-8 technologies, one-line description, and 1-2 project examples
3. **Given** user is on small screen, **When** formation renders, **Then** layout adapts gracefully (stacks or simplifies) while remaining readable

---

### User Story 4 - Project Highlights / Match Victories (Priority: P2)

A viewer sees strongest technical projects highlighted as case studies from projects.json with focus on impact, architecture decisions, and technologies.

**Why this priority**: Provides proof of technical depth. Recruiters want real engineering decisions and impact, not just job titles.

**Independent Test**: Projects from projects.json display as professional case-study cards with problem, solution, technologies, and measurable impact.

**Acceptance Scenarios**:

1. **Given** projects.json defines projects, **When** Projects section renders, **Then** projects display as professional case-study cards (not a game interface)
2. **Given** user reads a project card from projects.json, **When** they review content, **Then** they see problem, architecture decisions, technologies, and impact metric
3. **Given** user is interested in a project, **When** they click a link, **Then** they access deeper technical context or external project URLs from projects.json

---

### User Story 5 - Technical Playbook Reference (Priority: P3)

A technically-minded visitor (engineer, architect) can reference technical principles and approaches across architecture, cloud, security, backend, and DevOps, loaded dynamically from playbook.json.

**Why this priority**: Demonstrates thought leadership and engineering philosophy. Useful for peer discussions and senior-level conversations.

**Independent Test**: Technical Playbook section is readable, organized by topic, and provides clear principles without requiring interaction. Content loaded from playbook.json.

**Acceptance Scenarios**:

1. **Given** playbook.json defines principle categories, **When** user navigates to Technical Playbook, **Then** categories (Architecture, Cloud, Security, Backend, DevOps, Engineering Principles) render from playbook.json
2. **Given** user clicks on a category, **When** section expands, **Then** 3-5 bullet points describing principles/approaches from playbook.json appear
3. **Given** user is skimming quickly, **When** they scan playbook, **Then** headings and short principles from playbook.json are clear without lengthy prose

---

### User Story 6 - Portfolio Owner Manages Content (Priority: P1)

As the portfolio owner, I want to manage portfolio content (bio, skills, experiences, education, projects) via JSON files so I can update the portfolio without touching code.

**Why this priority**: Without JSON-driven content, portfolio UI is hardcoded and inflexible. JSON separation enables independent updates and version control.

**Independent Test**: Content owner can create/edit JSON files; portfolio loads and displays updated content without code changes or rebuilds.

**Acceptance Scenarios**:

1. **Given** content is stored in JSON files (skills.json, experiences.json, etc.), **When** portfolio loads, **Then** all content is read from JSON, not hardcoded
2. **Given** portfolio owner edits skills.json, **When** they deploy, **Then** skills section updates without UI code changes
3. **Given** portfolio owner adds new experience to experiences.json, **When** page loads, **Then** new entry appears in career timeline immediately

---

### User Story 7 - Navigation Routes from Configuration (Priority: P2)

As a visitor, navigation between portfolio sections works smoothly based on routing configuration stored in routes.json.

**Why this priority**: Centralized routing prevents hardcoded navigation and enables easy addition of new sections.

**Independent Test**: All routes defined in routes.json are accessible; navigation links work correctly; routing is consistent.

**Acceptance Scenarios**:

1. **Given** routes.json defines navigation paths, **When** user clicks navbar links, **Then** correct section component renders for each route
2. **Given** new route is added to routes.json, **When** portfolio deploys, **Then** new section is accessible via URL and navigation
3. **Given** invalid route is accessed via URL, **When** user navigates to it, **Then** system handles gracefully (404 or redirect to home)

---

### User Story 8 - Social Links & Contact from Configuration (Priority: P2)

As a visitor wanting to connect, I can find contact and social media links (LinkedIn, GitHub) easily in footer, loaded from social.json.

**Why this priority**: Social integration is critical for recruiter outreach and professional networking.

**Independent Test**: Social links from social.json are displayed, clickable, and lead to correct profiles; URLs are valid.

**Acceptance Scenarios**:

1. **Given** social.json defines LinkedIn and GitHub profiles, **When** footer renders, **Then** links appear and navigate to correct profiles
2. **Given** social links are external, **When** user clicks them, **Then** they open in new tab with correct URL
3. **Given** portfolio owner updates social.json, **When** portfolio deploys, **Then** new/updated links appear without code changes

---

### User Story 9 - About & Personal Story (Priority: P3)

A visitor wants to learn about who I am personally and find contact information, loaded from about.json and home.json.

**Why this priority**: Humanizes the portfolio. Lower priority than technical content but essential for completeness and trust-building.

**Independent Test**: About section is brief, personal, and loaded from about.json; contact links are easy to find and functional.

**Acceptance Scenarios**:

1. **Given** about.json contains biography, **When** About section loads, **Then** personal story displays with optional profile image
2. **Given** social links exist, **When** footer displays, **Then** contact information is accessible
3. **Given** home.json defines name and roles, **When** hero section renders, **Then** name and title display from data, not hardcoded

---

### User Story 10 - Data Validation & Error Handling (Priority: P2)

As the system, I validate JSON content on load and gracefully handle missing or malformed data to prevent broken portfolio sections.

**Why this priority**: Prevents silent failures and ensures robustness when content is missing or incorrectly formatted.

**Independent Test**: Portfolio handles missing JSON files, validates data structure, and displays appropriate fallbacks.

**Acceptance Scenarios**:

1. **Given** required JSON file is missing, **When** portfolio loads, **Then** system displays friendly message ("Section not available") instead of crashing
2. **Given** JSON file is malformed, **When** portfolio tries to load it, **Then** system logs error and displays fallback UI
3. **Given** optional fields in JSON are missing (e.g., project image URL), **When** section renders, **Then** missing fields are handled gracefully (omitted or defaults used)

---

### User Story 11 - Type Safety & Schema Validation (Priority: P3)

As a developer, I want TypeScript types/interfaces defined for each JSON schema so code is type-safe and IDEs provide autocomplete.

**Why this priority**: Improves code quality and developer experience. Essential for maintainability.

**Independent Test**: TypeScript interfaces match JSON schema; type errors caught at compile time for incorrect data access.

**Acceptance Scenarios**:

1. **Given** TypeScript interfaces are defined for JSON schemas, **When** developer accesses content properties, **Then** IDE provides autocomplete and type checking
2. **Given** TypeScript types are defined, **When** developer incorrectly accesses property, **Then** TypeScript compiler raises error
3. **Given** JSON data is loaded, **When** it's used in components, **Then** type-safe access prevents runtime errors

---

### Edge Cases

- What if JSON file is empty array `[]`? (Section renders empty or shows "no content" message)
- What if icon/image URL in JSON is broken or 404? (Graceful fallback to alt text or placeholder)
- What if experience dates overlap (e.g., multiple "current" jobs)? (Both displayed; no special handling required)
- What if social.json is missing? (Contact section displays gracefully or omits social links)
- What if project has no tags or description? (Fields render as empty/optional; no crash)
- What if JavaScript is disabled? (Fallback to static HTML with Timeline mode active)
- What if browser doesn't support SVG? (Graceful degradation to PNG fallback or text-based display)
- What if user has `prefers-reduced-motion` enabled? (Animations disabled; content remains accessible)
- What if portfolio loads on slow network? (Critical content (hero, title, basic skills) loads first; images lazy-load)

## Requirements *(mandatory)*

### Functional Requirements - UI/Design

- **FR-001**: System MUST display hero section with name, "Senior Software Engineer" title, and 1-line value proposition above the fold
- **FR-002**: System MUST provide navigation bar with links to HOME, SKILLS, CAREER, PROJECTS, ABOUT, CONTACT (sticky or persistent)
- **FR-003**: System MUST render Skills section with skills arranged as football formation on SVG pitch
- **FR-004**: System MUST allow users to click/hover on skills to reveal technology stack, proficiency, and project examples
- **FR-005**: System MUST display Career Journey as primary interactive feature with SVG football pitch and animated player movement synchronized to scroll
- **FR-006**: System MUST provide toggle between Interactive (⚽) and Timeline modes for Career Journey
- **FR-007**: System MUST display each career milestone with company, role, dates, achievements, and technologies in tooltip or expanded card on interaction
- **FR-008**: System MUST display Projects section with case-study cards showing problem, architecture decisions, technologies, and measurable impact
- **FR-009**: System MUST display Technical Playbook with organized sections (Architecture, Cloud, Security, Backend, DevOps, Engineering Principles)
- **FR-010**: System MUST display About section with brief personal story and contact information
- **FR-011**: System MUST support dark and light mode toggle
- **FR-012**: System MUST be fully responsive and functional on mobile, tablet, and desktop screens
- **FR-013**: System MUST preload and cache critical assets (hero image, fonts, main CSS) for fast initial load
- **FR-014**: System MUST implement scroll-triggered animations using GSAP + ScrollTrigger for career journey player movement
- **FR-015**: System MUST implement Framer Motion for UI transitions and parallax effects (hero parallax, smooth section transitions)
- **FR-016**: System MUST be deployed to custom domain (portfolio.prannoy-mulmi.com) via Vercel with automatic preview and production deploys
- **FR-017**: System MUST be SEO-friendly with proper meta tags, Open Graph data, and structured data (schema.org)
- **FR-018**: System MUST be accessible (WCAG 2.1 AA) with semantic HTML, ARIA labels, and alt text for all images
- **FR-019**: System MUST respect `prefers-reduced-motion` media query and disable animations for users who prefer it
- **FR-020**: System MUST have Lighthouse performance score ≥ 90 for all metrics

### Functional Requirements - Content & Data

- **FR-021**: System MUST load portfolio content from JSON files stored in `public/data/` directory (or similar)
- **FR-022**: System MUST define and use JSON schema for: skills, experiences, education, projects, routes, navigation (navbar), social links, about, home sections
- **FR-023**: System MUST parse and validate JSON data on application load; invalid JSON MUST NOT cause silent failures
- **FR-024**: System MUST render Skills section dynamically from skills.json with categories and items (no hardcoded skills)
- **FR-025**: System MUST render Career Journey milestones dynamically from experiences.json with company, role, dates, achievements, and technologies
- **FR-026**: System MUST render Education section dynamically from education.json with degrees, institutions, dates, and optional media (badges, logos)
- **FR-027**: System MUST render Projects section dynamically from projects.json with title, description, image, tags, and links
- **FR-028**: System MUST use routes.json to define all application routes (path to component mappings); navigation MUST follow these definitions
- **FR-029**: System MUST use navbar.json to configure navigation bar items and links; navbar MUST be consistent across pages
- **FR-030**: System MUST display social media links from social.json in footer or contact section; links MUST open in new tab
- **FR-031**: System MUST use home.json to populate hero section (name, role/title) and about.json for About page biography
- **FR-032**: System MUST handle missing or malformed JSON gracefully (show fallback UI, log errors, do not crash)
- **FR-033**: System MUST support optional fields in JSON (e.g., project image, certification URL) without requiring all fields
- **FR-034**: System MUST type-check JSON data against TypeScript interfaces/schemas at compile time and runtime
- **FR-035**: System MUST provide clear error messages in browser console or UI if JSON loading fails
- **FR-036**: System MUST cache loaded JSON data to avoid repeated fetches; cache MUST invalidate on deployment
- **FR-037**: System MUST display skeleton screens (placeholder shimmer layouts) for each portfolio section while JSON content is loading
- **FR-038**: System MUST include a migration script that transforms skills, experiences, education, projects, and playbook data from existing e-portfolio into JSON format; script MUST be run manually before v1 launch

### Key Entities

- **Skill**: `{ title, icon, category }` — professional skill with visual icon and category grouping
- **SkillCategory**: `{ title, items[] }` — groups related skills (e.g., "Languages & Databases")
- **Experience**: `{ title, subtitle, workType, workDescription[], dateText }` — job/role with company, responsibilities, and timeframe
- **Education**: `{ title, cardTitle, cardSubtitle, cardDetailedText?, icon, url?, media? }` — degree or certification with institution and optional media
- **Project**: `{ title, bodyText, image?, links[], tags[] }` — portfolio project with description and metadata
- **NavItem**: `{ title, href, type? }` — navigation link in navbar or footer
- **Route**: `{ component, path, headerTitle? }` — page route with component and URL path
- **Social**: `{ network, href }` — social media profile link
- **Home**: `{ name, roles[] }` — hero section data
- **About**: `{ about, imageSource }` — biography and profile image
- **Playbook**: `{ categories[{ name, principles[] }] }` — technical principles organized by category (Architecture, Cloud, Security, Backend, DevOps, Engineering Principles)

## Success Criteria *(mandatory)*

### Measurable Outcomes - User Experience

- **SC-001**: Recruiter can identify professional value and top skills within 20 seconds of page load (zero scrolling required)
- **SC-002**: Career Journey animations are smooth and perform at 60 FPS on modern devices; no jank or visual stuttering
- **SC-003**: Page achieves Lighthouse performance score ≥ 90 (Performance, Accessibility, Best Practices, SEO all ≥ 90)
- **SC-004**: Time to interactive (TTI) is under 2.5 seconds on 4G network; first contentful paint (FCP) is under 1.2 seconds
- **SC-005**: Portfolio is fully functional and readable on screens down to 320px width (mobile phones)
- **SC-006**: All interactive elements (skill cards, career milestones, project details) respond to user interaction within 100ms
- **SC-007**: Toggle between Interactive and Timeline modes works without page reload; both modes display all required information
- **SC-008**: All navigation links work correctly and page transitions are smooth
- **SC-009**: Custom domain (portfolio.prannoy-mulmi.com) is live and SSL certificate is valid
- **SC-010**: SEO audit shows no critical issues; portfolio is indexable by search engines with proper meta tags
- **SC-011**: Accessibility audit (WCAG 2.1 AA) passes with no critical or high-severity violations
- **SC-012**: Users with `prefers-reduced-motion` enabled see static content without animations; experience is not degraded

### Measurable Outcomes - Content Management

- **SC-013**: Content owner can update portfolio content (add/edit skill, job, project) via JSON edit without touching UI code or TypeScript
- **SC-014**: All portfolio content sections (skills, career, education, projects) load and render within 2 seconds of page load
- **SC-015**: If any JSON file is missing or malformed, portfolio loads completely with appropriate fallbacks (no broken sections or 404 errors)
- **SC-016**: TypeScript compilation succeeds with no type errors when accessing JSON data in components
- **SC-017**: Navigation between all routes defined in routes.json works correctly; no dead routes
- **SC-018**: Social links from social.json open correct external profiles in new tabs; URLs are valid
- **SC-019**: All optional fields in JSON (images, descriptions, links) render correctly or show graceful fallbacks when missing
- **SC-020**: Page remains functional and readable even if one JSON file fails to load (other sections still render)
- **SC-021**: TypeScript types for JSON schemas provide IDE autocomplete for all data properties; no `any` types used for content access
- **SC-022**: Skeleton screens display for each section within 100ms of page load; user perceives loading progress (not a blank page)

## Assumptions

- **Target Users**: Tech recruiters (primary), hiring managers, senior engineers, and curious visitors
- **Mobile Support**: Mobile-first responsive design; all features functional on mobile (Interactive career may default to Timeline mode)
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge within last 2 versions)
- **Network Conditions**: Users have broadband or 4G; portfolio optimized for fast networks but degrades gracefully on slow connections
- **Deployment**: Custom domain and SSL pre-configured in Vercel; DNS pointing to Vercel nameservers
- **Content Ownership**: All text, images, and project details owned by portfolio owner; no third-party content licensing issues
- **Football Metaphor Familiarity**: Target audience (tech professionals) understands basic football concepts (position, pass, formation, etc.)
- **Career Data is Complete**: All career milestones, projects, and technical principles are well-documented and available for content entry
- **Education Section Required**: Education section is required for v1 and prominently accessible (via nav, dedicated page, or quick-view section); not deferred post-launch
- **Content Migration Strategy**: Manual migration script provided to transform skills, experiences, education, projects, and playbook from existing e-portfolio; other files (routes, navbar, social, about, home) created manually
- **Content Location**: JSON files stored in `public/data/`; files bundled with deployment and served as static assets
- **Content Format**: All content uses JSON (not YAML, TOML, or database); JSON is source of truth for portfolio data
- **No Real-Time Updates**: Content updates require redeployment (not hot-reload); no live content management system needed for v1
- **Single Language**: Portfolio content in English; internationalization out of scope for v1 (but structure should support it)
- **No Backend API**: JSON files are static and bundled; no server-side content management or API required
- **Build-Time Validation**: JSON schema validation happens at build time or runtime on page load
- **Image Hosting**: Images referenced in JSON stored in `public/images/` or external CDN
- **Developer Responsible for Content Quality**: Content owner ensures JSON is valid and complete; system validates but doesn't auto-correct
- **Routes Map to Existing Components**: All routes in routes.json correspond to React components that exist or will be created
- **No Database**: Content not persisted to database; JSON is only source of truth (version-controlled in Git)
- **Existing Portfolio Sections**: Hero, Skills, Career Journey, Projects, Playbook, About sections already designed; this feature integrates content into them
- **Analytics Optional**: Google Analytics optional for v1; can be added post-launch
- **Animations are Enhancement**: GSAP and Framer Motion animations enhance experience but content remains accessible without them
