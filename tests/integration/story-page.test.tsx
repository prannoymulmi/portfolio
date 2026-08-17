import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { ContentProvider } from '@/components/Common/ContentProvider';

describe('Story page (/)', () => {
  const renderStory = () =>
    render(
      <ContentProvider>
        <Home />
      </ContentProvider>,
    );

  it('renders all 6 story sections in narrative order', () => {
    const { container } = renderStory();
    const sectionIds = Array.from(container.querySelectorAll('section[id]')).map(
      (section) => section.id,
    );

    expect(sectionIds).toEqual([
      'hero',
      'skills',
      'career',
      'education',
      'projects',
      'contact',
    ]);
  });

  it('renders no persistent navigation bar', () => {
    renderStory();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
