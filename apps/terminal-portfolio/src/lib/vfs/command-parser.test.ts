import { expect, test, describe } from 'vitest';
import type { TerminalState } from './command-parser';
import { executeCommand, getCompletions } from './command-parser';

describe('Command Parser Logic', () => {
  const initialState: TerminalState = { cwd: '/' };

  test('cd handles basic navigation', () => {
    let result = executeCommand('cd experience', initialState);
    expect(result.newState.cwd).toBe('/experience');
    expect(result.output).toBe('');

    // cd back
    result = executeCommand('cd ..', result.newState);
    expect(result.newState.cwd).toBe('/');

    // cd to non-existent
    result = executeCommand('cd nonexistent', initialState);
    expect(result.newState.cwd).toBe('/');
    expect(result.output).toContain('No such file or directory');
  });

  test('ls lists directory contents', () => {
    let result = executeCommand('ls', initialState);
    expect(result.output).toContain('experience');
    expect(result.output).toContain('stack');
    expect(result.output).toContain('philosophy.md');

    result = executeCommand('ls experience', initialState);
    expect(result.output).toContain('academics.md');
    expect(result.output).toContain('projects.md');

    result = executeCommand('ls nonexistent', initialState);
    expect(result.output).toContain('No such file or directory');
  });

  test('cat reads file content', () => {
    let result = executeCommand('cat philosophy.md', initialState);
    expect(result.output).toContain('# Code Authorship & Engineering Rigor');

    // cat a directory
    result = executeCommand('cat experience', initialState);
    expect(result.output).toContain('Is a directory');

    // cat nonexistent
    result = executeCommand('cat nonexistent.txt', initialState);
    expect(result.output).toContain('No such file or directory');
  });

  test('clear returns clear flag', () => {
    const result = executeCommand('clear', initialState);
    expect(result.clear).toBe(true);
    expect(result.output).toBe('');
    expect(result.newState).toEqual(initialState);
  });
  
  test('pwd prints current directory', () => {
    const state = executeCommand('cd experience', initialState).newState;
    const result = executeCommand('pwd', state);
    expect(result.output).toBe('/experience');
  });

  test('ask-diego flags async and requires arguments', () => {
    const noArgs = executeCommand('ask-diego', initialState);
    expect(noArgs.output).toContain('missing question operand');
    expect(noArgs.isAsync).toBeUndefined();

    const withArgs = executeCommand('ask-diego what is your tech stack?', initialState);
    expect(withArgs.output).toBe('');
    expect(withArgs.isAsync).toBe(true);
  });

  test('completes commands and paths', () => {
    const commandMatches = getCompletions('he', initialState);
    expect(commandMatches).toContain('help');

    const rootPathMatches = getCompletions('cd st', initialState);
    expect(rootPathMatches).toContain('stack/');

    const childPathMatches = getCompletions('cd stack/f', initialState);
    expect(childPathMatches).toContain('stack/frontend.json');

    const nestedState: TerminalState = { cwd: '/stack' };
    const nestedMatches = getCompletions('cat f', nestedState);
    expect(nestedMatches).toContain('frontend.json');
  });
});
