'use client';

import React, { useMemo, useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { SVGPitch } from '@/components/Career/SVGPitch';
import { SkillPosition } from './SkillPosition';
import { SkillCard } from './SkillCard';
import { SkillsSkeleton } from '@/components/Common/LoadingState';

// 4-3-3 formation layout (positions mapped to pitch)
// Defenders (4): positions at bottom
// Midfielders (3): positions at middle
// Attackers (3): positions at top
const FORMATION_LAYOUT = {
  defenders: [
    { x: 20, y: 80, position: 'Left Back' },
    { x: 40, y: 85, position: 'Center Back' },
    { x: 60, y: 85, position: 'Center Back' },
    { x: 80, y: 80, position: 'Right Back' },
  ],
  midfielders: [
    { x: 30, y: 50, position: 'Left Mid' },
    { x: 50, y: 50, position: 'Center Mid' },
    { x: 70, y: 50, position: 'Right Mid' },
  ],
  attackers: [
    { x: 35, y: 20, position: 'Left Wing' },
    { x: 50, y: 10, position: 'Striker' },
    { x: 65, y: 20, position: 'Right Wing' },
  ],
};

interface SkillPosition {
  x: number;
  y: number;
  position: string;
}

export function SkillsFormation() {
  const { skills } = useContent();
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number | null>(null);
  const [isResponsive, setIsResponsive] = useState(false);

  // Check if mobile on mount/resize
  React.useEffect(() => {
    const checkMobile = () => setIsResponsive(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Flatten skill categories and map to formation positions
  const skillPositions = useMemo(() => {
    if (!skills.data || !skills.data.skills || skills.data.skills.length === 0) return [];

    const allSkills: Array<{
      title: string;
      category: string;
      position?: SkillPosition;
      index: number;
    }> = [];

    const allPositions = [
      ...FORMATION_LAYOUT.defenders,
      ...FORMATION_LAYOUT.midfielders,
      ...FORMATION_LAYOUT.attackers,
    ];

    skills.data.skills.forEach((category) => {
      category.items.forEach((skill) => {
        allSkills.push({
          title: skill.title,
          category: category.title,
          index: allSkills.length,
        });
      });
    });

    // Map skills to positions (cycle if more skills than positions)
    return allSkills.map((skill, idx) => ({
      ...skill,
      position: allPositions[idx % allPositions.length],
    }));
  }, [skills.data]);

  const selectedSkill = selectedSkillIndex !== null ? skillPositions[selectedSkillIndex] : null;

  if (skills.loading) {
    return <SkillsSkeleton />;
  }

  if (skills.error || !skills.data) {
    return (
      <section className="py-12">
        <p className="text-center text-red-600">Failed to load skills</p>
      </section>
    );
  }

  return (
    <section className="space-y-8 py-12">
      <div>
        <h2 className="text-3xl font-bold">Skills Formation</h2>
        <p className="mt-2 text-on-photo">
          {isResponsive
            ? 'Skills organized by expertise area'
            : 'Click on any position to view skill details'}
        </p>
      </div>

      {isResponsive ? (
        // Mobile: Stack skills vertically
        <div className="space-y-3">
          {skillPositions.map((skillPos, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSkillIndex(idx)}
              className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {skillPos.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {skillPos.category}
                  </p>
                </div>
                {selectedSkillIndex === idx && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        // Desktop: SVG pitch formation
        <div className="flex gap-8">
          {/* Pitch with skill positions */}
          <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
            <div className="aspect-video">
              <SVGPitch>
                {skillPositions.map((skillPos, idx) => (
                  <SkillPosition
                    key={idx}
                    x={skillPos.position?.x ?? 50}
                    y={skillPos.position?.y ?? 50}
                    skillName={skillPos.title}
                    category={skillPos.category}
                    isSelected={selectedSkillIndex === idx}
                    onClick={() => setSelectedSkillIndex(idx)}
                    position={skillPos.position?.position}
                  />
                ))}
              </SVGPitch>
            </div>
          </div>

          {/* Skill details */}
          {selectedSkill && (
            <div className="w-80 shrink-0">
              <SkillCard
                skillName={selectedSkill.title}
                category={selectedSkill.category}
                onClose={() => setSelectedSkillIndex(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile detail panel */}
      {isResponsive && selectedSkill && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <SkillCard
            skillName={selectedSkill.title}
            category={selectedSkill.category}
            onClose={() => setSelectedSkillIndex(null)}
          />
        </div>
      )}
    </section>
  );
}
