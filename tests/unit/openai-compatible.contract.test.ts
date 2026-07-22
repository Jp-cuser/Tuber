import { OpenAiCompatibleAdapter } from '@/features/ai/adapters/openai-compatible';
import type { AiRequest } from '@/features/ai/types';

const request: AiRequest = {
  provider: 'openai',
  model: 'gpt-4o',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2026-07-22T00:00:00.000Z',
    },
  ],
};
const response = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as Response;
describe('OpenAI-compatible adapter contract', () => {
  it.each([
    'openai',
    'xai',
    'groq',
    'mistralai',
    'perplexity',
    'fireworks',
    'deepseek',
    'openrouter',
  ] as const)('generates normalized text for %s', async (provider) => {
    const fetcher = jest.fn(async () =>
      response({
        choices: [{ message: { content: 'Hi' } }],
        usage: { total_tokens: 2 },
      }),
    );
    const adapter = new OpenAiCompatibleAdapter(
      { provider, apiKey: 'secret', timeoutMs: 60_000 },
      fetcher,
    );
    await expect(
      adapter.generate({ ...request, provider }, new AbortController().signal),
    ).resolves.toMatchObject({
      text: 'Hi',
      providerMetadata: { usage: { total_tokens: 2 } },
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
    const init = calls[0]?.[1];
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      'Bearer secret',
    );
  });

  it('allows loopback LM Studio without a key', async () => {
    const adapter = new OpenAiCompatibleAdapter(
      { provider: 'lmstudio', timeoutMs: 60_000 },
      jest.fn(async () => response({})),
    );
    await expect(
      adapter.validateConfig({ provider: 'lmstudio', timeoutMs: 60_000 }),
    ).resolves.toEqual({ valid: true, errors: [] });
  });

  it('rejects non-loopback local URLs', async () => {
    const adapter = new OpenAiCompatibleAdapter(
      {
        provider: 'lmstudio',
        baseUrl: 'http://192.168.1.2:1234/v1',
        timeoutMs: 60_000,
      },
      jest.fn(async () => response({})),
    );
    const result = await adapter.validateConfig({
      provider: 'lmstudio',
      baseUrl: 'http://192.168.1.2:1234/v1',
      timeoutMs: 60_000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('loopback');
  });

  it('passes cancellation signals to fetch', async () => {
    const controller = new AbortController();
    const fetcher = jest.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init?.signal).toBe(controller.signal);
        return response({});
      },
    );
    const adapter = new OpenAiCompatibleAdapter(
      { provider: 'openai', apiKey: 'secret', timeoutMs: 60_000 },
      fetcher,
    );
    await adapter.stream(request, controller.signal);
  });
});
