import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AboutSection } from '@/components/About/AboutSection';

// Separate file so the mock (a real imageSource) doesn't leak into
// AboutSection.test.tsx, which relies on the real "no photo yet" content.
jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({
    about: {
      loading: false,
      error: null,
      data: { about: 'Bio text.', imageSource: '/images/profile.jpg' },
    },
    social: {
      loading: false,
      error: null,
      data: { social: [] },
    },
  }),
}));

describe('AboutSection with a real photo configured', () => {
  it('renders the real photo instead of the placeholder once imageSource is set', () => {
    render(<AboutSection />);

    const photo = screen.getByRole('img', { name: /^profile$/i });
    expect(photo).toHaveAttribute('src', expect.stringContaining('profile.jpg'));
    expect(screen.queryByRole('img', { name: /coming soon/i })).not.toBeInTheDocument();
  });
});
