'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useContentLoader } from '@/lib/hooks/useContentLoader';
import {
  HomeSchema,
  AboutSchema,
  SkillsFileSchema,
  ExperiencesFileSchema,
  EducationFileSchema,
  ProjectsFileSchema,
  PlaybookFileSchema,
  RoutesFileSchema,
  NavbarConfigSchema,
  SocialFileSchema,
} from '@/lib/utils/validation';
import type {
  Home,
  About,
  SkillsFile,
  ExperiencesFile,
  EducationFile,
  ProjectsFile,
  PlaybookFile,
  RoutesFile,
  NavbarConfig,
  SocialFile,
  ContentState,
} from '@/lib/types/portfolio';

interface ContentContextType {
  home: ContentState<Home>;
  about: ContentState<About>;
  skills: ContentState<SkillsFile>;
  experiences: ContentState<ExperiencesFile>;
  education: ContentState<EducationFile>;
  projects: ContentState<ProjectsFile>;
  playbook: ContentState<PlaybookFile>;
  routes: ContentState<RoutesFile>;
  navbar: ContentState<NavbarConfig>;
  social: ContentState<SocialFile>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const home = useContentLoader('home.json', HomeSchema);
  const about = useContentLoader('about.json', AboutSchema);
  const skills = useContentLoader('skills.json', SkillsFileSchema);
  const experiences = useContentLoader('experiences.json', ExperiencesFileSchema);
  const education = useContentLoader('education.json', EducationFileSchema);
  const projects = useContentLoader('projects.json', ProjectsFileSchema);
  const playbook = useContentLoader('playbook.json', PlaybookFileSchema);
  const routes = useContentLoader('routes.json', RoutesFileSchema);
  const navbar = useContentLoader('navbar.json', NavbarConfigSchema);
  const social = useContentLoader('social.json', SocialFileSchema);

  const value: ContentContextType = {
    home,
    about,
    skills,
    experiences,
    education,
    projects,
    playbook,
    routes,
    navbar,
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
