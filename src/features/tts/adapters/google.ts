import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';
import type {
  AudioPayload,
  TtsAdapter,
  TtsOptions,
  VoiceDefinition,
} from '../types';

const googleOptionsSchema = z.object({
  languageCode: z
    .string()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/)
    .default('ja-JP'),
  model: z.string().min(1).max(200).default('ja-JP-Neural2-B'),
  speed: z.number().min(0.25).max(4).default(1),
  pitch: z.number().min(-20).max(20).default(0),
  volumeGainDb: z.number().min(-96).max(16).default(0),
});

export interface GoogleTtsAdapterOptions {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class GoogleTtsAdapter implements TtsAdapter {
  private readonly baseUrl: URL;
  private readonly fetcher: typeof fetch;

  constructor(private readonly config: GoogleTtsAdapterOptions) {
    if (!config.apiKey.trim())
      throw new AppError(
        'INTERNAL_ERROR',
        500,
        'Google TTS API key is not configured',
      );
    this.baseUrl = new URL(
      config.baseUrl ?? 'https://texttospeech.googleapis.com',
    );
    if (
      this.baseUrl.protocol !== 'https:' ||
      !this.baseUrl.hostname.endsWith('.googleapis.com')
    )
      throw new AppError('FORBIDDEN', 403, 'Invalid Google TTS endpoint');
    this.fetcher = config.fetcher ?? fetch;
  }

  async synthesize(
    text: string,
    options: TtsOptions,
    signal?: AbortSignal,
  ): Promise<AudioPayload> {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length > 5_000)
      throw new AppError('BAD_REQUEST', 400, 'Invalid speech text');
    const parsed = googleOptionsSchema.safeParse(options);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid Google TTS options');
    const response = await this.request('v1/text:synthesize', {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        input: { text: cleanText },
        voice: {
          languageCode: parsed.data.languageCode,
          name: parsed.data.model,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: parsed.data.speed,
          pitch: parsed.data.pitch,
          volumeGainDb: parsed.data.volumeGainDb,
        },
      }),
    });
    const payload = z
      .object({ audioContent: z.string().min(1) })
      .safeParse(await response.json());
    if (!payload.success)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        'Google TTS returned invalid audio',
      );
    return {
      data: new Uint8Array(Buffer.from(payload.data.audioContent, 'base64')),
      mimeType: 'audio/mpeg',
    };
  }

  async listVoices(signal?: AbortSignal): Promise<VoiceDefinition[]> {
    const response = await this.request('v1/voices', { signal });
    const payload = z
      .object({
        voices: z.array(
          z.object({
            name: z.string(),
            languageCodes: z.array(z.string()),
          }),
        ),
      })
      .safeParse(await response.json());
    if (!payload.success)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        'Google TTS returned invalid voices',
      );
    return payload.data.voices.map((voice) => ({
      id: voice.name,
      name: `${voice.name} (${voice.languageCodes.join(', ')})`,
    }));
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const response = await this.fetcher(new URL(path, this.baseUrl), {
      ...init,
      redirect: 'manual',
      headers: {
        ...init.headers,
        'x-goog-api-key': this.config.apiKey,
      },
    });
    if (response.status >= 300 && response.status < 400)
      throw new AppError(
        'FORBIDDEN',
        403,
        'Google TTS redirects are not allowed',
      );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Google TTS request failed (${response.status})`,
      );
    return response;
  }
}
