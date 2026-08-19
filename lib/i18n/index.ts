import uiEn from './ui.en.json';
import uiDe from './ui.de.json';
import type { Locale } from './locales';
import type { Ui } from './uiSchema';

export * from './locales';
export * from './uiSchema';

// Statically imported (bundled at build time, not fetched) so chrome text
// never has a loading gap — contracts/ui-dictionary.md §Loading, ADR 0024.
// Every ui.<code>.json module lives here, one entry per registered locale.
const dictionaries: Partial<Record<Locale, Ui>> = {
  en: uiEn as Ui,
  de: uiDe as Ui,
};

/** Returns the dictionary for `locale`, falling back to English when the locale has none. */
export function getUi(locale: Locale): Ui {
  return dictionaries[locale] ?? dictionaries.en!;
}
