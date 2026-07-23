import { AivisCloudAdapter } from '@/features/tts/adapters/aivis-cloud';

const modelUuid = 'a59cb814-0083-4369-8542-f51a29e72af7';
const speakerUuid = '3e4d4d59-a274-4c38-a869-0b609d76ec3e';

function audioResponse() {
  return {
    ok: true,
    status: 200,
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    headers: { get: () => 'audio/mpeg' },
  } as unknown as Response;
}

describe('Aivis Cloud adapter contract', () => {
  it('maps Cloud voice, style, expression, and silence controls', async () => {
    const fetcher = jest.fn().mockResolvedValue(audioResponse());
    const adapter = new AivisCloudAdapter({ apiKey: 'cloud-secret', fetcher });

    await expect(
      adapter.synthesize('Cloud fixture', {
        model: modelUuid,
        speakerId: speakerUuid,
        styleId: 3,
        speed: 1.2,
        intonation: 1.3,
        tempoDynamics: 1.4,
        pitch: 0.1,
        prePhonemeLength: 0.2,
        postPhonemeLength: 0.3,
      }),
    ).resolves.toEqual({
      data: new Uint8Array([1, 2, 3]),
      mimeType: 'audio/mpeg',
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.aivis-project.com/v1/tts/synthesize',
      expect.objectContaining({
        method: 'POST',
        redirect: 'manual',
        headers: {
          Authorization: 'Bearer cloud-secret',
          'Content-Type': 'application/json',
        },
      }),
    );
    expect(
      JSON.parse(String((fetcher.mock.calls[0][1] as RequestInit).body)),
    ).toEqual({
      model_uuid: modelUuid,
      speaker_uuid: speakerUuid,
      style_id: 3,
      text: 'Cloud fixture',
      use_ssml: false,
      speaking_rate: 1.2,
      emotional_intensity: 1.3,
      tempo_dynamics: 1.4,
      pitch: 0.1,
      leading_silence_seconds: 0.2,
      trailing_silence_seconds: 0.3,
      output_format: 'mp3',
    });
  });

  it('supports style names without sending a style ID', async () => {
    const fetcher = jest.fn().mockResolvedValue(audioResponse());
    const adapter = new AivisCloudAdapter({ apiKey: 'cloud-secret', fetcher });
    await adapter.synthesize('Named style', {
      model: modelUuid,
      styleName: 'Happy',
    });
    expect(
      JSON.parse(String((fetcher.mock.calls[0][1] as RequestInit).body)),
    ).toMatchObject({ style_name: 'Happy' });
    expect(
      JSON.parse(String((fetcher.mock.calls[0][1] as RequestInit).body)),
    ).not.toHaveProperty('style_id');
  });

  it('requires configuration and rejects ambiguous styles', async () => {
    expect(() => new AivisCloudAdapter({ apiKey: ' ' })).toThrow(
      'Aivis Cloud API key is not configured',
    );
    const adapter = new AivisCloudAdapter({
      apiKey: 'cloud-secret',
      fetcher: jest.fn(),
    });
    await expect(
      adapter.synthesize('Invalid styles', {
        model: modelUuid,
        styleId: 1,
        styleName: 'Happy',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 400 });
  });
});
