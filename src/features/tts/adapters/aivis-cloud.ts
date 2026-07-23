import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';
import type { AudioPayload, TtsAdapter, TtsOptions } from '../types';

const cloudOptionsSchema = z
  .object({
    model: z.string().uuid(),
    speakerId: z.string().uuid().optional(),
    styleId: z.number().int().min(0).max(31).optional(),
    styleName: z.string().min(1).max(20).optional(),
    speed: z.number().min(0.5).max(2).default(1),
    intonation: z.number().min(0).max(2).default(1),
    tempoDynamics: z.number().min(0).max(2).default(1),
    pitch: z.number().min(-1).max(1).default(0),
    prePhonemeLength: z.number().min(0).max(60).default(0.1),
    postPhonemeLength: z.number().min(0).max(60).default(0.1),
  })
  .refine((value) => value.styleId === undefined || !value.styleName, {
    message: 'Style ID and style name are mutually exclusive',
  });

export interface AivisCloudAdapterOptions {
  apiKey: string;
  fetcher?: typeof fetch;
}

export class AivisCloudAdapter implements TtsAdapter {
  private readonly fetcher: typeof fetch;

  constructor(private readonly config: AivisCloudAdapterOptions) {
    if (!config.apiKey.trim())
      throw new AppError(
        'INTERNAL_ERROR',
        500,
        'Aivis Cloud API key is not configured',
      );
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
    const parsed = cloudOptionsSchema.safeParse(options);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid Aivis Cloud options');
    const response = await this.fetcher(
      'https://api.aivis-project.com/v1/tts/synthesize',
      {
        method: 'POST',
        redirect: 'manual',
        signal,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_uuid: parsed.data.model,
          ...(parsed.data.speakerId
            ? { speaker_uuid: parsed.data.speakerId }
            : {}),
          ...(parsed.data.styleId !== undefined
            ? { style_id: parsed.data.styleId }
            : {}),
          ...(parsed.data.styleName
            ? { style_name: parsed.data.styleName }
            : {}),
          text: cleanText,
          use_ssml: false,
          speaking_rate: parsed.data.speed,
          emotional_intensity: parsed.data.intonation,
          tempo_dynamics: parsed.data.tempoDynamics,
          pitch: parsed.data.pitch,
          leading_silence_seconds: parsed.data.prePhonemeLength,
          trailing_silence_seconds: parsed.data.postPhonemeLength,
          output_format: 'mp3',
        }),
      },
    );
    if (response.status >= 300 && response.status < 400)
      throw new AppError(
        'FORBIDDEN',
        403,
        'Aivis Cloud redirects are not allowed',
      );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Aivis Cloud request failed (${response.status})`,
      );
    return {
      data: new Uint8Array(await response.arrayBuffer()),
      mimeType: response.headers.get('content-type') ?? 'audio/mpeg',
    };
  }
}
