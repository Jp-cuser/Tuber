import { createMocks } from 'node-mocks-http';
import { createSynthesizeHandler } from '@/pages/api/tts/synthesize';

describe('/api/tts/synthesize handler', () => {
  it('returns base64 audio without exposing provider configuration', async () => {
    const adapter = {
      synthesize: jest.fn().mockResolvedValue({
        data: new Uint8Array([1, 2, 3]),
        mimeType: 'audio/wav',
      }),
    };
    const resolver = jest.fn().mockReturnValue(adapter);
    const handler = createSynthesizeHandler(resolver);
    const body = {
      engine: 'voicevox',
      text: 'test speech',
      options: { speakerId: '1', speed: 1.1 },
    };
    const { req, res } = createMocks({ method: 'POST', body });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      audioBase64: 'AQID',
      mimeType: 'audio/wav',
    });
    expect(resolver).toHaveBeenCalledWith('voicevox');
    expect(adapter.synthesize).toHaveBeenCalledWith(
      body.text,
      body.options,
      expect.any(AbortSignal),
    );
  });

  it('rejects malformed input before resolving an adapter', async () => {
    const resolver = jest.fn();
    const handler = createSynthesizeHandler(resolver);
    const { req, res } = createMocks({
      method: 'POST',
      body: { engine: 'voicevox', text: '' },
    });
    await expect(handler(req, res)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      status: 400,
    });
    expect(resolver).not.toHaveBeenCalled();
  });
});
