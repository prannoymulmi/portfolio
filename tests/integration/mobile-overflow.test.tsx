import fs from 'node:fs';
import path from 'node:path';

// jsdom has no layout engine, so scrollWidth/clientWidth/getBoundingClientRect
// all return zeros regardless of CSS — geometry is unobservable here (research
// R4, spec 012 clarify session). What is assertable is that the page source
// carries the containment utility the mobile-overflow fix depends on, the
// same technique tests/integration/backdrop-coverage.test.tsx uses for the
// backdrop's coverage guarantees.
const pageSource = fs.readFileSync(path.join(process.cwd(), 'app', 'page.tsx'), 'utf-8');

const globalsCssSource = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf-8');

const layoutSource = fs.readFileSync(path.join(process.cwd(), 'app', 'layout.tsx'), 'utf-8');

// specs/012-mobile-layout-fixes: a 640px decorative glow in
// components/Contact/ContactSection.tsx overhangs its column on a phone
// viewport, which is what made the whole document scrollable sideways. The
// fix contains it at the chapter section that hosts it, in app/page.tsx.
describe('mobile horizontal overflow containment (specs/012-mobile-layout-fixes)', () => {
  it('gives the contact chapter section a horizontal containment utility', () => {
    // The chapter landmarks render through <Chapter> (components/Common/Chapter.tsx,
    // research R-008/T031) rather than a bare <section> in page.tsx's own
    // source — the tag scanned for changed, the containment rule did not.
    const contactSectionMatch = pageSource.match(
      /<Chapter\s+id="contact"[\s\S]*?className="([^"]*)"/,
    );

    expect(contactSectionMatch).not.toBeNull();
    expect(contactSectionMatch?.[1]).toMatch(/\boverflow-x-clip\b/);
  });

  // research R2: overflow-x-clip, not overflow-hidden. Setting one axis to
  // `hidden` forces the other to `auto`, turning the section into a nested
  // scroll container that can trap `position: sticky` descendants — exactly
  // what FR-004 forbids for the one sticky element in the document,
  // StoryProgressNav. `clip` contains the overhang without creating a
  // scrollport.
  it('uses overflow-x-clip rather than overflow-hidden on the contact section', () => {
    const contactSectionMatch = pageSource.match(
      /<Chapter\s+id="contact"[\s\S]*?className="([^"]*)"/,
    );

    expect(contactSectionMatch?.[1]).not.toMatch(/\boverflow-hidden\b/);
  });

  // Regression guard for the rejected alternative (research R2): a global
  // guard on html/body would satisfy FR-001 (page doesn't scroll sideways)
  // while leaving FR-002 violated (the oversized element is still oversized,
  // merely invisible), and `overflow-x: hidden` at the viewport is a known
  // way to break `position: sticky` and smooth scrolling on iOS Safari
  // (FR-004). This encodes the rejected fix the way
  // backdrop-coverage.test.tsx encodes the rejected parallax.
  it('introduces no global overflow-x guard on html or body', () => {
    const globalOverflowGuard = /\b(html|body)\b[^{}]*\{[^{}]*overflow-x\s*:\s*(hidden|clip)/i;

    expect(globalsCssSource).not.toMatch(globalOverflowGuard);
    expect(layoutSource).not.toMatch(/overflow-x-hidden/);
  });
});
