import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { streamText } from 'ai';

// Mock the ai package
vi.mock('ai', () => ({
  streamText: vi.fn(),
}));

// Mock the @ai-sdk/google package
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mocked-model'),
}));

describe('POST /api/chat', () => {
  it('returns a DataStreamResponse on successful stream', async () => {
    const mockToTextStreamResponse = vi.fn().mockReturnValue(new Response('stream data'));
    
    // Setup the mock to return an object with toTextStreamResponse
    vi.mocked(streamText).mockReturnValue({
      toTextStreamResponse: mockToTextStreamResponse,
    } as unknown as ReturnType<typeof streamText>);

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
    });

    const response = await POST(req);

    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({
      model: 'mocked-model',
      messages: [{ role: 'user', content: 'hello' }],
      system: expect.stringContaining('elcokiin'),
    }));
    
    expect(mockToTextStreamResponse).toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
    expect(await response.text()).toBe('stream data');
  });

  it('returns a 500 error if streamText throws an error', async () => {
    // Suppress console.error during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(streamText).mockImplementation(() => {
      throw new Error('Test error');
    });

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
    });

    const response = await POST(req);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to generate response' });

    consoleSpy.mockRestore();
  });

  it('returns 400 for invalid messages payload', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Invalid request: messages are required' });
  });
});
