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
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByText(testProject.bodyText).className).toMatch(/line-clamp-3/);
  });

  it('sets the anchor id the hero credit pill targets', () => {
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /auth0 identity platform/i })).toHaveAttribute(
      'id',
      'project-auth0',
    );
  });

  // The pill used to ring this card in the grid; it now opens the detail
  // modal and rings that instead, so the card carries no highlight state at
  // all. The ring's behaviour is covered against the modal in
  // ProjectGallery.test.tsx.
  it('never carries the highlight ring itself — that moved to the detail modal', () => {
    render(
      <ProjectCard
        project={testProject}
        projectId="auth0"
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /auth0 identity platform/i }).className).not.toMatch(
      /project-card-highlight/,
    );
  });
});
