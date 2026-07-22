import { createMocks } from 'node-mocks-http';
import { createTranscribeHandler } from '@/pages/api/audio/transcribe';

const body = {
  audioBase64: 'YXVkaW8=',
  fileName: 'voice.webm',
  mimeType: 'audio/webm',
  model: 'gpt-4o-mini-transcribe',
  language: 'ja',
} as const;

describe('/api/audio/transcribe handler', () => {
  it('returns a server-side adapter transcript', async () => {
    const adapter = {
      transcribe: jest.fn().mockResolvedValue({ text: 'こんにちは' }),
    };
    const handler = createTranscribeHandler(() => adapter);
    const { req, res } = createMocks({ method: 'POST', body });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ text: 'こんにちは' });
    expect(adapter.transcribe).toHaveBeenCalledWith(
      body,
      expect.any(AbortSignal),
    );
  });

  it('rejects unsupported models before resolving an adapter', async () => {
    const resolver = jest.fn();
    const handler = createTranscribeHandler(resolver);
    const { req, res } = createMocks({
      method: 'POST',
      body: { ...body, model: 'unknown-model' },
    });
    await expect(handler(req, res)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      status: 400,
    });
    expect(resolver).not.toHaveBeenCalled();
  });
});
