import { AppError } from '@/lib/errors/app-error';
import { VoicevoxAdapter } from './adapters/voicevox';
import { KoeiromapAdapter } from './adapters/koeiromap';
import { GoogleTtsAdapter } from './adapters/google';
import { StyleBertVits2Adapter } from './adapters/stylebertvits2';
import { AivisSpeechAdapter } from './adapters/aivis-speech';
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
  if (engine === 'google') {
    const apiKey = environment.TTS_GOOGLE_API_KEY?.trim();
    if (!apiKey)
      throw new AppError('INTERNAL_ERROR', 500, 'Google TTS is not configured');
    return new GoogleTtsAdapter({
      apiKey,
      baseUrl: environment.TTS_GOOGLE_BASE_URL,
    });
  }
  if (engine === 'stylebertvits2') {
    return new StyleBertVits2Adapter({
      baseUrl:
        environment.TTS_STYLEBERTVITS2_BASE_URL ?? 'http://127.0.0.1:5000',
      apiKey: environment.TTS_STYLEBERTVITS2_API_KEY?.trim(),
      allowedOrigins: new Set(
        (environment.TTS_LOCAL_ALLOWED_ORIGINS ?? '')
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    });
  }
  if (engine === 'aivis_speech') {
    return new AivisSpeechAdapter({
      baseUrl:
        environment.TTS_AIVIS_SPEECH_BASE_URL ?? 'http://127.0.0.1:10101',
      allowedOrigins: new Set(
        (environment.TTS_LOCAL_ALLOWED_ORIGINS ?? '')
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    });
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
