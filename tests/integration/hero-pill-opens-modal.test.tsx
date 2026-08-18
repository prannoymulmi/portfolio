import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Project } from '@/lib/types/portfolio';

/**
 * The hero's credit pill and the projects gallery live in different subtrees
 * and talk to each other only through a window CustomEvent
 * (lib/utils/projectHighlight.ts). Unit tests dispatch that event directly,
 * which can never catch a regression in the pill's own click handler — the
 * one place the event is actually produced. This file clicks the real pill
 * with the real gallery mounted, so that seam is covered.
 */
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub only
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(() => true),
  ScrollTrigger: { create: jest.fn(() => ({ kill: jest.fn() })) },
}));

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  const motionValue = { get: () => 0, set: jest.fn(), on: () => jest.fn(), destroy: jest.fn() };
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useScroll: () => ({ scrollY: motionValue, scrollYProgress: motionValue }),
    useTransform: () => motionValue,
    useSpring: () => motionValue,
    useMotionValue: () => motionValue,
    useReducedMotion: () => true,
    motion: {
      div: React.forwardRef(
        (
          { children, initial, animate, exit, transition, style, ...rest }: Record<string, unknown>,
          ref: React.Ref<HTMLDivElement>,
        ) => (
          <div ref={ref} {...rest}>
            {children as React.ReactNode}
          </div>
        ),
      ),
    },
  };
});

const portfolioProject: Project = {
  id: 'portfolio-spec-driven',
  title: 'This Portfolio, Spec-Driven',
  bodyText: 'This site itself was designed and built with Claude Code.',
  links: [{ text: 'View on GitHub', route: 'https://github.com/prannoymulmi/portfolio' }],
  tags: ['Next.js'],
};

const mockContent = {
  home: {
    loading: false,
    error: null as Error | null,
    data: {
      name: 'Prannoy Mulmi',
      intro: 'Intro line.',
      roles: ['Software Engineer'],
      bio: 'Bio copy.',
      imageSource: '/images/portrait.png',
      cv: '/cv.pdf',
    },
  },
  projects: {
    loading: false,
    error: null as Error | null,
    data: { projects: [portfolioProject] },
  },
};

jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => mockContent,
}));

import { Hero } from '@/components/Hero/Hero';
import { ProjectGallery } from '@/components/Projects/ProjectGallery';

describe('hero credit pill -> project detail modal', () => {
  // jsdom implements no layout, so it ships no scrollIntoView at all — the
  // pill's own call to it would throw and abort the click handler.
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('opens the targeted project detail modal when the pill is clicked', () => {
    render(
      <>
        <Hero />
        <ProjectGallery />
      </>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /built with claude/i }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'This Portfolio, Spec-Driven' }),
    ).toBeInTheDocument();
  });

  it('runs the highlight ring on the opened modal', () => {
    render(
      <>
        <Hero />
        <ProjectGallery />
      </>,
    );

    fireEvent.click(screen.getByRole('link', { name: /built with claude/i }));

    const frame = screen.getByRole('dialog').parentElement as HTMLElement;
    expect(frame.className).toMatch(/project-card-highlight/);
  });
});
