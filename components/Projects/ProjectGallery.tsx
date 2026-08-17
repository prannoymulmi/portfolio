'use client';

import React, { useRef, useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ProjectsSkeleton } from '@/components/Common/LoadingState';

// Root of every per-project GitHub link already present in projects.json —
// not a new value, just its profile-level prefix (research.md, data-model.md).
const GITHUB_PROFILE_URL = 'https://github.com/prannoymulmi';

export function ProjectGallery() {
  const { projects } = useContent();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  // Captures the card that opened the modal so focus can return to it on
  // close (FR-005), without inventing a second piece of state alongside
  // selectedProjectId (research.md).
  const triggerRef = useRef<HTMLElement | null>(null);

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
  const selectedProject =
    selectedProjectId === null
      ? null
      : (projectList.find((project, idx) => (project.id || idx.toString()) === selectedProjectId) ?? null);

  const closeModal = () => {
    setSelectedProjectId(null);
    if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  };

  return (
    <section className="space-y-8 py-12">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-photo/70 text-sm transition-colors hover:text-primary"
          >
            More on GitHub ↗
          </a>
        </div>
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
            onSelect={() => {
              triggerRef.current = document.activeElement as HTMLElement;
              setSelectedProjectId(project.id || idx.toString());
            }}
          />
        ))}
      </div>

      <ProjectDetailModal project={selectedProject} onClose={closeModal} />
    </section>
  );
}
