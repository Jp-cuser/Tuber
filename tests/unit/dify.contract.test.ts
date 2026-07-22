import { DifyAdapter } from '@/features/ai/adapters/dify';
import type { AiRequest } from '@/features/ai/types';
const fake = (body: unknown): Response =>
  ({ ok: true, status: 200, json: async () => body }) as Response;
const request: AiRequest = {
  provider: 'dify',
  model: 'workflow',
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2026-07-22T00:00:00.000Z',
    },
  ],
  providerOptions: { conversationId: 'c1', userId: 'u1' },
};
test('Dify adapter maps blocking chat and conversation metadata', async () => {
  const fetcher = jest.fn(async () =>
    fake({ answer: 'Hi', conversation_id: 'c2' }),
  );
  const adapter = new DifyAdapter(
    {
      provider: 'dify',
      apiKey: 'secret',
      baseUrl: 'https://dify.example/v1',
      timeoutMs: 60_000,
    },
    fetcher,
  );
  await expect(
    adapter.generate(request, new AbortController().signal),
  ).resolves.toMatchObject({
    text: 'Hi',
    providerMetadata: { conversationId: 'c2' },
  });
  const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
  expect(JSON.parse(String(calls[0]?.[1].body))).toMatchObject({
    query: 'Hello',
    response_mode: 'blocking',
    conversation_id: 'c1',
    user: 'u1',
  });
});
test('Dify adapter requires key and HTTPS URL', async () => {
  const adapter = new DifyAdapter(
    { provider: 'dify', baseUrl: 'http://example.com', timeoutMs: 60_000 },
    jest.fn(async () => fake({})),
  );
  await expect(
    adapter.validateConfig({
      provider: 'dify',
      baseUrl: 'http://example.com',
      timeoutMs: 60_000,
    }),
  ).resolves.toMatchObject({ valid: false });
});
