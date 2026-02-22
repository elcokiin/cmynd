import { render, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import Page from './page'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('Page Component', () => {
  beforeAll(() => {
    // Mock ResizeObserver for react-resizable-panels in jsdom
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    // Mock scrollIntoView which is not implemented in jsdom
    window.HTMLElement.prototype.scrollIntoView = function() {}
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the main layout wrapper', async () => {
    const { container } = render(<Page />)
    
    await waitFor(() => {
      const main = container.querySelector('main')
      expect(main).not.toBeNull()
      expect(main?.classList.contains('flex')).toBe(true)
      expect(main?.classList.contains('h-screen')).toBe(true)
      // Make sure the panels are rendered (mounted is true)
      expect(container.querySelector('[data-slot="resizable-panel-group"]')).not.toBeNull()
    })
  })

  it('renders the resizable 60/40 split-pane architecture', async () => {
    const { container, getByText } = render(<Page />)
    
    await waitFor(() => {
      // Check for resizable group container
      const resizableGroup = container.querySelector('[data-slot="resizable-panel-group"]')
      expect(resizableGroup).not.toBeNull()
    })
    
    // Check for both panels
    const panels = container.querySelectorAll('[data-slot="resizable-panel"]')
    expect(panels.length).toBe(2)
    
    // Check default size in inline style roughly or existence of pane content
    expect(getByText('diegotenjo@elcokiin ~ $')).not.toBeNull()
    expect(getByText('AI Summary')).not.toBeNull()
    
    // Check for the handle
    const handle = container.querySelector('[data-slot="resizable-handle"]')
    expect(handle).not.toBeNull()
  })
})
