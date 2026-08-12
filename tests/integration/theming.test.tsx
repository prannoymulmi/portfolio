import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/components/Common/ThemeProvider';
import { ThemeToggle } from '@/components/Common/ThemeToggle';

/**
 * Exercises the theme contract (specs/003-.../contracts/theme-contract.md)
 * against the real next-themes provider, not a mock — the precedence and
 * persistence rules are the library's behaviour, so mocking it would test
 * nothing.
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
  });

  it('T5: opens matching the system preference when nothing is stored', async () => {
    setSystemPrefersDark(true);
    renderToggle();

    await screen.findByRole('button');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('T3: restores an explicitly stored choice on mount', async () => {
    window.localStorage.setItem('theme', 'dark');
    renderToggle();

    await screen.findByRole('button');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('precedence: an explicit choice outranks the system preference', async () => {
    // System says dark, stored choice says light — light must win.
    setSystemPrefersDark(true);
    window.localStorage.setItem('theme', 'light');
    renderToggle();

    await screen.findByRole('button');
    expect(document.documentElement).not.toHaveClass('dark');
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
});
