import { z } from 'zod';
import { validateCustomApiUrl } from '@/features/ai/adapters/custom-url-policy';
import { AppError } from '@/lib/errors/app-error';
import type { AudioPayload, TtsAdapter, TtsOptions } from '../types';

const styleBertOptionsSchema = z.object({
  model: z.string().regex(/^\d+$/).default('0'),
  speakerId: z.string().regex(/^\d+$/).default('0'),
  style: z.string().min(1).max(100).default('Neutral'),
  sdpRatio: z.number().min(0).max(1).default(0.2),
  speed: z.number().min(0.25).max(4).default(1),
});

export interface StyleBertVits2AdapterOptions {
  baseUrl?: string;
  apiKey?: string;
  allowedOrigins?: ReadonlySet<string>;
  fetcher?: typeof fetch;
}

export class StyleBertVits2Adapter implements TtsAdapter {
  private readonly baseUrl: URL;
  private readonly fetcher: typeof fetch;

  constructor(private readonly config: StyleBertVits2AdapterOptions = {}) {
    this.baseUrl = validateCustomApiUrl(
      config.baseUrl ?? 'http://127.0.0.1:5000',
      config.allowedOrigins ?? new Set(),
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
    const parsed = styleBertOptionsSchema.safeParse(options);
    if (!parsed.success)
      throw new AppError(
        'BAD_REQUEST',
        400,
        'Invalid Style-Bert-VITS2 options',
      );
    const parameters = new URLSearchParams({
      text: cleanText,
      model_id: parsed.data.model,
      speaker_id: parsed.data.speakerId,
      style: parsed.data.style,
      sdp_ratio: String(parsed.data.sdpRatio),
      length: String(1 / parsed.data.speed),
      language: 'JP',
    });
    const endpoint = new URL(
      `voice?${parameters}`,
      `${this.baseUrl.toString().replace(/\/$/, '')}/`,
    );
    const response = await this.fetcher(endpoint, {
      method: 'POST',
      redirect: 'manual',
      signal,
      headers: this.config.apiKey
        ? { 'X-API-Key': this.config.apiKey }
        : undefined,
    });
    if (response.status >= 300 && response.status < 400)
      throw new AppError(
        'FORBIDDEN',
        403,
        'Style-Bert-VITS2 redirects are not allowed',
      );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Style-Bert-VITS2 request failed (${response.status})`,
      );
    return {
      data: new Uint8Array(await response.arrayBuffer()),
      mimeType: response.headers.get('content-type') ?? 'audio/wav',
    };
  }
}
