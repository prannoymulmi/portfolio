'use client';

import { useEffect, useState } from 'react';
import { validateJSON } from '@/lib/utils/validation';
import type { ContentState } from '@/lib/types/portfolio';
import { z } from 'zod';

// In-memory cache for JSON content (session-level)
const contentCache = new Map<string, unknown>();

interface UseContentLoaderOptions {
  immediate?: boolean; // Start loading on mount
}

export function useContentLoader<T>(
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

    const loadContent = async () => {
      // Check cache first
      if (contentCache.has(fileName)) {
        const cachedData = contentCache.get(fileName);
        setState({
          data: cachedData as T,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(`/data/${fileName}`, {
          // `force-cache` reuses a cached response even once it's stale,
          // so content edits never show up without clearing the cache
          // entirely (e.g. incognito). `no-store` always fetches fresh —
          // these files are small and edited often, so freshness matters
          // more than the caching win.
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
        }

        const rawData = await response.json();

        // Validate against schema
        const validation = await validateJSON(rawData, schema, fileName);

        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Store in cache
        contentCache.set(fileName, validation.data);

        setState({
          data: validation.data,
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
  }, [fileName, schema, options.immediate]);

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
