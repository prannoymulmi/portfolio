# Quickstart: Verifying the Education Grade Badge

Automated tests cover the band mapping and the presence/absence of the badge.
Contrast over a photograph and mobile layout cannot be observed in jsdom, so the
checks below are manual and are the acceptance evidence for SC-002 and FR-007.

## Run it

```bash
cd /Users/prannoy/Projects/portfolio
npm run dev
```

Open `http://localhost:3000` and scroll to **Education & Certifications**, or jump
straight to `http://localhost:3000/#education`.

## Automated checks

```bash
npm test -- grade                  # band mapping table
npm test -- EducationSection       # badge present/absent per entry
npm run lint
```

## Visual checklist — default (light) theme

Four rows render. Verify:

- [ ] **MSc. Cybersecurity / University of Essex** shows a pill badge reading
      **Distinction** — a bordered rounded element, clearly not a paragraph.
- [ ] **B.Sc. Information Engineering / HAW Hamburg** shows a pill badge reading
      **Good** — *not* `1.9`, and *not* `1.9 Grade`. This is the FR-006 check.
- [ ] Both **AWS** rows show **no badge** and no gap, stray border, or shifted
      spacing where one would sit (FR-004).
- [ ] The badge's border and text tone match the **"Learn more ↗"** pill on the
      AWS rows. It must not introduce a new accent colour (FR-002).
- [ ] Badge text is comfortably legible where the background photograph is at its
      darkest behind the section (SC-002).
- [ ] All four rows read as one consistent set — same heading weight, same
      spacing rhythm (SC-005, User Story 2).

## Visual checklist — experimental dark theme

Append the flag and toggle: `http://localhost:3000/?experiment=true#education`

- [ ] The theme toggle is visible only with the flag present.
- [ ] With dark active, the badge remains legible against the darker composite;
      border and label are both still visible (FR-003).
- [ ] Reload with the flag and confirm no light-to-dark flash on the badge — it
      inherits `next-themes`' pre-paint class like the rest of the page.

## Visual checklist — mobile

DevTools device toolbar at **375 × 667** (iPhone SE):

- [ ] The badge sits on its own line beneath the institution, does not overlap the
      "Learn more" pill, and does not clip.
- [ ] The page does **not** scroll horizontally — drag right to confirm (FR-007,
      and the guarantee `specs/012-mobile-layout-fixes` established).

## Regression checks

- [ ] `git diff --stat` shows **no change** to `public/data/education.json` or to
      `lib/utils/validation.ts` (FR-005).
- [ ] `grep -rn "\.dark" app/globals.css components/Education/` shows no new
      hand-written `.dark` selector (constitution, ADR 0011).
- [ ] Production Lighthouse performance stays ≥ 90 (`npm run build && npm start`,
      then audit) — SC-004.
