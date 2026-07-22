import { KoeiromapAdapter } from '@/features/tts/adapters/koeiromap';

function response(options: {
  status?: number;
  contentType?: string;
  json?: unknown;
  bytes?: number[];
}) {
  const status = options.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => options.contentType ?? 'application/json' },
    json: async () => options.json,
    arrayBuffer: async () => new Uint8Array(options.bytes ?? []).buffer,
  } as unknown as Response;
}

describe('Koeiromap adapter contract', () => {
  it('sends key, coordinates, and style and decodes JSON audio', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      response({
        json: { audio: Buffer.from([1, 2, 3]).toString('base64') },
      }),
    );
    const adapter = new KoeiromapAdapter({
      apiKey: 'server-secret',
      endpoint: 'https://voice.example.test/synthesize',
      fetcher,
    });
    await expect(
      adapter.synthesize('こんにちは', {
        speakerX: -4,
        speakerY: 6,
        style: 'happy',
      }),
    ).resolves.toEqual({
      data: new Uint8Array([1, 2, 3]),
      mimeType: 'audio/wav',
    });
    const [url, init] = fetcher.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe('https://voice.example.test/synthesize');
    expect(init.headers).toMatchObject({
      'Ocp-Apim-Subscription-Key': 'server-secret',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      text: 'こんにちは',
      speaker_x: -4,
      speaker_y: 6,
      style: 'happy',
    });
    expect(init.redirect).toBe('manual');
  });

  it('accepts direct binary audio responses', async () => {
    const adapter = new KoeiromapAdapter({
      apiKey: 'server-secret',
      endpoint: 'https://voice.example.test/synthesize',
      fetcher: jest
        .fn()
        .mockResolvedValue(
          response({ contentType: 'audio/mpeg', bytes: [4, 5] }),
        ),
    });
    await expect(adapter.synthesize('test', {})).resolves.toEqual({
      data: new Uint8Array([4, 5]),
      mimeType: 'audio/mpeg',
    });
  });

  it('requires HTTPS and valid coordinate ranges', async () => {
    expect(
      () =>
        new KoeiromapAdapter({
          apiKey: 'server-secret',
          endpoint: 'http://voice.example.test/synthesize',
        }),
    ).toThrow('Koeiromap endpoint must use HTTPS');
    const adapter = new KoeiromapAdapter({
      apiKey: 'server-secret',
      endpoint: 'https://voice.example.test/synthesize',
      fetcher: jest.fn(),
    });
    await expect(
      adapter.synthesize('test', { speakerX: 11 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });
});
