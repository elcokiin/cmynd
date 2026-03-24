import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { TerminalView } from './terminal-view'
import type { TerminalState } from '@/lib/vfs/command-parser'

// Mock useSearchParams - returns empty by default
const mockGet = vi.fn().mockReturnValue(null)
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
}))

// Mock executeCommand to avoid dealing with the full file system in UI tests
vi.mock('@/lib/vfs/command-parser', () => ({
  executeCommand: vi.fn((commandLine: string, state: TerminalState) => {
    if (commandLine === 'clear') {
      return { newState: state, output: '', clear: true };
    }
    if (commandLine === 'cd test') {
      return { newState: { ...state, cwd: '/test' }, output: '' };
    }
    if (commandLine.startsWith('ask-diego')) {
      return { newState: state, output: '', isAsync: true };
    }
    return { newState: state, output: `mock output for ${commandLine}` };
  })
}))

describe('TerminalView Component', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders correctly with default prompt', () => {
    render(<TerminalView />)
    expect(screen.getAllByText('diegotenjo@elcokiin ~ $').length).toBeGreaterThan(0)
  })

  it('shows neofetch output by default', () => {
    render(<TerminalView />)
    expect(screen.getByText(/elcokiin@dev/)).not.toBeNull()
  })

  it('hides neofetch output when neofetch=hidden search param is set', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'neofetch') return 'hidden'
      return null
    })

    render(<TerminalView />)
    expect(screen.queryByText(/elcokiin@dev/)).toBeNull()
    expect(screen.getByText('Type "help" to see available commands.')).not.toBeNull()
  })

  it('shows neofetch when neofetch param has other value', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'neofetch') return 'visible'
      return null
    })

    render(<TerminalView />)
    expect(screen.getByText(/elcokiin@dev/)).not.toBeNull()
  })

  it('handles command execution and displays output', () => {
    mockGet.mockReturnValue(null)
    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'ls' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    // Check if output is rendered
    expect(screen.getByText('mock output for ls')).not.toBeNull()
    // History should show the command
    expect(screen.getByText('ls')).not.toBeNull()
  })

  it('handles cd command and changes prompt', () => {
    mockGet.mockReturnValue(null)
    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'cd test' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    // Check if new prompt is rendered
    expect(screen.getAllByText('diegotenjo@elcokiin ~/test $').length).toBeGreaterThan(0)
  })

  it('handles clear command', () => {
    mockGet.mockReturnValue(null)
    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    
    // First run a command
    fireEvent.change(input, { target: { value: 'echo test' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(screen.getByText('mock output for echo test')).not.toBeNull()
    
    // Then clear
    fireEvent.change(input, { target: { value: 'clear' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    // Output should be gone
    expect(screen.queryByText('mock output for echo test')).toBeNull()
  })

  it('handles ask-diego asynchronous fetch', async () => {
    mockGet.mockReturnValue(null)
    // Mock fetch for this specific test
    const mockRead = vi.fn()
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Hello ') })
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('from AI') })
      .mockResolvedValueOnce({ done: true });

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({ read: mockRead }),
      },
    } as unknown as Response);

    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'ask-diego test' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    // Check loading state
    expect(screen.getByText(/Contacting elcokiin's AI agent/)).not.toBeNull()
    
    // Wait for stream to complete
    const aiResponse = await screen.findByText('Hello from AI', {}, { timeout: 1000 })
    expect(aiResponse).not.toBeNull()

    // Clean up mock
    fetchMock.mockRestore();
  })
})
