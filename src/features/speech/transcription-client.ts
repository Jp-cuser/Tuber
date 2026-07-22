import type { TranscriptionRequest, WhisperModel } from './whisper';

const MAX_AUDIO_BYTES = 6 * 1024 * 1024;

export async function transcribeAudioFile(
  file: File,
  model: WhisperModel,
  language: string,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  if (!file.size) throw new Error('Audio file is empty');
  if (file.size > MAX_AUDIO_BYTES)
    throw new Error('Audio file must be 6 MB or smaller');
  const audioBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read audio file'));
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.readAsDataURL(file);
  });
  const request: TranscriptionRequest = {
    audioBase64,
    fileName: file.name,
    mimeType: file.type as TranscriptionRequest['mimeType'],
    model,
    language: language.split('-')[0],
  };
  const response = await fetcher('/api/audio/transcribe', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const payload = (await response.json()) as {
    text?: string;
    error?: { message?: string };
  };
  if (!response.ok)
    throw new Error(payload.error?.message ?? 'Transcription failed');
  if (typeof payload.text !== 'string')
    throw new Error('Transcription response is invalid');
  return payload.text;
}
