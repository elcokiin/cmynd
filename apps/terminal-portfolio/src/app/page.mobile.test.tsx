import { render, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterEach, beforeEach, vi } from 'vitest'
import Page from './page'
// @ts-expect-error - only exported in __mocks__/convex/react.ts
import { __resetQueryCount } from 'convex/react'

vi.mock('convex/react')

vi.mock('@convex-dev/agent/react', () => ({
  useUIMessages: () => ({ results: [], status: "loaded", loadMore: vi.fn() }),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}))

describe('Page Component - Mobile View', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.HTMLElement.prototype.scrollIntoView = function() {}

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
  })

  beforeEach(() => {
    __resetQueryCount()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders Sheet trigger button instead of split pane on mobile', async () => {
    const { container } = render(<Page />)
    
    await waitFor(() => {
      const resizableGroup = container.querySelector('[data-slot="resizable-panel-group"]')
      expect(resizableGroup).toBeNull()

      const triggerButton = container.querySelector('button[aria-haspopup="dialog"]')
      expect(triggerButton).not.toBeNull()
    })
  })
})
