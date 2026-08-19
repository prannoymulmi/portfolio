'use client';

import { useMemo, useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { ProjectsSkeleton } from '@/components/Common/LoadingState';
import { buildUsage } from '@/lib/utils/techDuration';
import { useUi } from '@/components/Common/LocaleProvider';
import { TechnologyList } from './TechnologyList';
import { TechnologyDetail } from './TechnologyDetail';

const ALL_CATEGORY = 'All';

/**
 * The evidence-backed replacement for a plain skills list: every technology
 * shown here carries a category and a duration computed from the site
 * owner's actual recorded work history, never a hand-typed number
 * (research R-001). Follows the same loading/error/shape conventions as
 * `components/Work/ThreeSystems.tsx` (research R-011).
 */
export function TechnologiesChapter() {
  const { technologies, experiences } = useContent();
  const ui = useUi();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [activeTechName, setActiveTechName] = useState<string | null>(null);

  // Either source loading means a duration cannot yet be computed; either
  // failing means it never will be, and the chapter reports it rather than
  // rendering a technology list with every duration silently missing.
  const loading = technologies.loading || experiences.loading;
  const failed =
    technologies.error || experiences.error || !technologies.data || !experiences.data;

  const usages = useMemo(() => {
    if (!technologies.data || !experiences.data) return [];
    return buildUsage(technologies.data, experiences.data.experiences);
  }, [technologies.data, experiences.data]);

  const visibleUsages = useMemo(
    () =>
      activeCategory === ALL_CATEGORY
        ? usages
        : usages.filter((usage) => usage.category === activeCategory),
    [usages, activeCategory],
  );

  // The active technology, deterministic on first paint (data-model.md):
  // whatever is currently selected if it is still visible, otherwise the
  // first entry of the visible list — it must never point at a hidden row.
  const resolvedActiveName =
    activeTechName && visibleUsages.some((usage) => usage.name === activeTechName)
      ? activeTechName
      : (visibleUsages[0]?.name ?? null);

  const activeUsage = visibleUsages.find((usage) => usage.name === resolvedActiveName) ?? null;

  if (loading) return <ProjectsSkeleton />;
  if (failed) {
    return <p className="text-center text-red-600">{ui.technologies.failedToLoad}</p>;
  }

  // Only offer a category filter for a category that still has at least one
  // technology once sub-year and untraceable ones are omitted (buildUsage) —
  // a filter pill that always narrows to an empty list would be a dead end.
  // Order is preserved from the content file's own `categories`.
  const categories = technologies.data!.categories.filter((category) =>
    usages.some((usage) => usage.category === category),
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono text-primary">{ui.technologies.label}</p>
        {/* font-display named explicitly, though it's already the body
            default (globals.css) — the reference's equivalent heading names
            its font family explicitly too, and doing the same here keeps the
            intent legible at the call site rather than relying on a global
            default nobody sees from this file. text-gradient-accent (already
            used by Contact's "Let's talk.") on the verb phrase, not the whole
            heading — same restrained "one emphasised phrase" rule, not a new
            treatment. Scale stays text-3xl sm:text-4xl, matching ThreeSystems
            (FR-008): weight and colour change here, not size. */}
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {ui.technologies.headingLead}{' '}
          <span className="text-gradient-accent">{ui.technologies.headingAccent}</span>{' '}
          {ui.technologies.headingTail}
        </h2>
        <p className="text-on-photo mt-4 max-w-2xl">{technologies.data!.intro}</p>
        <p className="text-on-photo mt-3 max-w-2xl">{technologies.data!.builtWithNote}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={activeCategory === ALL_CATEGORY}
          onClick={() => setActiveCategory(ALL_CATEGORY)}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeCategory === ALL_CATEGORY
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-on-photo hover:border-primary/50'
          }`}
        >
          {ui.technologies.allCategory}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeCategory === category
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-on-photo hover:border-primary/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <TechnologyList
          usages={visibleUsages}
          activeTechName={resolvedActiveName ?? ''}
          onSelect={setActiveTechName}
        />
        {activeUsage && <TechnologyDetail usage={activeUsage} />}
      </div>
    </div>
  );
}
