import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest'
import { TerminalView } from './terminal-view'
// @ts-expect-error - only exported in __mocks__/convex/react.ts
import { __resetQueryCount } from 'convex/react'

vi.mock('convex/react')

vi.mock('@convex-dev/agent/react', () => ({
  useUIMessages: () => ({ results: [], status: "loaded", loadMore: vi.fn() }),
}))

const mockGet = vi.hoisted(() => vi.fn().mockReturnValue(null))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
}))

vi.mock('@/lib/vfs/command-parser', () => ({
  executeCommand: vi.fn((commandLine: string, state: { cwd: string }) => {
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

  beforeEach(() => {
    __resetQueryCount()
  })

  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders correctly with default prompt', () => {
    render(<TerminalView />)
    expect(screen.getAllByText('diego@diego ~ $').length).toBeGreaterThan(0)
  })

  it('shows neofetch output by default', () => {
    render(<TerminalView />)
    expect(screen.getByText(/diego@dev/)).not.toBeNull()
  })

  it('hides neofetch output when neofetch=hidden search param is set', () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'neofetch') return 'hidden'
      return null
    })
    render(<TerminalView />)
    expect(screen.queryByText(/diego@dev/)).toBeNull()
    expect(screen.getByText('Type "help" to see available commands.')).not.toBeNull()
  })

  it('handles command execution and displays output', () => {
    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'ls' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(screen.getByText('mock output for ls')).not.toBeNull()
    expect(screen.getByText('ls')).not.toBeNull()
  })

  it('handles cd command and changes prompt', () => {
    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'cd test' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(screen.getAllByText('diego@diego ~/test $').length).toBeGreaterThan(0)
  })

  it('handles clear command', () => {
    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.change(input, { target: { value: 'echo test' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(screen.getByText('mock output for echo test')).not.toBeNull()
    
    fireEvent.change(input, { target: { value: 'clear' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(screen.queryByText('mock output for echo test')).toBeNull()
  })

  it('handles ask-diego by displaying the command', () => {
    render(<TerminalView />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'ask-diego hello' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(screen.getByText('ask-diego hello')).not.toBeNull()
  })
})
