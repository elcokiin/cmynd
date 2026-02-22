import { openai } from '@ai-sdk/openai';
import type { ModelMessage } from 'ai';
import { streamText } from 'ai';
import fsData from '@/lib/vfs/fs.json';
// Validates env vars at module load time
import '@elcokiin/env/portfolio';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ModelMessage[] } = await req.json();

    const systemPrompt = `You are an AI assistant representing Diego Tenjo (username: elcokiin), a Full-Stack Developer.
You have access to the following virtual file system representing their resume data and skills:

${JSON.stringify(fsData, null, 2)}

Answer questions accurately based on this information. Be concise, professional, and directly address the user's queries. Keep your tone aligned with an experienced software engineer.`;

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
      system: systemPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
