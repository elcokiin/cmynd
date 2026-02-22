import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Environment Variables Setup', () => {
  it('should have an .env.example file with required keys', () => {
    const examplePath = path.resolve(__dirname, '../.env.example');
    const content = fs.readFileSync(examplePath, 'utf-8');
    
    expect(content).toContain('OPENAI_API_KEY');
    expect(content).toContain('ANTHROPIC_API_KEY');
  });

  it('should have an .env.local file', () => {
    // This test ensures that the developer has set up their local env file.
    // It shouldn't be checked into source control, but we can verify it exists locally.
    const localPath = path.resolve(__dirname, '../.env.local');
    const exists = fs.existsSync(localPath);
    
    // We expect it to exist since the task is to establish it
    expect(exists).toBe(true);
  });
});
