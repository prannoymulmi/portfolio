import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectCard } from '@/components/Projects/ProjectCard';
import type { Project } from '@/lib/types/portfolio';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub only
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

const testProject: Project = {
  title: 'Auth0 Identity Platform',
  bodyText: 'A description of the project long enough to read like real body copy.',
  links: [{ text: 'View on GitHub', route: 'https://github.com/prannoymulmi/example' }],
  tags: ['Auth0', 'AWS'],
};

describe('ProjectCard', () => {
  it('calls onSelect when the card is clicked (FR-001)', () => {
    const onSelect = jest.fn();
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        isHighlighted={false}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /auth0 identity platform/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onSelect on Enter or Space when the card is focused (FR-001)', () => {
    const onSelect = jest.fn();
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        isHighlighted={false}
        onSelect={onSelect}
      />,
    );
    const card = screen.getByRole('button', { name: /auth0 identity platform/i });

    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('moves focus to itself on click, so the modal can return focus here on close', () => {
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        isHighlighted={false}
        onSelect={jest.fn()}
      />,
    );
    const card = screen.getByRole('button', { name: /auth0 identity platform/i });
    fireEvent.click(card);
    expect(document.activeElement).toBe(card);
  });

  it('truncates bodyText with line-clamp on the card, unlike the full-text modal', () => {
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        isHighlighted={false}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText(testProject.bodyText).className).toMatch(/line-clamp-3/);
  });

  it('sets the anchor id and highlight class the hero credit pill targets', () => {
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        isHighlighted
        onSelect={jest.fn()}
      />,
    );
    const card = screen.getByRole('button', { name: /auth0 identity platform/i });
    expect(card).toHaveAttribute('id', 'project-auth0');
    expect(card.className).toMatch(/project-card-highlight/);
  });

  it('omits the highlight class when not highlighted', () => {
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        isHighlighted={false}
        onSelect={jest.fn()}
      />,
    );
    const card = screen.getByRole('button', { name: /auth0 identity platform/i });
    expect(card.className).not.toMatch(/project-card-highlight/);
  });
});
