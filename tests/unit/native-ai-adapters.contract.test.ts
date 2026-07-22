import { AnthropicAdapter } from '@/features/ai/adapters/anthropic';
import { GeminiAdapter } from '@/features/ai/adapters/gemini';
import type { AiRequest } from '@/features/ai/types';

const fake = (body: unknown): Response =>
  ({ ok: true, status: 200, json: async () => body }) as Response;
const base: AiRequest = {
  provider: 'anthropic',
  model: 'claude-4-sonnet',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2026-07-22T00:00:00.000Z',
    },
  ],
};
describe('native AI adapter contracts', () => {
  it('normalizes Anthropic content and uses required headers', async () => {
    const fetcher = jest.fn(async () =>
      fake({
        content: [
          { type: 'thinking', thinking: 'think' },
          { type: 'text', text: 'Hello' },
        ],
        usage: { input_tokens: 1 },
      }),
    );
    const adapter = new AnthropicAdapter(
      { provider: 'anthropic', apiKey: 'secret', timeoutMs: 60_000 },
      fetcher,
    );
    await expect(
      adapter.generate(base, new AbortController().signal),
    ).resolves.toMatchObject({ text: 'Hello', reasoning: 'think' });
    const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
    expect((calls[0]?.[1].headers as Record<string, string>)['x-api-key']).toBe(
      'secret',
    );
  });
  it('normalizes Gemini content and maps grounding', async () => {
    const fetcher = jest.fn(async () =>
      fake({
        candidates: [
          {
            content: { parts: [{ text: 'Hello' }] },
            groundingMetadata: { source: true },
          },
        ],
        usageMetadata: { totalTokenCount: 2 },
      }),
    );
    const adapter = new GeminiAdapter(
      { provider: 'google', apiKey: 'secret', timeoutMs: 60_000 },
      fetcher,
    );
    await expect(
      adapter.generate(
        {
          ...base,
          provider: 'google',
          model: 'gemini-2.5-pro',
          searchGrounding: { enabled: true },
        },
        new AbortController().signal,
      ),
    ).resolves.toMatchObject({
      text: 'Hello',
      providerMetadata: { grounding: { source: true } },
    });
    const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
    expect(calls[0]?.[0]).toContain('gemini-2.5-pro:generateContent');
    expect(JSON.parse(String(calls[0]?.[1].body))).toMatchObject({
      tools: [{ google_search: {} }],
    });
  });
  it.each([
    ['anthropic', AnthropicAdapter],
    ['google', GeminiAdapter],
  ] as const)('%s rejects missing API keys', async (_name, Adapter) => {
    const adapter = new Adapter(
      { provider: _name, timeoutMs: 60_000 } as never,
      jest.fn(async () => fake({})),
    );
    await expect(
      adapter.validateConfig({ provider: _name, timeoutMs: 60_000 }),
    ).resolves.toMatchObject({ valid: false });
  });
});
