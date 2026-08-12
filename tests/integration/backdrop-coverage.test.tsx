import fs from 'node:fs';
import path from 'node:path';

// The backdrop only reads as one continuous surface if no chapter paints over
// it. This asserts against the page source rather than a render, because what
// matters is the class names the chapters carry, not their runtime output.
const pageSource = fs.readFileSync(path.join(process.cwd(), 'app', 'page.tsx'), 'utf-8');

describe('backdrop coverage across the story', () => {
  it('gives no chapter a gradient background of its own', () => {
    expect(pageSource).not.toMatch(/bg-gradient-to-br/);
  });

  it('gives no chapter an opaque background of its own', () => {
    // Opaque backgrounds hide the photo. Translucent scrims are the whole point,
    // so only bare bg-white / bg-gray-NNN with no alpha suffix are a failure.
    const opaqueBackgrounds = pageSource.match(
      /className="[^"]*\bbg-(white|gray-\d{2,3})(?![/\w-])/g,
    );
    expect(opaqueBackgrounds).toBeNull();
  });

  it('puts the shared scrim on every chapter section', () => {
    const sectionCount = (pageSource.match(/<section/g) ?? []).length;
    const scrimCount = (pageSource.match(/chapter-scrim/g) ?? []).length;

    // The hero is the one section without a scrim: it carries its own gradient
    // treatment so the player card reads against the photo.
    expect(sectionCount).toBeGreaterThan(0);
    expect(scrimCount).toBe(sectionCount - 1);
  });
});
