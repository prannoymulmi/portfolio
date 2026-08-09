'use client';

import React, { useMemo } from 'react';
import { useContent } from '@/components/Common/ContentProvider';

interface SkillCardProps {
  skillName: string;
  category: string;
  onClose: () => void;
}

export function SkillCard({ skillName, category, onClose }: SkillCardProps) {
  const { skills } = useContent();

  // Find the skill data from skills.json
  const skillData = useMemo(() => {
    if (!skills.data || !skills.data.skills) return null;

    for (const cat of skills.data.skills as any[]) {
      if (cat.title === category) {
        const skill = (cat.items as any[]).find((s: any) => s.title === skillName);
        return { skill, category: cat };
      }
    }
    return null;
  }, [skills.data, skillName, category]);

  if (!skillData?.skill) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">Skill data not available</p>
      </div>
    );
  }

  const { skill, category: categoryData } = skillData;

  return (
    <article className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      {/* Close button (mobile) */}
      <button
        onClick={onClose}
        className="mb-2 text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 md:hidden"
        aria-label="Close skill details"
      >
        ← Back
      </button>

      {/* Skill header */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{skill.title}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900 dark:bg-blue-900 dark:text-blue-100">
            {categoryData.title}
          </span>
        </p>
      </div>

      {/* Skill icon/visual (if available) */}
      {skill.icon && (
        <div className="mb-4 text-center text-5xl">{skill.icon}</div>
      )}

      {/* Skill description */}
      <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {skill.title} is a key expertise area in my technical foundation. I use this skill across
        multiple projects and have deep practical experience with various frameworks and tools in
        this domain.
      </p>

      {/* Related categories */}
      <div className="space-y-2 rounded-lg bg-white p-3 dark:bg-gray-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Related Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {((categoryData.items as any[]) || []).slice(0, 3).map((relatedSkill: any, idx: number) => (
            <span
              key={idx}
              className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              {relatedSkill.title}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
