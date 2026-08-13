'use client';

import { useContent } from '@/components/Common/ContentProvider';
import { ProjectsSkeleton } from '@/components/Common/LoadingState';
import { SystemCard } from './SystemCard';

/**
 * How many systems the chapter shows. Three is the claim the heading makes, so
 * it is a hard cap rather than "however many the content file happens to have"
 * — a fourth would make the heading a lie.
 */
const SYSTEM_COUNT = 3;

/**
 * The showcase that replaced the skills formation.
 *
 * What it replaced was a list of tool names scattered across a football pitch
 * at positions that carried no meaning — the mapping was `index % positions`,
 * so "Java" sat at left back for no reason a visitor could recover. A tool
 * name proves nothing on its own; this chapter answers the question the list
 * left open, which is what was built with them and what it did in production.
 */
export function ThreeSystems() {
  const { projects } = useContent();

  if (projects.loading) return <ProjectsSkeleton />;
  if (projects.error || !projects.data) {
    return <p className="text-center text-red-600">Failed to load systems</p>;
  }

  const systems = projects.data.projects.slice(0, SYSTEM_COUNT);

  // The chapter's gradient wash is mounted by app/page.tsx, on the full-bleed
  // <section>. Rendering it here would inset it to this content column, and a
  // wash with visible left and right edges reads as a background panel — the
  // per-chapter background ADR 0015 replaced with one shared photograph.
  return (
    <section className="space-y-8 py-12">
      <div>
        <p className="label-mono text-primary">Selected work</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Three systems I&rsquo;d happily defend in a design review
        </h2>
      </div>

      <div className="mt-10 divide-y divide-border border-t border-border">
        {systems.map((project) => (
          <SystemCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
