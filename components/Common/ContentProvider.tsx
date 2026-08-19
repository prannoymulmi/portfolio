'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useContentLoader } from '@/lib/hooks/useContentLoader';
import { useLocale } from '@/components/Common/LocaleProvider';
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
  const { locale } = useLocale();
  const home = useContentLoader(locale, 'home.json', HomeSchema);
  const experiences = useContentLoader(locale, 'experiences.json', ExperiencesFileSchema);
  const education = useContentLoader(locale, 'education.json', EducationFileSchema);
  const projects = useContentLoader(locale, 'projects.json', ProjectsFileSchema);
  const systems = useContentLoader(locale, 'systems.json', ProjectsFileSchema);
  const principle = useContentLoader(locale, 'principle.json', EngineeringPrincipleFileSchema);
  const routes = useContentLoader(locale, 'routes.json', RoutesFileSchema);
  const social = useContentLoader(locale, 'social.json', SocialFileSchema);
  const technologies = useContentLoader(locale, 'technologies.json', TechnologiesFileSchema);

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
