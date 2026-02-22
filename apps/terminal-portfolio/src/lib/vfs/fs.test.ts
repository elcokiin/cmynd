import { describe, it, expect } from 'vitest';
import { VirtualFileSystemSchema } from './schema';
import fsJson from './fs.json';

describe('fs.json data structure', () => {
  it('validates against the VirtualFileSystemSchema', () => {
    const result = VirtualFileSystemSchema.safeParse(fsJson);
    expect(result.success).toBe(true);
    
    if (!result.success) {
      console.error(result.error);
    }
  });

  it('contains the expected core directories and files', () => {
    // Assert structural components
    expect(fsJson.name).toBe('elcokiin');
    expect(fsJson.type).toBe('directory');
    
    // Check main directories
    expect(fsJson.children).toHaveProperty('experience');
    expect(fsJson.children.experience.type).toBe('directory');
    
    expect(fsJson.children).toHaveProperty('stack');
    expect(fsJson.children.stack.type).toBe('directory');
    
    expect(fsJson.children).toHaveProperty('philosophy.md');
    expect(fsJson.children['philosophy.md'].type).toBe('file');
    
    // Check specific files inside stack
    const stackChildren = fsJson.children.stack.children;
    expect(stackChildren).toHaveProperty('backend.json');
    expect(stackChildren['backend.json'].type).toBe('file');
    
    expect(stackChildren).toHaveProperty('frontend.json');
    expect(stackChildren['frontend.json'].type).toBe('file');
  });
});