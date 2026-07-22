import { VoicevoxAdapter } from '@/features/tts/adapters/voicevox';

function response(options: {
  status?: number;
  json?: unknown;
  bytes?: number[];
  contentType?: string;
}) {
  const status = options.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => options.json,
    arrayBuffer: async () => new Uint8Array(options.bytes ?? []).buffer,
    headers: { get: () => options.contentType ?? null },
  } as unknown as Response;
}

describe('VOICEVOX adapter contract', () => {
  it('runs audio_query then synthesis with supported controls', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(response({ json: { accent_phrases: [] } }))
      .mockResolvedValueOnce(
        response({ bytes: [1, 2, 3], contentType: 'audio/wav' }),
      );
    const adapter = new VoicevoxAdapter({ fetcher });
    await expect(
      adapter.synthesize('こんにちは', {
        speakerId: '3',
        speed: 1.2,
        pitch: 0.05,
        intonation: 1.1,
      }),
    ).resolves.toEqual({
      data: new Uint8Array([1, 2, 3]),
      mimeType: 'audio/wav',
    });
    expect(String(fetcher.mock.calls[0][0])).toContain(
      '/audio_query?text=%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF&speaker=3',
    );
    const synthesis = fetcher.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(String(synthesis.body))).toMatchObject({
      speedScale: 1.2,
      pitchScale: 0.05,
      intonationScale: 1.1,
    });
    expect(synthesis.redirect).toBe('manual');
  });

  it('normalizes speaker styles', async () => {
    const adapter = new VoicevoxAdapter({
      fetcher: jest.fn().mockResolvedValue(
        response({
          json: [
            {
              name: 'Fixture voice',
              styles: [{ id: 7, name: 'Normal' }],
            },
          ],
        }),
      ),
    });
    await expect(adapter.listVoices()).resolves.toEqual([
      {
        id: '7',
        name: 'Fixture voice',
        styles: [{ id: '7', name: 'Normal' }],
      },
    ]);
  });

  it('rejects non-loopback URLs unless explicitly allowed', () => {
    expect(
      () => new VoicevoxAdapter({ baseUrl: 'http://192.168.1.10:50021' }),
    ).toThrow('Custom API origin is not allowed');
  });
});
