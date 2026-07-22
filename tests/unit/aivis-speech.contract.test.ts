import { AivisSpeechAdapter } from '@/features/tts/adapters/aivis-speech';

function response(options: {
  json?: unknown;
  bytes?: number[];
  contentType?: string;
}) {
  return {
    ok: true,
    status: 200,
    json: async () => options.json,
    arrayBuffer: async () => new Uint8Array(options.bytes ?? []).buffer,
    headers: { get: () => options.contentType ?? null },
  } as unknown as Response;
}

describe('AivisSpeech adapter contract', () => {
  it('applies Aivis-specific AudioQuery controls before synthesis', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(response({ json: { accent_phrases: [] } }))
      .mockResolvedValueOnce(
        response({ bytes: [1, 2], contentType: 'audio/wav' }),
      );
    const adapter = new AivisSpeechAdapter({ fetcher });
    await expect(
      adapter.synthesize('こんにちは', {
        speakerId: '888753760',
        speed: 1.2,
        pitch: 0.1,
        intonation: 1.3,
        tempoDynamics: 1.4,
        prePhonemeLength: 0.2,
        postPhonemeLength: 0.3,
      }),
    ).resolves.toEqual({
      data: new Uint8Array([1, 2]),
      mimeType: 'audio/wav',
    });
    const synthesis = fetcher.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(String(synthesis.body))).toMatchObject({
      speedScale: 1.2,
      pitchScale: 0.1,
      intonationScale: 1.3,
      tempoDynamicsScale: 1.4,
      prePhonemeLength: 0.2,
      postPhonemeLength: 0.3,
    });
  });

  it('normalizes Aivis speaker styles', async () => {
    const adapter = new AivisSpeechAdapter({
      fetcher: jest.fn().mockResolvedValue(
        response({
          json: [
            {
              name: 'Aivis fixture',
              styles: [{ id: 888753760, name: 'Normal' }],
            },
          ],
        }),
      ),
    });
    await expect(adapter.listVoices()).resolves.toEqual([
      {
        id: '888753760',
        name: 'Aivis fixture',
        styles: [{ id: '888753760', name: 'Normal' }],
      },
    ]);
  });

  it('rejects unlisted network engines and invalid controls', async () => {
    expect(
      () => new AivisSpeechAdapter({ baseUrl: 'http://192.168.1.30:10101' }),
    ).toThrow('Custom API origin is not allowed');
    const adapter = new AivisSpeechAdapter({ fetcher: jest.fn() });
    await expect(
      adapter.synthesize('test', { tempoDynamics: 3 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });
});
