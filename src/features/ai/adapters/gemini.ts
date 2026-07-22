import { AppError } from '@/lib/errors/app-error';
import type {
  AiProviderAdapter,
  AiProviderConfig,
  AiRequest,
  AiResult,
  ValidationResult,
} from '../types';

type Fetcher = typeof fetch;
export class GeminiAdapter implements AiProviderAdapter {
  constructor(
    private readonly config: AiProviderConfig & { provider: 'google' },
    private readonly fetcher: Fetcher = fetch,
  ) {}
  async validateConfig(config: AiProviderConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!config.apiKey) errors.push('API key is required');
    const url = new URL(
      config.baseUrl ?? 'https://generativelanguage.googleapis.com',
    );
    if (url.protocol !== 'https:') errors.push('Gemini URL must use HTTPS');
    return { valid: errors.length === 0, errors };
  }
  private async request(
    request: AiRequest,
    signal: AbortSignal,
    stream: boolean,
  ): Promise<Response> {
    const validation = await this.validateConfig(this.config);
    if (!validation.valid)
      throw new AppError('BAD_REQUEST', 400, validation.errors.join('; '));
    const base = (
      this.config.baseUrl ?? 'https://generativelanguage.googleapis.com'
    ).replace(/\/$/, '');
    const action = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
    const response = await this.fetcher(
      `${base}/v1beta/models/${encodeURIComponent(request.model)}:${action}`,
      {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.config.apiKey ?? '',
        },
        body: JSON.stringify({
          systemInstruction: request.systemPrompt
            ? { parts: [{ text: request.systemPrompt }] }
            : undefined,
          contents: request.messages
            .filter((message) => message.role !== 'system')
            .map((message) => ({
              role: message.role === 'assistant' ? 'model' : 'user',
              parts:
                typeof message.content === 'string'
                  ? [{ text: message.content }]
                  : message.content.map((item) =>
                      item.type === 'text'
                        ? { text: item.text }
                        : {
                            inlineData: {
                              mimeType: item.mimeType ?? 'image/png',
                              data: item.data.replace(
                                /^data:[^;]+;base64,/,
                                '',
                              ),
                            },
                          },
                    ),
            })),
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxOutputTokens,
            ...(request.reasoning?.enabled
              ? {
                  thinkingConfig: {
                    thinkingBudget: request.reasoning.tokenBudget,
                  },
                }
              : {}),
          },
          ...(request.searchGrounding?.enabled
            ? { tools: [{ google_search: {} }] }
            : {}),
        }),
      },
    );
    if (!response.ok)
      throw new AppError(
        'INTERNAL_ERROR',
        502,
        `Gemini request failed with status ${response.status}`,
      );
    return response;
  }
  stream(request: AiRequest, signal: AbortSignal): Promise<Response> {
    return this.request(request, signal, true);
  }
  async generate(request: AiRequest, signal: AbortSignal): Promise<AiResult> {
    const data = (await (
      await this.request(request, signal, false)
    ).json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
        groundingMetadata?: unknown;
      }>;
      usageMetadata?: Record<string, unknown>;
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .filter((part) => !part.thought)
      .map((part) => part.text ?? '')
      .join('');
    if (!text)
      throw new AppError('INTERNAL_ERROR', 502, 'Gemini returned no text');
    return {
      text,
      reasoning:
        parts
          .filter((part) => part.thought)
          .map((part) => part.text ?? '')
          .join('') || undefined,
      providerMetadata: {
        usage: data.usageMetadata,
        grounding: data.candidates?.[0]?.groundingMetadata,
      },
    };
  }
  supportsMultimodal(): boolean {
    return true;
  }
  supportsReasoning(model: string): boolean {
    return /gemini-(2\.5|3)/i.test(model);
  }
  supportsSearchGrounding(): boolean {
    return true;
  }
}
