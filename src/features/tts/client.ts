import type { TtsOptions, VoiceEngine } from './types';

export async function synthesizeSpeech(
  engine: VoiceEngine,
  text: string,
  options: TtsOptions,
  fetcher: typeof fetch = fetch,
): Promise<Blob> {
  const response = await fetcher('/api/tts/synthesize', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine, text, options }),
  });
  const payload = (await response.json()) as {
    audioBase64?: string;
    mimeType?: string;
    error?: { message?: string };
  };
  if (!response.ok)
    throw new Error(payload.error?.message ?? 'Speech synthesis failed');
  if (!payload.audioBase64 || !payload.mimeType)
    throw new Error('Speech synthesis response is invalid');
  const binary = atob(payload.audioBase64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: payload.mimeType });
}
