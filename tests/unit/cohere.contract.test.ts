import { CohereAdapter } from '@/features/ai/adapters/cohere';
import type { AiRequest } from '@/features/ai/types';

const fake = (body: unknown): Response =>
  ({ ok: true, status: 200, json: async () => body }) as Response;
const request: AiRequest = {
  provider: 'cohere',
  model: 'command-r-plus',
  systemPrompt: 'Be concise',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2026-07-22T00:00:00.000Z',
    },
  ],
};
describe('Cohere adapter contract', () => {
  it('normalizes v2 chat responses and metadata', async () => {
    const fetcher = jest.fn(async () =>
      fake({
        message: { content: [{ type: 'text', text: 'Hello' }] },
        citations: [{ id: '1' }],
        usage: { billed_units: 1 },
      }),
    );
    const adapter = new CohereAdapter(
      { provider: 'cohere', apiKey: 'secret', timeoutMs: 60_000 },
      fetcher,
    );
    await expect(
      adapter.generate(request, new AbortController().signal),
    ).resolves.toMatchObject({
      text: 'Hello',
      providerMetadata: { citations: [{ id: '1' }] },
    });
    const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
    expect(calls[0]?.[0]).toBe('https://api.cohere.com/v2/chat');
    expect(
      (calls[0]?.[1].headers as Record<string, string>).Authorization,
    ).toBe('Bearer secret');
    expect(JSON.parse(String(calls[0]?.[1].body))).toMatchObject({
      preamble: 'Be concise',
      messages: [{ role: 'user', content: 'Hello' }],
    });
  });
  it('requires an API key and HTTPS', async () => {
    const adapter = new CohereAdapter(
      { provider: 'cohere', baseUrl: 'http://example.com', timeoutMs: 60_000 },
      jest.fn(async () => fake({})),
    );
    await expect(
      adapter.validateConfig({
        provider: 'cohere',
        baseUrl: 'http://example.com',
        timeoutMs: 60_000,
      }),
    ).resolves.toMatchObject({
      valid: false,
      errors: ['API key is required', 'Cohere URL must use HTTPS'],
    });
  });
  it('passes cancellation to streaming fetch', async () => {
    const controller = new AbortController();
    const fetcher = jest.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init?.signal).toBe(controller.signal);
        return fake({});
      },
    );
    const adapter = new CohereAdapter(
      { provider: 'cohere', apiKey: 'secret', timeoutMs: 60_000 },
      fetcher,
    );
    await adapter.stream(request, controller.signal);
  });
});
