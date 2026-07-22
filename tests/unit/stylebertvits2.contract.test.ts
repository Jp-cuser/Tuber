import { StyleBertVits2Adapter } from '@/features/tts/adapters/stylebertvits2';

function audioResponse(status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'audio/wav' },
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
  } as unknown as Response;
}

describe('Style-Bert-VITS2 adapter contract', () => {
  it('maps model, style, SDP ratio, and speaking rate to POST /voice', async () => {
    const fetcher = jest.fn().mockResolvedValue(audioResponse());
    const adapter = new StyleBertVits2Adapter({
      apiKey: 'local-secret',
      fetcher,
    });
    await expect(
      adapter.synthesize('こんにちは', {
        model: '2',
        speakerId: '1',
        style: 'Happy',
        sdpRatio: 0.35,
        speed: 1.25,
      }),
    ).resolves.toEqual({
      data: new Uint8Array([1, 2, 3]),
      mimeType: 'audio/wav',
    });
    const [url, init] = fetcher.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe('/voice');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      text: 'こんにちは',
      model_id: '2',
      speaker_id: '1',
      style: 'Happy',
      sdp_ratio: '0.35',
      length: '0.8',
      language: 'JP',
    });
    expect(init).toMatchObject({
      method: 'POST',
      redirect: 'manual',
      headers: { 'X-API-Key': 'local-secret' },
    });
  });

  it('rejects unlisted network services and invalid controls', async () => {
    expect(
      () =>
        new StyleBertVits2Adapter({
          baseUrl: 'http://192.168.1.20:5000',
        }),
    ).toThrow('Custom API origin is not allowed');
    const adapter = new StyleBertVits2Adapter({ fetcher: jest.fn() });
    await expect(
      adapter.synthesize('test', { sdpRatio: 1.1 }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });
});
