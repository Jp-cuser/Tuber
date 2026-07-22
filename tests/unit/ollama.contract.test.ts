import { OllamaAdapter } from '@/features/ai/adapters/ollama';
import type { AiRequest } from '@/features/ai/types';

const fake = (body: unknown): Response =>
  ({ ok: true, status: 200, json: async () => body }) as Response;
const request: AiRequest = {
  provider: 'ollama',
  model: 'gemma3',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2026-07-22T00:00:00.000Z',
    },
  ],
};
describe('Ollama adapter contract', () => {
  it('generates through the loopback chat endpoint without auth', async () => {
    const fetcher = jest.fn(async () =>
      fake({ message: { content: 'Hi' }, prompt_eval_count: 1, eval_count: 2 }),
    );
    const adapter = new OllamaAdapter(
      { provider: 'ollama', timeoutMs: 60_000 },
      fetcher,
    );
    await expect(
      adapter.generate(request, new AbortController().signal),
    ).resolves.toMatchObject({
      text: 'Hi',
      providerMetadata: { promptTokens: 1, completionTokens: 2 },
    });
    const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
    expect(calls[0]?.[0]).toBe('http://127.0.0.1:11434/api/chat');
    expect(calls[0]?.[1].headers).toEqual({
      'Content-Type': 'application/json',
    });
  });
  it('rejects LAN and public hosts by default', async () => {
    const adapter = new OllamaAdapter(
      {
        provider: 'ollama',
        baseUrl: 'http://192.168.1.20:11434',
        timeoutMs: 60_000,
      },
      jest.fn(async () => fake({})),
    );
    await expect(
      adapter.validateConfig({
        provider: 'ollama',
        baseUrl: 'http://192.168.1.20:11434',
        timeoutMs: 60_000,
      }),
    ).resolves.toMatchObject({ valid: false });
  });
  it('passes cancellation signals to streams', async () => {
    const controller = new AbortController();
    const fetcher = jest.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init?.signal).toBe(controller.signal);
        return fake({});
      },
    );
    const adapter = new OllamaAdapter(
      { provider: 'ollama', timeoutMs: 60_000 },
      fetcher,
    );
    await adapter.stream(request, controller.signal);
  });
});
