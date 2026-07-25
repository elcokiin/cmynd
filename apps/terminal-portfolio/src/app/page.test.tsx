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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('Page Component', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.HTMLElement.prototype.scrollIntoView = function() {}
  })

  beforeEach(() => {
    __resetQueryCount()
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
      expect(container.querySelector('[data-slot="resizable-panel-group"]')).not.toBeNull()
    })
  })

  it('renders the resizable 60/40 split-pane architecture', async () => {
    const { container } = render(<Page />)
    
    await waitFor(() => {
      const resizableGroup = container.querySelector('[data-slot="resizable-panel-group"]')
      expect(resizableGroup).not.toBeNull()
    })
    
    const panels = container.querySelectorAll('[data-slot="resizable-panel"]')
    expect(panels.length).toBe(2)
    
    expect(container.querySelector('[data-slot="resizable-handle"]')).not.toBeNull()
  })
})
