import { CustomApiAdapter } from '@/features/ai/adapters/custom-api';

test('maps a custom API request and response', async () => {
  const fetcher = jest.fn(
    async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({ data: { answer: 'ok' } }),
      }) as Response,
  );
  const adapter = new CustomApiAdapter(
    {
      url: 'https://api.example/chat',
      allowedOrigins: new Set(['https://api.example']),
      headers: { Authorization: 'Bearer secret' },
      bodyTemplate: { model: '{{model}}', messages: '{{messages}}' },
      responseTextPath: 'data.answer',
    },
    fetcher,
  );
  await expect(
    adapter.generate(
      { provider: 'custom-api', model: 'demo', messages: [] },
      new AbortController().signal,
    ),
  ).resolves.toEqual({ text: 'ok' });
  const calls = fetcher.mock.calls as unknown as Array<[URL, RequestInit]>;
  expect(calls[0]?.[1].redirect).toBe('manual');
});

test('rejects redirects', async () => {
  const fetcher = jest.fn(async () => ({ ok: false, status: 302 }) as Response);
  const adapter = new CustomApiAdapter(
    {
      url: 'http://127.0.0.1:8080/chat',
      allowedOrigins: new Set(),
      bodyTemplate: {},
      responseTextPath: 'text',
    },
    fetcher,
  );
  await expect(
    adapter.generate(
      { provider: 'custom-api', model: 'demo', messages: [] },
      new AbortController().signal,
    ),
  ).rejects.toThrow('redirects');
});
