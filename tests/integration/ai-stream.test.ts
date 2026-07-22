import { createMocks } from 'node-mocks-http';
import { createStreamHandler } from '@/pages/api/ai/stream';
import type { AiProviderAdapter } from '@/features/ai/types';

const body = {
  provider: 'openai',
  model: 'test-model',
  messages: [
    {
      id: 'message-1',
      role: 'user',
      content: 'hello',
      timestamp: '2026-07-22T12:00:00.000Z',
    },
  ],
};

function adapterWith(response: Response): AiProviderAdapter {
  return {
    stream: jest.fn().mockResolvedValue(response),
  } as unknown as AiProviderAdapter;
}

describe('/api/ai/stream handler', () => {
  it('relays upstream chunks with safe streaming headers', async () => {
    const adapter = adapterWith(
      new Response('data: first\n\ndata: second\n\n', {
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      }),
    );
    const handler = createStreamHandler(() => adapter);
    const { req, res } = createMocks({ method: 'POST', body });
    const write = jest.spyOn(res, 'write');

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader('content-type')).toBe('text/event-stream');
    expect(res.getHeader('cache-control')).toBe('no-cache, no-transform');
    const output = Buffer.concat(
      write.mock.calls.map((call: unknown[]) =>
        Buffer.from(call[0] as Uint8Array),
      ),
    ).toString();
    expect(output).toBe('data: first\n\ndata: second\n\n');
  });

  it('does not forward an unsafe upstream content type', async () => {
    const adapter = adapterWith(
      new Response('chunk', { headers: { 'content-type': 'text/html' } }),
    );
    const handler = createStreamHandler(() => adapter);
    const { req, res } = createMocks({ method: 'POST', body });

    await handler(req, res);

    expect(res.getHeader('content-type')).toBe('application/octet-stream');
    expect(res.getHeader('x-content-type-options')).toBe('nosniff');
  });

  it('rejects malformed input before starting a response', async () => {
    const resolver = jest.fn();
    const handler = createStreamHandler(resolver);
    const { req, res } = createMocks({ method: 'POST', body: {} });

    await expect(handler(req, res)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      status: 400,
    });
    expect(resolver).not.toHaveBeenCalled();
  });
});
