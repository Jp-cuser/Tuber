import { z } from 'zod';
import { validateCustomApiUrl } from '@/features/ai/adapters/custom-url-policy';
import { AppError } from '@/lib/errors/app-error';
import type {
  AudioPayload,
  TtsAdapter,
  TtsOptions,
  VoiceDefinition,
} from '../types';

const aivisOptionsSchema = z.object({
  speakerId: z.string().regex(/^\d+$/).default('888753760'),
  speed: z.number().min(0.5).max(2).default(1),
  pitch: z.number().min(-1).max(1).default(0),
  intonation: z.number().min(0).max(2).default(1),
  tempoDynamics: z.number().min(0).max(2).default(1),
  prePhonemeLength: z.number().min(0).max(10).default(0.1),
  postPhonemeLength: z.number().min(0).max(10).default(0.1),
});

export interface AivisSpeechAdapterOptions {
  baseUrl?: string;
  allowedOrigins?: ReadonlySet<string>;
  fetcher?: typeof fetch;
}

export class AivisSpeechAdapter implements TtsAdapter {
  private readonly baseUrl: URL;
  private readonly fetcher: typeof fetch;

  constructor(options: AivisSpeechAdapterOptions = {}) {
    this.baseUrl = validateCustomApiUrl(
      options.baseUrl ?? 'http://127.0.0.1:10101',
      options.allowedOrigins ?? new Set(),
    );
    this.fetcher = options.fetcher ?? fetch;
  }

  async synthesize(
    text: string,
    options: TtsOptions,
    signal?: AbortSignal,
  ): Promise<AudioPayload> {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length > 5_000)
      throw new AppError('BAD_REQUEST', 400, 'Invalid speech text');
    const parsed = aivisOptionsSchema.safeParse(options);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid AivisSpeech options');
    const parameters = new URLSearchParams({
      text: cleanText,
      speaker: parsed.data.speakerId,
    });
    const queryResponse = await this.request(`audio_query?${parameters}`, {
      method: 'POST',
      signal,
    });
    const query = (await queryResponse.json()) as Record<string, unknown>;
    Object.assign(query, {
      speedScale: parsed.data.speed,
      pitchScale: parsed.data.pitch,
      intonationScale: parsed.data.intonation,
      tempoDynamicsScale: parsed.data.tempoDynamics,
      prePhonemeLength: parsed.data.prePhonemeLength,
      postPhonemeLength: parsed.data.postPhonemeLength,
    });
    const audio = await this.request(
      `synthesis?speaker=${encodeURIComponent(parsed.data.speakerId)}`,
      {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      },
    );
    return {
      data: new Uint8Array(await audio.arrayBuffer()),
      mimeType: audio.headers.get('content-type') ?? 'audio/wav',
    };
  }

  async listVoices(signal?: AbortSignal): Promise<VoiceDefinition[]> {
    const response = await this.request('speakers', { signal });
    const payload = z
      .array(
        z.object({
          name: z.string(),
          styles: z.array(z.object({ id: z.number(), name: z.string() })),
        }),
      )
      .safeParse(await response.json());
    if (!payload.success)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        'AivisSpeech returned invalid speakers',
      );
    return payload.data.map((speaker) => ({
      id: String(speaker.styles[0]?.id ?? ''),
      name: speaker.name,
      styles: speaker.styles.map((style) => ({
        id: String(style.id),
        name: style.name,
      })),
    }));
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const response = await this.fetcher(
      new URL(path, `${this.baseUrl.toString().replace(/\/$/, '')}/`),
      { ...init, redirect: 'manual' },
    );
    if (response.status >= 300 && response.status < 400)
      throw new AppError(
        'FORBIDDEN',
        403,
        'AivisSpeech redirects are not allowed',
      );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `AivisSpeech request failed (${response.status})`,
      );
    return response;
  }
}
