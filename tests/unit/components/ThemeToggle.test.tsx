import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from '@/components/Common/ThemeToggle';

const setTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', resolvedTheme: 'light', setTheme }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => setTheme.mockClear());

  it('T1: renders a button with an accessible label describing the action', async () => {
    render(<ThemeToggle />);
    const button = await screen.findByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
  });

  it('T1: is keyboard-reachable — a real button, not a click-handling div', async () => {
    render(<ThemeToggle />);
    const button = await screen.findByRole('button');
    // Native buttons are focusable without an explicit tabIndex.
    expect(button.tagName).toBe('BUTTON');
    expect(button).not.toHaveAttribute('tabindex', '-1');
  });

  it('sets the opposite theme when activated', async () => {
    render(<ThemeToggle />);
    const button = await screen.findByRole('button');
    button.click();
    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
