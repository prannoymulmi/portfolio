import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocaleToggle } from '@/components/Common/LocaleToggle';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

// A live, mutable stand-in for the registry (variable name must start with
// "mock" — jest hoists jest.mock above imports and only allows closing over
// identifiers matching that prefix). Mutating its contents between tests
// changes what every import of SUPPORTED_LOCALES sees, with no re-import and
// no risk of a second React module instance.
const mockRegistry: { code: string; label: string; shortLabel: string; htmlLang: string }[] = [
  { code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' },
];

jest.mock('@/lib/i18n/locales', () => {
  const actual = jest.requireActual('@/lib/i18n/locales');
  return {
    ...actual,
    get SUPPORTED_LOCALES() {
      return mockRegistry;
    },
    isLocale: (value: unknown) => mockRegistry.some((entry) => entry.code === value),
  };
});

function renderToggle() {
  return render(
    <LocaleProvider>
      <LocaleToggle />
    </LocaleProvider>,
  );
}

describe('LocaleToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    mockRegistry.length = 0;
    mockRegistry.push({ code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' });
  });

  it('renders nothing when SUPPORTED_LOCALES has fewer than two entries', () => {
    const { container } = renderToggle();
    expect(container).toBeEmptyDOMElement();
  });

  describe('with two registered locales', () => {
    beforeEach(() => {
      mockRegistry.push({ code: 'de', label: 'Deutsch', shortLabel: 'DE', htmlLang: 'de' });
    });

    it("shows the next locale's shortLabel", () => {
      renderToggle();
      expect(screen.getByRole('button')).toHaveTextContent('DE');
    });

    it('carries an aria-label naming both the current and target language (FR-010)', () => {
      renderToggle();
      const label = screen.getByRole('button').getAttribute('aria-label') ?? '';
      expect(label).toMatch(/english/i);
      expect(label).toMatch(/deutsch/i);
    });

    it('switches the active locale on click (SC-001)', () => {
      renderToggle();
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(button).toHaveTextContent('EN');
    });

    it('wraps the selection around the registry', () => {
      renderToggle();
      const button = screen.getByRole('button');

      fireEvent.click(button); // en -> de
      expect(button).toHaveTextContent('EN');
      fireEvent.click(button); // de -> en (wraps)
      expect(button).toHaveTextContent('DE');
    });
  });
});
