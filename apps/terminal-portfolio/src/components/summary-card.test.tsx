import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SummaryCard } from './summary-card'

describe('SummaryCard component', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchMock: any

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchMock = vi.spyOn(global, 'fetch') as any
    window.HTMLElement.prototype.scrollIntoView = function() {}
  })

  afterEach(() => {
    fetchMock.mockRestore()
    cleanup()
  })

  it('renders correctly with initial state', () => {
    render(<SummaryCard />)
    expect(screen.getByText('AI Summary')).toBeDefined()
    expect(screen.getByText('Chat with an AI version of me powered by my portfolio files.')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDefined()
    expect(screen.getByPlaceholderText("Ask about Diego's profile...")).toBeDefined()
    expect(screen.getByText(/Ask me anything about my experience/i)).toBeDefined()
  })

  it('handles successful chat request', async () => {
    const mockResponse = 'Here is a summary of the profile.'
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(mockResponse))
        controller.close()
      },
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      body: stream,
    })

    render(<SummaryCard />)

    const input = screen.getByPlaceholderText("Ask about Diego's profile...")
    fireEvent.change(input, { target: { value: 'Tell me about your experience' } })

    const button = screen.getByRole('button', { name: 'Send' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(mockResponse)).toBeDefined()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Tell me about your experience' }]
      }),
    }))
  })

  it('handles error during chat request', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
    })

    render(<SummaryCard />)

    const input = screen.getByPlaceholderText("Ask about Diego's profile...")
    fireEvent.change(input, { target: { value: 'Tell me about your experience' } })

    const button = screen.getByRole('button', { name: 'Send' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch response')).toBeDefined()
    })
  })

  it('handles fetch network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    render(<SummaryCard />)

    const input = screen.getByPlaceholderText("Ask about Diego's profile...")
    fireEvent.change(input, { target: { value: 'Tell me about your experience' } })

    const button = screen.getByRole('button', { name: 'Send' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeDefined()
    })
  })
})
