import { AppError } from '@/lib/errors/app-error';
import { VoicevoxAdapter } from './adapters/voicevox';
import { KoeiromapAdapter } from './adapters/koeiromap';
import type { TtsAdapter, VoiceEngine } from './types';

export function createServerTtsAdapter(
  engine: VoiceEngine,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): TtsAdapter {
  if (engine === 'koeiromap') {
    const apiKey = environment.TTS_KOEIROMAP_API_KEY?.trim();
    const endpoint = environment.TTS_KOEIROMAP_ENDPOINT?.trim();
    if (!apiKey || !endpoint)
      throw new AppError('INTERNAL_ERROR', 500, 'Koeiromap is not configured');
    return new KoeiromapAdapter({ apiKey, endpoint });
  }
  if (engine !== 'voicevox')
    throw new AppError('BAD_REQUEST', 400, 'TTS engine is not implemented');
  return new VoicevoxAdapter({
    baseUrl: environment.TTS_VOICEVOX_BASE_URL ?? 'http://127.0.0.1:50021',
    allowedOrigins: new Set(
      (environment.TTS_LOCAL_ALLOWED_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  });
}
