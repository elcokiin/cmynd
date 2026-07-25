import { describe, it, expect } from 'vitest';
import { buildVfs } from './build-vfs';
import type { PublicPortfolio, PublicSkill, PublicProject, PublicExperience } from '@elcokiin/backend/lib/types/portfolio';

const mockProfile: PublicPortfolio = {
  _id: 'test' as any,
  name: 'Diego Tenjo',
  headline: 'Full-Stack Developer',
  about: '',
  philosophy: 'Keep it simple. Write deterministic code.',
  socialLinks: [],
  hobbies: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockSkills: PublicSkill[] = [
  { _id: 's1' as any, name: 'TypeScript', category: 'languages', icon: 'ts' },
  { _id: 's2' as any, name: 'React', category: 'frameworks', icon: 'react' },
];

const mockProjects: PublicProject[] = [
  {
    _id: 'p1' as any,
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project',
    technologies: ['TypeScript', 'React'],
    order: 1,
  },
];

const mockExperience: PublicExperience[] = [
  {
    _id: 'e1' as any,
    type: 'education',
    title: 'Systems Engineering',
    organization: 'University',
    startDate: '2020',
    isCurrent: true,
    order: 1,
  },
];

describe('buildVfs', () => {
  it('creates a valid directory structure', () => {
    const vfs = buildVfs(mockProfile, mockSkills, mockProjects, mockExperience);

    expect(vfs.type).toBe('directory');
    expect(vfs.name).toBe('diego');
    expect(vfs.children).toHaveProperty('experience');
    expect(vfs.children).toHaveProperty('projects');
    expect(vfs.children).toHaveProperty('stack');
    expect(vfs.children).toHaveProperty('philosophy.md');
  });

  it('contains skills grouped by category', () => {
    const vfs = buildVfs(mockProfile, mockSkills, mockProjects, mockExperience);
    const stack = vfs.children.stack as any;

    expect(stack.children).toHaveProperty('languages.json');
    expect(stack.children).toHaveProperty('frameworks.json');
  });

  it('contains experience files', () => {
    const vfs = buildVfs(mockProfile, mockSkills, mockProjects, mockExperience);
    const exp = vfs.children.experience as any;

    expect(exp.children).toHaveProperty('academics.md');
  });

  it('contains project files', () => {
    const vfs = buildVfs(mockProfile, mockSkills, mockProjects, mockExperience);
    const projects = vfs.children.projects as any;

    expect(projects.children).toHaveProperty('test-project.md');
  });
});
