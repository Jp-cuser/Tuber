import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';
import type { AudioPayload, TtsAdapter, TtsOptions } from '../types';

const optionsSchema = z.object({
  speakerX: z.number().min(-10).max(10).default(0),
  speakerY: z.number().min(-10).max(10).default(0),
  style: z
    .enum(['talk', 'happy', 'sad', 'angry', 'fear', 'surprise'])
    .default('talk'),
});

export interface KoeiromapAdapterOptions {
  apiKey: string;
  endpoint: string;
  fetcher?: typeof fetch;
}

export class KoeiromapAdapter implements TtsAdapter {
  private readonly endpoint: URL;
  private readonly fetcher: typeof fetch;

  constructor(private readonly config: KoeiromapAdapterOptions) {
    if (!config.apiKey.trim())
      throw new AppError(
        'INTERNAL_ERROR',
        500,
        'Koeiromap API key is not configured',
      );
    this.endpoint = new URL(config.endpoint);
    if (this.endpoint.protocol !== 'https:')
      throw new AppError('FORBIDDEN', 403, 'Koeiromap endpoint must use HTTPS');
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
    const parsed = optionsSchema.safeParse(options);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid Koeiromap options');
    const response = await this.fetcher(this.endpoint, {
      method: 'POST',
      redirect: 'manual',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        text: cleanText,
        speaker_x: parsed.data.speakerX,
        speaker_y: parsed.data.speakerY,
        style: parsed.data.style,
      }),
    });
    if (response.status >= 300 && response.status < 400)
      throw new AppError(
        'FORBIDDEN',
        403,
        'Koeiromap redirects are not allowed',
      );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Koeiromap request failed (${response.status})`,
      );
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.startsWith('audio/')) {
      return {
        data: new Uint8Array(await response.arrayBuffer()),
        mimeType: contentType.split(';')[0],
      };
    }
    const payload = (await response.json()) as unknown;
    const parsedPayload = z
      .object({
        audio: z.string().optional(),
        audioBase64: z.string().optional(),
      })
      .refine((value) => value.audio || value.audioBase64)
      .safeParse(payload);
    if (!parsedPayload.success)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        'Koeiromap returned invalid audio',
      );
    return {
      data: new Uint8Array(
        Buffer.from(
          parsedPayload.data.audioBase64 ?? parsedPayload.data.audio ?? '',
          'base64',
        ),
      ),
      mimeType: 'audio/wav',
    };
  }
}
