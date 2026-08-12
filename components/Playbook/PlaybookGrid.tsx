'use client';

import React, { useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { PrincipleCategory } from './PrincipleCategory';
import { PlaybookSkeleton } from '@/components/Common/LoadingState';

export function PlaybookGrid() {
  const { playbook } = useContent();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (playbook.loading) {
    return <PlaybookSkeleton />;
  }

  if (playbook.error || !playbook.data) {
    return (
      <section className="py-12">
        <p className="text-center text-red-600">Failed to load playbook</p>
      </section>
    );
  }

  const { categories } = playbook.data;

  return (
    <section className="space-y-8 py-12">
      <div>
        <h2 className="text-3xl font-bold">Technical Playbook</h2>
        <p className="text-on-photo mt-2">
          Core principles guiding architecture, design, and engineering decisions
        </p>
      </div>

      {/* Categories grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <PrincipleCategory
            key={category.name}
            category={category}
            isExpanded={expandedCategory === category.name}
            onToggle={() =>
              setExpandedCategory(expandedCategory === category.name ? null : category.name)
            }
          />
        ))}
      </div>
    </section>
  );
}
