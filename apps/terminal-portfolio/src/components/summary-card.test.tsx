import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { SummaryCard } from './summary-card'

const createThreadResult = { current: Promise.resolve({ threadId: "test" }) as Promise<{ threadId: string }> }

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: () => vi.fn(() => createThreadResult.current),
}))

vi.mock('@convex-dev/agent/react', () => ({
  useUIMessages: () => ({ results: [], status: "loaded", loadMore: vi.fn() }),
}))

vi.mock('@/hooks/use-markdown-response', () => ({
  useMarkdownResponse: () => ({
    components: {},
    remarkPlugins: [],
    rehypePlugins: [],
  }),
}))

describe('SummaryCard component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows loading state while initializing', () => {
    createThreadResult.current = new Promise(() => {})
    render(<SummaryCard />)
    expect(screen.getByText('AI Summary')).toBeDefined()
    expect(screen.getByText('Initializing chat...')).toBeDefined()
  })

  it('shows empty state after initialization', async () => {
    createThreadResult.current = Promise.resolve({ threadId: "test-thread" })
    render(<SummaryCard />)
    const text = await screen.findByText(/Ask me anything about my experience/i)
    expect(text).toBeDefined()
  })
})
