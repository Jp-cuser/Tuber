import { z } from 'zod';
import { validateCustomApiUrl } from '@/features/ai/adapters/custom-url-policy';
import { AppError } from '@/lib/errors/app-error';
import type {
  AudioPayload,
  TtsAdapter,
  TtsOptions,
  VoiceDefinition,
} from '../types';

const optionsSchema = z.object({
  speakerId: z.string().regex(/^\d+$/).default('1'),
  speed: z.number().min(0.5).max(2).default(1),
  pitch: z.number().min(-0.15).max(0.15).default(0),
  intonation: z.number().min(0).max(2).default(1),
});

interface VoicevoxSpeaker {
  name: string;
  styles: Array<{ id: number; name: string }>;
}

export interface VoicevoxAdapterOptions {
  baseUrl?: string;
  allowedOrigins?: ReadonlySet<string>;
  fetcher?: typeof fetch;
}

export class VoicevoxAdapter implements TtsAdapter {
  private readonly baseUrl: URL;
  private readonly fetcher: typeof fetch;

  constructor(options: VoicevoxAdapterOptions = {}) {
    this.baseUrl = validateCustomApiUrl(
      options.baseUrl ?? 'http://127.0.0.1:50021',
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
    const parsed = optionsSchema.safeParse(options);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid VOICEVOX options');
    const parameters = new URLSearchParams({
      text: cleanText,
      speaker: parsed.data.speakerId,
    });
    const queryResponse = await this.request(`audio_query?${parameters}`, {
      method: 'POST',
      signal,
    });
    const query = (await queryResponse.json()) as Record<string, unknown>;
    query.speedScale = parsed.data.speed;
    query.pitchScale = parsed.data.pitch;
    query.intonationScale = parsed.data.intonation;
    const audioResponse = await this.request(
      `synthesis?speaker=${encodeURIComponent(parsed.data.speakerId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
        signal,
      },
    );
    return {
      data: new Uint8Array(await audioResponse.arrayBuffer()),
      mimeType: audioResponse.headers.get('content-type') ?? 'audio/wav',
    };
  }

  async listVoices(signal?: AbortSignal): Promise<VoiceDefinition[]> {
    const response = await this.request('speakers', { signal });
    const parsed = z
      .array(
        z.object({
          name: z.string(),
          styles: z.array(z.object({ id: z.number(), name: z.string() })),
        }),
      )
      .safeParse((await response.json()) as VoicevoxSpeaker[]);
    if (!parsed.success)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        'VOICEVOX returned invalid speakers',
      );
    return parsed.data.map((speaker) => ({
      id: String(speaker.styles[0]?.id ?? ''),
      name: speaker.name,
      styles: speaker.styles.map((style) => ({
        id: String(style.id),
        name: style.name,
      })),
    }));
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const url = new URL(path, `${this.baseUrl.toString().replace(/\/$/, '')}/`);
    const response = await this.fetcher(url, { ...init, redirect: 'manual' });
    if (response.status >= 300 && response.status < 400)
      throw new AppError(
        'FORBIDDEN',
        403,
        'VOICEVOX redirects are not allowed',
      );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `VOICEVOX request failed (${response.status})`,
      );
    return response;
  }
}
