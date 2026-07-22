import { z } from 'zod';
import { AppError } from '@/lib/errors/app-error';

export const whisperModels = [
  'whisper-1',
  'gpt-4o-transcribe',
  'gpt-4o-mini-transcribe',
] as const;

export type WhisperModel = (typeof whisperModels)[number];

export const transcriptionRequestSchema = z.object({
  audioBase64: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.enum([
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
  ]),
  model: z.enum(whisperModels),
  language: z.string().min(2).max(16).optional(),
});

export type TranscriptionRequest = z.infer<typeof transcriptionRequestSchema>;

export interface WhisperAdapterOptions {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class WhisperAdapter {
  private readonly fetcher: typeof fetch;
  private readonly baseUrl: string;

  constructor(private readonly options: WhisperAdapterOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.baseUrl = (options.baseUrl ?? 'https://api.openai.com/v1').replace(
      /\/$/,
      '',
    );
  }

  async transcribe(input: TranscriptionRequest, signal?: AbortSignal) {
    const parsed = transcriptionRequestSchema.safeParse(input);
    if (!parsed.success)
      throw new AppError('BAD_REQUEST', 400, 'Invalid transcription request');

    const bytes = Buffer.from(parsed.data.audioBase64, 'base64');
    if (!bytes.length)
      throw new AppError('BAD_REQUEST', 400, 'Audio file is empty');
    const form = new FormData();
    form.append(
      'file',
      new Blob([bytes], { type: parsed.data.mimeType }),
      parsed.data.fileName,
    );
    form.append('model', parsed.data.model);
    if (parsed.data.language) form.append('language', parsed.data.language);

    const response = await this.fetcher(
      `${this.baseUrl}/audio/transcriptions`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.options.apiKey}` },
        body: form,
        signal,
      },
    );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Transcription provider failed (${response.status})`,
      );
    const payload = (await response.json()) as { text?: unknown };
    if (typeof payload.text !== 'string')
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        'Transcription provider returned an invalid response',
      );
    return { text: payload.text };
  }
}

export function createServerWhisperAdapter(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  const apiKey = environment.AI_OPENAI_API_KEY?.trim();
  if (!apiKey)
    throw new AppError(
      'INTERNAL_ERROR',
      500,
      'Whisper transcription is not configured',
    );
  return new WhisperAdapter({
    apiKey,
    baseUrl: environment.AI_OPENAI_BASE_URL,
  });
}
