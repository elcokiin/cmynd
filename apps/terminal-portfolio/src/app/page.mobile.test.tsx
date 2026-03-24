import { render, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import Page from './page'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}))

describe('Page Component - Mobile View', () => {
  beforeAll(() => {
    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.HTMLElement.prototype.scrollIntoView = function() {}

    // Mock matchMedia to return TRUE (isMobile)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: true, // Force true to simulate mobile
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    
    // Also mock innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders Sheet trigger button instead of split pane on mobile', async () => {
    const { container, getByText } = render(<Page />)
    
    await waitFor(() => {
      // resizable panel group should NOT be there
      const resizableGroup = container.querySelector('[data-slot="resizable-panel-group"]')
      expect(resizableGroup).toBeNull()

      // The Sheet trigger button should be visible (look for button with Menu icon or size icon)
      const triggerButton = container.querySelector('button[aria-haspopup="dialog"]')
      expect(triggerButton).not.toBeNull()
      
      // Terminal is still there
      expect(getByText('diegotenjo@elcokiin ~ $')).not.toBeNull()
    })
  })
})
