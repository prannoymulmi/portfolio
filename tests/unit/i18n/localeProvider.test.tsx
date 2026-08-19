import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocaleProvider, useLocale } from '@/components/Common/LocaleProvider';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/locales';

// The production registry ships with `en` only until T047. Unit-testing the
// provider's generic switching/persistence mechanism needs a second entry,
// so this file mocks the registry locally — it does not touch
// lib/i18n/locales.ts, which stays single-locale in production.
jest.mock('@/lib/i18n/locales', () => {
  const actual = jest.requireActual('@/lib/i18n/locales');
  return {
    ...actual,
    SUPPORTED_LOCALES: [
      { code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' },
      { code: 'de', label: 'Deutsch', shortLabel: 'DE', htmlLang: 'de' },
    ],
    isLocale: (value: unknown) => value === 'en' || value === 'de',
  };
});

// SUPPORTED_LOCALES (and therefore the Locale type) is `en`-only in
// production until T047, but the mock above registers a second locale for
// this file's tests — the assertion below bridges that gap for the type
// checker, which cannot see through jest.mock.
const TEST_LOCALE_DE = 'de' as unknown as Parameters<
  ReturnType<typeof useLocale>['setLocale']
>[0];

function LocaleReadout() {
  const { locale, setLocale } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button type="button" onClick={() => setLocale(TEST_LOCALE_DE)}>
        switch
      </button>
    </div>
  );
}

const tree = () => (
  <LocaleProvider>
    <LocaleReadout />
  </LocaleProvider>
);

describe('LocaleProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders en with no stored preference (FR-001)', () => {
    render(tree());
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('reads a valid stored de on mount', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    render(tree());
    expect(screen.getByTestId('locale')).toHaveTextContent('de');
  });

  it('resolves an unrecognised stored value to en (FR-005)', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'xx');
    render(tree());
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('does not crash the tree when localStorage throws on read (FR-005)', () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('storage blocked');
      },
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    const original = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: throwingStorage,
    });

    expect(() => render(tree())).not.toThrow();
    expect(screen.getByTestId('locale')).toHaveTextContent('en');

    Object.defineProperty(window, 'localStorage', { configurable: true, value: original });
  });

  it('writes to localStorage when setLocale is called (FR-004)', () => {
    render(tree());
    fireEvent.click(screen.getByRole('button', { name: 'switch' }));

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de');
    expect(screen.getByTestId('locale')).toHaveTextContent('de');
  });

  it("sets document.documentElement.lang to the active locale's htmlLang (FR-009)", () => {
    render(tree());
    expect(document.documentElement.lang).toBe('en');

    fireEvent.click(screen.getByRole('button', { name: 'switch' }));
    expect(document.documentElement.lang).toBe('de');
  });

  it('yields DEFAULT_LOCALE on the first render regardless of storage, matching the server (research R-001)', async () => {
    // Capture what a server render would produce — DEFAULT_LOCALE, since
    // there is no localStorage server-side and nothing is stored yet here.
    const { container: serverContainer, unmount } = render(tree());
    const serverHTML = serverContainer.innerHTML;
    unmount();

    // A returning visitor with a stored, non-default locale.
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'de');

    const container = document.createElement('div');
    container.innerHTML = serverHTML;
    document.body.appendChild(container);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(container, tree());
    });

    const hydrationMismatch = consoleError.mock.calls.some((call) =>
      String(call[0]).toLowerCase().includes('hydrat'),
    );
    expect(hydrationMismatch).toBe(false);

    // Once the mount effect runs, the stored locale still applies.
    expect(container.querySelector('[data-testid="locale"]')?.textContent).toBe('de');

    consoleError.mockRestore();
    document.body.removeChild(container);
  });
});
