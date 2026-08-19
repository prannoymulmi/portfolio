import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationTag } from '@/components/Hero/LocationTag';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/locales';

// Read the shipped strings rather than hardcoding a guess of what T054
// wrote — same technique Hero.test.tsx uses for content-sourced copy
// (US3, FR-008, SC-005).
const ui = {
  en: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib/i18n/ui.en.json'), 'utf-8')),
  de: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib/i18n/ui.de.json'), 'utf-8')),
};

function renderWithLocale() {
  return render(
    <LocaleProvider>
      <LocationTag />
    </LocaleProvider>,
  );
}

describe('LocationTag', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the English location string under the default locale', () => {
    renderWithLocale();
    expect(screen.getByText(ui.en.hero.location)).toBeInTheDocument();
  });

  it('renders the German location string once the stored locale is de', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'de');
    renderWithLocale();
    expect(await screen.findByText(ui.de.hero.location)).toBeInTheDocument();
  });

  it('marks its pin SVG as decorative, since the adjacent text already names the place', () => {
    const { container } = renderWithLocale();
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('never imports react-icons — ADR 0014 scopes it to SocialIcons.tsx alone', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components/Hero/LocationTag.tsx'),
      'utf-8',
    );
    // Matches an actual import/require, not incidental mentions in a
    // comment (e.g. this file's own ADR 0014 reference).
    expect(source).not.toMatch(/from\s+['"]react-icons|require\(['"]react-icons/);
  });
});
