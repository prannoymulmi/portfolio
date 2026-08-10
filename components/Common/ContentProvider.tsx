'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useContentLoader } from '@/lib/hooks/useContentLoader';
import {
  HomeSchema,
  SkillsFileSchema,
  ExperiencesFileSchema,
  EducationFileSchema,
  ProjectsFileSchema,
  PlaybookFileSchema,
  RoutesFileSchema,
  SocialFileSchema,
} from '@/lib/utils/validation';
import type {
  Home,
  SkillsFile,
  ExperiencesFile,
  EducationFile,
  ProjectsFile,
  PlaybookFile,
  RoutesFile,
  SocialFile,
  ContentState,
} from '@/lib/types/portfolio';

interface ContentContextType {
  home: ContentState<Home>;
  skills: ContentState<SkillsFile>;
  experiences: ContentState<ExperiencesFile>;
  education: ContentState<EducationFile>;
  projects: ContentState<ProjectsFile>;
  playbook: ContentState<PlaybookFile>;
  routes: ContentState<RoutesFile>;
  social: ContentState<SocialFile>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const home = useContentLoader('home.json', HomeSchema);
  const skills = useContentLoader('skills.json', SkillsFileSchema);
  const experiences = useContentLoader('experiences.json', ExperiencesFileSchema);
  const education = useContentLoader('education.json', EducationFileSchema);
  const projects = useContentLoader('projects.json', ProjectsFileSchema);
  const playbook = useContentLoader('playbook.json', PlaybookFileSchema);
  const routes = useContentLoader('routes.json', RoutesFileSchema);
  const social = useContentLoader('social.json', SocialFileSchema);

  const value: ContentContextType = {
    home,
    skills,
    experiences,
    education,
    projects,
    playbook,
    routes,
    social,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextType {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
}
