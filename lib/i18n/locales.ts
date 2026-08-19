// Locale registry — the single extension point for adding a language
// (FR-007, data-model.md §Locale). Adding a language is one entry here, one
// public/data/<code>/ directory, and one ui.<code>.json — no component
// changes (ADR 0024).
//
// German content (public/data/de/) and the German dictionary
// (lib/i18n/ui.de.json) both exist as of T044–T046, so the `de` entry below
// (T047) is what makes the toggle render at all (LocaleToggle returns null
// with fewer than two entries).
export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE', htmlLang: 'de' },
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'locale';

/** Guards an unknown value (e.g. from localStorage) down to a known Locale (FR-005). */
export function isLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale.code === value);
}
