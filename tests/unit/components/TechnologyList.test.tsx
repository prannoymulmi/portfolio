import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react';
import type { TechnologyUsage } from '@/lib/utils/techDuration';
import { TechnologyList } from '@/components/Technologies/TechnologyList';

/**
 * Regression test for a real, reported bug: clicking a category filter could
 * make the technology list appear to "disappear". Root cause — `TechnologyList`
 * used `whileInView` on the `<ul>` with `viewport={{ once: true }}`, and relied
 * on Framer Motion's variant-inheritance to bring each `<motion.li>` from
 * `hidden` to `visible`. A technology that is filtered out (its row unmounts)
 * and later filtered back in (a category switch, not the same one reversed)
 * is a *brand-new* `<motion.li>` instance — React does not resurrect the old
 * DOM node for a key that disappeared from the tree for one or more renders.
 * Because `viewport.once` had already fired and disconnected its observer,
 * that brand-new instance never received a "become visible" signal and
 * rendered permanently stuck at its `hidden` variant's `opacity: 0` — visually
 * indistinguishable from "the list is empty".
 *
 * This is unreachable with the mocked `framer-motion` used by
 * `TechnologiesChapter.test.tsx` (mocking strips all animation props), so it
 * needed real `framer-motion` plus a controllable `IntersectionObserver` to
 * reproduce — jsdom's is a no-op stub (jest.setup.js) that never calls back.
 */

type Instance = { callback: IntersectionObserverCallback; targets: Element[] };
let instances: Instance[];

class TriggerableIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  private inst: Instance;

  constructor(callback: IntersectionObserverCallback) {
    this.inst = { callback, targets: [] };
    instances.push(this.inst);
  }
  observe(target: Element) {
    this.inst.targets.push(target);
  }
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** Fires every currently-registered observer as though its target(s) had
 * scrolled fully into view. */
function enterViewport() {
  instances.forEach((inst) => {
    inst.callback(
      inst.targets.map(
        (target) =>
          ({
            target,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
            time: 0,
          }) as unknown as IntersectionObserverEntry,
      ),
      // The real callback signature takes the observer too; unused by
      // Framer Motion's handler.
      {} as IntersectionObserver,
    );
  });
}

function usage(name: string, category: string): TechnologyUsage {
  return {
    name,
    category,
    note: `Note for ${name}.`,
    totalMonths: 24,
    level: 'Production',
    isCurrent: false,
    roles: [],
  };
}

const cloud = usage('AWS', 'Cloud & Infrastructure');
const security = usage('Threat Modeling', 'Security');

describe('TechnologyList — entrance animation survives category-filter remounts', () => {
  const realIntersectionObserver = global.IntersectionObserver;

  beforeEach(() => {
    instances = [];
    global.IntersectionObserver = TriggerableIntersectionObserver;
  });

  afterEach(() => {
    global.IntersectionObserver = realIntersectionObserver;
  });

  it('renders a technology at full opacity once it remounts under a different filter, after the list has already entered view', async () => {
    const onSelect = jest.fn();

    const { rerender, container } = render(
      <TechnologyList usages={[cloud, security]} activeTechName="AWS" onSelect={onSelect} />,
    );

    // The list scrolls into view — the one-time viewport trigger fires.
    await act(async () => {
      enterViewport();
    });

    // Filter to a category that excludes "Threat Modeling" — its row unmounts.
    rerender(<TechnologyList usages={[cloud]} activeTechName="AWS" onSelect={onSelect} />);
    expect(container.querySelector('button[aria-current]')).not.toBeNull();
    const rows = () => Array.from(container.querySelectorAll('li'));
    expect(rows().some((li) => li.textContent?.includes('Threat Modeling'))).toBe(false);

    // Filter to a different category that re-includes it — a brand-new
    // <motion.li> instance mounts for the exact same technology.
    rerender(<TechnologyList usages={[security]} activeTechName="Threat Modeling" onSelect={onSelect} />);

    const threatModelingRow = rows().find((li) => li.textContent?.includes('Threat Modeling'));
    expect(threatModelingRow).toBeDefined();

    // The bug: this row would be permanently stuck at opacity 0 (the
    // `hidden` variant) because the list's viewport trigger had already
    // fired once and disconnected before this row ever existed.
    expect((threatModelingRow as HTMLElement).style.opacity).not.toBe('0');
  });

  it('never mounts a row with initial opacity 0 once the list has already entered view (a second, disjoint remount)', async () => {
    const onSelect = jest.fn();
    const { rerender, container } = render(
      <TechnologyList usages={[cloud]} activeTechName="AWS" onSelect={onSelect} />,
    );

    await act(async () => {
      enterViewport();
    });

    // Away, then back to a *third* distinct category — proves the fix isn't
    // a one-shot coincidence tied to a single remount.
    rerender(<TechnologyList usages={[security]} activeTechName="Threat Modeling" onSelect={onSelect} />);
    rerender(<TechnologyList usages={[cloud]} activeTechName="AWS" onSelect={onSelect} />);

    const row = Array.from(container.querySelectorAll('li')).find((li) =>
      li.textContent?.includes('AWS'),
    );
    expect(row).toBeDefined();
    expect((row as HTMLElement).style.opacity).not.toBe('0');
  });
});
