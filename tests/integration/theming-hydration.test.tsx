import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/components/Common/ThemeProvider';
import { ThemeToggle } from '@/components/Common/ThemeToggle';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

/**
 * The theme is decided across two runtimes — a pre-paint script, a server
 * render, and a hydration pass that has to match it — so the bugs live in the
 * seam between them, not in any one render. `tests/integration/theming.test.tsx`
 * renders client-side only and cannot see them: it passed while a stored dark
 * choice was being wiped on every load in a real browser, because the flag
 * reads `false` for exactly one commit after hydration and an effect fired on
 * that value.
 *
 * Hydrating is what surfaces it — that first commit only exists on this path.
 * The container is seeded with the server's output rather than server-rendered
 * for real: `react-dom/server` needs three jsdom polyfills and then leaves a
 * scheduler handle open that stops Jest exiting. The output is a bare
 * `<script>` — next-themes' pre-paint script, whose own contents carry
 * `suppressHydrationWarning`, and nothing else, because the flag's server
 * snapshot is `false` so the toggle renders nothing.
 */
const SERVER_HTML = '<script></script>';

const tree = () => (
  <LocaleProvider>
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  </LocaleProvider>
);

async function hydrate() {
  const container = document.createElement('div');
  container.innerHTML = SERVER_HTML;
  document.body.appendChild(container);

  await act(async () => {
    hydrateRoot(container, tree());
  });

  return container;
}

/** What next-themes' pre-paint script would have done before React ran. */
function storedChoiceApplied(theme: string) {
  window.localStorage.setItem('theme', theme);
  document.documentElement.className = theme === 'dark' ? 'dark' : '';
}

function visit(search: string) {
  window.history.replaceState({}, '', `/${search}`);
}

describe('Theme across hydration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.body.innerHTML = '';
  });

  afterEach(() => visit(''));

  it('keeps a stored dark choice under the flag, instead of resetting it on load', async () => {
    visit('?experiment=true');
    storedChoiceApplied('dark');

    await hydrate();

    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('shows the toggle under the flag once hydrated', async () => {
    visit('?experiment=true');

    const container = await hydrate();

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('resets a stored dark choice without the flag', async () => {
    visit('');
    storedChoiceApplied('dark');

    await hydrate();

    expect(window.localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('renders no toggle without the flag', async () => {
    visit('');

    const container = await hydrate();

    expect(container.querySelector('button')).not.toBeInTheDocument();
  });
});
