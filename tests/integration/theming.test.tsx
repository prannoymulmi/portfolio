import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/components/Common/ThemeProvider';
import { ThemeToggle } from '@/components/Common/ThemeToggle';

/**
 * Exercises the theme contract (specs/003-.../contracts/theme-contract.md)
 * against the real next-themes provider, not a mock — the precedence and
 * persistence rules are the library's behaviour, so mocking it would test
 * nothing.
 *
 * The contract is now gated: the dark design only exists for a visitor who
 * asked for it with `?experiment=true`, so every guarantee below is stated
 * relative to the flag.
 */

function setSystemPrefersDark(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-color-scheme: dark') ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

function visit(search: string) {
  window.history.replaceState({}, '', `/${search}`);
}

const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );

describe('Theme contract', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    setSystemPrefersDark(false);
    visit('?experiment=true');
  });

  afterEach(() => visit(''));

  it('T5: opens light regardless of the system preference', async () => {
    setSystemPrefersDark(true);
    renderToggle();

    await screen.findByRole('button');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('T3: restores an explicitly stored choice on mount', async () => {
    window.localStorage.setItem('theme', 'dark');
    renderToggle();

    await screen.findByRole('button');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('T2: activating the control switches the theme and stores it', async () => {
    renderToggle();
    const button = await screen.findByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });

  describe('without the experiment flag', () => {
    beforeEach(() => visit(''));

    it('offers no control at all', async () => {
      renderToggle();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('resets a stored dark choice, so nobody is stranded without the toggle', async () => {
      window.localStorage.setItem('theme', 'dark');
      renderToggle();

      await waitFor(() => expect(window.localStorage.getItem('theme')).toBe('light'));
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });
});
