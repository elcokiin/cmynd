import { expect, test, describe } from 'vitest';
import type { TerminalState } from './command-parser';
import { executeCommand, getCompletions } from './command-parser';
import type { DirectoryNode } from './schema';

const mockVfs: DirectoryNode = {
  name: 'diego',
  type: 'directory',
  permissions: 'drwxr-xr-x',
  children: {
    experience: {
      name: 'experience',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      children: {
        'academics.md': {
          name: 'academics.md',
          type: 'file',
          permissions: '-rw-r--r--',
          content: '# Academic Experience\n\nSystems & Computing Engineering.',
          extension: 'md',
        },
        'projects.md': {
          name: 'projects.md',
          type: 'file',
          permissions: '-rw-r--r--',
          content: '# Practical Output\n\nBuilt an Arch/Nvim environment.',
          extension: 'md',
        },
      },
    },
    stack: {
      name: 'stack',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      children: {
        'backend.json': {
          name: 'backend.json',
          type: 'file',
          permissions: '-rw-r--r--',
          content: '{"languages": ["TypeScript"]}',
          extension: 'json',
        },
        'frontend.json': {
          name: 'frontend.json',
          type: 'file',
          permissions: '-rw-r--r--',
          content: '{"frameworks": ["Next.js"]}',
          extension: 'json',
        },
      },
    },
    'philosophy.md': {
      name: 'philosophy.md',
      type: 'file',
      permissions: '-rw-r--r--',
      content: '# Code Authorship & Engineering Rigor\n\nKeep it simple.',
      extension: 'md',
    },
  },
};

const mockNeofetch = 'mock-neofetch-output';

describe('Command Parser Logic', () => {
  const initialState: TerminalState = { cwd: '/' };

  test('cd handles basic navigation', () => {
    let result = executeCommand('cd experience', initialState, mockVfs, mockNeofetch);
    expect(result.newState.cwd).toBe('/experience');
    expect(result.output).toBe('');

    result = executeCommand('cd ..', result.newState, mockVfs, mockNeofetch);
    expect(result.newState.cwd).toBe('/');

    result = executeCommand('cd nonexistent', initialState, mockVfs, mockNeofetch);
    expect(result.newState.cwd).toBe('/');
    expect(result.output).toContain('No such file or directory');
  });

  test('ls lists directory contents', () => {
    let result = executeCommand('ls', initialState, mockVfs, mockNeofetch);
    expect(result.output).toContain('experience');
    expect(result.output).toContain('stack');
    expect(result.output).toContain('philosophy.md');

    result = executeCommand('ls experience', initialState, mockVfs, mockNeofetch);
    expect(result.output).toContain('academics.md');
    expect(result.output).toContain('projects.md');

    result = executeCommand('ls nonexistent', initialState, mockVfs, mockNeofetch);
    expect(result.output).toContain('No such file or directory');
  });

  test('cat reads file content', () => {
    let result = executeCommand('cat philosophy.md', initialState, mockVfs, mockNeofetch);
    expect(result.output).toContain('# Code Authorship & Engineering Rigor');

    result = executeCommand('cat experience', initialState, mockVfs, mockNeofetch);
    expect(result.output).toContain('Is a directory');

    result = executeCommand('cat nonexistent.txt', initialState, mockVfs, mockNeofetch);
    expect(result.output).toContain('No such file or directory');
  });

  test('clear returns clear flag', () => {
    const result = executeCommand('clear', initialState, mockVfs, mockNeofetch);
    expect(result.clear).toBe(true);
    expect(result.output).toBe('');
    expect(result.newState).toEqual(initialState);
  });

  test('pwd prints current directory', () => {
    const state = executeCommand('cd experience', initialState, mockVfs, mockNeofetch).newState;
    const result = executeCommand('pwd', state, mockVfs, mockNeofetch);
    expect(result.output).toBe('/experience');
  });

  test('ask-diego flags async and requires arguments', () => {
    const noArgs = executeCommand('ask-diego', initialState, mockVfs, mockNeofetch);
    expect(noArgs.output).toContain('missing question operand');
    expect(noArgs.isAsync).toBeUndefined();

    const withArgs = executeCommand('ask-diego what is your tech stack?', initialState, mockVfs, mockNeofetch);
    expect(withArgs.output).toBe('');
    expect(withArgs.isAsync).toBe(true);
  });

  test('completes commands and paths', () => {
    const commandMatches = getCompletions('he', initialState, mockVfs);
    expect(commandMatches).toContain('help');

    const rootPathMatches = getCompletions('cd st', initialState, mockVfs);
    expect(rootPathMatches).toContain('stack/');

    const childPathMatches = getCompletions('cd stack/f', initialState, mockVfs);
    expect(childPathMatches).toContain('stack/frontend.json');

    const nestedState: TerminalState = { cwd: '/stack' };
    const nestedMatches = getCompletions('cat f', nestedState, mockVfs);
    expect(nestedMatches).toContain('frontend.json');
  });
});
