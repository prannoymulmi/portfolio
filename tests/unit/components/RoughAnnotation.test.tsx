import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoughAnnotation } from '@/components/Common/RoughAnnotation';

const annotate = jest.fn();

jest.mock('rough-notation', () => ({
  annotate: (...args: unknown[]) => {
    annotate(...args);
    return { show: jest.fn(), hide: jest.fn(), remove: jest.fn() };
  },
}));

const mockReducedMotion = jest.fn(() => false);
jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: () => mockReducedMotion(),
}));

describe('RoughAnnotation', () => {
  beforeEach(() => {
    annotate.mockClear();
    mockReducedMotion.mockReturnValue(false);
  });

  it('renders its children as readable text — the mark is emphasis, never the meaning', () => {
    render(<RoughAnnotation type="highlight">Security Nerd</RoughAnnotation>);
    expect(screen.getByText('Security Nerd')).toBeInTheDocument();
  });

  it('still renders the text even if annotation never runs', () => {
    // No layout in jsdom means the mark may not draw; the words must survive.
    render(<RoughAnnotation type="circle">AI enthusiast</RoughAnnotation>);
    expect(screen.getByText('AI enthusiast')).toBeVisible();
  });

  it('disables the draw animation when the visitor prefers reduced motion', async () => {
    mockReducedMotion.mockReturnValue(true);
    render(<RoughAnnotation type="underline">Software Engineer</RoughAnnotation>);

    await waitFor(() =>
      expect(annotate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ animate: false }),
      ),
    );
  });

  it('animates by default when reduced motion is not requested', async () => {
    render(<RoughAnnotation type="underline">Software Engineer</RoughAnnotation>);

    await waitFor(() =>
      expect(annotate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ animate: true }),
      ),
    );
  });

  it('uses a pale fill for highlight, which sits behind the glyphs', async () => {
    // A saturated fill here measured 2.84:1 against body text — under WCAG AA.
    render(<RoughAnnotation type="highlight">Security Nerd</RoughAnnotation>);

    await waitFor(() =>
      expect(annotate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ color: '#fef08a' }),
      ),
    );
  });

  it('uses a saturated stroke for outline marks, which do not cover text', async () => {
    render(<RoughAnnotation type="circle">AI enthusiast</RoughAnnotation>);

    await waitFor(() =>
      expect(annotate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ color: '#2563eb' }),
      ),
    );
  });

  it('passes the requested mark type through', async () => {
    render(<RoughAnnotation type="box">Cloud Architect</RoughAnnotation>);

    await waitFor(() =>
      expect(annotate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'box' }),
      ),
    );
  });
});
