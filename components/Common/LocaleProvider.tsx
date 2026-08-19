'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, isLocale } from '@/lib/i18n/locales';
import type { Locale } from '@/lib/i18n/locales';
import { getUi } from '@/lib/i18n';
import type { Ui } from '@/lib/i18n/uiSchema';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

/**
 * Owns the active locale (ADR 0024, research.md R-001). `useState(DEFAULT_LOCALE)`
 * means the server render and the client's hydration render both say
 * DEFAULT_LOCALE, so nothing mismatches — a stored preference (if any) is
 * only applied once the mount effect below has committed, mirroring the
 * `mounted` pattern already used in HamburgerMenu.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored)) {
        // Reading a one-time value from an external system (localStorage) on
        // mount, not synchronizing React state with itself — the same
        // pattern and justification as HamburgerMenu's `mounted` effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(stored);
      }
    } catch {
      // Unreadable storage (private mode, disabled storage) — stay on DEFAULT_LOCALE (FR-005).
    }
    // Only ever run once, on mount — see the useState comment above.
  }, []);

  useEffect(() => {
    const htmlLang = SUPPORTED_LOCALES.find((entry) => entry.code === locale)?.htmlLang ?? locale;
    document.documentElement.lang = htmlLang;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Unwritable storage — the in-memory locale still updates for this session.
    }
  };

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

/** Returns the active locale's UI chrome dictionary. */
export function useUi(): Ui {
  const { locale } = useLocale();
  return getUi(locale);
}
