import { extractAiStreamDelta } from '@/features/ai/stream-delta';

describe('AI stream delta normalization', () => {
  it('extracts OpenAI text and reasoning deltas', () => {
    expect(
      extractAiStreamDelta('openai', {
        format: 'sse',
        data: JSON.stringify({
          choices: [
            { delta: { content: 'hello', reasoning_content: 'think' } },
          ],
        }),
      }),
    ).toEqual({ text: 'hello', reasoning: 'think', done: false });
  });

  it('extracts Anthropic content deltas', () => {
    expect(
      extractAiStreamDelta('anthropic', {
        format: 'sse',
        event: 'content_block_delta',
        data: JSON.stringify({
          type: 'content_block_delta',
          delta: { text: 'hi' },
        }),
      }),
    ).toEqual({ text: 'hi', reasoning: undefined, done: false });
  });

  it('separates Gemini thought parts from answer parts', () => {
    expect(
      extractAiStreamDelta('google', {
        format: 'ndjson',
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: 'reason', thought: true }, { text: 'answer' }],
              },
            },
          ],
        },
      }),
    ).toEqual({ reasoning: 'reason', text: 'answer' });
  });

  it('recognizes the OpenAI stream terminator', () => {
    expect(
      extractAiStreamDelta('openai', { format: 'sse', data: '[DONE]' }),
    ).toEqual({ done: true });
  });
});
