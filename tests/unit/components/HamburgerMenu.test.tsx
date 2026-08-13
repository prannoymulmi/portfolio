import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HamburgerMenu } from '@/components/Navigation/HamburgerMenu';

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...rest }: React.ComponentProps<'div'>) => <div {...rest}>{children}</div>,
  },
}));

const SECTIONS = [
  { id: 'hero', label: 'Introduction' },
  { id: 'skills', label: 'Selected Work' },
  { id: 'career', label: 'Career Journey' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'playbook', label: 'Technical Playbook' },
  { id: 'contact', label: 'Contact' },
];

describe('HamburgerMenu', () => {
  it('renders a toggle button with the sections passed in, closed by default', () => {
    render(<HamburgerMenu sections={SECTIONS} />);

    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Career Journey' })).not.toBeInTheDocument();
  });
});
