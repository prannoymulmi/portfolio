import { z } from 'zod';

// UI chrome dictionary schema (contracts/ui-dictionary.md, ADR 0024). Every
// leaf is a non-empty string; nesting never exceeds two levels. Filled in by
// the string-extraction tasks (T031–T042) — this file's shape is what
// ui.en.json / ui.de.json are validated against.
export const UiSchema = z.object({
  nav: z.object({
    closeMenu: z.string().min(1),
    openMenu: z.string().min(1),
    storySections: z.string().min(1),
    jumpTo: z.string().min(1),
    // `{email}`-interpolated, resolved through format() (contracts/ui-dictionary.md §Interpolation).
    emailLabel: z.string().min(1),
    switchToLightMode: z.string().min(1),
    switchToDarkMode: z.string().min(1),
    // `{current}` / `{target}`-interpolated (LocaleToggle's aria-label,
    // research R-010) — both values are always endonyms (locales.ts `label`,
    // e.g. "Deutsch"), never translated themselves.
    switchLocale: z.string().min(1),
    sections: z.object({
      hero: z.string().min(1),
      skills: z.string().min(1),
      career: z.string().min(1),
      technologies: z.string().min(1),
      education: z.string().min(1),
      projects: z.string().min(1),
      contact: z.string().min(1),
    }),
  }),
  hero: z.object({
    // The pill's resting label (CreditPillText's BASE_TEXT) — also the
    // leading text of creditPillFull, though the dictionary does not enforce
    // that relationship (a translator keeps both sentences consistent).
    creditPillBase: z.string().min(1),
    // The pill's full accessible name / typed line (Hero.tsx's aria-label
    // and CreditPillText's FULL_TEXT read the same sentence).
    creditPillFull: z.string().min(1),
    whatIDo: z.string().min(1),
    viewWork: z.string().min(1),
    playCareer: z.string().min(1),
    // `{label}`-interpolated (CvLink's aria-label).
    cvOpensInNewTab: z.string().min(1),
    // `{name}`-interpolated (HeroPortrait's alt text).
    portraitAlt: z.string().min(1),
    // LocationTag's text (US3, FR-008, SC-005) — the adjacent pin SVG is
    // decorative (`aria-hidden`) since this string already names the place.
    location: z.string().min(1),
  }),
  work: z.object({
    eyebrow: z.string().min(1),
    heading: z.string().min(1),
    failedToLoad: z.string().min(1),
    // `{title}`-interpolated (SystemCard's aria-label).
    technologiesUsedOn: z.string().min(1),
    // PrincipleBand's eyebrow — the held statement between the Work and
    // Career chapters, grouped here rather than a twelfth top-level group.
    principleEyebrow: z.string().min(1),
  }),
  career: z.object({
    eyebrow: z.string().min(1),
    heading: z.string().min(1),
    interactiveDescription: z.string().min(1),
    timelineDescription: z.string().min(1),
    failedToLoad: z.string().min(1),
    previousChapter: z.string().min(1),
    nextChapter: z.string().min(1),
    // `{order}` / `{total}`-interpolated (CareerPitch's "Chapter X / Y").
    chapterCounter: z.string().min(1),
    pausePlay: z.string().min(1),
    playInOrder: z.string().min(1),
    // `{order}` / `{position}` / `{company}` / `{role}`-interpolated
    // (CareerPitch's per-player aria-label). `position` is resolved through
    // `positions` below before formatting.
    chapterAriaLabel: z.string().min(1),
    tip: z.string().min(1),
    whatIBuilt: z.string().min(1),
    achievements: z.string().min(1),
    technologies: z.string().min(1),
    // `{order}` / `{position}`-interpolated (ChapterDetail's "Chapter N · Position").
    chapterLabel: z.string().min(1),
    // `{company}`-interpolated, shared by ChapterDetail and TimelineView's
    // "Technologies used at {company}" aria-labels.
    technologiesUsedAt: z.string().min(1),
    noExperienceData: z.string().min(1),
    pitch: z.string().min(1),
    timeline: z.string().min(1),
    switchToTimelineView: z.string().min(1),
    switchToInteractiveView: z.string().min(1),
    // The display-only substitution for the literal "Present" kept in
    // dateText (research R-006) — applied at render time, never stored.
    present: z.string().min(1),
    positions: z.object({
      goalkeeper: z.string().min(1),
      centreBack: z.string().min(1),
      leftBack: z.string().min(1),
      defensiveMidfield: z.string().min(1),
      playmaker: z.string().min(1),
      rightWing: z.string().min(1),
      striker: z.string().min(1),
    }),
    // Keyed by the existing workType Zod enum values (validation.ts) — the
    // enum itself is data and does not change; only its display does.
    workTypes: z.object({
      'Full-time': z.string().min(1),
      'Part-time': z.string().min(1),
      Contract: z.string().min(1),
      Freelance: z.string().min(1),
      'Working student': z.string().min(1),
    }),
  }),
  technologies: z.object({
    // Shared across the eyebrow paragraph and TechnologyList's aria-label —
    // both render the same word.
    label: z.string().min(1),
    headingLead: z.string().min(1),
    headingAccent: z.string().min(1),
    headingTail: z.string().min(1),
    failedToLoad: z.string().min(1),
    allCategory: z.string().min(1),
    whereItWasUsed: z.string().min(1),
    levels: z.object({
      dailyDriver: z.string().min(1),
      production: z.string().min(1),
      workingKnowledge: z.string().min(1),
    }),
    units: z.object({
      underOneYear: z.string().min(1),
      // `{value}`-interpolated with the Intl-formatted number.
      years: z.string().min(1),
    }),
  }),
  education: z.object({
    heading: z.string().min(1),
    subheading: z.string().min(1),
    failedToLoad: z.string().min(1),
    learnMore: z.string().min(1),
    // Alt text for an institution's logo (EducationSection.tsx) — `{institution}`
    // interpolates the entry's own cardSubtitle, so it isn't duplicated here.
    logoAlt: z.string().min(1),
    grades: z.object({
      veryGood: z.string().min(1),
      good: z.string().min(1),
      satisfactory: z.string().min(1),
      sufficient: z.string().min(1),
    }),
  }),
  projects: z.object({
    heading: z.string().min(1),
    subheading: z.string().min(1),
    failedToLoad: z.string().min(1),
    moreOnGithub: z.string().min(1),
    close: z.string().min(1),
    viewOnGithub: z.string().min(1),
  }),
  contact: z.object({
    eyebrow: z.string().min(1),
    headingLead: z.string().min(1),
    headingAccent: z.string().min(1),
  }),
  footer: z.object({
    tagline: z.string().min(1),
    quickLinks: z.string().min(1),
    connect: z.string().min(1),
    projects: z.string().min(1),
    selectedWork: z.string().min(1),
    career: z.string().min(1),
    // `{year}` / `{name}`-interpolated. `name` is always supplied as the
    // invariant "Prannoy Mulmi" literal, never translated (data-model.md R-005 spirit).
    copyright: z.string().min(1),
  }),
  errors: z.object({
    contentUnavailable: z.string().min(1),
    somethingWentWrong: z.string().min(1),
    tryAgain: z.string().min(1),
    couldNotLoadSection: z.string().min(1),
    unexpectedError: z.string().min(1),
  }),
  a11y: z.object({
    skipToMainContent: z.string().min(1),
    landmarks: z.object({
      hero: z.string().min(1),
      skills: z.string().min(1),
      career: z.string().min(1),
      technologies: z.string().min(1),
      education: z.string().min(1),
      projects: z.string().min(1),
      contact: z.string().min(1),
    }),
  }),
});

export type Ui = z.infer<typeof UiSchema>;
