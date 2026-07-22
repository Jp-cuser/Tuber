import { WhisperAdapter } from '@/features/speech/whisper';

describe('Whisper transcription adapter contract', () => {
  it.each([
    'whisper-1',
    'gpt-4o-transcribe',
    'gpt-4o-mini-transcribe',
  ] as const)('sends audio with model %s', async (model) => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: 'transcribed text' }),
    });
    const adapter = new WhisperAdapter({ apiKey: 'server-secret', fetcher });
    await expect(
      adapter.transcribe({
        audioBase64: Buffer.from('audio').toString('base64'),
        fileName: 'voice.webm',
        mimeType: 'audio/webm',
        model,
        language: 'ja',
      }),
    ).resolves.toEqual({ text: 'transcribed text' });
    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/audio/transcriptions');
    expect(init.headers).toEqual({ Authorization: 'Bearer server-secret' });
    const form = init.body as FormData;
    expect(form.get('model')).toBe(model);
    expect(form.get('language')).toBe('ja');
    expect(form.get('file')).toBeInstanceOf(Blob);
  });

  it('maps upstream failures to a safe error', async () => {
    const adapter = new WhisperAdapter({
      apiKey: 'server-secret',
      fetcher: jest.fn().mockResolvedValue({ ok: false, status: 429 }),
    });
    await expect(
      adapter.transcribe({
        audioBase64: 'YQ==',
        fileName: 'voice.wav',
        mimeType: 'audio/wav',
        model: 'whisper-1',
      }),
    ).rejects.toMatchObject({ code: 'INTERNAL_ERROR', status: 502 });
  });
});
