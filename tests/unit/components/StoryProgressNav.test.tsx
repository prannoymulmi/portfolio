import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoryProgressNav } from '@/components/Navigation/StoryProgressNav';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.ComponentProps<'div'>) => <div {...rest}>{children}</div>,
  },
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: (value: unknown) => value,
}));

describe('StoryProgressNav', () => {
  it('renders a jump link for every story section', () => {
    render(<StoryProgressNav />);

    const expectedSections = [
      'Introduction',
      'About',
      'Skills',
      'Career Journey',
      'Education',
      'Projects',
      'Technical Playbook',
      'Contact',
    ];

    for (const label of expectedSections) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('points the career entry at the #career anchor', () => {
    render(<StoryProgressNav />);
    expect(screen.getByRole('link', { name: 'Career Journey' })).toHaveAttribute('href', '#career');
  });
});
