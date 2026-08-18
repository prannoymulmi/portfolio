'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useContentLoader } from '@/lib/hooks/useContentLoader';
import {
  HomeSchema,
  ExperiencesFileSchema,
  EducationFileSchema,
  ProjectsFileSchema,
  EngineeringPrincipleFileSchema,
  RoutesFileSchema,
  SocialFileSchema,
  TechnologiesFileSchema,
} from '@/lib/utils/validation';
import type {
  Home,
  ExperiencesFile,
  EducationFile,
  ProjectsFile,
  EngineeringPrincipleFile,
  RoutesFile,
  SocialFile,
  TechnologiesFile,
  ContentState,
} from '@/lib/types/portfolio';

interface ContentContextType {
  home: ContentState<Home>;
  experiences: ContentState<ExperiencesFile>;
  education: ContentState<EducationFile>;
  projects: ContentState<ProjectsFile>;
  systems: ContentState<ProjectsFile>;
  principle: ContentState<EngineeringPrincipleFile>;
  routes: ContentState<RoutesFile>;
  social: ContentState<SocialFile>;
  technologies: ContentState<TechnologiesFile>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const home = useContentLoader('home.json', HomeSchema);
  const experiences = useContentLoader('experiences.json', ExperiencesFileSchema);
  const education = useContentLoader('education.json', EducationFileSchema);
  const projects = useContentLoader('projects.json', ProjectsFileSchema);
  const systems = useContentLoader('systems.json', ProjectsFileSchema);
  const principle = useContentLoader('principle.json', EngineeringPrincipleFileSchema);
  const routes = useContentLoader('routes.json', RoutesFileSchema);
  const social = useContentLoader('social.json', SocialFileSchema);
  const technologies = useContentLoader('technologies.json', TechnologiesFileSchema);

  const value: ContentContextType = {
    home,
    experiences,
    education,
    projects,
    systems,
    principle,
    routes,
    social,
    technologies,
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
