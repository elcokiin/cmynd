import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SummaryCard } from './summary-card'

describe('SummaryCard component', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchMock: any

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchMock = vi.spyOn(global, 'fetch') as any
  })

  afterEach(() => {
    fetchMock.mockRestore()
    cleanup()
  })

  it('renders correctly with initial state', () => {
    render(<SummaryCard />)
    expect(screen.getByText('AI Summary')).toBeDefined()
    expect(screen.getByText('Generate an AI-powered summary of my profile.')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Summarize' })).toBeDefined()
    expect(screen.getByText(/No summary generated yet/i)).toBeDefined()
  })

  it('handles successful summarize request', async () => {
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
    
    const button = screen.getByRole('button', { name: 'Summarize' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(mockResponse)).toBeDefined()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: "Summarize this developer's profile." }]
      }),
    }))
  })

  it('handles error during summarize request', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
    })

    render(<SummaryCard />)
    
    const button = screen.getByRole('button', { name: 'Summarize' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch summary')).toBeDefined()
    })
  })

  it('handles fetch network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    render(<SummaryCard />)
    
    const button = screen.getByRole('button', { name: 'Summarize' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeDefined()
    })
  })
})
