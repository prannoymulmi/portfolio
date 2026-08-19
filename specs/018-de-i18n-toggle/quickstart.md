# Quickstart: Verify the German Language Toggle & Hero Location Tag

Manual end-to-end verification once implementation lands. References
`spec.md` requirement IDs (FR-xxx, SC-xxx) rather than repeating them.

## Prerequisites

- `pnpm install && pnpm dev`
- A fresh/incognito browser window (no prior `localStorage` for the site)

## Steps

1. Open `http://localhost:3000`. Everything renders in English. DevTools
   Elements panel shows `<html lang="en">`. `localStorage.locale` is unset.
   (FR-001, FR-005)
2. Confirm the nav bar's control cluster shows a **DE** button beside the
   theme/social controls, at both mobile and desktop widths, and that it
   stays visible/reachable while scrolled down to the Contact chapter.
   (FR-002)
3. Inspect the button's accessible name (e.g. via the browser's
   accessibility tree or a screen reader). It identifies current and
   target language, e.g. *"Language: English. Switch to German."* (FR-010)
4. Click it. Every chapter's text becomes German with no full page reload:
   nav "Jump to" panel, Hero roles/intro/bio/buttons, Selected Work,
   Career (including work types and pitch position labels), Technologies
   (including proficiency-level labels and durations like `3,5 J.`),
   Education (including grade band), Projects, Contact, Footer.
   (FR-003, SC-002) Scroll position does not jump.
5. Confirm `<html lang>` is now `"de"` and `localStorage.locale === 'de'`.
   (FR-009)
6. Confirm the Hero shows a location-pin icon with **Hamburg, Deutschland**.
   Toggle back to English and confirm it reads **Hamburg, Germany**.
   (FR-008, SC-005)
7. Reload the page. Still German. Close the tab, reopen the site. Still
   German. (FR-004, SC-003)
8. Click the toggle once more. Everything returns to English exactly as it
   started. (US1 acceptance scenario 3)
9. In DevTools, set `localStorage.locale = 'xx'` and reload. Site loads in
   English, no console error. (FR-005)
10. Temporarily rename `public/data/de/projects.json` (or otherwise make it
    404/invalid) and reload with German active. The Projects chapter
    renders in English; every other chapter stays German; layout stays
    intact; one console warning logs the fallback. Restore the file
    afterward. (FR-006)
11. Open the hamburger menu in German and follow an in-page chapter link.
    Still German after navigating. (US1 acceptance scenario 4)

## Automated checks

```sh
pnpm type-check
pnpm lint
pnpm test   # must fail if a key is deleted from lib/i18n/ui.de.json —
             # verify this once by deleting one key and reverting;
             # tests/unit/i18n/ui-parity.test.ts is what catches it
```

See `contracts/locale-content-set.md` for the content-set validation rules
these tests enforce, and `contracts/ui-dictionary.md` for the dictionary
contract the parity test is proving.
