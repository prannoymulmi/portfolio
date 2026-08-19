'use client';

import { useEffect, useState } from 'react';
import { validateJSON } from '@/lib/utils/validation';
import type { ContentState } from '@/lib/types/portfolio';
import type { Locale } from '@/lib/i18n/locales';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';
import { z } from 'zod';

// In-memory cache for JSON content (session-level), keyed by `${locale}/${fileName}`
// so switching locale never serves an already-cached payload in the other
// language (research.md R-009) — the silent-failure guard this key exists
// for specifically.
const contentCache = new Map<string, unknown>();

function cacheKey(locale: Locale, fileName: string): string {
  return `${locale}/${fileName}`;
}

interface UseContentLoaderOptions {
  immediate?: boolean; // Start loading on mount
}

/**
 * Fetches `public/data/<locale>/<fileName>` and validates it against `schema`.
 * A non-`ok` response or a failed validation for a non-English locale falls
 * back to the whole `public/data/en/<fileName>` file — never a per-field
 * merge (ADR 0024, contracts/locale-content-set.md §Fallback rule).
 */
export function useContentLoader<T>(
  locale: Locale,
  fileName: string,
  schema: z.ZodSchema<T>,
  options: UseContentLoaderOptions = { immediate: true },
): ContentState<T> {
  const shouldLoad = options.immediate !== false;
  const [state, setState] = useState<ContentState<T>>({
    data: null,
    loading: shouldLoad,
    error: null,
  });

  useEffect(() => {
    if (options.immediate === false) return;

    const key = cacheKey(locale, fileName);

    const loadContent = async () => {
      // Check cache first
      if (contentCache.has(key)) {
        const cachedData = contentCache.get(key);
        setState({
          data: cachedData as T,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const fetchAndValidate = async (targetLocale: Locale) => {
          const response = await fetch(`/data/${targetLocale}/${fileName}`, {
            // `force-cache` reuses a cached response even once it's stale,
            // so content edits never show up without clearing the cache
            // entirely (e.g. incognito). `no-store` always fetches fresh —
            // these files are small and edited often, so freshness matters
            // more than the caching win.
            cache: 'no-store',
          });

          if (!response.ok) {
            return { ok: false as const, response };
          }

          const rawData = await response.json();
          const validation = await validateJSON(rawData, schema, fileName);

          if (!validation.valid) {
            return { ok: false as const, response, validationError: validation.error };
          }

          return { ok: true as const, data: validation.data };
        };

        let result = await fetchAndValidate(locale);

        if (!result.ok && locale !== DEFAULT_LOCALE) {
          const reason = result.validationError ?? result.response.statusText;
          console.warn(
            `Content loader falling back to ${DEFAULT_LOCALE} for ${fileName} (locale "${locale}"): ${reason}`,
          );
          result = await fetchAndValidate(DEFAULT_LOCALE);
        }

        if (!result.ok) {
          throw new Error(
            result.validationError ?? `Failed to fetch ${fileName}: ${result.response.statusText}`,
          );
        }

        // Store in cache
        contentCache.set(key, result.data);

        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Content loader error for ${fileName}:`, errorMessage);

        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error(errorMessage),
        });
      }
    };

    loadContent();
  }, [locale, fileName, schema, options.immediate]);

  return state;
}

// Clear cache (useful for testing or manual refresh)
export function clearContentCache(): void {
  contentCache.clear();
}

// Get cache status for debugging
export function getContentCacheStatus(): { size: number; keys: string[] } {
  return {
    size: contentCache.size,
    keys: Array.from(contentCache.keys()),
  };
}
