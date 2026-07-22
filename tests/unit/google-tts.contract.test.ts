import { GoogleTtsAdapter } from '@/features/tts/adapters/google';

function response(json: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => json,
  } as unknown as Response;
}

describe('Google TTS adapter contract', () => {
  it('maps voice and audio controls and decodes audioContent', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValue(
        response({ audioContent: Buffer.from([1, 2, 3]).toString('base64') }),
      );
    const adapter = new GoogleTtsAdapter({
      apiKey: 'server-secret',
      fetcher,
    });
    await expect(
      adapter.synthesize('hello', {
        languageCode: 'en-US',
        model: 'en-US-Neural2-A',
        speed: 1.25,
        pitch: 2,
        volumeGainDb: 3,
      }),
    ).resolves.toEqual({
      data: new Uint8Array([1, 2, 3]),
      mimeType: 'audio/mpeg',
    });
    const [url, init] = fetcher.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
    );
    expect(init.headers).toMatchObject({
      'x-goog-api-key': 'server-secret',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      input: { text: 'hello' },
      voice: { languageCode: 'en-US', name: 'en-US-Neural2-A' },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.25,
        pitch: 2,
        volumeGainDb: 3,
      },
    });
  });

  it('normalizes the official voices response', async () => {
    const adapter = new GoogleTtsAdapter({
      apiKey: 'server-secret',
      fetcher: jest.fn().mockResolvedValue(
        response({
          voices: [{ name: 'ja-JP-Neural2-B', languageCodes: ['ja-JP'] }],
        }),
      ),
    });
    await expect(adapter.listVoices()).resolves.toEqual([
      {
        id: 'ja-JP-Neural2-B',
        name: 'ja-JP-Neural2-B (ja-JP)',
      },
    ]);
  });

  it('rejects non-Google endpoints and invalid controls', async () => {
    expect(
      () =>
        new GoogleTtsAdapter({
          apiKey: 'server-secret',
          baseUrl: 'https://example.test',
        }),
    ).toThrow('Invalid Google TTS endpoint');
    const adapter = new GoogleTtsAdapter({
      apiKey: 'server-secret',
      fetcher: jest.fn(),
    });
    await expect(
      adapter.synthesize('hello', { speed: 5 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });
});
