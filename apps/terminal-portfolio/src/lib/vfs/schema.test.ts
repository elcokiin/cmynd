import { describe, it, expect } from 'vitest';
import { VirtualFileSystemSchema, FileSystemSchema } from './schema';

describe('VFS Zod Schema', () => {
  it('validates a file node', () => {
    const fileNode = {
      name: 'philosophy.md',
      type: 'file',
      content: '# Philosophy',
    };
    
    const result = FileSystemSchema.safeParse(fileNode);
    expect(result.success).toBe(true);
  });

  it('validates a directory node with children', () => {
    const dirNode = {
      name: 'stack',
      type: 'directory',
      children: {
        'backend.json': {
          name: 'backend.json',
          type: 'file',
          content: '{"lang": "Node"}',
        },
      },
    };
    
    const result = FileSystemSchema.safeParse(dirNode);
    expect(result.success).toBe(true);
  });

  it('validates the complete virtual file system schema (root directory)', () => {
    const rootFs = {
      name: 'root',
      type: 'directory',
      children: {
        'experience': {
          name: 'experience',
          type: 'directory',
          children: {},
        },
        'stack': {
          name: 'stack',
          type: 'directory',
          children: {
            'backend.json': {
              name: 'backend.json',
              type: 'file',
              content: '{}',
            },
            'frontend.json': {
              name: 'frontend.json',
              type: 'file',
              content: '{}',
            },
          },
        },
        'philosophy.md': {
          name: 'philosophy.md',
          type: 'file',
          content: 'Keep it simple.',
        },
      },
    };

    const result = VirtualFileSystemSchema.safeParse(rootFs);
    expect(result.success).toBe(true);
  });

  it('fails on invalid nodes', () => {
    const invalidNode = {
      name: 'unknown',
      type: 'symlink',
    };

    const result = FileSystemSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });
});
