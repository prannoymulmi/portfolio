import { renderHook, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { useContentLoader, clearContentCache } from '@/lib/hooks/useContentLoader';
import type { Locale } from '@/lib/i18n/locales';

const schema = z.object({ value: z.string() });

// The Locale type is `en`-only in production until T047 (SUPPORTED_LOCALES
// ships with one entry). The fallback behaviour under test is generic to any
// second locale, so this bridges the gap for the type checker rather than
// waiting on German content to exist.
const DE: Locale = 'de' as unknown as Locale;

interface MockResponse {
  ok: boolean;
  status?: number;
  body?: unknown;
}

function mockFetchImpl(responses: Record<string, MockResponse>) {
  return jest.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const response = responses[url];
    if (!response) {
      throw new Error(`Unmocked fetch in test: ${url}`);
    }
    return {
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 404),
      statusText: response.ok ? 'OK' : 'Not Found',
      json: async () => response.body,
    } as Response;
  });
}

describe('useContentLoader (locale-aware)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearContentCache();
    jest.restoreAllMocks();
  });

  it('fetches /data/en/home.json for locale en', async () => {
    global.fetch = mockFetchImpl({
      '/data/en/home.json': { ok: true, body: { value: 'english' } },
    });

    const { result } = renderHook(() => useContentLoader('en', 'home.json', schema));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ value: 'english' });
    expect(global.fetch).toHaveBeenCalledWith('/data/en/home.json', expect.any(Object));
  });

  it('fetches /data/de/home.json for locale de', async () => {
    global.fetch = mockFetchImpl({
      '/data/de/home.json': { ok: true, body: { value: 'deutsch' } },
    });

    const { result } = renderHook(() => useContentLoader(DE, 'home.json', schema));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ value: 'deutsch' });
    expect(global.fetch).toHaveBeenCalledWith('/data/de/home.json', expect.any(Object));
  });

  it('falls back to the whole English file on a 404 for a non-English locale (FR-006)', async () => {
    global.fetch = mockFetchImpl({
      '/data/de/home.json': { ok: false, status: 404 },
      '/data/en/home.json': { ok: true, body: { value: 'english fallback' } },
    });

    const { result } = renderHook(() => useContentLoader(DE, 'home.json', schema));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ value: 'english fallback' });
    expect(result.current.error).toBeNull();
  });

  it('falls back to the whole English file when the de file fails Zod validation', async () => {
    global.fetch = mockFetchImpl({
      '/data/de/home.json': { ok: true, body: { value: 42 } }, // wrong type
      '/data/en/home.json': { ok: true, body: { value: 'english fallback' } },
    });

    const { result } = renderHook(() => useContentLoader(DE, 'home.json', schema));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ value: 'english fallback' });
    expect(result.current.error).toBeNull();
  });

  it('logs the fallback once, not per render', async () => {
    global.fetch = mockFetchImpl({
      '/data/de/home.json': { ok: false, status: 404 },
      '/data/en/home.json': { ok: true, body: { value: 'english fallback' } },
    });
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { result, rerender } = renderHook(() => useContentLoader(DE, 'home.json', schema));
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender();
    rerender();

    expect(consoleWarn).toHaveBeenCalledTimes(1);
  });

  it('does not serve a cached English payload after switching locale (research R-009)', async () => {
    global.fetch = mockFetchImpl({
      '/data/en/home.json': { ok: true, body: { value: 'english' } },
      '/data/de/home.json': { ok: true, body: { value: 'deutsch' } },
    });

    const { result, rerender } = renderHook(
      ({ locale }: { locale: Locale }) => useContentLoader(locale, 'home.json', schema),
      { initialProps: { locale: 'en' as Locale } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ value: 'english' });

    rerender({ locale: DE });
    await waitFor(() => expect(result.current.data).toEqual({ value: 'deutsch' }));
  });
});
