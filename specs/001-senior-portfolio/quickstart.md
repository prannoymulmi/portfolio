# Quickstart & Validation Guide

**Purpose**: Provide runnable validation scenarios that prove the feature works end-to-end.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Text editor
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Setup Commands

```bash
# Clone repository
git clone https://github.com/prannoymulmi/portfolio.git
cd portfolio

# Install dependencies
npm install

# Create JSON data files in public/data/
# (See data-model.md for schema and examples)
# You can start with example JSON or use the migration script:
npm run migrate:content  # Run manual migration script for existing e-portfolio data

# Verify JSON files are valid
npm run validate:json

# Start development server
npm run dev
```

**Expected Output**: Development server running at `http://localhost:3000`

## Validation Scenarios

### Scenario 1: Recruiter 20-Second Assessment ✅

**Goal**: Verify recruiter can see hero, title, and skills within 20 seconds without scrolling.

**Steps**:
1. Open `http://localhost:3000` in browser
2. Measure time from page load to fully rendered hero section
3. Observe: Name, "Senior Software Engineer" title, and top 3-4 skills visible above fold
4. No scrolling required to see these elements

**Expected Result**: ✅ Hero section visible within 1.2s FCP (First Contentful Paint)

**Failure Indicators**:
- Hero content missing or below fold
- Page loading takes > 2.5s (TTI)
- Skeleton screens block visibility

**Test Command**:
```bash
npm run test:e2e -- recruiter-flow.test.ts
```

---

### Scenario 2: Career Journey Scroll Animation ✅

**Goal**: Verify scroll-driven SVG player animation works smoothly at 60 FPS.

**Steps**:
1. Navigate to `/career` (Career Journey page)
2. Scroll slowly down the career section
3. Observe: SVG player animates along football pitch path matching scroll position
4. Check browser DevTools Performance tab: FPS ≥ 60

**Expected Result**: ✅ Smooth 60 FPS animation synchronized to scroll

**Failure Indicators**:
- Animation jank or stuttering (FPS < 60)
- Player doesn't move with scroll
- GSAP ScrollTrigger not initialized

**Test Command**:
```bash
npm run test:e2e -- career-journey.test.ts
```

---

### Scenario 3: Skills Formation Visualization ✅

**Goal**: Verify skills render as football formation and reveal details on interaction.

**Steps**:
1. Navigate to `/skills`
2. Observe: Skills displayed as football positions on SVG pitch (formation layout)
3. Hover over a skill position
4. Expected: Skill card appears with 5-8 technologies listed
5. Click skill card
6. Expected: Technologies and project examples expand or tooltip appears

**Expected Result**: ✅ Skills formation visible, clickable, interactive details display

**Failure Indicators**:
- Skills not arranged in formation
- No SVG pitch visualization
- Click/hover doesn't reveal details
- Technologies list empty or missing

**Test Command**:
```bash
npm run test:unit -- SkillsFormation.test.tsx
```

---

### Scenario 4: Education Section Prominent Display ✅

**Goal**: Verify education section is required and prominently accessible.

**Steps**:
1. Navigate to `/education`
2. Observe: Education page loads with degrees/certifications displayed
3. Check navbar: Education link is visible and clickable
4. Expected: At least 1-2 education entries displayed with institution name, degree, and dates

**Expected Result**: ✅ Education section accessible and visible in navigation

**Failure Indicators**:
- Education page missing or 404
- Navbar doesn't show Education link
- No education data displayed
- Required fields missing

**Test Command**:
```bash
npm run test:unit -- EducationCard.test.tsx
```

---

### Scenario 5: JSON Content Loading & Caching ✅

**Goal**: Verify JSON loads correctly, skeleton screens appear, content replaces skeletons, and caching works.

**Steps**:
1. Open DevTools Network tab
2. Refresh page (Cmd+R or Ctrl+R)
3. Observe: Skeleton screens appear immediately (< 100ms)
4. Observe: JSON files start loading (skills.json, experiences.json, etc.)
5. Wait for JSON to load (< 2 seconds total)
6. Observe: Skeleton screens replace with actual content
7. Navigate to another page then back
8. Observe: Content loads instantly (from cache, no network requests)

**Expected Result**: ✅ Skeleton screens → JSON load → content display → cached navigation

**Failure Indicators**:
- Skeleton screens not visible
- JSON loading takes > 2 seconds
- Content doesn't replace skeleton
- No caching (re-fetches on navigation)

**Test Command**:
```bash
npm run test:integration -- content-loading.test.ts
```

---

### Scenario 6: Mobile & Accessibility ✅

**Goal**: Verify responsive design, Timeline mode toggle, and prefers-reduced-motion.

**Steps**:
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Resize to 375px width (mobile phone)
4. Navigate to `/career`
5. Observe: "Interactive ⚽ / Timeline" toggle appears
6. Click toggle to switch to Timeline mode
7. Observe: Career displays as linear list (not animation)
8. Check browser settings: Enable "Prefers Reduced Motion" (MacOS: System Preferences → Accessibility → Display)
9. Refresh page
10. Observe: No scroll animations; content still accessible

**Expected Result**: ✅ Responsive mobile view + Timeline toggle + motion preferences respected

**Failure Indicators**:
- Content doesn't fit on mobile (< 320px width)
- Toggle missing or non-functional
- Animations play despite prefers-reduced-motion enabled
- Timeline mode doesn't display career data

**Test Command**:
```bash
npm run test:e2e -- mobile-accessibility.test.ts
```

---

### Scenario 7: Dark/Light Mode Toggle ✅

**Goal**: Verify theme toggle works and preferences are saved.

**Steps**:
1. Open portfolio at `http://localhost:3000`
2. Observe: Current theme (light or dark)
3. Click theme toggle (usually sun/moon icon)
4. Observe: Background and text colors change
5. Refresh page
6. Observe: Theme preference persists (localStorage)

**Expected Result**: ✅ Theme toggles and persists across sessions

**Failure Indicators**:
- Toggle missing or non-functional
- Colors don't change
- Theme resets on page refresh
- CSS not applying theme styles

**Test Command**:
```bash
npm run test:unit -- ThemeToggle.test.tsx
```

---

### Scenario 8: Error Handling - Missing JSON ✅

**Goal**: Verify graceful degradation if JSON file is missing or malformed.

**Steps**:
1. Rename `public/data/skills.json` to `public/data/skills.json.bak` (simulate missing file)
2. Refresh portfolio
3. Navigate to `/skills`
4. Observe: Page loads without crash, shows "Section not available" or similar fallback
5. Check browser console: Error is logged with details
6. Restore `public/data/skills.json`
7. Refresh page
8. Observe: Skills section now displays normally

**Expected Result**: ✅ Graceful fallback, error logged, no crash

**Failure Indicators**:
- Page crashes or blank (500 error)
- Error not logged to console
- Fallback UI not displayed
- Other sections broken due to one missing file

**Test Command**:
```bash
npm run test:integration -- error-handling.test.tsx
```

---

### Scenario 9: Performance - Lighthouse ≥ 90 ✅

**Goal**: Verify production build meets performance targets.

**Steps**:
1. Build production bundle: `npm run build`
2. Start production server: `npm run start`
3. Open DevTools Lighthouse tab (or use CLI)
4. Run Lighthouse audit
5. Review results: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90

**Expected Result**: ✅ All Lighthouse categories ≥ 90

**Failure Indicators**:
- Performance < 90 (images not optimized, bundle too large, etc.)
- Accessibility < 90 (missing ARIA labels, poor contrast, etc.)
- SEO < 90 (missing meta tags, not mobile-friendly, etc.)

**Test Command**:
```bash
npm run test:lighthouse
```

---

### Scenario 10: SEO & Meta Tags ✅

**Goal**: Verify meta tags and Open Graph data are present and correct.

**Steps**:
1. Open DevTools → Elements tab
2. Inspect `<head>` section
3. Verify presence of:
   - `<title>` (portfolio title)
   - `<meta name="description" content="...">` (page description)
   - `<meta property="og:title" content="...">` (Open Graph title)
   - `<meta property="og:description" content="...">` (Open Graph description)
   - `<meta property="og:image" content="...">` (Open Graph image)
   - `<meta name="viewport" content="width=device-width">` (mobile viewport)
4. Share portfolio link on social media (Twitter, LinkedIn)
5. Observe: Shared preview shows correct title, description, image

**Expected Result**: ✅ Meta tags present and render correctly in social preview

**Failure Indicators**:
- Meta tags missing
- Open Graph data incorrect or missing
- Social preview shows generic/wrong title/description/image

**Test Command**:
```bash
npm run test:seo -- meta-tags.test.ts
```

---

## Quick Validation Checklist

Run all tests to validate feature:

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance & lighthouse
npm run test:lighthouse

# Lint & type check
npm run lint
npm run type-check

# Build production bundle
npm run build

# Expected: All tests pass, no lint errors, bundle < 500 KB gzipped
```

## Troubleshooting

### Skeleton screens don't appear
- Check `components/Common/LoadingState.tsx` is imported in pages
- Verify CSS for skeleton animations is loaded
- Check that JSON fetch is actually async

### JSON not loading
- Verify `public/data/*.json` files exist
- Check browser console for network errors
- Validate JSON syntax: `npm run validate:json`

### Animation stuttering (FPS < 60)
- Check DevTools Performance tab for long tasks
- Verify GSAP ScrollTrigger is initialized
- Check for excessive re-renders in React Components

### Mobile view broken
- Check Tailwind responsive classes (`md:`, `lg:`) are correct
- Verify viewport meta tag is present
- Test with real device, not just emulator

### Dark mode not persisting
- Check localStorage is enabled in browser
- Verify theme provider wraps entire app
- Check CSS variables are defined correctly

---

**Quickstart complete. All scenarios are independent and runnable. Feature is ready for development.**
