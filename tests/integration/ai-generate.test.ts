import { createMocks } from 'node-mocks-http';
import { createGenerateHandler } from '@/pages/api/ai/generate';
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

describe('/api/ai/generate handler', () => {
  it('returns the selected adapter result', async () => {
    const adapter = {
      generate: jest.fn().mockResolvedValue({ text: 'hello back' }),
    } as unknown as AiProviderAdapter;
    const resolver = jest.fn().mockReturnValue(adapter);
    const handler = createGenerateHandler(resolver);
    const { req, res } = createMocks({ method: 'POST', body });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ text: 'hello back' });
    expect(resolver).toHaveBeenCalledWith('openai');
  });

  it('rejects malformed input before resolving a provider', async () => {
    const resolver = jest.fn();
    const handler = createGenerateHandler(resolver);
    const { req, res } = createMocks({ method: 'POST', body: {} });

    await expect(handler(req, res)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      status: 400,
    });
    expect(resolver).not.toHaveBeenCalled();
  });
});
