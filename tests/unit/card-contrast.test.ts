import fs from 'node:fs';
import path from 'node:path';

/**
 * The card's colours are chosen against measured contrast, not by eye — the
 * reference mock's own rust measured 6.02:1 and had to be darkened before it
 * could carry display-size type (specs/006-hero-card-redesign/research.md §2).
 *
 * This suite is the guard on that work. It reads the tokens out of globals.css
 * rather than duplicating them, so a colour edited in one place and not the
 * other fails here instead of shipping.
 */

const CSS = fs.readFileSync(path.join(process.cwd(), 'app/globals.css'), 'utf-8');

/** WCAG 2.1 relative luminance. */
function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Reads a token from a specific block of globals.css. Both editions declare the
 * same six names, so the block has to be narrowed before matching or the light
 * value would always win.
 */
function token(block: 'root' | 'dark', name: string): string {
  const opener = block === 'root' ? ':root {' : '.dark {';
  const start = CSS.indexOf(opener);
  expect(start).toBeGreaterThan(-1);
  const body = CSS.slice(start, CSS.indexOf('\n}', start));
  const match = body.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`--${name} not found in ${opener}`);
  return match[1];
}

describe('player card contrast', () => {
  describe.each([['root'], ['dark']] as const)('%s edition', (edition) => {
    const ground = () => token(edition, 'card-ground');

    // FR-019: display-size text clears AAA. The name and the figure block are
    // both set in ink, and the position abbreviation is set in accent, so all
    // three of these pairs carry display type.
    it('sets body and display type at AAA (7:1) against the card ground', () => {
      expect(contrast(token(edition, 'card-ink'), ground())).toBeGreaterThanOrEqual(7);
    });

    it('sets the accent at AAA (7:1) against the card ground', () => {
      expect(contrast(token(edition, 'card-accent'), ground())).toBeGreaterThanOrEqual(7);
    });

    // The ground grades toward the edge colour at the card's rim. Type sits in
    // the interior, but the grade must not drag any of it below AA.
    it('keeps ink above AA (4.5:1) against the graded edge', () => {
      expect(
        contrast(token(edition, 'card-ink'), token(edition, 'card-edge')),
      ).toBeGreaterThanOrEqual(4.5);
    });

    // WCAG 1.4.11: the frame is a meaningful boundary, so it owes 3:1 — but
    // only 3:1, which is why the foil is a frame colour and never a text one.
    it('draws the foil above the 3:1 non-text boundary floor', () => {
      expect(contrast(token(edition, 'card-foil'), ground())).toBeGreaterThanOrEqual(3);
    });
  });

  // Recorded as a test rather than a comment because it is the constraint most
  // likely to be broken by someone reaching for "the gold one" for a label.
  it('leaves the light foil below AA for text, which is why it never carries any', () => {
    expect(contrast(token('root', 'card-foil'), token('root', 'card-ground'))).toBeLessThan(4.5);
  });

  it('keeps the same six tokens declared in both editions', () => {
    const names = [
      'card-ground',
      'card-edge',
      'card-ink',
      'card-accent',
      'card-foil',
      'card-foil-lite',
    ];
    for (const name of names) {
      expect(token('root', name)).toMatch(/^#[0-9a-f]{6}$/i);
      expect(token('dark', name)).toMatch(/^#[0-9a-f]{6}$/i);
      // An edition that reuses a value has not been designed, it has been
      // forgotten — the two grounds especially must differ.
      if (name === 'card-ground' || name === 'card-ink') {
        expect(token('root', name)).not.toBe(token('dark', name));
      }
    }
  });
});
