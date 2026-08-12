'use client';

import React, { useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { ProjectCard } from './ProjectCard';
import { ProjectsSkeleton } from '@/components/Common/LoadingState';

export function ProjectGallery() {
  const { projects } = useContent();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (projects.loading) {
    return <ProjectsSkeleton />;
  }

  if (projects.error || !projects.data) {
    return (
      <section className="py-12">
        <p className="text-center text-red-600">Failed to load projects</p>
      </section>
    );
  }

  const { projects: projectList } = projects.data;

  return (
    <section className="space-y-8 py-12">
      <div>
        <h2 className="text-3xl font-bold">Featured Projects</h2>
        <p className="mt-2 text-on-photo">
          Case studies showcasing problem-solving, technical decisions, and measurable impact
        </p>
      </div>

      {/* Projects grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectList.map((project, idx) => (
          <ProjectCard
            key={project.id || idx}
            project={project}
            isSelected={selectedProjectId === (project.id || idx.toString())}
            onSelect={() => setSelectedProjectId(project.id || idx.toString())}
          />
        ))}
      </div>
    </section>
  );
}
