import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from '@/components/Common/ThemeToggle';

const setTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', resolvedTheme: 'light', setTheme }),
}));

/** The flag is read off the real URL, so the tests navigate rather than mock. */
function visit(search: string) {
  window.history.replaceState({}, '', `/${search}`);
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    setTheme.mockClear();
    visit('?experiment=true');
  });

  afterEach(() => visit(''));

  it('renders nothing without the experiment flag', () => {
    visit('');
    const { container } = render(<ThemeToggle />);
    expect(container).toBeEmptyDOMElement();
  });

  it('stays hidden for a flag set to anything but true', () => {
    visit('?experiment=1');
    const { container } = render(<ThemeToggle />);
    expect(container).toBeEmptyDOMElement();
  });

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
