'use client';

import { useContent } from '@/components/Common/ContentProvider';

export function TopSkillsPreview() {
  const { skills } = useContent();

  if (skills.loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (skills.error || !skills.data) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Skills not available at the moment
      </p>
    );
  }

  // Get top 3-4 skills from first categories
  const topSkills: string[] = [];

  for (const category of skills.data.skills) {
    if (topSkills.length >= 4) break;
    for (const skill of category.items) {
      if (topSkills.length >= 4) break;
      topSkills.push(skill.title);
    }
  }

  if (topSkills.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">No skills available</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {topSkills.map((skill) => (
        <div
          key={skill}
          className="flex items-center justify-center rounded-lg bg-gray-50 px-4 py-3 text-center font-medium text-gray-900 dark:bg-gray-700 dark:text-white"
        >
          {skill}
        </div>
      ))}
    </div>
  );
}
