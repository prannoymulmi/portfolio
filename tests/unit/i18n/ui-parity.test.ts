import fs from 'node:fs';
import path from 'node:path';
import { UiSchema } from '@/lib/i18n/uiSchema';

/**
 * Discovers every `lib/i18n/ui.*.json` dictionary and holds every
 * non-English locale to the exact key set of `ui.en.json` — no missing key,
 * no extra key — plus schema validity (contracts/ui-dictionary.md
 * §Completeness). Passes trivially today with one dictionary; becomes the
 * load-bearing gate once German lands (T046).
 */

const I18N_DIR = path.join(process.cwd(), 'lib', 'i18n');

function discoverDictionaries(): Record<string, unknown> {
  const dictionaries: Record<string, unknown> = {};
  for (const entry of fs.readdirSync(I18N_DIR)) {
    const match = entry.match(/^ui\.([a-z]{2})\.json$/);
    if (!match) continue;
    const code = match[1];
    const raw = fs.readFileSync(path.join(I18N_DIR, entry), 'utf-8');
    dictionaries[code] = JSON.parse(raw);
  }
  return dictionaries;
}

/** Recursively flattens a nested object to dot-path keys, e.g. `nav.jumpTo`. */
function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];

  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return flattenKeys(value, nextPrefix);
    }
    return [nextPrefix];
  });
}

describe('ui dictionary parity', () => {
  const dictionaries = discoverDictionaries();
  const englishKeys = flattenKeys(dictionaries.en).sort();

  it('ships an English dictionary to compare every other locale against', () => {
    expect(dictionaries.en).toBeDefined();
  });

  it('validates every dictionary against UiSchema', () => {
    for (const [code, dictionary] of Object.entries(dictionaries)) {
      const result = UiSchema.safeParse(dictionary);
      expect({ code, success: result.success, error: result.success ? null : result.error }).toEqual(
        { code, success: true, error: null },
      );
    }
  });

  it('holds every non-English locale to the exact key set of ui.en.json', () => {
    for (const [code, dictionary] of Object.entries(dictionaries)) {
      if (code === 'en') continue;
      const keys = flattenKeys(dictionary).sort();
      expect({ code, keys }).toEqual({ code, keys: englishKeys });
    }
  });
});
