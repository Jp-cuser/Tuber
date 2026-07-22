import { AzureOpenAiAdapter } from '@/features/ai/adapters/azure-openai';
import type { AiRequest } from '@/features/ai/types';

const fake = (body: unknown): Response =>
  ({ ok: true, status: 200, json: async () => body }) as Response;
const request: AiRequest = {
  provider: 'azure',
  model: 'ignored-deployment-model',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2026-07-22T00:00:00.000Z',
    },
  ],
};
describe('Azure OpenAI adapter contract', () => {
  it('uses deployment URL, API version, and api-key header', async () => {
    const fetcher = jest.fn(async () =>
      fake({ choices: [{ message: { content: 'Hello' } }] }),
    );
    const adapter = new AzureOpenAiAdapter(
      {
        provider: 'azure',
        apiKey: 'secret',
        baseUrl: 'https://sample.openai.azure.com',
        deployment: 'chat-prod',
        apiVersion: '2025-04-01-preview',
        timeoutMs: 60_000,
      },
      fetcher,
    );
    await expect(
      adapter.generate(request, new AbortController().signal),
    ).resolves.toEqual({
      text: 'Hello',
      reasoning: undefined,
      providerMetadata: undefined,
    });
    const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
    expect(calls[0]?.[0]).toBe(
      'https://sample.openai.azure.com/openai/deployments/chat-prod/chat/completions?api-version=2025-04-01-preview',
    );
    expect((calls[0]?.[1].headers as Record<string, string>)['api-key']).toBe(
      'secret',
    );
    expect(
      (calls[0]?.[1].headers as Record<string, string>).Authorization,
    ).toBeUndefined();
  });
  it('rejects arbitrary hosts and incomplete configuration', async () => {
    const adapter = new AzureOpenAiAdapter(
      { provider: 'azure', baseUrl: 'https://example.com', timeoutMs: 60_000 },
      jest.fn(async () => fake({})),
    );
    const result = await adapter.validateConfig({
      provider: 'azure',
      baseUrl: 'https://example.com',
      timeoutMs: 60_000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'API key is required',
        'Azure deployment is required',
        'Azure API version is required',
        'Azure resource URL must use an approved HTTPS host',
      ]),
    );
  });
  it('passes cancellation to fetch for streams', async () => {
    const controller = new AbortController();
    const fetcher = jest.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init?.signal).toBe(controller.signal);
        return fake({});
      },
    );
    const adapter = new AzureOpenAiAdapter(
      {
        provider: 'azure',
        apiKey: 'secret',
        baseUrl: 'https://sample.openai.azure.com',
        deployment: 'chat',
        apiVersion: '2025-04-01-preview',
        timeoutMs: 60_000,
      },
      fetcher,
    );
    await adapter.stream(request, controller.signal);
  });
});
