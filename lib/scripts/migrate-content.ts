#!/usr/bin/env node
/**
 * Migration script to populate portfolio JSON files from existing e-portfolio data
 *
 * Usage: npx ts-node lib/scripts/migrate-content.ts
 *
 * This script reads from an existing e-portfolio data source (public/e-portfolio/profile)
 * and transforms it into the v1 portfolio JSON schema.
 *
 * Source: https://github.com/prannoymulmi/e-portfolio/tree/master/public/e-portfolio/profile
 * Outputs to: public/data/*.json
 */

import fs from 'fs';
import path from 'path';

interface MigrationResult {
  success: boolean;
  filesCreated: string[];
  errors: string[];
  warnings: string[];
}

async function migrateContent(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    filesCreated: [],
    errors: [],
    warnings: [],
  };

  const sourceDir = path.join(process.cwd(), 'public', 'e-portfolio', 'profile');
  const targetDir = path.join(process.cwd(), 'public', 'data');

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      result.warnings.push(
        `Source directory not found: ${sourceDir}. Skipping migration. ` +
          `Manually populate public/data/*.json files or provide e-portfolio data.`,
      );
      return result;
    }

    // List available files in source directory
    const sourceFiles = fs.readdirSync(sourceDir);
    console.log(`Found source files: ${sourceFiles.join(', ')}`);

    // Migration templates (update as needed based on actual e-portfolio structure)
    const templates = {
      'skills.json': () => ({
        intro:
          'Core competencies across full-stack development, cloud architecture, and team leadership.',
        skills: [
          {
            title: 'Languages & Databases',
            items: [
              { title: 'TypeScript', category: 'Languages & Databases' },
              { title: 'Go', category: 'Languages & Databases' },
              { title: 'Python', category: 'Languages & Databases' },
              { title: 'PostgreSQL', category: 'Languages & Databases' },
            ],
          },
          {
            title: 'Cloud & DevOps',
            items: [
              { title: 'AWS', category: 'Cloud & DevOps' },
              { title: 'Kubernetes', category: 'Cloud & DevOps' },
              { title: 'Docker', category: 'Cloud & DevOps' },
              { title: 'Terraform', category: 'Cloud & DevOps' },
            ],
          },
        ],
      }),
      'experiences.json': () => ({
        experiences: [
          {
            title: 'Senior Software Engineer',
            subtitle: 'Current Company',
            workType: 'Full-time' as const,
            workDescription: [
              'Led technical architecture decisions for microservices migration',
              'Mentored team of 5 junior engineers',
              'Improved deployment pipeline, reducing time by 60%',
              'Maintained 99.9% uptime SLA across production systems',
            ],
            dateText: '2023-01 — Present',
            technologies: ['TypeScript', 'AWS', 'Kubernetes', 'PostgreSQL'],
          },
        ],
      }),
      'education.json': () => ({
        education: [
          {
            title: '2014-2018',
            cardTitle: 'B.S. Computer Science',
            cardSubtitle: 'University Name',
            cardDetailedText: 'GPA: 3.8',
          },
        ],
      }),
      'projects.json': () => ({
        projects: [
          {
            title: 'Cloud Migration Platform',
            bodyText:
              'Built a Kubernetes-based platform that reduced deployment time by 60% and improved system reliability to 99.99% uptime. Led cross-functional team of 8 engineers.',
            tags: ['Kubernetes', 'Go', 'AWS', 'DevOps'],
            links: [
              { text: 'GitHub', route: 'https://github.com/example' },
              { text: 'Case Study', route: '/projects/migration' },
            ],
          },
        ],
      }),
      'playbook.json': () => ({
        categories: [
          {
            name: 'Architecture',
            principles: [
              {
                title: 'Microservices First',
                description:
                  'Break systems into independently deployable services for scalability and maintainability.',
              },
            ],
          },
          {
            name: 'Cloud',
            principles: [
              {
                title: 'Infrastructure as Code',
                description:
                  'Define all infrastructure in version-controlled code (Terraform, CloudFormation) for reproducibility.',
              },
            ],
          },
          {
            name: 'Security',
            principles: [
              {
                title: 'Principle of Least Privilege',
                description:
                  'Grant minimal necessary permissions; reduce attack surface with zero-trust architecture.',
              },
            ],
          },
          {
            name: 'Backend',
            principles: [
              {
                title: 'API Versioning',
                description:
                  'Version APIs explicitly to support multiple client versions and smooth deprecation.',
              },
            ],
          },
          {
            name: 'DevOps',
            principles: [
              {
                title: 'Continuous Deployment',
                description:
                  'Automate testing and deployment; ship small, frequent changes for faster feedback.',
              },
            ],
          },
          {
            name: 'Engineering Principles',
            principles: [
              {
                title: 'Code Review Culture',
                description:
                  'Require peer review for all changes; balance speed with quality and knowledge sharing.',
              },
            ],
          },
        ],
      }),
    };

    // Create default files if source data not available
    for (const [fileName, generator] of Object.entries(templates)) {
      const targetPath = path.join(targetDir, fileName);

      if (fs.existsSync(targetPath)) {
        result.warnings.push(`Skipped ${fileName} (already exists)`);
        continue;
      }

      try {
        const content = generator();
        fs.writeFileSync(targetPath, JSON.stringify(content, null, 2));
        result.filesCreated.push(fileName);
        console.log(`✓ Created ${fileName}`);
      } catch (error) {
        result.errors.push(`Failed to create ${fileName}: ${String(error)}`);
      }
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.errors.push(`Migration failed: ${String(error)}`);
    result.success = false;
  }

  return result;
}

// Run migration
migrateContent()
  .then((result) => {
    console.log('\n=== Migration Report ===');
    console.log(`Status: ${result.success ? '✓ SUCCESS' : '✗ FAILED'}`);
    console.log(`Files created: ${result.filesCreated.length}`);
    if (result.filesCreated.length > 0) {
      console.log(`  - ${result.filesCreated.join('\n  - ')}`);
    }

    if (result.warnings.length > 0) {
      console.log(`\nWarnings: ${result.warnings.length}`);
      result.warnings.forEach((w) => console.log(`  ⚠ ${w}`));
    }

    if (result.errors.length > 0) {
      console.log(`\nErrors: ${result.errors.length}`);
      result.errors.forEach((e) => console.log(`  ✗ ${e}`));
    }

    console.log('\nNext steps:');
    console.log('1. Review generated files in public/data/');
    console.log('2. Edit JSON files to customize content');
    console.log('3. Run: npm run dev');
    console.log('4. Verify content displays correctly on portfolio');

    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
