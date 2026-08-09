'use client';

import React from 'react';
import { useContent } from '@/components/Common/ContentProvider';

interface SkillCardProps {
  skillName: string;
  category: string;
  onClose: () => void;
}

function findSkill(
  data: unknown,
  category: string,
  skillName: string,
): { skill: { title: string; icon?: string } | undefined; category: { title: string; items: { title: string }[] } } | null {
  const skillsData = data as { skills?: Array<{ title: string; items: Array<{ title: string; icon?: string }> }> } | null;
  if (!skillsData?.skills) return null;
  for (const cat of skillsData.skills) {
    if (cat.title === category) {
      const skill = cat.items.find((s) => s.title === skillName);
      return { skill, category: cat };
    }
  }
  return null;
}

export function SkillCard({ skillName, category, onClose }: SkillCardProps) {
  const { skills } = useContent();
  const skillData = findSkill(skills.data, category, skillName);

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
          {(categoryData.items || []).slice(0, 3).map((relatedSkill, idx) => (
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
